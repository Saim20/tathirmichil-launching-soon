import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentTestById } from '@/lib/apis/tests';
import { evaluateUserAssessmentTestAdmin } from '@/lib/apis/test-evaluation';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
    try {
        const { testId, timeTaken, tabSwitchCount } = await request.json();
        const idToken = request.headers.get('Authorization')?.split(' ')[1];

        if (!idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Verify the token and get user info
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // Fetch the test data
        const testResponse = await getAssessmentTestById(testId);
        if (!testResponse.success || !testResponse.data) {
            return NextResponse.json({ message: testResponse.error || 'Test not found' }, { status: 404 });
        }

        const test = testResponse.data;

        // Evaluate the test for this user using admin Firebase
        const result = await evaluateUserAssessmentTestAdmin({
            testId,
            userId,
            test,
            timeTaken,
            tabSwitchCount,
            firestoreCollections: {
                test: 'assessment-tests',
                userResults: 'assessment-test-user-results',
            },
        });

        if (result.success) {
            return NextResponse.json({ message: result.message }, { status: 200 });
        } else {
            return NextResponse.json({ message: result.message }, { status: 500 });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 