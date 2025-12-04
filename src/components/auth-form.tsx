'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DUMMY_USERS } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { loginAs } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userId = formData.get('user') as string | null;
    
    if (!userId) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Please select a user to log in as.',
        });
        return;
    }
    
    const userToLogin = DUMMY_USERS.find(u => u.uid === userId);

    if (!userToLogin) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Selected user not found.',
        });
        return;
    }

    toast({
      title: 'Login Successful',
      description: 'Redirecting to your dashboard...',
    });

    loginAs(userToLogin.uid);
    router.push('/dashboard');
  };

  return (
    <>
      <form onSubmit={handleSignIn} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required defaultValue="demo@example.com" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {isSignUp && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(false);
                }}
                className="ml-auto inline-block text-sm underline"
              >
                Already have an account?
              </a>
            )}
          </div>
          <Input id="password" type="password" required defaultValue="password" />
        </div>
        {!isSignUp && (
          <div className="grid gap-2 text-center my-4">
            <Label>Select a user to login as</Label>
            <Select name="user">
              <SelectTrigger>
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {DUMMY_USERS.map((user) => (
                  <SelectItem key={user.uid} value={user.uid}>
                    {user.displayName} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button type="submit" className="w-full">
          {isSignUp ? 'Create an account' : 'Login'}
        </Button>
      </form>
      
      {!isSignUp && (
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(true);
            }}
            className="underline"
          >
            Sign up
          </a>
        </div>
      )}
    </>
  );
}
