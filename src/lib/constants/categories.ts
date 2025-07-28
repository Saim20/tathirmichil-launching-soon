/**
 * Test and Question Categories
 */

export const TEST_CATEGORIES = [
  'Math',
  'English', 
  'Analytical',
  'Writing',
  'Biology',
  'Chemistry',
  'Physics'
] as const;

export type TestCategory = typeof TEST_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Math': 'bg-blue-100 text-blue-800 border-blue-200',
  'English': 'bg-green-100 text-green-800 border-green-200',
  'Analytical': 'bg-purple-100 text-purple-800 border-purple-200',
  'Writing': 'bg-orange-100 text-orange-800 border-orange-200',
  'Biology': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Chemistry': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Physics': 'bg-red-100 text-red-800 border-red-200',
};

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'Math': 'Mathematics',
  'English': 'English',
  'Analytical': 'Analytical Ability',
  'Writing': 'Writing',
  'Biology': 'Biology',
  'Chemistry': 'Chemistry',
  'Physics': 'Physics',
};
