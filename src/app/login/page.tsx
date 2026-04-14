import Image from 'next/image';
import { AuthForm } from '@/components/auth-form';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12 bg-white">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo className="justify-center" />
            <h1 className="text-xl font-bold mt-4">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Enter Your Credentials To Access Your Dashboard
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
      <div className="hidden lg:block relative">
        <Image
          src="/login-hero.png"
          alt="People working on a project"
          fill
          className="object-cover"
          data-ai-hint="collaboration project"
        />
      </div>
    </div>
  );
}
