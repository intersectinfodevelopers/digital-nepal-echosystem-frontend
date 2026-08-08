'use client';

import type { RecentActivityItem } from '@/types/dashboard';

const STORAGE_KEY = 'recent_activity';
const ACTIVITY_EVENT = 'activity:update';

export function getActivities(): RecentActivityItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentActivityItem[]) : [];
  } catch {
    return [];
  }
}

function setActivities(items: RecentActivityItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.error('Failed to save activity to localStorage');
  }
}

export function recordActivity(item: RecentActivityItem): void {
  const items = getActivities();
  items.unshift(item);
  setActivities(items.slice(0, 20));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  }
}

export function subscribeActivities(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener(ACTIVITY_EVENT, callback);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(ACTIVITY_EVENT, callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function formatActivityTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
