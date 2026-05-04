import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AppState {
  selectedState: string | null;
  setSelectedState: (code: string | null) => void;
  lastSearchedAddress: string | null;
  setLastSearchedAddress: (address: string | null) => void;
}

const AppStateContext = createContext<AppState | null>(null);

const STORAGE_KEY = "civic-hub-state";
const ADDRESS_KEY = "civic-hub-address";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selectedState, setSelectedStateRaw] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [lastSearchedAddress, setLastSearchedAddressRaw] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ADDRESS_KEY);
    } catch {
      return null;
    }
  });

  const setSelectedState = useCallback((code: string | null) => {
    setSelectedStateRaw(code);
    try {
      if (code) {
        localStorage.setItem(STORAGE_KEY, code);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLastSearchedAddress = useCallback((address: string | null) => {
    setLastSearchedAddressRaw(address);
    try {
      if (address) {
        localStorage.setItem(ADDRESS_KEY, address);
      } else {
        localStorage.removeItem(ADDRESS_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <AppStateContext.Provider value={{ selectedState, setSelectedState, lastSearchedAddress, setLastSearchedAddress }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return ctx;
}
