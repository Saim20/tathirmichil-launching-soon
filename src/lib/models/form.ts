export interface PersonalBatchFormData {
  // Section 1 - Basic Information
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  facebookProfile: string;
  location: string;
  profilePictureUrl?: string; // Optional, can be set after upload
  // Note: Profile photo is stored in users/{uid}/profilePictureUrl

  // Section 2 - Academic Information
  school: string;
  college: string;
  group: 'Science' | 'Business' | 'Humanities' | 'Mixed';
  hscBatch: '24' | '25' | '26' | 'Other';
  hscBatchOther?: string;
  academicDescription: string;

  // Section 3 - Personal Questions
  personalDescription: string;
  whyIBA: string;
  whyApplyingHere: string;
  ifNotIBA: string;
  fiveYearsVision: string;

  // Section 4 - Preparation Details
  otherPlatforms: string;
  strugglingAreas: string[];
  prepTimeline: '< 1 month' | '2-3 months' | '4-6 months' | '> 6 months';
  admissionPlans: string;

  // Section 5 - Commitment
  stableInternet: 'Yes' | 'Chole' | 'Badbuzz';
  videoCameraOn: 'I agree' | 'Parbo nah';
  attendClasses: 'Always unless emergency' | 'Might skip a few' | 'If I can manage time';
  activeParticipation: 'Sure' | 'Maybe' | "Can't";
  skipOtherCoachings: 'Done' | 'Will juggle' | 'Not possible';
  stickTillExam: 'Locked in' | 'May drop midway';

  // Section 6 - Reflection
  recentFailure: string;
  lastBookVideoArticle: string;

  // Section 7 - Referral & Timing
  referral: string;
  preferredStartDate: string;
  preferredTiming: string[];
  preferredBatchType: 'Crash' | 'Regular';
  selectedBatch: string;

  // Metadata
  userId: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FormValidationErrors {
  [key: string]: string;
}
