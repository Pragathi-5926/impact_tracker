'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { DUMMY_ACTIVITIES, SDG_GOALS } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function StudentReportsPage() {
    const { user } = useAuth();
    const reportCardRef = useRef<HTMLDivElement>(null);

    if (!user) return null;

    const studentActivities = DUMMY_ACTIVITIES.filter(act => act.studentId === user.uid && act.status === 'approved');
    const totalPoints = studentActivities.reduce((sum, act) => sum + act.points, 0);

    const handleDownload = () => {
        const input = reportCardRef.current;
        if (input) {
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgProps= pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`sdg-report-${user.displayName?.replace(/\s/g, '-').toLowerCase()}.pdf`);
            });
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">My Contribution Report</h1>
                    <p className="text-muted-foreground">A summary of your verified SDG activities.</p>
                </div>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>

            <Card ref={reportCardRef}>
                <CardHeader>
                    <div>
                        <CardTitle>Activity Summary for {user.displayName}</CardTitle>
                        <CardDescription>As of {format(new Date(), 'PP')}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {studentActivities.length > 0 ? studentActivities.map((activity, index) => (
                        <div key={activity.id}>
                            <div className="flex justify-between items-start">
                                <div className='max-w-prose'>
                                    <h3 className="font-semibold">{activity.description}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Verified on {activity.verifiedAt ? format(new Date(activity.verifiedAt), 'PP') : 'N/A'}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {activity.sdgGoals.map(goalId => {
                                            const goal = SDG_GOALS.find(g => g.id === goalId);
                                            return goal ? (
                                                <Badge key={goalId} variant="secondary" style={{ backgroundColor: `${goal.color}20`, color: goal.color, border: `1px solid ${goal.color}80`}}>
                                                    SDG {goal.id}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-primary">{activity.points} pts</p>
                                </div>
                            </div>
                            {index < studentActivities.length - 1 && <Separator className="mt-6" />}
                        </div>
                    )) : (
                        <p className='text-muted-foreground text-center py-8'>You have no approved activities yet.</p>
                    )}
                </CardContent>
                {studentActivities.length > 0 && (
                  <CardFooter className="flex justify-end bg-muted/50 p-4">
                      <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Points</p>
                          <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                      </div>
                  </CardFooter>
                )}
            </Card>
        </div>
    );
}
