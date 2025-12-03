'use client';
import { SDGBarChart } from "@/components/dashboard/chart-components";
import { DUMMY_ACTIVITIES, DUMMY_USERS } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, CheckCircle, BarChart } from "lucide-react";

export default function AdminReportsPage() {
    const totalStudents = DUMMY_USERS.filter(u => u.role === 'student').length;
    const totalActivities = DUMMY_ACTIVITIES.filter(a => a.status === 'approved').length;

    const departmentData = DUMMY_USERS.reduce((acc, user) => {
        if(user.role === 'student' && user.department) {
            if(!acc[user.department]) {
                acc[user.department] = { students: 0, activities: 0 };
            }
            acc[user.department].students++;
        }
        return acc;
    }, {} as Record<string, {students: number, activities: number}>);

    DUMMY_ACTIVITIES.forEach(activity => {
        if(activity.status === 'approved') {
            const student = DUMMY_USERS.find(u => u.uid === activity.studentId);
            if(student?.department && departmentData[student.department]) {
                departmentData[student.department].activities++;
            }
        }
    });

    const departmentChartData = Object.entries(departmentData).map(([name, data]) => ({
        name,
        activities: data.activities,
    }));
    
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Department Reports</h1>
                <p className="text-muted-foreground">Campus-wide analytics and department-wise performance.</p>
            </div>

             <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Students" value={totalStudents} icon={Users} />
                <StatCard title="Total Verified Activities" value={totalActivities} icon={CheckCircle} />
                <StatCard title="Departments" value={Object.keys(departmentData).length} icon={BarChart} />
             </div>

            <SDGBarChart 
                data={departmentChartData}
                title="Activities per Department"
                description="Number of approved SDG activities submitted by students in each department."
                dataKey="activities"
                xAxisKey="name"
            />
        </div>
    );
}
