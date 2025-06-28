'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: SignInFormValues) {
    setServerError('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      if (result?.error) {
        setServerError('Invalid email or password');
        return;
      }
      router.push('/properties/map');
      router.refresh();
    } catch (error) {
      setServerError('An unexpected error occurred');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Icons.logo className="mx-auto h-12 w-12" />
          <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Form {...form}>
          <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="Email address" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="Password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-emerald-700 focus:ring-emerald-700 bg-background"
                  disabled={isLoading}
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-foreground">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-700 hover:text-emerald-600">
                  Forgot your password?
                </a>
              </div>
            </div>
            {serverError && (
              <FormMessage className="text-destructive text-sm text-center">{serverError}</FormMessage>
            )}
            <Button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              onClick={() => signIn('github', { callbackUrl: '/workouts' })}
              variant="outline"
              className="flex w-full items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <Icons.gitHub className="h-5 w-5" />
              <span>GitHub</span>
            </Button>
            <Button
              onClick={() => signIn('google', { callbackUrl: '/workouts' })}
              variant="outline"
              className="flex w-full items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              <span>Google</span>
            </Button>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-emerald-700 hover:text-emerald-600">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}