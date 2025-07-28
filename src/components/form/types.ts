import { PersonalBatchFormData, FormValidationErrors } from "@/lib/models/form";

export interface FormStepProps {
  formData: Partial<PersonalBatchFormData>;
  errors: FormValidationErrors;
  onInputChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  submitting?: boolean;
}

export interface PhotoUploadProps {
  photoFile: File | null;
  photoPreview: string;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface StrugglingAreasProps {
  strugglingAreas: string[];
  onStrugglingAreasChange: (area: string, checked: boolean) => void;
}
