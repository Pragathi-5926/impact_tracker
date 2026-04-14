'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DUMMY_ACTIVITIES, DUMMY_USERS } from "@/lib/data";
import { useAuth } from "@/lib/hooks/use-auth";

export default function StaffAnalyticsPage() {
    const { user } = useAuth();
    if(!user) return null;

    const departmentActivities = DUMMY_ACTIVITIES; // Assuming staff sees all activities for now.

    const studentPerformance = DUMMY_USERS
        .filter(u => u.role === 'student')
        .map(student => {
            const activities = departmentActivities.filter(a => a.studentId === student.uid && a.status === 'approved');
            const points = activities.reduce((sum, act) => sum + act.points, 0);
            return {
                name: student.displayName,
                approved: activities.length,
                points
            }
        })
        .sort((a,b) => b.points - a.points)
        .slice(0, 5);

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Department Analytics</h1>
                <p className="text-muted-foreground">Performance and contribution metrics for the {user.department} department.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Student Performers</CardTitle>
                    <CardDescription>Students with the highest points from approved activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Approved Activities</TableHead>
                                <TableHead className="text-right">Total Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentPerformance.map(student => (
                                <TableRow key={student.name}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.approved}</TableCell>
                                    <TableCell className="text-right font-semibold">{student.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
