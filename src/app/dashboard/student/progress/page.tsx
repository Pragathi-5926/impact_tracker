'use client';

import { SDGAreaChart, SDGBarChart } from "@/components/dashboard/chart-components";
import { DUMMY_ACTIVITIES } from "@/lib/data";
import { useAuth } from "@/lib/hooks/use-auth";
import { format } from "date-fns";

export default function MyProgressPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const studentActivities = DUMMY_ACTIVITIES.filter(act => act.studentId === user.uid);
  
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

  const sdgCounts: {[key: number]: number} = {};
  studentActivities.forEach(activity => {
    if (activity.status === 'approved') {
        activity.sdgGoals.forEach(goalId => {
            sdgCounts[goalId] = (sdgCounts[goalId] || 0) + 1;
        });
    }
  });

  const sdgChartData = Object.entries(sdgCounts).map(([goalId, count]) => ({
    goal: `SDG ${goalId}`,
    activities: count
  }));

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
       <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground">Visualize your contributions to the Sustainable Development Goals.</p>
      </div>

      <SDGAreaChart 
        data={cumulativeProgressData}
        title="Points Over Time"
        description="Your cumulative SDG points from approved activities."
        dataKey="points"
        xAxisKey="date"
      />

      <SDGBarChart
        data={sdgChartData}
        title="Contribution by SDG"
        description="Number of your approved activities per SDG goal."
        dataKey="activities"
        xAxisKey="goal"
      />
    </div>
  );
}
