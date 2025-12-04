'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addActivity } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SDG_GOALS } from '@/lib/data';
import { useAuth } from '@/lib/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Submitting...' : 'Submit Activity'}
    </Button>
  );
}

export function ActivityForm() {
  const { user } = useAuth();
  const initialState = { message: null, errors: {} };
  
  if (!user) return null;

  const addActivityWithStudentId = addActivity.bind(null, user.uid, user.displayName || 'Student');
  const [state, dispatch] = useActionState(addActivityWithStudentId, initialState);

  const { toast } = useToast();

  useEffect(() => {
    if (state.type === 'success') {
      toast({
        title: 'Success!',
        description: state.message,
      });
    } else if (state.type === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Submit New Activity</CardTitle>
          <CardDescription>
            Detail your SDG-related activity. Your submission will be reviewed
            by faculty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Activity Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g., Organized a campus clean-up drive"
              required
            />
             {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentationLinks">Documentation Link</Label>
            <Input
              id="documentationLinks"
              name="documentationLinks"
              type="url"
              placeholder="https://example.com/proof"
            />
            {state.errors?.documentationLinks && <p className="text-sm font-medium text-destructive">{state.errors.documentationLinks[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label>Relevant SDG Goals</Label>
            <ScrollArea className="h-40 w-full rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SDG_GOALS.map((goal) => (
                  <div key={goal.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sdg-${goal.id}`}
                      name="sdgGoals"
                      value={goal.id.toString()}
                    />
                    <label
                      htmlFor={`sdg-${goal.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {goal.id}. {goal.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
             {state.errors?.sdgGoals && <p className="text-sm font-medium text-destructive">{state.errors.sdgGoals[0]}</p>}
          </div>
          <SubmitButton />
        </CardContent>
      </Card>
    </form>
  );
}
