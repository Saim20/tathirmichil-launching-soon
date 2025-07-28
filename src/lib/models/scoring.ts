export interface CategoryScore {
    [category: string]: {
        score: number;
        total: number;
        subcategories: {
            [subcategory: string]: {
                score: number;
                total: number;
            };
        };
    };
}

export interface QuestionOptionStats {
    [questionId: string]: {
        [optionIndex: number]: {
            count: number;
            percent: number;
        };
    };
}

export interface Stats {
    [id: string]: {
        time: number;
        count: number;
        percent: number;
        avgTime: number;
        totalCount: number;
    };
}

export type UserAnswerData = {
    questions: Record<string, { selected: number | null; timeTaken: number }>;
    updatedAt: string;
    startedAt: string;
};