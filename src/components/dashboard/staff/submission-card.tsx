'use client';

import { useState, useMemo } from 'react';
import type { Activity } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Link as LinkIcon,
  Check,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { SDG_GOALS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { approveAndEvaluateActivity, rejectActivityWithReason } from '@/app/actions';
import { useAuth } from '@/lib/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

export function SubmissionCard({ activity }: { activity: Activity }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const { toast } = useToast();

  // Evaluation state
  const [scores, setScores] = useState({
    sdgAlignment: '',
    participationContribution: '',
    activitySignificanceImpact: '',
    proofDocumentation: '',
    activityDescription: '',
  });
  const [staffFeedback, setStaffFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + (Number(score) || 0), 0);
  }, [scores]);

  const handleApprove = async () => {
    if (!user) return;
    
    const allScored = Object.values(scores).every(score => score !== '');
    if (!allScored) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Evaluation',
        description: 'Please provide a score for all five criteria.',
      });
      return;
    }

    setIsSubmitting(true);
    const evaluationData = {
      ...Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Number(v)])),
      totalScore,
      staffFeedback,
      evaluatedBy: user.uid,
    };

    const result = await approveAndEvaluateActivity(activity.id, user.uid, evaluationData);
    if (result.type === 'success') {
      toast({ title: 'Success', description: result.message });
      setIsApproveOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!user) return;

    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Reason',
        description: 'Please provide a reason for rejection.',
      });
      return;
    }

    setIsSubmitting(true);
    const rejectionData = {
      reason: rejectionReason,
      rejectedBy: user.uid,
    };

    const result = await rejectActivityWithReason(activity.id, user.uid, rejectionData);
    if (result.type === 'success') {
      toast({ title: 'Success', description: result.message });
      setIsRejectOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSubmitting(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : name[0];
  };

  const EvaluationCriteria = [
    { id: 'sdgAlignment', label: 'SDG Alignment', description: 'Whether the activity genuinely relates to the selected SDG(s).' },
    { id: 'participationContribution', label: 'Participation & Contribution', description: 'How actively the student participated or contributed to the activity.' },
    { id: 'activitySignificanceImpact', label: 'Activity Significance & Impact', description: 'The importance, reach, or benefit of the activity.' },
    { id: 'proofDocumentation', label: 'Proof & Documentation', description: 'Quality and validity of certificates, photos, attendance proof, reports, or other evidence.' },
    { id: 'activityDescription', label: 'Activity Description', description: 'How clearly the student explains what they did and how it connects to the SDG.' },
  ];

  const submittedDate = activity.submittedAt instanceof Date 
    ? activity.submittedAt 
    : activity.submittedAt ? new Date(activity.submittedAt.seconds * 1000) : new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">
              {activity.description}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{getInitials(activity.studentName)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{activity.studentName}</span> &middot; 
              <span>Submitted {formatDistanceToNow(submittedDate, { addSuffix: true })}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
            {activity.sdgGoals.map((id) => {
                const goal = SDG_GOALS.find(g => g.id === id);
                return (
                    <Badge key={id} variant="secondary" className="text-[10px]" style={goal ? {backgroundColor: `${goal.color}20`, color: goal.color, border: `1px solid ${goal.color}40`} : {}}>
                        SDG {id}
                    </Badge>
                )
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="documentation" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View Supporting Evidence
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0">
              <div className="rounded-md bg-muted/50 p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Documentation Links:</h4>
                <ul className="space-y-1.5">
                  {activity.documentationLinks.length > 0 ? activity.documentationLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline hover:no-underline flex items-center gap-1.5"
                      >
                        <LinkIcon className="h-3 w-3" />
                        {link}
                      </a>
                    </li>
                  )) : (
                    <li className="text-xs text-muted-foreground italic">No links provided.</li>
                  )}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {activity.status === 'verified' && activity.evaluation && (
          <div className="rounded-md border border-accent bg-accent/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-primary flex items-center gap-2">
                <Check className="h-4 w-4" />
                Evaluation Result
              </h4>
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold">
                Total: {activity.evaluation.totalScore} / 25
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
               <div className="flex justify-between border-b pb-1">
                 <span className="text-muted-foreground">SDG Alignment:</span>
                 <span className="font-medium">{activity.evaluation.sdgAlignment}/5</span>
               </div>
               <div className="flex justify-between border-b pb-1">
                 <span className="text-muted-foreground">Participation:</span>
                 <span className="font-medium">{activity.evaluation.participationContribution}/5</span>
               </div>
               <div className="flex justify-between border-b pb-1">
                 <span className="text-muted-foreground">Significance:</span>
                 <span className="font-medium">{activity.evaluation.activitySignificanceImpact}/5</span>
               </div>
               <div className="flex justify-between border-b pb-1">
                 <span className="text-muted-foreground">Documentation:</span>
                 <span className="font-medium">{activity.evaluation.proofDocumentation}/5</span>
               </div>
               <div className="flex justify-between border-b pb-1">
                 <span className="text-muted-foreground">Description:</span>
                 <span className="font-medium">{activity.evaluation.activityDescription}/5</span>
               </div>
            </div>
            {activity.evaluation.staffFeedback && (
              <div className="mt-2 text-sm italic text-muted-foreground border-l-2 border-primary/20 pl-3 py-1">
                "{activity.evaluation.staffFeedback}"
              </div>
            )}
          </div>
        )}

        {activity.status === 'rejected' && activity.rejection && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 space-y-2">
            <h4 className="font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Rejection Details
            </h4>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Reason:</span> {activity.rejection.reason}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Rejected on {format(activity.rejection.rejectedAt instanceof Date ? activity.rejection.rejectedAt : new Date(activity.rejection.rejectedAt.seconds * 1000), 'PPP')}
            </p>
          </div>
        )}
      </CardContent>

      {activity.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reject SDG Activity</DialogTitle>
                <DialogDescription>
                  Explain why this activity cannot be approved. This reason is required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this activity cannot be approved and what the student should correct or provide..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                  {isSubmitting ? 'Rejecting...' : 'Reject Activity'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Evaluate SDG Activity</DialogTitle>
                <DialogDescription>
                  Assess the submission based on the following criteria (0-5 marks each).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {EvaluationCriteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">{criterion.label}</Label>
                      <Select
                        value={scores[criterion.id as keyof typeof scores]}
                        onValueChange={(val) => setScores(prev => ({ ...prev, [criterion.id]: val }))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Score" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map((s) => (
                            <SelectItem key={s} value={s.toString()}>
                              {s} marks
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">{criterion.description}</p>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">Total Score:</span>
                  <span className="font-bold text-2xl text-primary">{totalScore} / 25</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffFeedback">Staff Feedback (Optional)</Label>
                  <Textarea
                    id="staffFeedback"
                    placeholder="Provide feedback about the student's activity, strengths, or areas for improvement..."
                    value={staffFeedback}
                    onChange={(e) => setStaffFeedback(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Approving...' : 'Approve & Verify'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}

      {activity.status !== 'pending' && (
        <CardFooter className="flex justify-end items-center border-t pt-2 mt-2 bg-muted/20">
            <span className="text-[10px] text-muted-foreground italic mr-auto">
              {activity.status === 'verified' ? 'Approved' : 'Rejected'} by {activity.verifiedBy === user?.uid ? 'You' : 'Staff'}
            </span>
            <Badge variant={activity.status === 'verified' ? 'default' : 'destructive'} className="capitalize h-5 text-[10px] px-2">
                {activity.status}
            </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
