import { useState, useEffect, useCallback } from 'react';
import { apiKeyUtils, ApiKeyConfig } from '../utils/apiKeys';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadApiKeys = useCallback(() => {
    if (typeof window !== 'undefined') {
      const keys = apiKeyUtils.loadApiKeys();
      setApiKeys(keys);
      setIsLoading(false);
    }
  }, []);

  const saveApiKeys = useCallback((keys: ApiKeyConfig) => {
    apiKeyUtils.saveApiKeys(keys);
    setApiKeys(keys);
  }, []);

  const removeApiKey = useCallback((provider: keyof ApiKeyConfig) => {
    apiKeyUtils.removeApiKey(provider);
    loadApiKeys(); // Reload to get updated state
  }, [loadApiKeys]);

  const clearAllApiKeys = useCallback(() => {
    apiKeyUtils.clearAllApiKeys();
    setApiKeys({});
  }, []);

  const hasOpenRouterKey = useCallback((): boolean => {
    // Return false during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return false;
    return apiKeyUtils.hasApiKey('openrouter');
  }, []);

  const hasOpenAIKey = useCallback((): boolean => {
    // Return false during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return false;
    return apiKeyUtils.hasApiKey('openai');
  }, []);

  const hasGeminiKey = useCallback((): boolean => {
    // Return false during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return false;
    return apiKeyUtils.hasApiKey('gemini');
  }, []);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'byok_api_keys') {
        loadApiKeys();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadApiKeys]);

  return {
    apiKeys,
    isLoading,
    saveApiKeys,
    removeApiKey,
    clearAllApiKeys,
    hasOpenRouterKey,
    hasOpenAIKey,
    hasGeminiKey,
    refreshApiKeys: loadApiKeys,
  };
} 