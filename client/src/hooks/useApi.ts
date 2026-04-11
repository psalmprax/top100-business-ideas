/**
 * useApi Hook
 * Custom hook for handling API calls with loading and error states
 */

import * as React from "react";
import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
    refetch: () => Promise<void>;
}

export function useApi<T>(
    fetchFn: () => Promise<T>,
    deps: React.DependencyList = []
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await fetchFn();
            setState({ data: result, loading: false, error: null });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setState({ data: null, loading: false, error: errorMessage });
        }
    }, deps);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        ...state,
        refetch: fetchData,
    };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<T, R> {
    onSuccess?: (data: R) => void;
    onError?: (error: string) => void;
}

interface UseMutationReturn<T, R> {
    mutate: (data: T) => Promise<void>;
    loading: boolean;
    error: string | null;
    data: R | null;
    reset: () => void;
}

export function useMutation<T, R = unknown>(
    mutationFn: (data: T) => Promise<R>,
    options?: UseMutationOptions<T, R>
): UseMutationReturn<T, R> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<R | null>(null);

    const mutate = useCallback(async (data: T) => {
        setLoading(true);
        setError(null);

        try {
            const result = await mutationFn(data);
            setData(result);
            options?.onSuccess?.(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            options?.onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [mutationFn, options]);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        mutate,
        loading,
        error,
        data,
        reset,
    };
}

// Hook for polling data
export function usePolling<T>(
    fetchFn: () => Promise<T>,
    interval: number = 30000,
    deps: React.DependencyList = []
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        try {
            const result = await fetchFn();
            setState({ data: result, loading: false, error: null });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setState(prev => ({ ...prev, error: errorMessage }));
        }
    }, [fetchFn]);

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Set up polling
        const intervalId = setInterval(fetchData, interval);

        return () => clearInterval(intervalId);
    }, [fetchData, interval]);

    return {
        ...state,
        refetch: fetchData,
    };
}

// Hook for WebSocket connections
interface UseWebSocketOptions {
    onMessage?: (data: unknown) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
    connected: boolean;
    lastMessage: unknown | null;
    sendMessage: (data: unknown) => void;
}

export function useWebSocket(
    url: string,
    options?: UseWebSocketOptions
): UseWebSocketReturn {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<unknown | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const websocket = new WebSocket(url);

        websocket.onopen = () => {
            setConnected(true);
            options?.onOpen?.();
        };

        websocket.onclose = () => {
            setConnected(false);
            options?.onClose?.();
        };

        websocket.onerror = (error) => {
            options?.onError?.(error);
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
                options?.onMessage?.(data);
            } catch {
                setLastMessage(event.data);
            }
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [url]);

    const sendMessage = useCallback((data: unknown) => {
        if (ws && connected) {
            ws.send(JSON.stringify(data));
        }
    }, [ws, connected]);

    return {
        connected,
        lastMessage,
        sendMessage,
    };
}
