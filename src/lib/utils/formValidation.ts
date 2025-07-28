import { PersonalBatchFormData, FormValidationErrors } from "@/lib/models/form";

export const validateForm = (formData: Partial<PersonalBatchFormData>): FormValidationErrors => {
  const newErrors: FormValidationErrors = {};

  // Required fields validation
  const requiredFields = [
    "fullName",
    "phoneNumber",
    "emailAddress",
    "facebookProfile",
    "location",
    "school",
    "college",
    "academicDescription",
    "personalDescription",
    "whyIBA",
    "whyApplyingHere",
    "ifNotIBA",
    "fiveYearsVision",
    "otherPlatforms",
    "admissionPlans",
    "recentFailure",
    "lastBookVideoArticle",
  ];

  requiredFields.forEach((field) => {
    if (
      !formData[field as keyof PersonalBatchFormData] ||
      (typeof formData[field as keyof PersonalBatchFormData] === "string" &&
        (formData[field as keyof PersonalBatchFormData] as string).trim() === "")
    ) {
      newErrors[field] = "This field is required";
    }
  });

  // Minimum sentence validations - improved sentence counting
  if (
    formData.academicDescription &&
    formData.academicDescription.split(/[.!?]+/).filter(s => s.trim().length > 5).length < 5
  ) {
    newErrors.academicDescription = "Please write at least 5 sentences";
  }

  if (
    formData.personalDescription &&
    formData.personalDescription.split(/[.!?]+/).filter(s => s.trim().length > 5).length < 5
  ) {
    newErrors.personalDescription = "Please write at least 5 sentences";
  }

  // Phone number validation (less strict: allow 8+ digits, ignore format)
  if (
    formData.phoneNumber &&
    formData.phoneNumber.replace(/\D/g, "").length < 8
  ) {
    newErrors.phoneNumber = "Please enter a valid phone number";
  }

  // Email validation (less strict: just check for "@" and ".")
  if (
    formData.emailAddress &&
    (!formData.emailAddress.includes("@") ||
      !formData.emailAddress.includes("."))
  ) {
    newErrors.emailAddress = "Please enter a valid email address";
  }

  // Facebook URL validation (less strict: just check for "facebook")
  if (
    formData.facebookProfile &&
    !formData.facebookProfile.toLowerCase().includes("facebook")
  ) {
    newErrors.facebookProfile = "Please enter a valid Facebook profile URL";
  }

  // HSC Batch "Other" validation
  if (
    formData.hscBatch === "Other" &&
    (!formData.hscBatchOther || formData.hscBatchOther.trim() === "")
  ) {
    newErrors.hscBatchOther = "Please specify your batch";
  }

  return newErrors;
};

export const validateCurrentStep = (
  formData: Partial<PersonalBatchFormData>,
  currentStep: number,
  photoFile?: File | null,
  existingPhotoUrl?: string
): FormValidationErrors => {
  const stepFields: { [key: number]: string[] } = {
    1: ["fullName", "phoneNumber", "emailAddress", "facebookProfile", "location"],
    2: ["school", "college", "academicDescription"],
    3: ["personalDescription", "whyIBA", "whyApplyingHere", "ifNotIBA"],
    4: ["fiveYearsVision", "otherPlatforms", "admissionPlans"],
    5: [], // Commitment section - all dropdowns with defaults
    6: ["recentFailure", "lastBookVideoArticle"],
    7: [] // Referral section - optional fields
  };

  const currentStepFields = stepFields[currentStep] || [];
  const stepErrors: FormValidationErrors = {};

  currentStepFields.forEach((field) => {
    if (
      !formData[field as keyof PersonalBatchFormData] ||
      (typeof formData[field as keyof PersonalBatchFormData] === "string" &&
        (formData[field as keyof PersonalBatchFormData] as string).trim() === "")
    ) {
      stepErrors[field] = "This field is required";
    }
  });

  // Additional validations for specific steps
  if (currentStep === 1) {
    // Photo validation - require either a new photo file or existing photo URL
    if (!photoFile && !existingPhotoUrl) {
      stepErrors.profilePicture = "Profile picture is required";
    }

    if (
      formData.phoneNumber &&
      formData.phoneNumber.replace(/\D/g, "").length < 8
    ) {
      stepErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (
      formData.emailAddress &&
      (!formData.emailAddress.includes("@") ||
        !formData.emailAddress.includes("."))
    ) {
      stepErrors.emailAddress = "Please enter a valid email address";
    }

    if (
      formData.facebookProfile &&
      !formData.facebookProfile.toLowerCase().includes("facebook")
    ) {
      stepErrors.facebookProfile = "Please enter a valid Facebook profile URL";
    }
  }

  if (currentStep === 2) {
    if (
      formData.academicDescription &&
      formData.academicDescription.split(/[.!?]+/).filter(s => s.trim().length > 10).length < 5
    ) {
      stepErrors.academicDescription = "Please write at least 5 sentences";
    }
  }

  if (currentStep === 3) {
    if (
      formData.personalDescription &&
      formData.personalDescription.split(/[.!?]+/).filter(s => s.trim().length > 10).length < 5
    ) {
      stepErrors.personalDescription = "Please write at least 5 sentences";
    }
  }

  return stepErrors;
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
