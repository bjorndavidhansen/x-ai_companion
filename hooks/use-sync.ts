// use-sync.ts
import { useEffect, useState, useCallback } from 'react';
import { APIClient } from '@/lib/api';
import { toast } from 'sonner';

interface SyncStatus {
  complete: boolean;
  progress?: number;
  error?: string;
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<SyncStatus>({ complete: false });
  const [error, setError] = useState<string | null>(null);
  const api = new APIClient();

  const checkStatus = useCallback(async () => {
    try {
      const currentStatus = await api.checkSyncStatus();
      setStatus(currentStatus);
      return currentStatus.complete;
    } catch (error) {
      setError('Failed to check sync status');
      return true; // Stop polling on error
    }
  }, [api]);

  const startSync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      await api.synchronizeContent();
      
      const pollInterval = 5000;
      const poll = setInterval(async () => {
        const isComplete = await checkStatus();
        if (isComplete) {
          clearInterval(poll);
          setIsSyncing(false);
          toast.success('Sync completed successfully');
        }
      }, pollInterval);

      // Clean up interval on unmount
      return () => clearInterval(poll);
    } catch (error) {
      setError('Sync failed to start');
      setIsSyncing(false);
      toast.error('Failed to start sync');
    }
  }, [api, checkStatus]);

  useEffect(() => {
    const cleanup = startSync();
    return () => cleanup?.();
  }, [startSync]);

  return { 
    isSyncing, 
    status, 
    error,
    startSync // Allow manual sync restart
  };
}