import { useState, useEffect, useCallback } from "react";
import { storage } from "../lib/storage";

const SHORTLIST_KEY = "business-ideas-shortlist";

export function useShortlist() {
  const [shortlist, setShortlist] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = storage.get<number[]>(SHORTLIST_KEY, []);
      if (stored.length > 0) {
        setShortlist(stored);
      }
    } catch (err) {
      console.error("Failed to load shortlist:", err);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever shortlist changes
  useEffect(() => {
    if (isLoaded) {
      try {
        storage.set(SHORTLIST_KEY, shortlist);
      } catch (err) {
        console.error("Failed to save shortlist:", err);
      }
    }
  }, [shortlist, isLoaded]);

  const toggle = useCallback((ideaId: number) => {
    setShortlist(prev =>
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  }, []);

  const add = useCallback((ideaId: number) => {
    setShortlist(prev => (prev.includes(ideaId) ? prev : [...prev, ideaId]));
  }, []);

  const remove = useCallback((ideaId: number) => {
    setShortlist(prev => prev.filter(id => id !== ideaId));
  }, []);

  const clear = useCallback(() => {
    setShortlist([]);
  }, []);

  const isInShortlist = useCallback(
    (ideaId: number) => {
      return shortlist.includes(ideaId);
    },
    [shortlist]
  );

  return {
    shortlist,
    isLoaded,
    toggle,
    add,
    remove,
    clear,
    isInShortlist,
    count: shortlist.length,
  };
}
