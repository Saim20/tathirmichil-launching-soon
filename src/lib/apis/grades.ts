import { updateUserGrade } from "@/lib/apis/users";

export type GradeValue = "A" | "B" | "C" | "D" | "F";

export interface StudentGrade {
  uid: string;
  grade: GradeValue;
  updatedAt: string; // ISO string
}

/**
 * Set student grade by updating their user profile
 */
export async function setStudentGrade(uid: string, grade: GradeValue): Promise<void> {
  const response = await updateUserGrade(uid, grade);
  if (!response.success) {
    throw new Error(response.error || 'Failed to update grade');
  }
}

/**
 * Get student grade from user profile (deprecated - use user.grade directly)
 * @deprecated Use user.grade from UserProfile instead
 */
export async function getStudentGrade(uid: string): Promise<StudentGrade | null> {
  // This function is now deprecated since grades are part of user profiles
  // Return null to indicate no separate grade record exists
  return null;
}
