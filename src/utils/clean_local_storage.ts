import { STORAGE_PREFIX } from "../constants";

export function cleanExpiredLocalStorage(ttl: number) {
  const now = Date.now();

  // Iterate over all keys in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(STORAGE_PREFIX)) {
      try {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          const item = JSON.parse(itemStr);

          // Check for timestamp and validate it
          if (item.timestamp && now - item.timestamp > ttl) {
            console.warn(`Removing expired localStorage key: ${key}`);
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error(`Failed to parse localStorage key: ${key}`, error);
        localStorage.removeItem(key); // Clean up corrupted data
      }
    }
  }
}
