import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

function useSearchParamsWithSuspense() {
    const searchParams = useSearchParams();
    return searchParams;
}

export function useRedirect() {
    const searchParams = useSearchParamsWithSuspense();
    const router = useRouter();

    const performRedirect = useCallback(() => {
        const redirect = searchParams.get("redirect");

        if (redirect) {
            console.log("Using redirect URL:", redirect);
            router.push(redirect);
        } else {
            console.log("Using fallback to /student");
            router.push("/student");
        }
    }, [searchParams, router]);

    const redirect = useCallback(() => {
        // Remove artificial delay for faster redirects
        performRedirect();
    }, [performRedirect]);

    return { redirect };
}