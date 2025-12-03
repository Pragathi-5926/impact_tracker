'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { Award, CheckCircle2, TrendingUp, Hourglass } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { DUMMY_ACTIVITIES, DUMMY_USERS } from '@/lib/data';
import { SDGAreaChart } from '@/components/dashboard/chart-components';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  if (!user) return null; // Or a loading skeleton

  const studentActivities = DUMMY_ACTIVITIES.filter(act => act.studentId === user.uid);
  const approvedCount = studentActivities.filter(a => a.status === 'approved').length;
  const pendingCount = studentActivities.filter(a => a.status === 'pending').length;
  const totalPoints = studentActivities.reduce((sum, act) => act.status === 'approved' ? sum + act.points : sum, 0);

  const allStudentsPoints = DUMMY_USERS.filter(u => u.role === 'student').map(student => {
    const points = DUMMY_ACTIVITIES
      .filter(act => act.studentId === student.uid && act.status === 'approved')
      .reduce((sum, act) => sum + act.points, 0);
    return { name: student.displayName, points };
  }).sort((a,b) => b.points - a.points);
  
  const rank = allStudentsPoints.findIndex(s => s.name === user.displayName) + 1;

  const progressData = studentActivities
    .filter(a => a.status === 'approved' && a.verifiedAt)
    .sort((a, b) => new Date(a.verifiedAt!).getTime() - new Date(b.verifiedAt!).getTime())
    .map(a => ({
        date: format(new Date(a.verifiedAt!), 'MMM d'),
        points: a.points
    }));
    
  let cumulativePoints = 0;
  const cumulativeProgressData = progressData.map(item => {
    cumulativePoints += item.points;
    return { ...item, points: cumulativePoints };
  });

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
        <StatCard title="Class Rank" value={`#${rank}`} icon={Award} description={`Among ${allStudentsPoints.length} students`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SDGAreaChart 
            data={cumulativeProgressData}
            title="My Progress"
            description="Your cumulative SDG points over time."
            dataKey="points"
            xAxisKey="date"
        />

        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest submissions and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {studentActivities.slice(0, 5).map(activity => (
                        <div key={activity.id} className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{activity.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    Submitted on {format(new Date(activity.submittedAt as Date), 'PP')}
                                </p>
                            </div>
                            <Badge variant={
                                activity.status === 'approved' ? 'default' :
                                activity.status === 'pending' ? 'secondary' : 'destructive'
                            } className={`capitalize ${activity.status === 'approved' && 'bg-accent text-accent-foreground'}`}>
                                {activity.status}
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
