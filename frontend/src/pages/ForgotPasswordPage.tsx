import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, ArrowLeft, MailCheck } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <p className="text-xl font-bold">TransitOps</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                <MailCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
              </p>
              <Button className="w-full" onClick={() => setSent(false)}>Resend email</Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">Reset your password</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@transitops.in" required />
                </div>
                <Button type="submit" className="w-full">Send Reset Link</Button>
              </form>
            </>
          )}

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
