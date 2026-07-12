import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { cn } from '@/utils/helpers'

const ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']

const DEMO_CREDS = {
  'Fleet Manager': { email: 'fleet@transitops.com', password: 'fleet123' },
  'Dispatcher': { email: 'dispatch@transitops.com', password: 'dispatch123' },
  'Safety Officer': { email: 'safety@transitops.com', password: 'safety123' },
  'Financial Analyst': { email: 'finance@transitops.com', password: 'finance123' },
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('Fleet Manager')
  const [email, setEmail] = useState('fleet@transitops.com')
  const [password, setPassword] = useState('fleet123')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (r) => {
    setRole(r)
    setEmail(DEMO_CREDS[r].email)
    setPassword(DEMO_CREDS[r].password)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] gradient-primary p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">TransitOps</p>
            <p className="text-white/70 text-sm">Smart Transport Platform</p>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight">Manage your fleet<br />with confidence</h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              Real-time tracking, intelligent dispatch, and comprehensive analytics — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Vehicles', value: '8' },
              { label: 'Trips Today', value: '12' },
              { label: 'Fleet Utilization', value: '78%' },
              { label: 'On-Time Rate', value: '94%' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-white/70 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-sm">© 2026 TransitOps. Enterprise Fleet Management.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">TransitOps</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Role Selector */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Select Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium text-left border transition-all duration-150',
                    role === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@transitops.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo: Select a role above to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  )
}
