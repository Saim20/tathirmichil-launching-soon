import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/auth/auth-provider";
import { PersonalBatchFormData, FormValidationErrors } from "@/lib/models/form";
import {
    submitPersonalBatchForm,
    updatePersonalBatchForm,
    uploadFormPhoto,
    checkExistingFormSubmission,
} from "@/lib/apis/forms";
import { validateForm, validateCurrentStep, getStepWithError } from "@/lib/utils/formValidation";
import useAutoSave from "@/hooks/useAutoSave";

export interface UseFormStateReturn {
    // Form data and state
    formData: Partial<PersonalBatchFormData>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<PersonalBatchFormData>>>;
    errors: FormValidationErrors;
    setErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;

    // Loading states
    loading: boolean;
    submitting: boolean;
    submitted: boolean;
    setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;

    // Form submission states
    submitError: string;
    submitSuccess: string;
    setSubmitError: React.Dispatch<React.SetStateAction<string>>;
    setSubmitSuccess: React.Dispatch<React.SetStateAction<string>>;

    // Photo states
    photoFile: File | null;
    photoPreview: string;
    setPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
    setPhotoPreview: React.Dispatch<React.SetStateAction<string>>;

    // Step navigation
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    totalSteps: number;

    // Existing form data
    existingFormData: PersonalBatchFormData | null;
    setExistingFormData: React.Dispatch<React.SetStateAction<PersonalBatchFormData | null>>;

    // Auto-save
    autoSaveStatus: any;
    loadSavedData: () => any;
    clearSavedData: () => void;
    getSavedDataInfo: () => any;

    // Form handlers
    handleInputChange: (field: string, value: any) => void;
    handleStrugglingAreasChange: (area: string, checked: boolean) => void;
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;

    // Navigation functions
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;

    // Step completion tracking
    isStepCompleted: (step: number) => boolean;
    completedSteps: Set<number>;

    // Validation functions
    validateCurrentStepData: () => boolean;

    // Utilities
    getStepTitle: (step: number) => string;
}

export const useFormState = (): UseFormStateReturn => {
    const { user } = useContext(AuthContext) || {};
    const router = useRouter();

    // Basic state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [existingFormData, setExistingFormData] = useState<PersonalBatchFormData | null>(null);
    const [submitError, setSubmitError] = useState<string>("");
    const [submitSuccess, setSubmitSuccess] = useState<string>("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const [errors, setErrors] = useState<FormValidationErrors>({});

    // Track completed steps
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 7;

    const [formData, setFormData] = useState<Partial<PersonalBatchFormData>>({
        // Initialize with user data
        fullName: user?.displayName || "",
        emailAddress: user?.email || "",
        userId: user?.uid || "",
        strugglingAreas: [],
        group: "Science",
        hscBatch: "25",
        prepTimeline: "2-3 months",
        stableInternet: "Yes",
        videoCameraOn: "I agree",
        attendClasses: "Always unless emergency",
        activeParticipation: "Sure",
        skipOtherCoachings: "Done",
        stickTillExam: "Locked in",
        preferredTiming: "Evening",
        preferredStartDate: "ASAP",
    });

    // Initialize auto-save hook
    const { status: autoSaveStatus, loadSavedData, clearSavedData, getSavedDataInfo } = useAutoSave({
        data: formData,
        storageKey: `tathir_form_draft_${user?.uid || 'anonymous'}`,
        delay: 2000, // Save 2 seconds after user stops typing
        onSave: (data) => {
            console.log('Form auto-saved successfully');
        },
        onLoad: (data) => {
            console.log('Loaded form data:', data);
        },
    });

    // Check if user already submitted
    useEffect(() => {
        if (!user?.uid) return;

        const checkSubmission = async () => {
            setLoading(true);
            try {
                const result = await checkExistingFormSubmission(user.uid);

                if (result.success && result.data) {
                    const existingData = result.data.formData!;

                    // Process the existingData to handle Firestore timestamp conversion
                    const processedData = {
                        ...existingData,
                        submittedAt: existingData.submittedAt
                    };

                    setExistingFormData(processedData);
                    setSubmitted(true);

                    // Load existing data into form state
                    setFormData(processedData);



                    // Set photo preview if available from existing form data
                    if (processedData.profilePictureUrl) {
                        console.log('processedData.profilePictureUrl:', processedData.profilePictureUrl);
                        
                        setPhotoPreview(processedData.profilePictureUrl);
                    }
                }
            } catch (error) {
                console.error("Error checking existing submission:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSubmission();
    }, [user?.uid]);

    // Check for saved draft data on mount
    useEffect(() => {
        if (!user?.uid || submitted) return;

        const savedDataInfo = getSavedDataInfo();
        if (savedDataInfo.exists && !savedDataInfo.isExpired) {
            // Optionally show a notification about available draft data
            console.log('Found saved draft data from', savedDataInfo.timestamp);
        }
    }, [user?.uid, submitted, getSavedDataInfo]);

    // When user switches to editing mode, ensure existing form data and profile picture are loaded
    useEffect(() => {
        if (isEditing && existingFormData && !loading) {
            console.log('Switching to edit mode, loading existing data:', existingFormData);
            setFormData(existingFormData);
            
            // Load existing profile picture if available
            if ((existingFormData as any).profilePictureUrl) {
                setPhotoPreview((existingFormData as any).profilePictureUrl);
                console.log('Loaded existing profile picture in edit mode:', (existingFormData as any).profilePictureUrl);
            }

            // Mark all steps as completed if we have existing form data
            const allSteps = new Set<number>();
            for (let i = 1; i <= totalSteps; i++) {
                const stepErrors = validateCurrentStep(
                    existingFormData, 
                    i, 
                    null, 
                    (existingFormData as any).profilePictureUrl
                );
                if (Object.keys(stepErrors).length === 0) {
                    allSteps.add(i);
                }
            }
            setCompletedSteps(allSteps);
        }
    }, [isEditing, existingFormData, loading]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        // Clear general submit error when user starts typing
        if (submitError) {
            setSubmitError("");
        }
    };

    const handleStrugglingAreasChange = (area: string, checked: boolean) => {
        const areas = formData.strugglingAreas || [];
        if (checked) {
            handleInputChange("strugglingAreas", [...areas, area]);
        } else {
            handleInputChange(
                "strugglingAreas",
                areas.filter((a) => a !== area)
            );
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Validate current step only
    const validateCurrentStepData = (): boolean => {
        const stepErrors = validateCurrentStep(
            formData, 
            currentStep, 
            photoFile, 
            photoPreview || existingFormData?.profilePictureUrl
        );
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Check if a specific step is completed (has valid data)
    const isStepCompleted = (step: number): boolean => {
        const stepErrors = validateCurrentStep(
            formData, 
            step, 
            photoFile, 
            photoPreview || existingFormData?.profilePictureUrl
        );
        return Object.keys(stepErrors).length === 0;
    };

    // Navigation functions
    const nextStep = () => {
        if (validateCurrentStepData()) {
            // Mark current step as completed
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: number) => {
        // Allow navigation to:
        // 1. Previous steps (step <= currentStep)
        // 2. Completed steps (even if they're ahead)
        // 3. Next step if current step is valid
        if (step <= currentStep || completedSteps.has(step) || (step === currentStep + 1 && validateCurrentStepData())) {
            // If moving forward and current step is valid, mark it as completed
            if (step > currentStep && validateCurrentStepData()) {
                setCompletedSteps(prev => new Set([...prev, currentStep]));
            }
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Get step title for navigation
    const getStepTitle = (step: number): string => {
        const titles = {
            1: "Basic Information",
            2: "Academic Information",
            3: "Personal Questions",
            4: "Preparation Details",
            5: "Commitment",
            6: "Reflection",
            7: "Referral & Timing"
        };
        return titles[step as keyof typeof titles] || "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Form submission started");

        // Clear previous messages
        setSubmitError("");
        setSubmitSuccess("");
        console.log("Form data before submission:", formData);

        // Validate all form data (not just current step)
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);

        console.log("Validation errors:", validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            // Find which step has the first error and navigate to it
            const errorStep = getStepWithError(validationErrors, totalSteps);
            setCurrentStep(errorStep);

            // Scroll to first error
            const firstErrorField = Object.keys(validationErrors)[0];
            setTimeout(() => {
                const element = document.getElementById(firstErrorField);
                element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);

            setSubmitError(
                "Please correct the errors highlighted above and try again."
            );
            return;
        }

        setSubmitting(true);

        try {
            // Check if user is authenticated
            if (!user?.uid) {
                throw new Error("You must be logged in to submit the form");
            }

            // Upload photo if provided (this will update user's profile picture)
            if (photoFile && user?.uid) {
                setSubmitSuccess("Uploading photo...");
                const photoResult = await uploadFormPhoto(photoFile, user.uid);
                if (!photoResult.success) {
                    throw new Error(
                        "Failed to upload photo: " + (photoResult.error || "Unknown error")
                    );
                }
                setSubmitSuccess("Photo uploaded successfully. Submitting form...");
            }

            // Submit or update form data
            const submitData: PersonalBatchFormData = {
                ...formData,
                userId: user?.uid || "",
                submittedAt: existingFormData?.submittedAt || new Date(),
            } as PersonalBatchFormData;

            console.log("Submitting form data:", submitData);

            // Use update function if form already exists, otherwise submit new form
            const result = existingFormData
                ? await updatePersonalBatchForm(submitData)
                : await submitPersonalBatchForm(submitData);

            console.log("Submission result:", result);

            if (result.success) {
                const successMessage = existingFormData
                    ? "Application updated successfully!"
                    : "Application submitted successfully!";
                setSubmitSuccess(successMessage);
                setExistingFormData(submitData);

                // Clear auto-saved draft data since form is now successfully submitted
                clearSavedData();

                setTimeout(() => {
                    setSubmitted(true);
                    setIsEditing(false);
                }, 1500);
            } else {
                throw new Error(result.error || "Failed to submit form");
            }
        } catch (error: any) {
            console.error("Form submission error:", error);
            setSubmitError(
                error.message || "Failed to submit form. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return {
        // Form data and state
        formData,
        setFormData,
        errors,
        setErrors,

        // Loading states
        loading,
        submitting,
        submitted,
        setSubmitted,
        isEditing,
        setIsEditing,

        // Form submission states
        submitError,
        submitSuccess,
        setSubmitError,
        setSubmitSuccess,

        // Photo states
        photoFile,
        photoPreview,
        setPhotoFile,
        setPhotoPreview,

        // Step navigation
        currentStep,
        setCurrentStep,
        totalSteps,

        // Existing form data
        existingFormData,
        setExistingFormData,

        // Auto-save
        autoSaveStatus,
        loadSavedData,
        clearSavedData,
        getSavedDataInfo,

        // Form handlers
        handleInputChange,
        handleStrugglingAreasChange,
        handlePhotoChange,
        handleSubmit,

        // Navigation functions
        nextStep,
        prevStep,
        goToStep,

        // Step completion tracking
        isStepCompleted,
        completedSteps,

        // Validation functions
        validateCurrentStepData,

        // Utilities
        getStepTitle,
    };
};
