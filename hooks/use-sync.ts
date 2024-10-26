import { useEffect, useState } from 'react';
import { APIClient } from '@/lib/api';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const api = new APIClient();

  useEffect(() => {
    const sync = async () => {
      setIsSyncing(true);
      try {
        await api.synchronizeContent();
        // Poll status until complete
        const pollId = setInterval(async () => {
          const status = await api.checkSyncStatus();
          if (status.complete) {
            clearInterval(pollId);
            setIsSyncing(false);
          }
        }, 5000);
      } catch (error) {
        setIsSyncing(false);
      }
    };

    sync();
  }, []);

  return { isSyncing };
}