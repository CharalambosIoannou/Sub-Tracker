import { useState, useEffect } from 'react';
import { Subscription } from '../types';

const STORAGE_KEY = 'subtrack_subscriptions';

const DEFAULT_SUBS_MOCK: Subscription[] = [];

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSubscriptions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse subscriptions from local storage', e);
        setSubscriptions(DEFAULT_SUBS_MOCK);
      }
    } else {
      setSubscriptions(DEFAULT_SUBS_MOCK);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }, [subscriptions, isLoaded]);

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...sub,
      id: crypto.randomUUID(),
    };
    setSubscriptions((prev) => [...prev, newSub]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
}
