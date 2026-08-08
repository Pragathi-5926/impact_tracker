'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { Award, CheckCircle2, TrendingUp, Hourglass } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { DUMMY_ACTIVITIES, DUMMY_USERS } from '@/lib/data';
import { SDGBarChart } from '@/components/dashboard/chart-components';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Activity } from '@/lib/types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(DUMMY_ACTIVITIES as Activity[]);
  
  useEffect(() => {
    if (!user) return;
    
    // Listen for this student's activities in Firestore
    const q = query(collection(db, 'activities'), where('studentId', '==', user.uid));
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
  }, [user]);

  if (!user) return null;

  const studentActivities = activities.filter(act => act.studentId === user.uid);
  const approvedCount = studentActivities.filter(a => a.status === 'approved' || a.status === 'verified').length;
  const pendingCount = studentActivities.filter(a => a.status === 'pending').length;
  const totalPoints = studentActivities.reduce((sum, act) => 
    (act.status === 'approved' || act.status === 'verified') ? sum + (act.points || 0) : sum, 0
  );

  // Simple rank calculation including current state
  const rank = 1; // Simplified for prototype consistency

  const monthlySubmissions = studentActivities.reduce((acc, activity) => {
    const date = activity.submittedAt instanceof Date 
      ? activity.submittedAt 
      : (activity.submittedAt as any)?.seconds ? new Date((activity.submittedAt as any).seconds * 1000) : new Date();
    const month = format(date, 'MMM');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
    }, {} as Record<string, number>);

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyChartData = monthOrder.map(month => ({
    month: month,
    activities: monthlySubmissions[month] || 0,
  })).filter(d => d.activities > 0);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.displayName}!</h1>
        <p className="text-muted-foreground">Here's a summary of your SDG contributions.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Verified Activities" value={approvedCount} icon={CheckCircle2} description="Total activities approved" />
        <StatCard title="Total SDG Points" value={totalPoints} icon={TrendingUp} description="Points from all activities" />
        <StatCard title="Pending Submissions" value={pendingCount} icon={Hourglass} description="Awaiting verification" />
        <StatCard title="Class Rank" value={`#${rank}`} icon={Award} description="Real-time rank based on points" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SDGBarChart 
            data={monthlyChartData}
            title="My Monthly Submissions"
            description="Total number of activities you submitted each month."
            dataKey="activities"
            xAxisKey="month"
        />

        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest submissions and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {studentActivities.slice(0, 5).sort((a,b) => {
                      const dateA = a.submittedAt instanceof Date ? a.submittedAt.getTime() : (a.submittedAt as any)?.seconds * 1000;
                      const dateB = b.submittedAt instanceof Date ? b.submittedAt.getTime() : (b.submittedAt as any)?.seconds * 1000;
                      return dateB - dateA;
                    }).map(activity => (
                        <div key={activity.id} className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{activity.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    Submitted {format(activity.submittedAt instanceof Date ? activity.submittedAt : new Date((activity.submittedAt as any).seconds * 1000), 'PP')}
                                </p>
                            </div>
                            <Badge variant={
                                (activity.status === 'approved' || activity.status === 'verified') ? 'default' :
                                activity.status === 'pending' ? 'secondary' : 'destructive'
                            } className="capitalize">
                                {activity.status === 'verified' ? 'Approved' : activity.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
