'use client';

import { useState } from 'react';
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
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { UserRole } from '@/lib/types';
import { DUMMY_USERS } from '@/lib/data';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.486-11.02-8.118l-6.573,4.817C9.352,39.579,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.462,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

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

  const handleGoogleSignIn = async () => {
    // Mock Google sign in
    toast({
      title: 'Google Sign-In',
      description:
        'This is a demo. Assuming successful sign-in as a student.',
    });
    loginAs('student');
    router.push('/dashboard');
  };

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
          <div className="grid gap-2">
            <Label>Select your role to login</Label>
            <RadioGroup name="role" defaultValue="student" className="flex gap-4">
              {DUMMY_USERS.map((user) => (
                 <div key={user.uid} className="flex items-center space-x-2">
                  <RadioGroupItem value={user.role} id={`role-${user.role}`} />
                  <Label htmlFor={`role-${user.role}`} className="capitalize">{user.role}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        <Button type="submit" className="w-full">
          {isSignUp ? 'Create an account' : 'Login'}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
        <GoogleIcon className="mr-2 h-4 w-4" />
        Google
      </Button>
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
