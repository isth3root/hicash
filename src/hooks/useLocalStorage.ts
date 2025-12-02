import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const jsonValue = localStorage.getItem(key);
      if (jsonValue != null) return JSON.parse(jsonValue);
    } catch (error) {
        console.error("Error reading from local storage", error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch(error) {
        console.error("Error writing to local storage", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
