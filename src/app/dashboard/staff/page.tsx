'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { Hourglass, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { DUMMY_ACTIVITIES } from '@/lib/data';
import { SDGBarChart } from '@/components/dashboard/chart-components';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Activity } from '@/lib/types';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(DUMMY_ACTIVITIES as Activity[]);
  
  useEffect(() => {
    const q = query(collection(db, 'activities'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreActs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[];
      setActivities(prev => {
        const dummyOnly = prev.filter(a => a.id.startsWith('act-'));
        const merged = [...firestoreActs];
        dummyOnly.forEach(dummy => {
          if (!merged.find(m => m.id === dummy.id)) {
            merged.push(dummy);
          }
        });
        return merged;
      });
    });
    return () => unsubscribe();
  }, []);
  
  if (!user) return null;

  const pendingCount = activities.filter(a => a.status === 'pending').length;
  const approvedCount = activities.filter(a => a.status === 'approved' || a.status === 'verified').length;
  const rejectedCount = activities.filter(a => a.status === 'rejected').length;

  const departmentAnalytics = activities.reduce((acc, activity) => {
    if(activity.status === 'approved' || activity.status === 'verified') {
        activity.sdgGoals.forEach(goalId => {
            acc[goalId] = (acc[goalId] || 0) + 1;
        });
    }
    return acc;
  }, {} as Record<number, number>);

  const chartData = Object.entries(departmentAnalytics).map(([goal, count]) => ({
      name: `SDG ${goal}`,
      activities: count
  }));


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.displayName}!</h1>
            <p className="text-muted-foreground">Here's an overview of student submissions for the {user.department} department.</p>
        </div>
        <Link href="/dashboard/staff/verify">
            <Button>Verify Submissions</Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Pending Verifications" value={pendingCount} icon={Hourglass} description="Submissions awaiting review" />
        <StatCard title="Total Approved" value={approvedCount} icon={CheckCircle2} description="Verified & Approved" />
        <StatCard title="Total Rejected" value={rejectedCount} icon={XCircle} description="Since the start of term" />
        <StatCard title="Overall Activity" value={activities.length} icon={BarChart2} description="Total submissions received" />
      </div>

      <SDGBarChart 
        data={chartData}
        title="Department SDG Focus"
        description="Distribution of approved activities across different SDG goals."
        dataKey="activities"
        xAxisKey="name"
      />
    </div>
  );
}
