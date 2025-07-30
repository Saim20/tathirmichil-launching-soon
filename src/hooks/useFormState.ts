import { useState, useEffect, useContext, useRef } from "react";
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
import { storage } from "@/lib/firebase/firebase";
import { ref, deleteObject } from "firebase/storage";

export interface AutoSaveStatus {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
    error?: string;
}

export interface SubmissionStatus {
    status: 'unsubmitted' | 'submitting' | 'submitted' | 'modified' | 'error';
    lastSubmissionDate?: Date;
    hasUnsavedChanges: boolean;
}

export interface StepValidationError {
    field: string;
    message: string;
}

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
    currentPhotoUrl: string;
    isUploadingPhoto: boolean;

    // Step navigation
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    totalSteps: number;

    // Existing form data
    existingFormData: PersonalBatchFormData | null;
    setExistingFormData: React.Dispatch<React.SetStateAction<PersonalBatchFormData | null>>;

    // Auto-save
    autoSaveStatus: AutoSaveStatus;
    loadSavedData: () => any;
    clearSavedData: () => void;
    getSavedDataInfo: () => any;
    hasUnsavedChanges: boolean;

    // Submission status
    submissionStatus: SubmissionStatus;
    getAllValidationErrors: () => FormValidationErrors;
    getCurrentStepValidationErrors: () => StepValidationError[];
    getCompletedFieldsCount: () => number;
    getTotalFieldsCount: () => number;
    getStepValidationErrors: (stepNumber: number) => StepValidationError[];
    getStepFieldsCount: (stepNumber: number) => number;
    validateAndSetCurrentStepErrors: () => boolean;

    // Form handlers
    handleInputChange: (field: string, value: any) => void;
    handleStrugglingAreasChange: (area: string, checked: boolean) => void;
    handlePreferredTimingChange: (timing: string, checked: boolean) => void;
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;

    // Navigation functions
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;

    // Step completion tracking
    isStepCompleted: (step: number) => boolean;
    completedSteps: Set<number>;
    setCompletedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;

    // Utilities
    getStepTitle: (step: number) => string;
    isStepValid: (stepNumber: number) => boolean;
}

export const useFormState = (): UseFormStateReturn => {
    const { user, userProfile } = useContext(AuthContext) || {};
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

    // Submission status tracking
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
        status: 'unsubmitted',
        hasUnsavedChanges: false
    });
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>(""); // Track current uploaded photo URL
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false); // Track photo upload status
    const [errors, setErrors] = useState<FormValidationErrors>({});

    // Track completed steps
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Track if we've already loaded existing data in edit mode to prevent overriding user changes
    const [hasLoadedExistingData, setHasLoadedExistingData] = useState(false);

    // Track if we're currently loading initial data to prevent auto-save conflicts
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);

    // Track unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Auto-save status
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>({ status: 'idle' });

    // Auto-save timeout ref
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        preferredTiming: [],
        preferredBatchType: "Regular",
        preferredStartDate: "ASAP",
    });

    // Direct auto-save implementation
    const storageKey = `tathir_form_latest_${user?.uid || 'anonymous'}`;

    // Auto-save function
    const saveDataToLocalStorage = () => {
        try {
            const saveData = {
                formData,
                currentStep,
                photoPreview,
                currentPhotoUrl, // Save the uploaded photo URL
                completedSteps: Array.from(completedSteps),
                timestamp: Date.now(),
                version: '1.2' // Updated version to handle photo URL
            };

            localStorage.setItem(storageKey, JSON.stringify(saveData));

            const now = new Date();
            setAutoSaveStatus({
                status: 'saved',
                lastSaved: now
            });
            setHasUnsavedChanges(false);

        } catch (error) {
            setAutoSaveStatus({
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error('Failed to auto-save form:', error);
        }
    };

    // Load saved data function
    const loadSavedData = () => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);

                if (!parsed.formData || !parsed.timestamp) {
                    console.warn("Invalid saved data structure, removing...");
                    localStorage.removeItem(storageKey);
                    return null;
                }

                const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;

                if (!isExpired) {
                    console.log("📂 Loaded saved form data from", new Date(parsed.timestamp).toLocaleString());
                    return parsed;
                } else {
                    console.log("🗑️ Removing expired form data (older than 24 hours)");
                    localStorage.removeItem(storageKey);
                }
            }
        } catch (error) {
            console.error("Failed to load saved form data:", error);
            try {
                localStorage.removeItem(storageKey);
            } catch (clearError) {
                console.error("Failed to clear corrupted data:", clearError);
            }
        }
        return null;
    };

    // Clear saved data function
    const clearSavedData = () => {
        try {
            localStorage.removeItem(storageKey);
            setAutoSaveStatus({ status: 'idle' });
        } catch (error) {
            console.error("Failed to clear saved form data:", error);
        }
    };

    // Get saved data info function
    const getSavedDataInfo = () => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    exists: true,
                    timestamp: new Date(parsed.timestamp),
                    isExpired: Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000
                };
            }
        } catch (error) {
            console.error("Failed to get saved data info:", error);
        }
        return { exists: false };
    };

    // Set profile picture from user's auth profile if available
    useEffect(() => {
        console.log('Profile picture check:', { userProfile: userProfile?.profilePictureUrl, userPhotoURL: user?.photoURL, photoPreview, photoFile });

        if (userProfile?.profilePictureUrl && !photoPreview && !photoFile) {
            console.log('Setting initial profile picture from user profile:', userProfile.profilePictureUrl);
            setPhotoPreview(userProfile.profilePictureUrl);
            setCurrentPhotoUrl(userProfile.profilePictureUrl);
        } else if (user?.photoURL && !photoPreview && !photoFile) {
            console.log('Setting initial profile picture from user auth:', user.photoURL);
            setPhotoPreview(user.photoURL);
            setCurrentPhotoUrl(user.photoURL);
        }
    }, [user?.photoURL, photoFile, userProfile?.profilePictureUrl, photoPreview]);

    // Auto-save effect - triggers when form data changes
    useEffect(() => {
        if (!user?.uid || isLoadingInitialData) return;

        // Clear any existing timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set status to saving and mark as unsaved
        setAutoSaveStatus({ status: 'saving' });
        setHasUnsavedChanges(true);

        // Set timeout for auto-save (1 second after last change)
        autoSaveTimeoutRef.current = setTimeout(() => {
            saveDataToLocalStorage();
        }, 1000);

        // Cleanup timeout on unmount
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [formData, currentStep, photoPreview, completedSteps, user?.uid, isLoadingInitialData]);

    // Load data on mount - localStorage first (latest edits), then database
    useEffect(() => {
        if (!user?.uid) return;

        console.log('🔄 Starting initial data load for user:', user.uid);
        let hasLoadedData = false;

        // First, try to load from localStorage (latest edits)
        const savedDataInfo = getSavedDataInfo();
        if (savedDataInfo.exists && !savedDataInfo.isExpired) {
            const savedData = loadSavedData();
            if (savedData?.formData) {
                console.log('📥 Loading latest edits from localStorage');
                setFormData(savedData.formData);
                if (savedData.currentStep) {
                    setCurrentStep(savedData.currentStep);
                }
                if (savedData.completedSteps) {
                    setCompletedSteps(new Set(savedData.completedSteps));
                }
                // Only restore saved photo if it exists and is different from user's profile picture
                // This prevents overriding the user's profile picture with empty/placeholder values
                if (savedData.photoPreview &&
                    savedData.photoPreview !== userProfile?.profilePictureUrl &&
                    savedData.photoPreview !== user?.photoURL) {
                    setPhotoPreview(savedData.photoPreview);
                }
                if (savedData.currentPhotoUrl) {
                    setCurrentPhotoUrl(savedData.currentPhotoUrl); // Restore uploaded photo URL
                }
                hasLoadedData = true;
                setHasUnsavedChanges(false); // Data loaded from localStorage is considered saved
            }
        }

        // If no localStorage data, check database for existing submission
        if (!hasLoadedData) {
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

                        // Load existing data into form state only if no localStorage data
                        console.log('📥 Loading data from database (no localStorage found)');
                        setFormData(processedData);

                        // Set photo preview if available from existing form data
                        // Only set if it's different from user's profile picture to avoid conflicts
                        if (processedData.profilePictureUrl?.trim() &&
                            processedData.profilePictureUrl !== userProfile?.profilePictureUrl &&
                            processedData.profilePictureUrl !== user?.photoURL) {
                            setPhotoPreview(processedData.profilePictureUrl);
                            setCurrentPhotoUrl(processedData.profilePictureUrl); // Track current uploaded URL
                        } else if (!processedData.profilePictureUrl?.trim()) {
                            // If no profile picture in database, let the profile picture useEffect handle it
                            setPhotoPreview("");
                        }
                        setHasUnsavedChanges(false); // Data loaded from database is considered saved
                    }
                } catch (error) {
                    console.error("Error checking existing submission:", error);
                } finally {
                    setLoading(false);
                    console.log('✅ Database check complete - enabling auto-save');
                    setIsLoadingInitialData(false); // Enable auto-save after initial loading
                }
            };

            checkSubmission();
        } else {
            // Data was loaded from localStorage, no need to check database
            console.log('✅ Initial data loading complete - enabling auto-save');
            setIsLoadingInitialData(false);
        }
    }, [user?.uid]); // Removed getSavedDataInfo and loadSavedData from dependencies

    // When user switches to editing mode, ensure existing form data and profile picture are loaded (only once)
    useEffect(() => {
        if (isEditing && existingFormData && !loading && !hasLoadedExistingData) {
            console.log('Switching to edit mode, loading existing data:', existingFormData);
            setFormData(existingFormData);

            // Load existing profile picture if available
            if ((existingFormData as any).profilePictureUrl?.trim()) {
                setPhotoPreview((existingFormData as any).profilePictureUrl);
                setCurrentPhotoUrl((existingFormData as any).profilePictureUrl); // Track current uploaded URL
                console.log('Loaded existing profile picture in edit mode:', (existingFormData as any).profilePictureUrl);
            } else {
                // If profilePictureUrl is empty or undefined, ensure photoPreview is empty
                setPhotoPreview("");
                console.log('No valid profile picture in existing data, clearing photoPreview');
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

            // Mark that we've loaded the data
            setHasLoadedExistingData(true);
        }

        // Reset the flag when exiting edit mode
        if (!isEditing && hasLoadedExistingData) {
            setHasLoadedExistingData(false);
        }
    }, [isEditing, existingFormData, loading, hasLoadedExistingData]);

    // Revalidate completed steps when form data changes
    useEffect(() => {
        if (!user?.uid || submitted || loading) return;

        // Create a function to validate each step
        const validateStep = (step: number): boolean => {
            switch (step) {
                case 1:
                    return !!(formData.fullName?.trim() &&
                        formData.emailAddress?.trim() &&
                        formData.phoneNumber?.trim() &&
                        formData.facebookProfile?.trim() &&
                        (photoPreview?.trim() || photoFile)); // Include photo validation with proper empty string check
                case 2:
                    return !!(formData.school?.trim() &&
                        formData.college?.trim() &&
                        formData.group &&
                        formData.hscBatch &&
                        formData.academicDescription?.trim());
                case 3:
                    return !!(formData.personalDescription?.trim() &&
                        formData.whyIBA?.trim() &&
                        formData.whyApplyingHere?.trim() &&
                        formData.ifNotIBA?.trim());
                case 4:
                    return !!(formData.prepTimeline &&
                        formData.strugglingAreas && formData.strugglingAreas.length > 0 &&
                        formData.fiveYearsVision?.trim() &&
                        formData.otherPlatforms?.trim() &&
                        formData.admissionPlans?.trim());
                case 5:
                    return !!(formData.stableInternet &&
                        formData.videoCameraOn &&
                        formData.attendClasses &&
                        formData.activeParticipation &&
                        formData.skipOtherCoachings &&
                        formData.stickTillExam);
                case 6:
                    return !!(formData.recentFailure?.trim() &&
                        formData.lastBookVideoArticle?.trim());
                case 7:
                    return !!(formData.preferredTiming && formData.preferredTiming.length > 0 &&
                        formData.preferredBatchType);
                default:
                    return false;
            }
        };

        // Revalidate all completed steps
        const validSteps = new Set<number>();
        for (let step = 1; step <= totalSteps; step++) {
            if (validateStep(step)) {
                validSteps.add(step);
            }
        }

        setCompletedSteps(validSteps);
    }, [formData, user?.uid, submitted, loading, totalSteps, photoPreview, photoFile]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true); // Mark as having unsaved changes

        // Update submission status if form was previously submitted
        if (submissionStatus.status === 'submitted') {
            setSubmissionStatus(prev => ({
                ...prev,
                status: 'modified',
                hasUnsavedChanges: true
            }));
        }

        // Don't clear errors immediately - let validation handle it
        // This prevents the flickering effect

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

    const handlePreferredTimingChange = (timing: string, checked: boolean) => {
        const timings = formData.preferredTiming || [];
        if (checked) {
            handleInputChange("preferredTiming", [...timings, timing]);
        } else {
            handleInputChange(
                "preferredTiming",
                timings.filter((t) => t !== timing)
            );
        }
    };

    // Helper function to check if URL is Firebase storage URL and extract path
    const isFirebaseStorageUrl = (url: string): boolean => {
        return url.includes('firebasestorage.googleapis.com') || url.includes('firebase');
    };

    // Helper function to delete previous photo from Firebase storage
    const deletePreviousPhoto = async (photoUrl: string): Promise<void> => {
        if (!photoUrl || !isFirebaseStorageUrl(photoUrl)) return;

        try {
            // Extract the path from the URL
            // Firebase storage URLs have format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?{params}
            const urlParts = photoUrl.split('/o/');
            if (urlParts.length > 1) {
                const pathWithParams = urlParts[1];
                const path = decodeURIComponent(pathWithParams.split('?')[0]);
                const photoRef = ref(storage, path);
                await deleteObject(photoRef);
                console.log('Successfully deleted previous photo:', path);
            }
        } catch (error) {
            console.error('Error deleting previous photo:', error);
            // Don't throw error - continue with upload even if deletion fails
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.uid) return;

        setIsUploadingPhoto(true);
        setHasUnsavedChanges(true);

        try {
            // Delete previous photo if it exists and is from Firebase storage
            if (currentPhotoUrl) {
                await deletePreviousPhoto(currentPhotoUrl);
            }

            // Upload new photo immediately
            const uploadResult = await uploadFormPhoto(file, user.uid);

            if (uploadResult.success && uploadResult.data?.photoUrl) {
                // Update states with new photo
                setCurrentPhotoUrl(uploadResult.data.photoUrl);
                setPhotoPreview(uploadResult.data.photoUrl);
                setPhotoFile(file); // Keep file reference for form data

                console.log('Photo uploaded successfully:', uploadResult.data.photoUrl);

                // Trigger auto-save since we have a new photo URL
                setAutoSaveStatus({ status: 'saving' });

                // Clear any previous auto-save timeout
                if (autoSaveTimeoutRef.current) {
                    clearTimeout(autoSaveTimeoutRef.current);
                }

                // Save to localStorage immediately with new photo URL
                autoSaveTimeoutRef.current = setTimeout(() => {
                    saveDataToLocalStorage();
                    setAutoSaveStatus({
                        status: 'saved',
                        lastSaved: new Date()
                    });
                }, 500); // Short delay for immediate save
            } else {
                throw new Error(uploadResult.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            setAutoSaveStatus({
                status: 'error',
                error: 'Failed to upload photo'
            });

            // Still set preview for user feedback, but don't update currentPhotoUrl
            const reader = new FileReader();
            reader.onload = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
            setPhotoFile(file);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // Check if a specific step is completed - simplified
    const isStepCompleted = (step: number): boolean => {
        // Check if step is in completed steps set
        return completedSteps.has(step);
    };

    // Enhanced navigation functions with auto-save
    const nextStep = () => {
        // Mark current step as completed
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: number) => {
        // Allow free navigation to all steps
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Consolidated validation logic for any step
    const getStepValidationErrors = (stepNumber: number): StepValidationError[] => {
        const stepErrors: StepValidationError[] = [];

        switch (stepNumber) {
            case 1:
                if (!formData.fullName?.trim()) {
                    stepErrors.push({ field: 'fullName', message: 'Full Name is required' });
                }
                if (!formData.emailAddress?.trim()) {
                    stepErrors.push({ field: 'emailAddress', message: 'Email Address is required' });
                }
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress.trim())) {
                    stepErrors.push({ field: 'emailAddress', message: 'Please enter a valid email address' });
                }
                if (!formData.phoneNumber?.trim()) {
                    stepErrors.push({ field: 'phoneNumber', message: 'Phone Number is required' });
                }
                else if (!/^(\+8801|01)[3-9]\d{8}$/.test(formData.phoneNumber.trim().replace(/\s/g, ''))) {
                    stepErrors.push({ field: 'phoneNumber', message: 'Please enter a valid Bangladeshi phone number' });
                }
                if (!formData.facebookProfile?.trim()) {
                    stepErrors.push({ field: 'facebookProfile', message: 'Facebook Profile is required' });
                }
                else if (!/^https?:\/\/(www\.)?(facebook|fb)\.com\/[a-zA-Z0-9._-]+\/?$/.test(formData.facebookProfile.trim())) {
                    stepErrors.push({ field: 'facebookProfile', message: 'Please enter a valid Facebook profile URL' });
                }
                if (!formData.location?.trim()) {
                    stepErrors.push({ field: 'location', message: 'Current Location is required' });
                }
                if (!photoPreview?.trim() && !photoFile) {
                    stepErrors.push({ field: 'profilePicture', message: 'Profile Picture is required' });
                }
                break;
            case 2:
                if (!formData.school?.trim()) {
                    stepErrors.push({ field: 'school', message: 'School is required' });
                }
                if (!formData.college?.trim()) {
                    stepErrors.push({ field: 'college', message: 'College is required' });
                }
                if (!formData.group) {
                    stepErrors.push({ field: 'group', message: 'Group is required' });
                }
                if (!formData.hscBatch) {
                    stepErrors.push({ field: 'hscBatch', message: 'HSC Batch is required' });
                }
                if (!formData.academicDescription?.trim()) {
                    stepErrors.push({ field: 'academicDescription', message: 'Academic Description is required' });
                }
                break;
            case 3:
                if (!formData.personalDescription?.trim()) {
                    stepErrors.push({ field: 'personalDescription', message: 'Personal Description is required' });
                }
                if (!formData.whyIBA?.trim()) {
                    stepErrors.push({ field: 'whyIBA', message: 'Why IBA is required' });
                }
                if (!formData.whyApplyingHere?.trim()) {
                    stepErrors.push({ field: 'whyApplyingHere', message: 'Why applying here is required' });
                }
                if (!formData.ifNotIBA?.trim()) {
                    stepErrors.push({ field: 'ifNotIBA', message: 'If not IBA response is required' });
                }
                break;
            case 4:
                if (!formData.prepTimeline) {
                    stepErrors.push({ field: 'prepTimeline', message: 'Preparation Timeline is required' });
                }
                if (!formData.strugglingAreas || formData.strugglingAreas.length === 0) {
                    stepErrors.push({ field: 'strugglingAreas', message: 'Struggling Areas selection is required' });
                }
                if (!formData.fiveYearsVision?.trim()) {
                    stepErrors.push({ field: 'fiveYearsVision', message: 'Five Years Vision is required' });
                }
                if (!formData.otherPlatforms?.trim()) {
                    stepErrors.push({ field: 'otherPlatforms', message: 'Other Platforms response is required' });
                }
                if (!formData.admissionPlans?.trim()) {
                    stepErrors.push({ field: 'admissionPlans', message: 'Admission Plans are required' });
                }
                break;
            case 5:
                if (!formData.stableInternet) {
                    stepErrors.push({ field: 'stableInternet', message: 'Stable Internet confirmation is required' });
                }
                if (!formData.videoCameraOn) {
                    stepErrors.push({ field: 'videoCameraOn', message: 'Video Camera confirmation is required' });
                }
                if (!formData.attendClasses) {
                    stepErrors.push({ field: 'attendClasses', message: 'Attend Classes confirmation is required' });
                }
                if (!formData.activeParticipation) {
                    stepErrors.push({ field: 'activeParticipation', message: 'Active Participation confirmation is required' });
                }
                if (!formData.skipOtherCoachings) {
                    stepErrors.push({ field: 'skipOtherCoachings', message: 'Skip Other Coachings confirmation is required' });
                }
                if (!formData.stickTillExam) {
                    stepErrors.push({ field: 'stickTillExam', message: 'Stick Till Exam confirmation is required' });
                }
                break;
            case 6:
                if (!formData.recentFailure?.trim()) {
                    stepErrors.push({ field: 'recentFailure', message: 'Recent Failure response is required' });
                }
                if (!formData.lastBookVideoArticle?.trim()) {
                    stepErrors.push({ field: 'lastBookVideoArticle', message: 'Last Book/Video/Article response is required' });
                }
                break;
            case 7:
                if (!formData.preferredTiming || formData.preferredTiming.length === 0) {
                    stepErrors.push({ field: 'preferredTiming', message: 'Preferred Timing selection is required' });
                }
                if (!formData.preferredBatchType) {
                    stepErrors.push({ field: 'preferredBatchType', message: 'Preferred Batch Type is required' });
                }
                break;
        }

        return stepErrors;
    };

    // Validate and set field errors for current step
    const validateAndSetCurrentStepErrors = () => {
        const stepErrors = getStepValidationErrors(currentStep);
        const newErrors: FormValidationErrors = {};

        // Convert StepValidationError[] to FormValidationErrors
        stepErrors.forEach(error => {
            newErrors[error.field] = error.message;
        });

        setErrors(newErrors);
        return stepErrors.length === 0;
    };

    // Get all validation errors for the form
    const getAllValidationErrors = (): FormValidationErrors => {
        const allErrors: FormValidationErrors = {};
        for (let step = 1; step <= totalSteps; step++) {
            const stepErrors = getStepValidationErrors(step);
            stepErrors.forEach(error => {
                allErrors[error.field] = error.message;
            });
        }
        return allErrors;
    };

    // Get validation errors for current step (for step navigation display)
    const getCurrentStepValidationErrors = (): StepValidationError[] => {
        return getStepValidationErrors(currentStep);
    };

    const isStepValid = (stepNumber: number): boolean => {
        const stepErrors = getStepValidationErrors(stepNumber);
        return stepErrors.length === 0;
    };

    // Get completed fields count for current step
    const getCompletedFieldsCount = (): number => {
        const totalFields = getTotalFieldsCount();
        const errors = getCurrentStepValidationErrors();
        return Math.max(0, totalFields - errors.length);
    };

    // Get total fields count for any step
    const getStepFieldsCount = (stepNumber: number): number => {
        switch (stepNumber) {
            case 1: return 6; // fullName, emailAddress, phoneNumber, facebookProfile, location, profilePicture
            case 2: return 5; // school, college, group, hscBatch, academicDescription  
            case 3: return 4; // personalDescription, whyIBA, whyApplyingHere, ifNotIBA
            case 4: return 5; // prepTimeline, strugglingAreas, fiveYearsVision, otherPlatforms, admissionPlans
            case 5: return 6; // stableInternet, videoCameraOn, attendClasses, activeParticipation, skipOtherCoachings, stickTillExam
            case 6: return 2; // recentFailure, lastBookVideoArticle
            case 7: return 2; // preferredTiming, preferredBatchType
            default: return 0;
        }
    };

    // Get total fields count for current step
    const getTotalFieldsCount = (): number => {
        return getStepFieldsCount(currentStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Form submission started");

        // Clear previous messages
        setSubmitError("");
        setSubmitSuccess("");
        console.log("Form data before submission:", formData);

        // Comprehensive validation before submission
        const validationErrors: string[] = [];

        Object.entries(getAllValidationErrors()).forEach(([field, message]) => {
            if (message) {
                validationErrors.push(`${field}: ${message}`);
            }
        });

        if(validationErrors.length > 0) {
        // If there are validation errors, show them and don't submit
            setSubmitError(`Please complete the following required fields:\n• ${validationErrors.join('\n• ')}`);
            setSubmitting(false);
            return;
        }

        console.log("Form data validation passed, proceeding with submission:", formData);

        setSubmitting(true);
        setSubmissionStatus(prev => ({ ...prev, status: 'submitting' }));

        try {
            // Check if user is authenticated
            if (!user?.uid) {
                throw new Error("You must be logged in to submit the form");
            }

            // Photo is already uploaded immediately when selected, so we skip photo upload here
            // The currentPhotoUrl contains the uploaded photo URL if available

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

                // Clear auto-saved data since form is now successfully submitted
                clearSavedData();
                setHasUnsavedChanges(false);

                // Update submission status
                setSubmissionStatus({
                    status: 'submitted',
                    lastSubmissionDate: new Date(),
                    hasUnsavedChanges: false
                });

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
            setSubmissionStatus(prev => ({ ...prev, status: 'error' }));
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
        currentPhotoUrl,
        isUploadingPhoto,

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
        hasUnsavedChanges,

        // Submission status
        submissionStatus,
        getAllValidationErrors,
        getCurrentStepValidationErrors,
        getCompletedFieldsCount,
        getTotalFieldsCount,
        getStepValidationErrors,
        getStepFieldsCount,
        validateAndSetCurrentStepErrors,

        // Form handlers
        handleInputChange,
        handleStrugglingAreasChange,
        handlePreferredTimingChange,
        handlePhotoChange,
        handleSubmit,

        // Navigation functions
        nextStep,
        prevStep,
        goToStep,

        // Step completion tracking
        isStepCompleted,
        completedSteps,
        setCompletedSteps,

        // Utilities
        getStepTitle,
        isStepValid,
    };
};
