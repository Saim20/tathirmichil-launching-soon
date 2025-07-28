"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface UseAutoSaveProps {
  data: Record<string, any>;
  delay?: number;
  storageKey: string;
  onSave?: (data: Record<string, any>) => void;
  onLoad?: (data: Record<string, any>) => void;
}

interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export default function useAutoSave({ 
  data, 
  delay = 2000, 
  storageKey,
  onSave,
  onLoad
}: UseAutoSaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const lastDataRef = useRef<string>('');
  const [status, setStatus] = useState<AutoSaveStatus>({ status: 'idle' });

  // Check if data has actually changed
  const hasDataChanged = useCallback((newData: Record<string, any>) => {
    const newDataString = JSON.stringify(newData);
    const hasChanged = newDataString !== lastDataRef.current;
    lastDataRef.current = newDataString;
    return hasChanged;
  }, []);

  useEffect(() => {
    // Don't save on initial mount or if data hasn't changed
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if data hasn't actually changed
    if (!hasDataChanged(data)) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus({ status: 'saving' });

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      try {
        const saveData = {
          data,
          timestamp: Date.now(),
          version: '1.0'
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        
        const now = new Date();
        setStatus({ 
          status: 'saved', 
          lastSaved: now 
        });
        
        if (onSave) {
          onSave(data);
        }
        
        console.log("📝 Form auto-saved at", now.toLocaleTimeString());
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStatus({ 
          status: 'error', 
          error: errorMessage 
        });
        console.error("Failed to auto-save form:", error);
      }
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, storageKey, onSave, hasDataChanged]);

  const loadSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Check if data structure is valid
        if (!parsed.data || !parsed.timestamp) {
          console.warn("Invalid saved data structure");
          localStorage.removeItem(storageKey);
          return null;
        }
        
        // Only return data if it's less than 24 hours old
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired) {
          if (onLoad) {
            onLoad(parsed.data);
          }
          console.log("📂 Loaded saved form data from", new Date(parsed.timestamp).toLocaleString());
          return parsed.data;
        } else {
          // Remove expired data
          console.log("🗑️ Removing expired form data");
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error("Failed to load saved form data:", error);
      // Clear corrupted data
      localStorage.removeItem(storageKey);
    }
    return null;
  }, [storageKey, onLoad]);

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setStatus({ status: 'idle' });
      console.log("🗑️ Saved form data cleared");
    } catch (error) {
      console.error("Failed to clear saved form data:", error);
    }
  }, [storageKey]);

  const getSavedDataInfo = useCallback(() => {
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
  }, [storageKey]);

  return { 
    loadSavedData, 
    clearSavedData, 
    getSavedDataInfo,
    status 
  };
}

export type { AutoSaveStatus };
