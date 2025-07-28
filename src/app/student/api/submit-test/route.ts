import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsStudent } from '@/lib/helpers/role-checks';
import { evaluateTestAutomaticallyAdmin } from '@/lib/apis/test-evaluation';
import { TestSubmission, QuestionAnswer, ComprehensiveQuestionAnswer } from '@/lib/apis/test-types';

export async function POST(req: NextRequest) {
    try {
        const { testId, answers, timeTaken, tabSwitchCount } = await req.json();

        if (!testId || typeof answers !== 'object' || answers === null || typeof timeTaken !== 'number') {
            return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
        }

        // Authorization check
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        // Check if the user is valid
        const { isStudent, userId } = await checkIfUserIsStudent(idToken);
        if (!isStudent) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }
        // Convert answers to the format expected by the evaluation system
        // The answers parameter is already in the correct format: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>
        const answersForEvaluation: Record<string, any> = {};
        
        // Process each answer entry
        for (const [questionId, answerData] of Object.entries(answers as Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>)) {
            if (answerData.type === 'comprehensive') {
                // This is a comprehensive question answer
                const compAnswer = answerData as ComprehensiveQuestionAnswer;
                answersForEvaluation[questionId] = {
                    id: compAnswer.id,
                    timeTaken: compAnswer.timeTaken,
                    subQuestionAnswers: compAnswer.subQuestionAnswers,
                    type: 'comprehensive'
                };
            } else {
                // This is a regular question answer
                const questionAnswer = answerData as QuestionAnswer;
                answersForEvaluation[questionId] = {
                    id: questionAnswer.id,
                    selected: questionAnswer.selected,
                    timeTaken: questionAnswer.timeTaken,
                    type: 'question'
                };
            }
        }

        // Create a submission object for evaluation
        const submissionTime = new Date();
        const submission: TestSubmission = {
            testId,
            userId,
            testType: 'practice',
            answers: answersForEvaluation,
            startTime: new Date(submissionTime.getTime() - (timeTaken * 1000)), // Calculate start time
            endTime: submissionTime,
            totalTimeTaken: timeTaken,
            status: 'submitted',
            submittedAt: submissionTime,
            tabSwitchCount: tabSwitchCount || 0
        };

        // Use the automatic evaluation system to calculate scores
        try {
            await evaluateTestAutomaticallyAdmin(testId, 'practice', submission);
        } catch (evaluationError) {
            console.error('Evaluation error:', evaluationError);
            return NextResponse.json({ 
                success: false, 
                message: 'Error evaluating test submission' 
            }, { status: 500 });
        }

        // Note: Coins are already awarded by evaluateTestAutomatically function
        // Note: Results are stored by evaluateTestAutomaticallyAdmin function

        return NextResponse.json({ success: true});
    } catch (error) {
        console.error('Error submitting test:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}