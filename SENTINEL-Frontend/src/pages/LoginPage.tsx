import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Activity, Github, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  const BASE_URL = import.meta.env.VITE_API_URL as string;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[45%] bg-surface-1 relative flex-col justify-between p-12 overflow-hidden border-r border-border-soft">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-amber-primary/5 blur-[120px] rounded-full" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full bg-amber-primary/20 border border-amber-primary/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-primary shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-text-primary">Sentinel</span>
          </Link>
          <h2 className="font-display text-5xl leading-tight mb-6">
            See the <span className="text-amber-primary italic">future</span> of your engineering stack.
          </h2>
        </div>
        <div className="relative flex-grow flex items-center justify-center my-8">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-primary shadow-[0_0_20px_rgba(245,166,35,0.4)] z-20" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-text-secondary/50"
                style={{ transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-80px)` }}
              />
            ))}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <circle cx="50%" cy="50%" r="80" fill="none" stroke="currentColor" strokeDasharray="4 4" className="text-amber-primary" />
            </svg>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="text-lg text-text-secondary font-display italic">
            "Sentinel caught a circular dependency that would have taken down our payments service on Black Friday."
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-medium" />
            <div>
              <p className="text-sm font-medium text-text-primary">Sarah Chen</p>
              <p className="text-xs text-text-tertiary">CTO, Vercel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          <div className="glass-2 p-8 rounded-2xl border border-border-medium shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-medium mb-2">Welcome back</h3>
              <p className="text-text-secondary text-sm">Enter your credentials to access the command center.</p>
            </div>

            <div className="space-y-4">
              <a href={`${BASE_URL}/auth/oauth/google`}>
                <Button variant="glass" className="w-full justify-start gap-3 h-12" type="button">
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </Button>
              </a>
              <a href={`${BASE_URL}/auth/oauth/github`}>
                <Button variant="glass" className="w-full justify-start gap-3 h-12" type="button">
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </Button>
              </a>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-medium" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-2 px-2 text-text-tertiary">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button className="w-full h-11 mt-2" type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-text-tertiary">
              By clicking continue, you agree to our{' '}
              <a href="#" className="underline hover:text-text-secondary">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-text-secondary">Privacy Policy</a>.
            </p>

            <p className="mt-4 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-amber-text hover:text-amber-primary font-semibold underline underline-offset-4 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
