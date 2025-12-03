'use client';
import { SubmissionCard } from "@/components/dashboard/staff/submission-card";
import { DUMMY_ACTIVITIES } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function VerifySubmissionsPage() {
    const pendingActivities = DUMMY_ACTIVITIES.filter(a => a.status === 'pending');
    const verifiedActivities = DUMMY_ACTIVITIES.filter(a => a.status !== 'pending').sort((a,b) => new Date(b.verifiedAt || 0).getTime() - new Date(a.verifiedAt || 0).getTime());

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Verify Submissions</h1>
                <p className="text-muted-foreground">Review and approve or reject student SDG activities.</p>
            </div>
            
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">
                        Pending
                        <Badge variant="secondary" className="ml-2">{pendingActivities.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="verified">Verified</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    <div className="space-y-4">
                        {pendingActivities.length > 0 ? (
                            pendingActivities.map(activity => (
                                <SubmissionCard key={activity.id} activity={activity} />
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
                                <SubmissionCard key={activity.id} activity={activity} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No submissions have been verified yet.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
