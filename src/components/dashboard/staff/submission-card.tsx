'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Link as LinkIcon,
  Check,
  X,
  Bot,
  Loader2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { SDG_GOALS } from '@/lib/data';
import {
  verifySubmissionCredibility,
  type VerifySubmissionCredibilityOutput,
} from '@/ai/flows/verify-submission-credibility';
import { useToast } from '@/hooks/use-toast';
import { updateActivityStatus } from '@/app/actions';

export function SubmissionCard({ activity }: { activity: Activity }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] =
    useState<VerifySubmissionCredibilityOutput | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    setIsVerifying(true);
    setAnalysis(null);
    try {
      const result = await verifySubmissionCredibility({
        activityDescription: activity.description,
        documentationLinks: activity.documentationLinks,
        sdgGoals: activity.sdgGoals
          .map((id) => SDG_GOALS.find((g) => g.id === id)?.name)
          .join(', '),
      });
      setAnalysis(result);
    } catch (error) {
      console.error('AI verification failed:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'The AI analysis could not be completed.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    const result = await updateActivityStatus(activity.id, status);
    if (result.type === 'success') {
      toast({ title: 'Success', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSubmitting(false);
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : name[0];
  };

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
            <AccordionTrigger>View Documentation & Analysis</AccordionTrigger>
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

              <Button onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" /> Analyze Credibility
                  </>
                )}
              </Button>

              {analysis && (
                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-semibold text-lg">AI Credibility Analysis</h4>
                  <div>
                    <h5 className="font-semibold flex items-center gap-2">
                      {analysis.recommendation.toLowerCase().includes('approve') 
                        ? <ThumbsUp className="h-4 w-4 text-accent" /> 
                        : <ThumbsDown className="h-4 w-4 text-destructive" />}
                      Recommendation
                    </h5>
                    <p className="text-sm">{analysis.recommendation}</p>
                  </div>
                   <div>
                    <h5 className="font-semibold">Overall Credibility</h5>
                    <p className="text-sm">{analysis.overallCredibility}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">Relevance to SDGs</h5>
                    <p className="text-sm">{analysis.relevanceToSdgGoals}</p>
                  </div>
                   <div>
                    <h5 className="font-semibold">Link Summaries</h5>
                    <ul className="space-y-2 text-sm">
                        {analysis.summaryOfLinks.map(s => (
                            <li key={s.url}><strong>{s.url}:</strong> {s.summary}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => handleDecision('rejected')} disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" size="sm" onClick={() => handleDecision('approved')} disabled={isSubmitting}>
          <Check className="mr-2 h-4 w-4" /> Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
