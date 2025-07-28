import { useEffect, useState, useCallback } from "react";
import { getAllUsers } from "@/lib/apis/users";
import type { UserProfile } from "@/lib/apis/users";
import { CACHE_KEYS, CACHE_CONFIG, isCacheTimestampFresh } from "@/lib/utils/cache-helpers";

export function useAllUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update local user cache
    const updateUserLocal = useCallback((uid: string, updates: Partial<UserProfile>) => {
        setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(user => 
                user.uid === uid ? { 
                    ...user, 
                    ...updates,
                    // Always update the updatedAt field for local changes
                    updatedAt: updates.updatedAt || new Date()
                } : user
            );
            // Update localStorage cache with new updatedAt timestamp
            if (typeof window !== "undefined") {
                localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(updatedUsers));
                localStorage.setItem(CACHE_KEYS.USERS_LAST_SYNC, new Date().toISOString());
            }
            return updatedUsers;
        });
    }, []);

    // Check if cache is fresh (less than 5 minutes old and recent updates)
    const isCacheFresh = useCallback((cachedUsers: UserProfile[]): boolean => {
        if (typeof window === "undefined") return false;
        
        const lastSync = localStorage.getItem(CACHE_KEYS.USERS_LAST_SYNC);
        if (!lastSync) return false;

        const lastSyncTime = new Date(lastSync);
        
        // Use utility function to check if cache timestamp is fresh
        if (!isCacheTimestampFresh(lastSyncTime)) return false;

        // Check if any user has been updated recently (within the last sync)
        const hasRecentUpdates = cachedUsers.some(user => {
            if (!user.updatedAt) return false;
            const userUpdateTime = new Date(user.updatedAt);
            return userUpdateTime > lastSyncTime;
        });

        // If there are recent updates that happened after our last sync, cache is stale
        return !hasRecentUpdates;
    }, []);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        
        const cached = localStorage.getItem(CACHE_KEYS.USERS);
        if (cached) {
            try {
                const cachedUsers = JSON.parse(cached);
                
                // Convert date strings back to Date objects
                const processedUsers = cachedUsers.map((user: any) => ({
                    ...user,
                    updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
                    gradeUpdatedAt: user.gradeUpdatedAt ? new Date(user.gradeUpdatedAt) : undefined,
                    approvalUpdatedAt: user.approvalUpdatedAt ? new Date(user.approvalUpdatedAt) : undefined,
                }));

                if (isCacheFresh(processedUsers)) {
                    setUsers(processedUsers);
                    return; // Use cache, don't refresh
                }
            } catch (e) {
                console.warn('Failed to parse cached users:', e);
                localStorage.removeItem(CACHE_KEYS.USERS);
                localStorage.removeItem(CACHE_KEYS.USERS_LAST_SYNC);
            }
        }
        
        // Cache is stale or doesn't exist, refresh in background
        refresh();
        // eslint-disable-next-line
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Try incremental update first if we have cached data
            const cachedUsers = users.length > 0 ? users : (() => {
                if (typeof window === "undefined") return [];
                const cached = localStorage.getItem(CACHE_KEYS.USERS);
                if (!cached) return [];
                try {
                    return JSON.parse(cached).map((user: any) => ({
                        ...user,
                        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
                        gradeUpdatedAt: user.gradeUpdatedAt ? new Date(user.gradeUpdatedAt) : undefined,
                        approvalUpdatedAt: user.approvalUpdatedAt ? new Date(user.approvalUpdatedAt) : undefined,
                    }));
                } catch (e) {
                    return [];
                }
            })();

            let lastSyncTime: Date | undefined;
            if (cachedUsers.length > 0 && typeof window !== "undefined") {
                const lastSync = localStorage.getItem(CACHE_KEYS.USERS_LAST_SYNC);
                if (lastSync) {
                    lastSyncTime = new Date(lastSync);
                }
            }

            // Fetch users (incremental if we have a last sync time)
            const response = await getAllUsers(lastSyncTime);
            
            if (response.success && response.data) {
                const newOrUpdatedUsers = Array.from(response.data.values());
                
                let finalUserList: UserProfile[];
                
                if (lastSyncTime && cachedUsers.length > 0) {
                    // Incremental update: merge new/updated users with cached users
                    const updatedUsersMap = new Map(newOrUpdatedUsers.map(user => [user.uid, user]));
                    finalUserList = cachedUsers.map((cachedUser: UserProfile) => 
                        updatedUsersMap.get(cachedUser.uid) || cachedUser
                    );
                    
                    // Add any completely new users
                    newOrUpdatedUsers.forEach(user => {
                        if (!cachedUsers.some((cachedUser: UserProfile) => cachedUser.uid === user.uid)) {
                            finalUserList.push(user);
                        }
                    });
                } else {
                    // Full refresh
                    finalUserList = newOrUpdatedUsers;
                }
                
                setUsers(finalUserList);
                if (typeof window !== "undefined") {
                    localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(finalUserList));
                    localStorage.setItem(CACHE_KEYS.USERS_LAST_SYNC, new Date().toISOString());
                }
            } else {
                setError(response.error || "Failed to fetch users");
            }
        } catch (err: any) {
            setError(err?.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [users]);

    return { users, loading, error, refresh, updateUserLocal };
}
