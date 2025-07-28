/**
 * Test Data Transformers
 * 
 * This module contains all the data transformation functions for converting
 * Firestore documents to TypeScript interfaces.
 */

import { DocumentData } from "firebase/firestore";
import { validateRequiredFields, timestampToDate } from "./base";
import { 
    Test, 
    LiveTest, 
    AssessmentTest, 
    ChallengeTest,
    TestType,
    TestVariant
} from "./test-types";

// ============================================================================
// TRANSFORMERS
// ============================================================================

export const transformTest = (data: DocumentData, id: string): Test => {
    if (data.title === undefined &&  data.createdBy !== undefined) {
        data.title = `Test by ${data.createdByName}`;
    }
    validateRequiredFields(data, ['title', 'orderedQuestions', 'time', 'createdAt'], 'Test');
    
    return {
        id,
        title: data.title,
        orderedQuestions: data.orderedQuestions || [],
        time: data.time,
        createdAt: timestampToDate(data.createdAt),
        category: data.category,
        subCategory: data.subCategory,
    };
};

export const transformLiveTest = (data: DocumentData, id: string): LiveTest => {
    const test = transformTest(data, id) as LiveTest;
    validateRequiredFields(data, ['startsAt'], 'Live Test');
    test.startsAt = timestampToDate(data.startsAt);
    return test;
};

export const transformAssessmentTest = (data: DocumentData, id: string): AssessmentTest => {
    return transformTest(data, id) as AssessmentTest;
};

export const transformChallengeTest = (data: DocumentData, id: string): ChallengeTest => {
    const test = transformTest(data, id) as ChallengeTest;
    validateRequiredFields(data, ['createdBy', 'createdByName', 'invitedUser', 'invitedName', 'status', 'startTime'], 'Challenge test');
    
    test.createdBy = data.createdBy;
    test.createdByName = data.createdByName;
    test.invitedUser = data.invitedUser;
    test.invitedName = data.invitedName;
    test.status = data.status;
    test.results = data.results;
    test.startTime = timestampToDate(data.startTime);
    
    return test;
};

// ============================================================================
// TRANSFORMER UTILITIES
// ============================================================================

export const getTransformerForTestType = (testType: TestType) => {
    switch (testType) {
        case 'live':
            return transformLiveTest;
        case 'assessment':
            return transformAssessmentTest;
        case 'challenge':
            return transformChallengeTest;
        case 'practice':
        default:
            return transformTest;
    }
};

export const getCollectionNameForTestType = (testType: TestType): string => {
    return `${testType}-tests`;
};
