import { useEffect, useRef, useState } from 'react';
import { isHydrated, subscribe } from './db';

/** Re-renders a component whenever the persistent database changes. */
export function useData<T>(selector: () => T): T {
  const ref = useRef(selector);
  ref.current = selector;
  const [value, setValue] = useState<T>(() => selector());
  useEffect(() => {
    setValue(ref.current());
    return subscribe(() => setValue(ref.current()));
  }, []);
  return value;
}

/** True once the active language has finished loading from Supabase. */
export function useHydration(): boolean {
  const [ready, setReady] = useState(() => isHydrated());
  useEffect(() => {
    setReady(isHydrated());
    return subscribe(() => setReady(isHydrated()));
  }, []);
  return ready;
}
