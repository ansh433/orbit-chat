export interface ApiKeyConfig {
  openrouter?: string;
  openai?: string;
  gemini?: string;
}

const API_KEYS_STORAGE_KEY = 'byok_api_keys';

const encrypt = (text: string): string => {
  return btoa(text);
};

const decrypt = (encryptedText: string): string => {
  try {
    return atob(encryptedText);
  } catch {
    return '';
  }
};

export const apiKeyUtils = {
  saveApiKeys: (keys: ApiKeyConfig): void => {
    const encryptedKeys: Record<string, string> = {};
    
    Object.entries(keys).forEach(([provider, key]) => {
      if (key && key.trim()) {
        encryptedKeys[provider] = encrypt(key.trim());
      }
    });
    
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(encryptedKeys));
  },

  loadApiKeys: (): ApiKeyConfig => {
    // Return empty config during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (!stored) return {};
      
      const encryptedKeys = JSON.parse(stored);
      const decryptedKeys: ApiKeyConfig = {};
      
      Object.entries(encryptedKeys).forEach(([provider, encryptedKey]) => {
        if (typeof encryptedKey === 'string') {
          const decryptedKey = decrypt(encryptedKey);
          if (decryptedKey) {
            (decryptedKeys as any)[provider] = decryptedKey;
          }
        }
      });
      
      return decryptedKeys;
    } catch {
      return {};
    }
  },

  removeApiKey: (provider: keyof ApiKeyConfig): void => {
    const keys = apiKeyUtils.loadApiKeys();
    delete keys[provider];
    apiKeyUtils.saveApiKeys(keys);
  },

  clearAllApiKeys: (): void => {
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
  },

  hasApiKey: (provider: keyof ApiKeyConfig): boolean => {
    // Return false during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return false;
    const keys = apiKeyUtils.loadApiKeys();
    return !!(keys[provider] && keys[provider]!.trim());
  },

  getApiKey: (provider: keyof ApiKeyConfig): string | undefined => {
    // Return undefined during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return undefined;
    const keys = apiKeyUtils.loadApiKeys();
    return keys[provider];
  },

  validateApiKey: (provider: keyof ApiKeyConfig, key: string): boolean => {
    if (!key || !key.trim()) return false;
    
    const trimmedKey = key.trim();
    
    switch (provider) {
      case 'openrouter':
        return trimmedKey.startsWith('sk-or-') && trimmedKey.length > 20;
      case 'openai':
        return trimmedKey.startsWith('sk-') && trimmedKey.length > 20;
      case 'gemini':
        return trimmedKey.length > 30; 
      default:
        return trimmedKey.length > 10; 
    }
  },

  getMaskedApiKey: (key: string): string => {
    if (!key || key.length < 8) return '';
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4);
  }
}; 