'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DUMMY_ACTIVITIES, DUMMY_USERS } from "@/lib/data";
import { useAuth } from "@/lib/hooks/use-auth";
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Activity } from '@/lib/types';

export default function StaffAnalyticsPage() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>(DUMMY_ACTIVITIES as Activity[]);

    useEffect(() => {
        // Real-time listener for all activities to reflect evaluation updates
        const q = query(collection(db, 'activities'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreActivities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Activity[];
            
            setActivities(prev => {
                // Keep dummy data but prioritize Firestore updates for activities with the same ID
                const dummyOnly = prev.filter(a => a.id.startsWith('act-'));
                const merged = [...firestoreActivities];
                
                dummyOnly.forEach(dummy => {
                    if (!merged.find(m => m.id === dummy.id)) {
                        merged.push(dummy);
                    }
                });
                
                return merged;
            });
        }, (error) => {
            console.error("Error fetching analytics data:", error);
        });

        return () => unsubscribe();
    }, []);

    if(!user) return null;

    // Calculate student performance based on approved/verified activities and their evaluation points
    const studentPerformance = DUMMY_USERS
        .filter(u => u.role === 'student')
        .map(student => {
            const studentActs = activities.filter(a => 
                a.studentId === student.uid && 
                (a.status === 'approved' || a.status === 'verified')
            );
            
            // Sum up the points assigned during the evaluation process
            const totalPoints = studentActs.reduce((sum, act) => sum + (act.points || 0), 0);
            
            return {
                name: student.displayName,
                approved: studentActs.length,
                points: totalPoints
            };
        })
        .sort((a,b) => b.points - a.points)
        .slice(0, 10); // Show top 10 instead of 5 for better visibility

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Department Analytics</h1>
                <p className="text-muted-foreground">Performance and contribution metrics for the {user.department} department.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Student Performers</CardTitle>
                    <CardDescription>Rankings based on total points from approved and verified activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Approved Activities</TableHead>
                                <TableHead className="text-right">Total SDG Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentPerformance.length > 0 ? (
                                studentPerformance.map(student => (
                                    <TableRow key={student.name}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.approved}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            {student.points}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                        No student data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
