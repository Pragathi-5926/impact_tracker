import type { Activity, UserProfile } from './types';

// This is a simplified UserProfile for dummy data, as we don't have a full Firebase User object
export const DUMMY_USERS: Omit<UserProfile, keyof import('firebase/auth').User | 'providerId' >[] = [];


export const DUMMY_ACTIVITIES: Activity[] = [];

export const SDG_GOALS: { id: number; name: string; color: string; }[] = [];
