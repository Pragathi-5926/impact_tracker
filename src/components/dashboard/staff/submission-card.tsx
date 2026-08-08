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
import { formatDistanceToNow } from 'date-fns';
import {
  Link as LinkIcon,
  Check,
  X,
} from 'lucide-react';
import { SDG_GOALS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { approveAndEvaluateActivity, rejectActivityWithReason } from '@/app/actions';
import { useAuth } from '@/lib/hooks/use-auth';

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
      evaluatedAt: new Date(),
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
      rejectedAt: new Date(),
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {activity.description}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback>{getInitials(activity.studentName)}</AvatarFallback>
              </Avatar>
              {activity.studentName} &middot; Submitted{' '}
              {formatDistanceToNow(new Date(activity.submittedAt as Date), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {activity.sdgGoals.map((id) => {
                const goal = SDG_GOALS.find(g => g.id === id);
                return (
                    <Badge key={id} variant="secondary" style={goal ? {backgroundColor: `${goal.color}20`} : {}}>
                        SDG {id}
                    </Badge>
                )
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="documentation">
            <AccordionTrigger>View Documentation</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Provided Links:</h4>
                <ul className="space-y-1 list-disc pl-5">
                  {activity.documentationLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      {activity.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2">
          {/* Rejection Dialog */}
          <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
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

          {/* Evaluation Dialog */}
          <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
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

                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">Total Score: {totalScore} / 25</span>
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
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
        <CardFooter className="flex justify-end items-center">
            <Badge variant={activity.status === 'approved' ? 'outline' : 'destructive'} className="capitalize">
                {activity.status}
            </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
