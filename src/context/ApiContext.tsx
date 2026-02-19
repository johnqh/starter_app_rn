/**
 * API Context for React Native
 *
 * Provides network client, base URL, and authentication token
 * for API calls throughout the app.
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { NetworkClient, NetworkResponse, NetworkRequestOptions, Optional } from '@sudobility/types';
import { env } from '@/config/env';
import { useAuth } from './AuthContext';

export interface ApiContextValue {
  networkClient: NetworkClient;
  baseUrl: string;
  token: string | null;
  userId: string | null;
  isReady: boolean;
  isLoading: boolean;
}

// Helper for making fetch requests and returning NetworkResponse
async function makeRequest<T>(
  url: string,
  options?: Optional<NetworkRequestOptions>
): Promise<NetworkResponse<T>> {
  const method = options?.method ?? 'GET';
  const body = options?.body as BodyInit | undefined;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body,
    signal: options?.signal,
  });

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let data: T | undefined;
  let error: string | undefined;

  try {
    const json = await response.json();
    if (response.ok) {
      data = json as T;
    } else {
      error = json.error || json.message || `HTTP ${response.status}`;
    }
  } catch (e) {
    if (!response.ok) {
      error = `HTTP ${response.status}`;
    }
  }

  return {
    success: response.ok,
    data,
    error,
    timestamp: new Date().toISOString(),
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers,
  };
}

// Create a simple fetch-based network client
const createNetworkClient = (): NetworkClient => ({
  request: <T,>(
    url: string,
    options?: Optional<NetworkRequestOptions>
  ): Promise<NetworkResponse<T>> => makeRequest(url, options),

  get: <T,>(
    url: string,
    options?: Optional<Omit<NetworkRequestOptions, 'method' | 'body'>>
  ): Promise<NetworkResponse<T>> => makeRequest(url, { ...options, method: 'GET' }),

  post: <T,>(
    url: string,
    body?: Optional<unknown>,
    options?: Optional<Omit<NetworkRequestOptions, 'method'>>
  ): Promise<NetworkResponse<T>> =>
    makeRequest(url, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T,>(
    url: string,
    body?: Optional<unknown>,
    options?: Optional<Omit<NetworkRequestOptions, 'method'>>
  ): Promise<NetworkResponse<T>> =>
    makeRequest(url, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T,>(
    url: string,
    options?: Optional<Omit<NetworkRequestOptions, 'method' | 'body'>>
  ): Promise<NetworkResponse<T>> => makeRequest(url, { ...options, method: 'DELETE' }),
});

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { token, user, isReady, isLoading } = useAuth();
  const networkClient = useMemo(() => createNetworkClient(), []);

  const value = useMemo<ApiContextValue>(() => ({
    networkClient,
    baseUrl: env.API_URL,
    token,
    userId: user?.uid ?? null,
    isReady,
    isLoading,
  }), [networkClient, token, user?.uid, isReady, isLoading]);

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}
