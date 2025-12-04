'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DUMMY_USERS } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [demoRole, setDemoRole] = useState<'admin' | 'staff' | 'student' | null>(null);
  const { loginAs, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!demoRole) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please select a role to log in as.',
      });
      return;
    }
    
    const userToLogin = DUMMY_USERS.find((u) => u.role === demoRole);

    if (!userToLogin) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'No user found for the selected role.',
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

  const uniqueRoles = [...new Set(DUMMY_USERS.map(user => user.role))];

  if (loading) return null;

  return (
    <>
      <form onSubmit={handleSignIn} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-base">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required defaultValue="demo@example.com" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-base">Password</Label>
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
            <Label className="font-medium text-base capitalize">Select Your Role To Login</Label>
             <RadioGroup 
                defaultValue="student"
                className="flex gap-4 justify-center" 
                onValueChange={(value) => setDemoRole(value as 'admin' | 'staff' | 'student')}
              >
              {uniqueRoles.map((role) => (
                <div className="flex items-center space-x-2" key={role}>
                    <RadioGroupItem value={role} id={`role-${role}`} />
                    <Label className="uppercase" htmlFor={`role-${role}`}>{role}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        <Button type="submit" className="w-full">
          {isSignUp ? 'Create an account' : 'LOGIN'}
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
