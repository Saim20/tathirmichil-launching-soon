import { PersonalBatchFormData, FormValidationErrors } from "@/lib/models/form";

export interface FormStepProps {
  formData: Partial<PersonalBatchFormData>;
  errors: FormValidationErrors;
  onInputChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onValidationChange?: (fieldId: string, isValid: boolean, error?: string) => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isStepValid?: boolean;
  submitting?: boolean;
}

export interface PhotoUploadProps {
  photoFile: File | null;
  photoPreview: string;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (fieldId: string, isValid: boolean, error?: string) => void;
}

export interface StrugglingAreasProps {
  strugglingAreas: string[];
  onStrugglingAreasChange: (area: string, checked: boolean) => void;
}

export interface PreferredTimingProps {
  preferredTiming: string[];
  onPreferredTimingChange: (timing: string, checked: boolean) => void;
}
