import { NextRequest, NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '../../../../lib/helpers/role-checks';
import { getLiveTestById } from '@/lib/apis/tests';
import { evaluateLiveTestAdmin } from '@/lib/apis/test-evaluation';

export async function POST(request: NextRequest) {
    try {
        const { testId } = await request.json();
        const idToken = request.headers.get('Authorization')?.split(' ')[1];

        if (!idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const { isAdmin } = await checkIfUserIsAdmin(idToken);
        if (!isAdmin) {
            console.log('Unauthorized access attempt');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Verify the test exists
        const testResponse = await getLiveTestById(testId);
        if (!testResponse.success || !testResponse.data) {
            return NextResponse.json({ message: testResponse.error || 'Test not found' }, { status: 404 });
        }

        // Get admin ID for evaluation
        const adminId = 'admin'; // You may want to get this from the decoded token

        // Use the new live test evaluation system
        const result = await evaluateLiveTestAdmin(testId, testResponse.data);
        if (result.success) {
            return NextResponse.json({ 
                message: result.message,
                evaluatedUsers: result.evaluatedUsers 
            }, { status: 200 });
        } else {
            const errorMessage = result.message || 'Unknown error occurred';
            if (errorMessage.includes('Question')) {
                return NextResponse.json({ message: errorMessage }, { status: 404 });
            } else if (errorMessage.includes('No user submissions found')) {
                return NextResponse.json({ message: errorMessage }, { status: 404 });
            } else {
                return NextResponse.json({ message: errorMessage }, { status: 500 });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
