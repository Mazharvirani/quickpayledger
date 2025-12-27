import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, ArrowLeft, Mail } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-sent';

export default function Auth() {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || (view !== 'forgot-password' && !password)) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (view === 'signup' && password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (view !== 'forgot-password' && password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          setView('reset-sent');
        }
      } else if (view === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message === 'Invalid login credentials' 
              ? 'Invalid email or password. Please try again.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please login instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Signup Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account Created!',
            description: 'You have successfully signed up.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Reset email sent confirmation view
  if (view === 'reset-sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription className="mt-2">
                We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setView('login');
                setEmail('');
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the email?{' '}
              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-primary font-medium hover:underline"
              >
                Try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {view === 'login' && 'Welcome Back'}
              {view === 'signup' && 'Create Account'}
              {view === 'forgot-password' && 'Reset Password'}
            </CardTitle>
            <CardDescription className="mt-2">
              {view === 'login' && 'Sign in to manage your invoices and inventory'}
              {view === 'signup' && 'Sign up to start managing your business'}
              {view === 'forgot-password' && 'Enter your email to receive a reset link'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {view === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {view === 'login' && 'Signing in...'}
                  {view === 'signup' && 'Creating account...'}
                  {view === 'forgot-password' && 'Sending reset link...'}
                </>
              ) : (
                <>
                  {view === 'login' && 'Sign In'}
                  {view === 'signup' && 'Create Account'}
                  {view === 'forgot-password' && 'Send Reset Link'}
                </>
              )}
            </Button>
          </form>
          
          {view === 'forgot-password' ? (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm text-primary font-medium hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                className="text-primary font-medium hover:underline"
              >
                {view === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
