import { useState, useCallback, useRef } from "react";

export enum SearchInputState {
  PRISTINE,
  FOCUSED,
  LOADING,
  RESULTS,
  NAVIGATING,
  NO_RESULTS,
  EXECUTED,
}

export const useSearchStateMachine = () => {
  const [state, setState] = useState<SearchInputState>(
    SearchInputState.PRISTINE,
  );
  const queryVersion = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const transition = useCallback((newState: SearchInputState) => {
    setState(newState);
  }, []);

  const startNewRequest = useCallback(() => {
    queryVersion.current += 1;
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    return {
      version: queryVersion.current,
      signal: abortController.current.signal,
    };
  }, []);

  const getCurrentVersion = useCallback(() => queryVersion.current, []);

  return {
    state,
    transition,
    startNewRequest,
    getCurrentVersion,
  };
};
