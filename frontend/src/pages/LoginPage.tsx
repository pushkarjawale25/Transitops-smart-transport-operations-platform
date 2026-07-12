import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Sun, Moon, AlertCircle, ShieldCheck, Route, Wallet, Gauge, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login, isAuthenticated, authError, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold">TransitOps</p>
              <p className="text-xs text-blue-200">Smart Transport Operations</p>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Manage your entire fleet from one command center.
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              Track vehicles, drivers, trips, maintenance, fuel, and expenses — all in real time.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md pt-4">
              {[
                { icon: Truck,        label: 'Fleet Management' },
                { icon: Route,        label: 'Trip Dispatch' },
                { icon: Gauge,        label: 'Performance Analytics' },
                { icon: ShieldCheck,  label: 'Safety & Compliance' },
                { icon: Wallet,       label: 'Cost Tracking' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-blue-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-blue-300">Enterprise-grade fleet operations platform</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-slide-up">
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold">TransitOps</p>
            </div>

            <h2 className="text-2xl font-bold">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your registered email and password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@transitops.in"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                />
              </div>

              {authError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 text-sm"
                disabled={submitting || authLoading}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-5 rounded-lg border border-dashed bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Use your registered account credentials to sign in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
