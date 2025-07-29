import { PersonalBatchFormData, FormValidationErrors } from "@/lib/models/form";

export const validateForm = (formData: Partial<PersonalBatchFormData>): FormValidationErrors => {
  // Form validation is now handled by individual form field components
  // This function is kept for backwards compatibility but returns empty errors
  // since validation is done at the component level
  return {};
};

export const validateCurrentStep = (
  formData: Partial<PersonalBatchFormData>,
  currentStep: number,
  photoFile?: File | null,
  existingPhotoUrl?: string
): FormValidationErrors => {
  // Step validation is now handled by individual form field components
  // This function is kept for backwards compatibility but returns empty errors
  // since validation is done at the component level
  return {};
};

export const getStepWithError = (
  validationErrors: FormValidationErrors, 
  totalSteps: number
): number => {
  const errorFields = Object.keys(validationErrors);
  const stepFields: { [key: number]: string[] } = {
    1: ["fullName", "phoneNumber", "emailAddress", "facebookProfile", "location"],
    2: ["school", "college", "academicDescription", "hscBatchOther"],
    3: ["personalDescription", "whyIBA", "whyApplyingHere", "ifNotIBA"],
    4: ["fiveYearsVision", "otherPlatforms", "admissionPlans"],
    5: [], 
    6: ["recentFailure", "lastBookVideoArticle"],
    7: []
  };

  // Find the first step with an error
  for (let step = 1; step <= totalSteps; step++) {
    const stepFieldsArray = stepFields[step] || [];
    if (stepFieldsArray.some(field => errorFields.includes(field))) {
      return step;
    }
  }
  
  return 1; // Default to first step if no specific step found
};
