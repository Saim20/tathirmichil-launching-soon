// Helper functions for challenge results and comparisons

/**
 * Calculates statistics for a challenge with both users' results
 */
export function calculateChallengeStats(challenge: any) {
  if (!challenge || !challenge.results) {
    return {
      hasAllResults: false,
      winner: null,
      isTie: false,
      creatorStats: null,
      invitedStats: null
    };
  }
  
  const creatorResult = challenge.results[challenge.createdBy];
  const invitedResult = challenge.results[challenge.invitedUser];
  
  if (!creatorResult || !invitedResult) {
    return {
      hasAllResults: false,
      winner: null,
      isTie: false,
      creatorStats: creatorResult ? getStatSummary(creatorResult) : null,
      invitedStats: invitedResult ? getStatSummary(invitedResult) : null
    };
  }
  
  const creatorScore = creatorResult.totalCorrect;
  const invitedScore = invitedResult.totalCorrect;
  
  // Determine tie or winner
  const isTie = creatorScore === invitedScore;
  const winner = isTie ? null : (creatorScore > invitedScore ? challenge.createdBy : challenge.invitedUser);
  
  return {
    hasAllResults: true,
    winner,
    isTie,
    creatorStats: getStatSummary(creatorResult),
    invitedStats: getStatSummary(invitedResult)
  };
}

/**
 * Get summary statistics for user result
 */
function getStatSummary(result: any) {
  if (!result) return null;
  
  // Calculate average time per question
  const avgTimePerQuestion = result.answers ? 
    Object.values(result.answers).reduce((total: number, answer: any) => total + (answer.timeTaken || 0), 0) / 
    Object.values(result.answers).length : 
    0;
  
  // Count unanswered questions
  const unansweredCount = result.answers ?
    Object.values(result.answers).filter((answer: any) => answer.selected === null).length :
    0;
  
  return {
    score: result.totalCorrect,
    total: result.totalQuestions || result.totalScore, // Fallback to totalScore for backwards compatibility
    percentage: result.totalQuestions 
      ? ((result.totalCorrect / result.totalQuestions) * 100).toFixed(1)
      : ((result.totalCorrect / result.totalScore) * 100).toFixed(1), // Fallback for old data
    timeTaken: result.timeTaken,
    avgTimePerQuestion,
    unansweredCount
  };
}

/**
 * Compares two users' answers to determine who performed better on each question
 */
export function compareQuestionPerformance(questionId: string, creatorAnswers: any, invitedAnswers: any, correctIndex: number) {
  const creatorAnswer = creatorAnswers[questionId];
  const invitedAnswer = invitedAnswers[questionId];
  
  // If either user didn't answer
  if (!creatorAnswer || !invitedAnswer) {
    return {
      creatorCorrect: creatorAnswer?.selected === correctIndex,
      invitedCorrect: invitedAnswer?.selected === correctIndex,
      winner: null
    };
  }
  
  const creatorCorrect = creatorAnswer.selected === correctIndex;
  const invitedCorrect = invitedAnswer.selected === correctIndex;
  
  // If both got it right, compare time
  if (creatorCorrect && invitedCorrect) {
    return {
      creatorCorrect,
      invitedCorrect,
      winner: creatorAnswer.timeTaken < invitedAnswer.timeTaken ? 'creator' : 
             invitedAnswer.timeTaken < creatorAnswer.timeTaken ? 'invited' : 'tie'
    };
  }
  
  // If only one got it right
  if (creatorCorrect) return { creatorCorrect, invitedCorrect, winner: 'creator' };
  if (invitedCorrect) return { creatorCorrect, invitedCorrect, winner: 'invited' };
  
  // Both got it wrong
  return { creatorCorrect, invitedCorrect, winner: null };
}
