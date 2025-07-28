import { NextRequest, NextResponse } from 'next/server';
import { isPrivatePath, isLoginRoute } from '@/lib/auth/path-utils';

// Simple in-memory cache for token verification results
const tokenCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Extracted token verification logic with caching
async function verifyToken(token: string, req: NextRequest): Promise<boolean> {
    // Check cache first
    const cached = tokenCache.get(token);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.valid;
    }

    try {
        const protocol = req.nextUrl.protocol || (process.env.NODE_ENV === 'production' ? 'https:' : 'http:');
        const host = req.headers.get('host');
        const verifyUrl = `${protocol}//${host}/api/verify-token`;
        const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        const isValid = response.ok;
        
        // Cache the result
        tokenCache.set(token, { valid: isValid, timestamp: Date.now() });
        
        // Clean up old cache entries periodically
        if (tokenCache.size > 100) {
            const now = Date.now();
            for (const [key, value] of tokenCache.entries()) {
                if (now - value.timestamp > CACHE_DURATION) {
                    tokenCache.delete(key);
                }
            }
        }
        
        return isValid;
    } catch (err) {
        // Cache negative result for a shorter duration
        tokenCache.set(token, { valid: false, timestamp: Date.now() });
        return false;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // Allow public routes
    if (isPrivatePath(pathname)) {
        // Check if the user is logged in
        const token = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            // Redirect to login
            const loginUrl = req.nextUrl.clone();
            loginUrl.pathname = '/login';
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        } else {
            // Verify the token
            const valid = await verifyToken(token, req);
            if (!valid) {
                const loginUrl = req.nextUrl.clone();
                loginUrl.pathname = '/login';
                loginUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(loginUrl);
            }
            return NextResponse.next();
        }
    } else {
        // Check if the user is logged in
        const token = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
        if (token) {
            const valid = await verifyToken(token, req);
            if (valid) {
                const tryingToEnterLoginRoute = isLoginRoute(pathname);
                const redirectUrl = req.nextUrl.searchParams.get('redirect');
                if (tryingToEnterLoginRoute) {
                    // Redirect to redirect url
                    if (redirectUrl) {
                        return NextResponse.redirect(new URL(redirectUrl, req.url));
                    } else {
                        return NextResponse.redirect(new URL('/', req.url));
                    }
                } else if (redirectUrl) {
                    return NextResponse.redirect(new URL(redirectUrl, req.url));
                }
                return NextResponse.next();
            }
        } else {
            return NextResponse.next();
        }
    }
}

// Specify the paths the middleware should run on
export const config = {
    matcher: [
        '/admin/:path*',
        '/student/:path*',
        '/complete-profile',
        '/test/:path*',
        '/assessment/:path*',
        '/challenge/:path*',
        '/form',
        '/login',
        '/signup',
    ],
}