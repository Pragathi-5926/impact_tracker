import type { Activity, UserProfile } from './types';

// This is a simplified UserProfile for dummy data, as we don't have a full Firebase User object
export const DUMMY_USERS: Omit<UserProfile, keyof import('firebase/auth').User | 'providerId' >[] = [
  {
    uid: 'admin01',
    email: 'admin@campus.com',
    displayName: 'Admin User',
    photoURL: 'https://i.pravatar.cc/150?u=admin01',
    role: 'admin',
  },
  {
    uid: 'staff01',
    email: 'hod@campus.com',
    displayName: 'Dr. Evelyn Reed',
    photoURL: 'https://i.pravatar.cc/150?u=staff01',
    role: 'staff',
    department: 'Computer Science',
  },
  {
    uid: 'student01',
    email: 'student1@campus.com',
    displayName: 'Alex Johnson',
    photoURL: 'https://i.pravatar.cc/150?u=student01',
    role: 'student',
    department: 'Computer Science',
  },
];


export const DUMMY_ACTIVITIES: Activity[] = [];

export const SDG_GOALS = [
    { id: 1, name: "No Poverty", color: "#E5243B" },
    { id: 2, name: "Zero Hunger", color: "#DDA63A" },
    { id: 3, name: "Good Health and Well-being", color: "#4C9F38" },
    { id: 4, name: "Quality Education", color: "#C5192D" },
    { id: 5, name: "Gender Equality", color: "#FF3A21" },
    { id: 6, name: "Clean Water and Sanitation", color: "#26BDE2" },
    { id: 7, name: "Affordable and Clean Energy", color: "#FCC30B" },
    { id: 8, name: "Decent Work and Economic Growth", color: "#A21942" },
    { id: 9, name: "Industry, Innovation, and Infrastructure", color: "#FD6925" },
    { id: 10, name: "Reduced Inequality", color: "#DD1367" },
    { id: 11, name: "Sustainable Cities and Communities", color: "#FD9D24" },
    { id: 12, name: "Responsible Consumption and Production", color: "#BF8B2E" },
    { id: 13, name: "Climate Action", color: "#3F7E44" },
    { id: 14, name: "Life Below Water", color: "#0A97D9" },
    { id: 15, name: "Life on Land", color: "#56C02B" },
    { id: 16, name: "Peace and Justice Strong Institutions", color: "#00689D" },
    { id: 17, name: "Partnerships for the Goals", color: "#19486A" }
];
