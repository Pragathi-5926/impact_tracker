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
} from 'lucide-react';
import { SDG_GOALS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { updateActivityStatus } from '@/app/actions';

export function SubmissionCard({ activity }: { activity: Activity }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
