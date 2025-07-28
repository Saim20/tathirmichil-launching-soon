import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsStudent } from '@/lib/helpers/role-checks';
import { convertToUTCPlus6 } from '@/app/(public)/api/server-time/get-time';
import { OrderedQuestion } from '@/lib/apis/test-types';

// Assume these helpers exist or stub them for now
// import { getUserByEmailOrUsername } from '@/lib/apis/users';
// import { getRandomQuestions } from '@/lib/apis/questions';

// Temporary stubs for helpers
async function getUserByEmail(identifier: string) {
  // Try to find user by email or username in Firestore
  const usersRef = adminFirestore.collection('users');
  let userSnap = await usersRef.where('email', '==', identifier).limit(1).get();
  if (!userSnap.empty) return userSnap.docs[0];
  return null;
}

async function getRandomQuestions(categoriesWithCounts: {category: string, numQuestions: number, numComprehensive: number}[]): Promise<OrderedQuestion[]> {
  let allQuestions: OrderedQuestion[] = [];
  
  for (const { category, numQuestions, numComprehensive } of categoriesWithCounts) {
    if (!category || (numQuestions === 0 && numComprehensive === 0)) continue;
    
    const categoryQuestions: OrderedQuestion[] = [];
    
    // Fetch regular questions if needed
    if (numQuestions > 0) {
      const regularQuestionsSnapshot = await adminFirestore.collection('questions')
        .where('category', '==', category)
        .orderBy('random')
        .limit(numQuestions)
        .get();
      
      if (regularQuestionsSnapshot.docs.length < numQuestions) {
        throw new Error(`Not enough regular questions in category: ${category} (found ${regularQuestionsSnapshot.docs.length}, need ${numQuestions})`);
      }
      
      // Shuffle and select required regular questions
      const shuffledRegular = regularQuestionsSnapshot.docs
        .map(doc => ({ id: doc.id, type: 'question' as const, doc }))
        .sort(() => 0.5 - Math.random())
        .slice(0, numQuestions);
      
      // Update random fields for selected regular questions
      const regularUpdatePromises = shuffledRegular.map(async (q) => {
        const randomNumber = Math.floor(Math.random() * 5000) + 1;
        await q.doc.ref.update({ random: randomNumber });
      });
      await Promise.all(regularUpdatePromises);
      
      categoryQuestions.push(...shuffledRegular.map(q => ({ id: q.id, type: q.type })));
    }
    
    // Fetch comprehensive questions if needed
    if (numComprehensive > 0) {
      const comprehensiveQuestionsSnapshot = await adminFirestore.collection('comprehensive-questions')
        .where('category', '==', category)
        .orderBy('random')
        .limit(numComprehensive)
        .get(); 
      
      if (comprehensiveQuestionsSnapshot.docs.length < numComprehensive) {
        throw new Error(`Not enough comprehensive questions in category: ${category} (found ${comprehensiveQuestionsSnapshot.docs.length}, need ${numComprehensive})`);
      }
      
      // Shuffle and select required comprehensive questions
      const shuffledComprehensive = comprehensiveQuestionsSnapshot.docs
        .map(doc => ({ id: doc.id, type: 'comprehensive' as const, doc }))
        .sort(() => 0.5 - Math.random())
        .slice(0, numComprehensive);

      // Update random fields for selected comprehensive questions
      const comprehensiveUpdatePromises = shuffledComprehensive.map(async (q) => {
        const randomNumber = Math.floor(Math.random() * 500) + 1;
        await q.doc.ref.update({ random: randomNumber });
      });

      await Promise.all(comprehensiveUpdatePromises);

      categoryQuestions.push(...shuffledComprehensive.map(q => ({ id: q.id, type: q.type })));
    }
    
    // Shuffle questions within category to mix regular and comprehensive
    const shuffledCategoryQuestions = categoryQuestions.sort(() => 0.5 - Math.random());
    allQuestions = allQuestions.concat(shuffledCategoryQuestions);
  }
  
  // Final shuffle of all questions
  return allQuestions.sort(() => 0.5 - Math.random());
}

export async function POST(req: NextRequest) {
  try {
    const { invitedUser, categories, numQuestions, time, startTime } = await req.json();
    
    // Validate required fields
    if (!invitedUser || !categories || !Array.isArray(categories) || categories.length === 0 || !time || !startTime) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }
    
    // Validate categories structure and calculate total questions
    let calculatedTotalQuestions = 0;
    for (const cat of categories) {
      if (!cat.category || (typeof cat.numQuestions !== 'number') || (typeof cat.numComprehensive !== 'number')) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid category structure. Each category must have category, numQuestions, and numComprehensive fields.' 
        }, { status: 400 });
      }
      calculatedTotalQuestions += cat.numQuestions + cat.numComprehensive;
    }
    
    if (calculatedTotalQuestions === 0) {
      return NextResponse.json({ success: false, message: 'At least one question must be selected.' }, { status: 400 });
    }

    // Authorization check
    const idToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { isStudent, userId } = await checkIfUserIsStudent(idToken);
    if (!isStudent) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Validate invited user
    const invitedUserObj = await getUserByEmail(invitedUser);
    if (!invitedUserObj) {
      return NextResponse.json({ success: false, message: 'Invited user not found.' }, { status: 404 });
    }
    if (invitedUserObj.id === userId) {
      return NextResponse.json({ success: false, message: 'You cannot challenge yourself.' }, { status: 400 });
    }

    // Get random questions
    let orderedQuestions: OrderedQuestion[] = [];
    try {
      orderedQuestions = await getRandomQuestions(categories);
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
    if (orderedQuestions.length < calculatedTotalQuestions) {
      return NextResponse.json({ success: false, message: 'Not enough questions in the selected categories.' }, { status: 400 });
    }

    // Get the user's display name
    const userSnap = await adminFirestore.collection('users').doc(userId).get();
    const userData = userSnap.data();

    const setStartTime = new Date(startTime);
    

    // Create challenge test document
    const challengeTestRef = adminFirestore.collection('challenge-tests');
    const challenge = await challengeTestRef.add({
      createdBy: userId,
      createdByName: userData?.displayName ?? '',
      invitedUser: invitedUserObj.id,
      invitedName: invitedUserObj.data()?.displayName ?? '',
      status: 'pending',
      orderedQuestions: orderedQuestions,
      userAnswers: {},
      results: {},
      createdAt: new Date(),
      startTime: setStartTime, // Store the start time if provided
      time, // Store the time limit for the test
    });

    // Add notification for the invited user
    await adminFirestore
      .collection('users')
      .doc(invitedUserObj.id)
      .collection('notifications').add({
        type: 'challenge-invite',
        challengeId: challenge.id,
        from: userId,
        fromName: userData?.displayName ?? '',
        createdAt: new Date(),
        read: false,
      });

    return NextResponse.json({ success: true, challengeTestId: challenge.id });
  } catch (error) {
    console.error('Error creating challenge test:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 