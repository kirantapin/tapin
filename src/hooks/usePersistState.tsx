import { useState, useEffect, useMemo } from "react";
import { STORAGE_TTL, STORAGE_PREFIX } from "../constants";

interface PersistedState<T> {
  value: T;
  timestamp: number; // Timestamp for when the state was last saved
}

export function usePersistState<T>(
  initial_value: T,
  id: string,
  ttl: number = STORAGE_TTL
): [T, (new_state: T | ((prevState: T) => T)) => void, () => void] {
  const _initial_value = useMemo(() => {
    const local_storage_value_str = localStorage.getItem(STORAGE_PREFIX + id);
    const now = Date.now();

    if (local_storage_value_str) {
      try {
        const parsed: PersistedState<T> = JSON.parse(local_storage_value_str);

        // Check if the data is expired
        if (now - parsed.timestamp < ttl) {
          //merging older stored value and new value
          if (Array.isArray(parsed.value) && Array.isArray(initial_value)) {
            const merged = [...parsed.value, ...initial_value] as T;
            localStorage.setItem(
              STORAGE_PREFIX + id,
              JSON.stringify({ value: merged, timestamp: now })
            );
            return merged;
          }
          return parsed.value as T;
        } else {
          localStorage.removeItem(STORAGE_PREFIX + id); // Clean up expired data
        }
      } catch (error) {
        console.error("Failed to parse localStorage value:", error);
      }
    }

    const payload: PersistedState<T> = {
      value: initial_value,
      timestamp: now,
    };
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(payload));

    return initial_value;
  }, [id, initial_value, ttl]);

  const [state, setState] = useState<T>(_initial_value);

  // Updated setState to support functional updates
  const setPersistedState = (new_state: T | ((prevState: T) => T)) => {
    setState((prevState) => {
      const updatedState =
        typeof new_state === "function"
          ? (new_state as (prevState: T) => T)(prevState) // Call the function with prevState
          : new_state; // Direct value

      // Save the updated state to localStorage with a timestamp
      const payload: PersistedState<T> = {
        value: updatedState,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(payload));

      return updatedState;
    });
  };

  const clearPersistedState = () => {
    localStorage.removeItem(STORAGE_PREFIX + id);
  };

  return [state, setPersistedState, clearPersistedState];
}
