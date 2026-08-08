'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import { SDG_GOALS } from '@/lib/data';
import { useAuth } from '@/lib/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadCloud, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export function ActivityForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [links, setLinks] = useState<string[]>(['']);

  if (!user) return null;

  const addLink = () => setLinks([...links, '']);
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const description = formData.get('description') as string;
    const sdgGoals = formData.getAll('sdgGoals').map(Number);
    const validLinks = links.filter(link => link.trim() !== '');
    
    if (!description || description.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Description must be at least 10 characters.',
      });
      setIsSubmitting(false);
      return;
    }

    if (sdgGoals.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select at least one SDG goal.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'activities'), {
        studentId: user.uid,
        studentName: user.displayName || 'Student',
        description,
        sdgGoals,
        documentationLinks: validLinks, 
        status: 'pending',
        submittedAt: serverTimestamp(),
        points: 0,
      });

      toast({
        title: 'Success!',
        description: 'Your activity has been submitted for review.',
      });
      
      router.push('/dashboard/student');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit activity.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Submit New Activity</CardTitle>
          <CardDescription>
            Detail your SDG-related activity. Your submission will be reviewed
            by faculty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Activity Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g., Organized a campus clean-up drive"
              required
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Documentation Links (e.g., GitHub, Portfolio, Articles)</Label>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        placeholder="https://github.com/username/project"
                        type="url"
                        className="pl-9"
                      />
                    </div>
                    {links.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeLink(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove link</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addLink}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Another Link
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Supporting Files (Optional)</Label>
              <Label 
                htmlFor="documentationFile"
                className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-primary bg-primary/5 text-primary transition-colors hover:bg-primary/10"
              >
                <UploadCloud className="h-6 w-6" />
                <span className="mt-2 text-xs font-semibold">
                  {fileName ? fileName : 'Click to upload or drag and drop'}
                </span>
                <p className="text-[10px] text-primary/80">PDF, PNG, JPG or other supporting documents</p>
              </Label>
              <Input
                id="documentationFile"
                name="documentationFile"
                type="file"
                className="sr-only"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Relevant SDG Goals</Label>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SDG_GOALS.map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`sdg-${goal.id}`}
                      name="sdgGoals"
                      value={goal.id.toString()}
                      className="mt-1"
                    />
                    <label
                      htmlFor={`sdg-${goal.id}`}
                      className="text-sm font-medium leading-tight cursor-pointer"
                    >
                      {goal.id}. {goal.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Activity'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}