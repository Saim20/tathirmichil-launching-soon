import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkIfUserIsStudent } from '@/lib/helpers/role-checks';
import { evaluateChallengeTestSubmissionAdmin } from '@/lib/apis/test-evaluation';
import { TestSubmission } from '@/lib/apis/test-types';

export async function POST(req: NextRequest) {
    try {
        const { testId, answers, timeTaken, tabSwitchCount } = await req.json();

        if (!testId || !Array.isArray(answers) || typeof timeTaken !== 'number') {
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

        // Fetch the challenge test document
        const challengeTestRef = adminFirestore.collection('challenge-tests').doc(testId);
        const challengeTestSnap = await challengeTestRef.get();
        if (!challengeTestSnap.exists) {
            return NextResponse.json({ success: false, message: 'Challenge test not found' }, { status: 404 });
        }
        const challengeTest = challengeTestSnap.data();
        if (!challengeTest) {
            return NextResponse.json({ success: false, message: 'Challenge test data missing' }, { status: 404 });
        }

        // Only allow the invited users to submit
        if (![challengeTest.createdBy, challengeTest.invitedUser].includes(userId)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        // Prepare answers in the new format for evaluation
        // Need to handle both regular questions and comprehensive questions differently
        const answersForEvaluation: Record<string, any> = {};
        
        // Group answers by parent ID for comprehensive questions, or use as-is for regular questions
        const answerGroups: Record<string, any[]> = {};
        
        for (const answer of answers) {
            // Check if this is a sub-question of a comprehensive question
            if (answer.parentId) {
                // This is a sub-question of a comprehensive question
                if (!answerGroups[answer.parentId]) {
                    answerGroups[answer.parentId] = [];
                }
                answerGroups[answer.parentId].push(answer);
            } else {
                // This is a regular question
                answersForEvaluation[answer.id] = {
                    id: answer.id,
                    selected: answer.selected,
                    timeTaken: answer.timeTaken,
                    type: 'question'
                };
            }
        }
        
        // Process comprehensive question groups
        for (const [parentId, subAnswers] of Object.entries(answerGroups)) {
            const subQuestionAnswers: Record<string, { selected: number | null; timeTaken: number }> = {};
            let totalTimeTaken = 0;
            
            for (const subAnswer of subAnswers) {
                subQuestionAnswers[subAnswer.id] = {
                    selected: subAnswer.selected,
                    timeTaken: subAnswer.timeTaken
                };
                totalTimeTaken += subAnswer.timeTaken || 0;
            }
            
            answersForEvaluation[parentId] = {
                id: parentId,
                timeTaken: totalTimeTaken,
                subQuestionAnswers,
                type: 'comprehensive'
            };
        }

        // Create a submission object for evaluation
        const submissionTime = new Date();
        const submission: TestSubmission = {
            testId,
            userId,
            testType: 'challenge',
            answers: answersForEvaluation,
            startTime: new Date(submissionTime.getTime() - (timeTaken * 1000)), // Calculate start time
            endTime: submissionTime,
            totalTimeTaken: timeTaken,
            status: 'submitted',
            submittedAt: submissionTime,
            tabSwitchCount: tabSwitchCount || 0
        };

        // Get the challenge test to check orderedQuestions structure
        const challengeTestData = challengeTestSnap.data();
        if (!challengeTestData?.orderedQuestions) {
            return NextResponse.json({ 
                success: false, 
                message: 'Challenge test does not have orderedQuestions structure' 
            }, { status: 400 });
        }

        // Store the user's submission first
        const userResult = {
            answers: answersForEvaluation,
            timeTaken,
            submittedAt: new Date(),
            status: 'submitted',
            tabSwitchCount: tabSwitchCount || 0
        };

        // Update the challenge test with user's submission
        await challengeTestRef.set({
            results: {
                ...(challengeTest.results || {}),
                [userId]: userResult,
            },
        }, { merge: true });

        // Use the admin evaluation system to calculate scores
        try {
            await evaluateChallengeTestSubmissionAdmin(testId, userId, submission);
        } catch (evaluationError) {
            console.error('Evaluation error:', evaluationError);
            // Continue with the logic even if evaluation fails
        }

        // Get the updated results after evaluation to check completion
        const updatedChallengeSnap = await challengeTestRef.get();
        const updatedChallengeData = updatedChallengeSnap.data();
        const results = updatedChallengeData?.results || {};
        const userIds = Object.keys(results);

        // Check if both users have submitted and been evaluated
        if (userIds.length === 2) {
            // Get evaluated results from the challenge test results
            const user1Result = results[userIds[0]];
            const user2Result = results[userIds[1]];
            
            // Use totalScore from evaluation results or fallback to a calculated value
            const user1Score = user1Result?.totalScore || user1Result?.totalCorrect || 0;
            const user2Score = user2Result?.totalScore || user2Result?.totalCorrect || 0;

            // Determine winner and loser
            const [winnerId, loserId] = user1Score > user2Score 
                ? [userIds[0], userIds[1]]
                : user2Score > user1Score 
                    ? [userIds[1], userIds[0]]
                    : [null, null];

            // Update coins if there's a clear winner
            if (winnerId && loserId) {
                const batch = adminFirestore.batch();
                const winnerRef = adminFirestore.collection('users').doc(winnerId);
                const loserRef = adminFirestore.collection('users').doc(loserId);

                batch.update(winnerRef, { coins: FieldValue.increment(100) });
                batch.update(loserRef, { coins: FieldValue.increment(-50) });
                await batch.commit();
            }

            // Mark challenge as completed
            await challengeTestRef.update({ status: 'completed' });
        }

        // Get the current user's result for the response
        const currentUserResult = results[userId] || {};
        const userScore = currentUserResult?.totalScore || currentUserResult?.totalCorrect || 0;
        const userCategoryScores = currentUserResult?.categoryScores || {};
        
        // Get total questions from the challenge test
        const totalQuestions = challengeTestData?.orderedQuestions?.length || 0;

        return NextResponse.json({ 
            success: true, 
            categoryScores: userCategoryScores, 
            totalCorrect: userScore, 
            totalQuestions 
        });
    } catch (error) {
        console.error('Error submitting challenge test:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
} 