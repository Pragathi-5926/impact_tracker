'use client';

import { useState, useEffect } from 'react';
import { SubmissionCard } from "@/components/dashboard/staff/submission-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DUMMY_ACTIVITIES } from '@/lib/data';
import type { Activity } from '@/lib/types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function VerifySubmissionsPage() {
    const [activities, setActivities] = useState<Activity[]>(DUMMY_ACTIVITIES as Activity[]);

    useEffect(() => {
      const q = query(collection(db, 'activities'), orderBy('submittedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreActivities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];
        
        // Merge dummy activities with firestore activities
        // In a real app, you'd only use firestoreActivities
        setActivities(prev => {
          const dummyOnly = prev.filter(a => a.id.startsWith('act-'));
          const merged = [...firestoreActivities];
          
          // Only add dummy activities that don't have a newer version in firestore (if we used real IDs)
          dummyOnly.forEach(dummy => {
            if (!merged.find(m => m.id === dummy.id)) {
              merged.push(dummy);
            }
          });
          
          return merged;
        });
      }, (error) => {
        console.error("Error fetching activities:", error);
      });

      return () => unsubscribe();
    }, []);

    const handleUpdate = (updatedActivity: Activity) => {
      setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
    };

    const pendingActivities = activities.filter(a => a.status === 'pending');
    const verifiedActivities = activities.filter(a => a.status === 'verified');
    const rejectedActivities = activities.filter(a => a.status === 'rejected');

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Verify Submissions</h1>
                <p className="text-muted-foreground">Review and approve or reject student SDG activities.</p>
            </div>
            
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                        Pending
                        <Badge variant="secondary" className="ml-2">{pendingActivities.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="verified">
                        Verified
                        <Badge variant="secondary" className="ml-2">{verifiedActivities.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        Rejected
                        <Badge variant="secondary" className="ml-2">{rejectedActivities.length}</Badge>
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-6">
                    <div className="space-y-4">
                        {pendingActivities.length > 0 ? (
                            pendingActivities.map(activity => (
                                <SubmissionCard key={activity.id} activity={activity} onUpdate={handleUpdate} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No pending submissions.</p>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="verified" className="mt-6">
                    <div className="space-y-4">
                         {verifiedActivities.length > 0 ? (
                            verifiedActivities.map(activity => (
                                <SubmissionCard key={activity.id} activity={activity} onUpdate={handleUpdate} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No submissions have been verified yet.</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    <div className="space-y-4">
                         {rejectedActivities.length > 0 ? (
                            rejectedActivities.map(activity => (
                                <SubmissionCard key={activity.id} activity={activity} onUpdate={handleUpdate} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No submissions have been rejected yet.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
