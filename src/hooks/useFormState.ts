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
import { storage } from "@/lib/firebase/firebase";
import { ref, deleteObject } from "firebase/storage";
import { difference } from "next/dist/build/utils";

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
    errors: FormValidationErrors;

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

    // Photo states
    photoFile: File | null;
    photoPreview: string;

    // Step navigation
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    totalSteps: number;

    // Existing form data
    existingFormData: PersonalBatchFormData | null;

    // Auto-save and status
    autoSaveStatus: AutoSaveStatus;
    hasUnsavedChanges: boolean;
    isLoadingInitialData: boolean;
    submissionStatus: SubmissionStatus;

    // Validation functions
    getAllValidationErrors: () => FormValidationErrors;
    getCurrentStepValidationErrors: () => StepValidationError[];
    getCompletedFieldsCount: () => number;
    getTotalFieldsCount: () => number;
    getStepValidationErrors: (stepNumber: number, data?: Partial<PersonalBatchFormData>, profilePictureUrl?: string) => StepValidationError[];
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
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true); // Start as true to prevent premature status display

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
        selectedBatch: "",
    });

    // Direct auto-save implementation
    const storageKey = `tathir_form_latest_${user?.uid || 'anonymous'}`;

    // Get default form data
    const getDefaultFormData = (): Partial<PersonalBatchFormData> => ({
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
        selectedBatch: "",
    });

    // Safely merge loaded data with defaults
    const safelyMergeFormData = (loadedData: any): Partial<PersonalBatchFormData> => {
        const defaults = getDefaultFormData();

        if (!loadedData || typeof loadedData !== 'object') {
            console.log('🛡️ Using default form data - invalid loaded data');
            return defaults;
        }

        try {
            // Merge loaded data with defaults, keeping defaults for missing fields
            const merged = { ...defaults, ...loadedData };

            // Ensure arrays are properly handled
            if (!Array.isArray(merged.strugglingAreas)) {
                merged.strugglingAreas = defaults.strugglingAreas;
            }
            if (!Array.isArray(merged.preferredTiming)) {
                merged.preferredTiming = defaults.preferredTiming;
            }

            console.log('✅ Successfully merged loaded data with defaults');
            return merged;
        } catch (error) {
            console.warn('🛡️ Error merging data, using defaults:', error);
            return defaults;
        }
    };

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

    // Centralized validation function - handles both current form state and arbitrary data
    const getStepValidationErrors = (stepNumber: number, data?: Partial<PersonalBatchFormData>, profilePictureUrl?: string): StepValidationError[] => {
        // Use provided data or fall back to current form state
        const validationData = data || formData;
        const photoUrl = profilePictureUrl || photoPreview || "";
        const hasPhotoFile = !data && photoFile; // Only consider photoFile when validating current state

        const stepErrors: StepValidationError[] = [];

        switch (stepNumber) {
            case 1:
                if (!validationData.fullName?.trim()) {
                    stepErrors.push({ field: 'fullName', message: 'Full Name is required' });
                }
                if (!validationData.emailAddress?.trim()) {
                    stepErrors.push({ field: 'emailAddress', message: 'Email Address is required' });
                }
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validationData.emailAddress.trim())) {
                    stepErrors.push({ field: 'emailAddress', message: 'Please enter a valid email address' });
                }
                if (!validationData.phoneNumber?.trim()) {
                    stepErrors.push({ field: 'phoneNumber', message: 'Phone Number is required' });
                }
                else if (!/^(\+8801|01)[3-9]\d{8}$/.test(validationData.phoneNumber.trim().replace(/\s/g, ''))) {
                    stepErrors.push({ field: 'phoneNumber', message: 'Please enter a valid Bangladeshi phone number' });
                }
                if (!validationData.facebookProfile?.trim()) {
                    stepErrors.push({ field: 'facebookProfile', message: 'Facebook Profile is required' });
                }
                if (!validationData.location?.trim()) {
                    stepErrors.push({ field: 'location', message: 'Current Location is required' });
                }
                if (!photoUrl?.trim() && !hasPhotoFile) {
                    stepErrors.push({ field: 'profilePicture', message: 'Profile Picture is required' });
                }
                break;
            case 2:
                if (!validationData.school?.trim()) {
                    stepErrors.push({ field: 'school', message: 'School is required' });
                }
                if (!validationData.college?.trim()) {
                    stepErrors.push({ field: 'college', message: 'College is required' });
                }
                if (!validationData.group) {
                    stepErrors.push({ field: 'group', message: 'Group is required' });
                }
                if (!validationData.hscBatch) {
                    stepErrors.push({ field: 'hscBatch', message: 'HSC Batch is required' });
                }
                if (!validationData.academicDescription?.trim()) {
                    stepErrors.push({ field: 'academicDescription', message: 'Academic Description is required' });
                }
                break;
            case 3:
                if (!validationData.personalDescription?.trim()) {
                    stepErrors.push({ field: 'personalDescription', message: 'Personal Description is required' });
                }
                if (!validationData.whyIBA?.trim()) {
                    stepErrors.push({ field: 'whyIBA', message: 'Why IBA is required' });
                }
                if (!validationData.whyApplyingHere?.trim()) {
                    stepErrors.push({ field: 'whyApplyingHere', message: 'Why applying here is required' });
                }
                if (!validationData.ifNotIBA?.trim()) {
                    stepErrors.push({ field: 'ifNotIBA', message: 'If not IBA response is required' });
                }
                break;
            case 4:
                if (!validationData.prepTimeline) {
                    stepErrors.push({ field: 'prepTimeline', message: 'Preparation Timeline is required' });
                }
                if (!validationData.strugglingAreas || validationData.strugglingAreas.length === 0) {
                    stepErrors.push({ field: 'strugglingAreas', message: 'Struggling Areas selection is required' });
                }
                if (!validationData.fiveYearsVision?.trim()) {
                    stepErrors.push({ field: 'fiveYearsVision', message: 'Five Years Vision is required' });
                }
                if (!validationData.otherPlatforms?.trim()) {
                    stepErrors.push({ field: 'otherPlatforms', message: 'Other Platforms response is required' });
                }
                if (!validationData.admissionPlans?.trim()) {
                    stepErrors.push({ field: 'admissionPlans', message: 'Admission Plans are required' });
                }
                break;
            case 5:
                if (!validationData.stableInternet) {
                    stepErrors.push({ field: 'stableInternet', message: 'Stable Internet confirmation is required' });
                }
                if (!validationData.videoCameraOn) {
                    stepErrors.push({ field: 'videoCameraOn', message: 'Video Camera confirmation is required' });
                }
                if (!validationData.attendClasses) {
                    stepErrors.push({ field: 'attendClasses', message: 'Attend Classes confirmation is required' });
                }
                if (!validationData.activeParticipation) {
                    stepErrors.push({ field: 'activeParticipation', message: 'Active Participation confirmation is required' });
                }
                if (!validationData.skipOtherCoachings) {
                    stepErrors.push({ field: 'skipOtherCoachings', message: 'Skip Other Coachings confirmation is required' });
                }
                if (!validationData.stickTillExam) {
                    stepErrors.push({ field: 'stickTillExam', message: 'Stick Till Exam confirmation is required' });
                }
                break;
            case 6:
                if (!validationData.recentFailure?.trim()) {
                    stepErrors.push({ field: 'recentFailure', message: 'Recent Failure response is required' });
                }
                if (!validationData.lastBookVideoArticle?.trim()) {
                    stepErrors.push({ field: 'lastBookVideoArticle', message: 'Last Book/Video/Article response is required' });
                }
                break;
            case 7:
                if (!validationData.selectedBatch?.trim()) {
                    stepErrors.push({ field: 'selectedBatch', message: 'Batch selection is required' });
                }
                break;
        }

        return stepErrors;
    };

    // Modular data loading functions
    const loadFromLocalStorage = (): { success: boolean; data?: any; hasData: boolean } => {
        const savedDataInfo = getSavedDataInfo();
        if (savedDataInfo.exists && !savedDataInfo.isExpired) {
            const savedData = loadSavedData();
            if (savedData?.formData) {
                console.log('📥 Loading latest edits from localStorage');
                return { success: true, data: savedData, hasData: true };
            }
        }
        return { success: true, data: null, hasData: false };
    };

    const loadFromDatabase = async (): Promise<{ success: boolean; data?: any; hasData: boolean; error?: string }> => {
        try {
            const result = await checkExistingFormSubmission(user!.uid);
            if (result.success && result.data) {
                const existingData = result.data.formData!;
                const processedData = { ...existingData, submittedAt: existingData.submittedAt };
                console.log('📥 Loading data from database');
                return { success: true, data: processedData, hasData: true };
            }
            return { success: true, data: null, hasData: false };
        } catch (error) {
            console.error("Error loading from database:", error);
            return { success: false, data: null, hasData: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    };

    const applyLocalStorageData = (savedData: any) => {
        setFormData(safelyMergeFormData(savedData.formData));
        if (savedData.currentStep) {
            setCurrentStep(savedData.currentStep);
        }
        if (savedData.completedSteps) {
            setCompletedSteps(new Set(savedData.completedSteps));
        }
        // Only restore saved photo if it exists and is different from user's profile picture
        if (savedData.photoPreview &&
            savedData.photoPreview !== userProfile?.profilePictureUrl &&
            savedData.photoPreview !== user?.photoURL) {
            setPhotoPreview(savedData.photoPreview);
        }
        if (savedData.currentPhotoUrl) {
            setCurrentPhotoUrl(savedData.currentPhotoUrl);
        }
        setHasUnsavedChanges(false);
    };

    const applyDatabaseData = (processedData: any) => {
        setExistingFormData(processedData);
        const mergedData = safelyMergeFormData(processedData);
        setFormData(mergedData);

        // Set photo preview if available from existing form data
        if (processedData.profilePictureUrl?.trim() &&
            processedData.profilePictureUrl !== userProfile?.profilePictureUrl &&
            processedData.profilePictureUrl !== user?.photoURL) {
            setPhotoPreview(processedData.profilePictureUrl);
            setCurrentPhotoUrl(processedData.profilePictureUrl);
        } else if (!processedData.profilePictureUrl?.trim()) {
            setPhotoPreview("");
        }
        setHasUnsavedChanges(false);
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
    }, [formData, user?.uid, isLoadingInitialData]);

    // Load data on mount - prioritize localStorage (latest edits), then database for reference
    useEffect(() => {
        if (!user?.uid) {
            setIsLoadingInitialData(false); // No user, no loading needed
            return;
        }

        console.log('🔄 Starting initial data load for user:', user.uid);
        setIsLoadingInitialData(true);
        setLoading(true);

        const initializeFormData = async () => {
            try {
                // Step 1: Always try localStorage first (preserves latest edits)
                const localStorageResult = loadFromLocalStorage();

                // Step 2: Get database data for submission status reference
                const databaseResult = await loadFromDatabase();

                if (localStorageResult.hasData) {
                    // Apply localStorage data (user's latest edits)
                    console.log('📥 Applying localStorage data (latest edits)');
                    applyLocalStorageData(localStorageResult.data);

                    // Set initial submission status based on database state
                    if (databaseResult.success && databaseResult.hasData) {
                        // Database has submission - check if it's complete
                        const allErrors: StepValidationError[] = [];
                        for (let step = 1; step <= totalSteps; step++) {
                            const stepErrors = getStepValidationErrors(step, databaseResult.data, databaseResult.data.profilePictureUrl);
                            allErrors.push(...stepErrors);
                        }
                        const isDatabaseComplete = allErrors.length === 0;

                        if (isDatabaseComplete) {
                            console.log('✅ Database has complete submission - localStorage contains edits to submitted form');
                            setExistingFormData(databaseResult.data);
                            setSubmitted(true);
                            setSubmissionStatus({
                                status: 'submitted', // Modified because localStorage has different data
                                lastSubmissionDate: databaseResult.data.submittedAt ? new Date(databaseResult.data.submittedAt) : new Date(),
                                hasUnsavedChanges: false
                            });
                        } else if (databaseResult.data.submittedAt) {
                            console.log('🔄 Database has incomplete submission - localStorage contains latest edits');
                            setExistingFormData(databaseResult.data);
                            setSubmissionStatus({
                                status: 'modified',
                                lastSubmissionDate: databaseResult.data.submittedAt ? new Date(databaseResult.data.submittedAt) : undefined,
                                hasUnsavedChanges: true
                            });
                        } else {
                            // Database has no submission - localStorage is draft
                            setSubmissionStatus({
                                status: 'unsubmitted',
                                hasUnsavedChanges: true
                            });
                        }
                    } else {
                        // No database submission - localStorage is draft
                        setSubmissionStatus({
                            status: 'unsubmitted',
                            hasUnsavedChanges: true
                        });
                    }
                } else if (databaseResult.success && databaseResult.hasData) {
                    // No localStorage data - use database data
                    console.log('📥 No localStorage found - applying database data');
                    applyDatabaseData(databaseResult.data);

                    // Validate database data completeness
                    const allErrors: StepValidationError[] = [];
                    for (let step = 1; step <= totalSteps; step++) {
                        const stepErrors = getStepValidationErrors(step, databaseResult.data, databaseResult.data.profilePictureUrl);
                        allErrors.push(...stepErrors);
                    }
                    const isDataComplete = allErrors.length === 0;

                    if (isDataComplete) {
                        console.log('✅ Database data is complete - marking as submitted');
                        setSubmitted(true);
                        setSubmissionStatus({
                            status: 'submitted',
                            lastSubmissionDate: databaseResult.data.submittedAt ? new Date(databaseResult.data.submittedAt) : new Date(),
                            hasUnsavedChanges: false
                        });
                    } else {
                        console.log('⚠️ Database data is incomplete - keeping as draft');
                        setSubmitted(false);
                        setSubmissionStatus({
                            status: 'modified',
                            lastSubmissionDate: databaseResult.data.submittedAt ? new Date(databaseResult.data.submittedAt) : undefined,
                            hasUnsavedChanges: true
                        });
                    }
                } else {
                    // No data found anywhere - start fresh
                    console.log('🆕 No existing data found - starting fresh');
                    setSubmissionStatus({
                        status: 'unsubmitted',
                        hasUnsavedChanges: false
                    });
                }
            } catch (error) {
                console.error("Error during initial data load:", error);
                setSubmissionStatus({
                    status: 'unsubmitted',
                    hasUnsavedChanges: false
                });
            } finally {
                setLoading(false);
                setIsLoadingInitialData(false);
                console.log('✅ Initial data loading complete - enabling auto-save');
            }
        };

        initializeFormData();
    }, [user?.uid]);

    // When user switches to editing mode, ensure existing form data and profile picture are loaded (only once)
    useEffect(() => {
        if (isEditing && existingFormData && !loading && !hasLoadedExistingData) {
            console.log('Switching to edit mode, loading existing data:', existingFormData);
            const mergedData = safelyMergeFormData(existingFormData);
            setFormData(mergedData);

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

            // Only mark steps as completed if they actually have valid data
            const validSteps = new Set<number>();
            for (let i = 1; i <= totalSteps; i++) {
                const stepErrors = getStepValidationErrors(i);
                if (stepErrors.length === 0) {
                    validSteps.add(i);
                }
            }
            setCompletedSteps(validSteps);

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

        // Use centralized validation system to check step completion
        const validSteps = new Set<number>();
        for (let step = 1; step <= totalSteps; step++) {
            const stepErrors = getStepValidationErrors(step);
            if (stepErrors.length === 0) {
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
            case 7: return 1; // selectedBatch
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

        if (validationErrors.length > 0) {
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
        errors,

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

        // Photo states
        photoFile,
        photoPreview,

        // Step navigation
        currentStep,
        setCurrentStep,
        totalSteps,

        // Existing form data
        existingFormData,

        // Auto-save and status
        autoSaveStatus,
        hasUnsavedChanges,
        isLoadingInitialData,
        submissionStatus,

        // Validation functions
        getAllValidationErrors,
        getCurrentStepValidationErrors,
        getCompletedFieldsCount,
        getTotalFieldsCount,
        getStepValidationErrors,
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

        // Utilities
        getStepTitle,
        isStepValid,
    };
};
