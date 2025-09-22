import { useState, useCallback, useRef, useEffect } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ApiOptions {
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
) {
  const {
    immediate = false,
    retryCount = 0,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      
      setState({
        data: result,
        loading: false,
        error: null,
        success: true
      });

      onSuccess?.(result);
      retryCountRef.current = 0;
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        timeoutRef.current = setTimeout(() => {
          execute(...args);
        }, retryDelay);
        return;
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });

      onError?.(errorMessage);
      retryCountRef.current = 0;
      
      throw error;
    }
  }, [apiFunction, retryCount, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
    retryCountRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset
  };
}

// Specialized hook for medical records
export function useMedicalRecords() {
  const fetchMedicalRecords = useCallback(async (params: {
    page?: number;
    limit?: number;
    patientId?: string;
    search?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.patientId) searchParams.set('patient_id', params.patientId);
    if (params.search) searchParams.set('search', params.search);

    const response = await fetch(`/api/medical-records?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch medical records');
    }
    return response.json();
  }, []);

  return useApi(fetchMedicalRecords);
}

// Specialized hook for patients
export function usePatients() {
  const fetchPatients = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);

    const response = await fetch(`/api/patients?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    return response.json();
  }, []);

  return useApi(fetchPatients);
}

// Hook for real-time updates
export function useRealtimeSubscription<T>(
  table: string,
  filter?: string,
  onUpdate?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // This would integrate with Supabase realtime
    // const subscription = supabase
    //   .channel(`${table}_changes`)
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public',
    //     table,
    //     filter
    //   }, (payload) => {
    //     onUpdate?.(payload);
    //     // Update local state based on the change
    //   })
    //   .subscribe((status) => {
    //     setConnected(status === 'SUBSCRIBED');
    //   });

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [table, filter, onUpdate]);

  return { data, connected };
}
