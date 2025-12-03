'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { UserRole } from '@/lib/types';
import { DUMMY_USERS } from '@/lib/data';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { loginAs } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is a mock sign in.
    toast({
      title: 'Login Successful',
      description: 'Redirecting to your dashboard...',
    });
    // In a real app, you would get the role from the database.
    // For the demo, we use the radio button selection.
    const formData = new FormData(e.target as HTMLFormElement);
    const role = formData.get('role') as UserRole;
    loginAs(role);
    router.push('/dashboard');
  };

  const uniqueRoles: UserRole[] = Array.from(new Set(DUMMY_USERS.map(u => u.role)));


  return (
    <>
      <form onSubmit={handleSignIn} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
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
          <Input id="password" type="password" required />
        </div>
        {!isSignUp && (
          <div className="grid gap-2 text-center my-4">
            <Label>Select your role to login</Label>
            <RadioGroup name="role" defaultValue="student" className="flex gap-4 justify-center pt-2">
              {uniqueRoles.map((role) => (
                 <div key={role} className="flex items-center space-x-2">
                  <RadioGroupItem value={role} id={`role-${role}`} />
                   <Label className="capitalize" htmlFor={`role-${role}`}>
                    {role}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
