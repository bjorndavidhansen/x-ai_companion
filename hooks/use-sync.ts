import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { APIClient } from '@/lib/api';
import { toast } from 'sonner';

interface SyncStatus {
  complete: boolean;
  progress?: number;
  error?: string;
}

interface SyncState {
  isSyncing: boolean;
  status: SyncStatus;
  error: string | null;
}

interface UseSyncReturn extends SyncState {
  startSync: () => Promise<void>;
  cancelSync: () => void;
}

const POLL_INTERVAL = 5000;
const MAX_RETRIES = 3;

export function useSync(): UseSyncReturn {
  // Combined state management
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    status: { complete: false },
    error: null,
  });

  // Memoize API client
  const api = useMemo(() => new APIClient(), []);

  // Reference for cleanup function
  const cleanupRef = React.useRef<(() => void) | null>(null);

  // Check sync status with retry logic
  const checkStatus = useCallback(async (retryCount = 0): Promise<boolean> => {
    try {
      const currentStatus = await api.checkSyncStatus();
      setState(prev => ({
        ...prev,
        status: currentStatus,
        error: null,
      }));
      return currentStatus.complete;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkStatus(retryCount + 1);
      }
      
      const message = 'Failed to check sync status';
      console.error(message, error);
      setState(prev => ({
        ...prev,
        error: message,
      }));
      toast.error(message);
      return true; // Stop polling on max retries
    }
  }, [api]);

  // Start sync with proper cleanup
  const startSync = useCallback(async () => {
    // Clear any existing sync
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isSyncing: true,
      error: null,
    }));

    try {
      await api.synchronizeContent();
      
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes maximum (with 5s interval)
      
      const poll = setInterval(async () => {
        pollCount++;
        
        if (pollCount >= maxPolls) {
          clearInterval(poll);
          setState(prev => ({
            ...prev,
            isSyncing: false,
            error: 'Sync timed out',
          }));
          toast.error('Sync timed out');
          return;
        }

        const isComplete = await checkStatus();
        if (isComplete) {
          clearInterval(poll);
          setState(prev => ({
            ...prev,
            isSyncing: false,
          }));
          toast.success('Sync completed successfully');
        }
      }, POLL_INTERVAL);

      // Store cleanup function
      cleanupRef.current = () => {
        clearInterval(poll);
        setState(prev => ({
          ...prev,
          isSyncing: false,
        }));
      };
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to start sync';
      
      console.error('Sync failed:', error);
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: message,
      }));
      toast.error(message);
    }
  }, [api, checkStatus]);

  // Cancel current sync
  const cancelSync = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      toast.info('Sync cancelled');
    }
  }, []);

  // Start initial sync
  useEffect(() => {
    startSync().catch(error => {
      console.error('Initial sync failed:', error);
    });

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [startSync]);

  return {
    isSyncing: state.isSyncing,
    status: state.status,
    error: state.error,
    startSync,
    cancelSync,
  };
}

// Example usage:
/*
function SyncComponent() {
  const { isSyncing, status, error, startSync, cancelSync } = useSync();

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => startSync()}>Retry Sync</button>
      </div>
    );
  }

  return (
    <div>
      {isSyncing ? (
        <>
          <p>Syncing... {status.progress}%</p>
          <button onClick={cancelSync}>Cancel</button>
        </>
      ) : (
        <button onClick={() => startSync()}>Start Sync</button>
      )}
    </div>
  );
}
*/