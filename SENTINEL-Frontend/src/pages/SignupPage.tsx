import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Github, Chrome, Loader2, Building2, User } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            // Sign up with the exact payload the FastAPI backend requires
            await api.postNoAuth('/auth/signup', {
                email,
                password,
                name,
                workspace_name: workspaceName,
            });

            // Show a success message
            toast.success('Account created successfully! Please log in.');

            // Redirect straight to the login page
            navigate('/login');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const BASE_URL = import.meta.env.VITE_API_URL as string;

    return (
        <div className="min-h-screen flex">
            {/* Left panel — decorative */}
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
                        Start monitoring your team's{' '}
                        <span className="text-amber-primary italic">hidden promises.</span>
                    </h2>
                    <p className="text-text-secondary leading-relaxed max-w-sm">
                        Set up your workspace in 30 seconds. Sentinel starts extracting commitments from your Slack and Gmail immediately.
                    </p>
                </div>

                {/* Decorative stat cards */}
                <div className="relative z-10 space-y-3">
                    {[
                        { label: 'Commitments Tracked', value: '10,000+', color: 'text-amber-primary' },
                        { label: 'At-risk dependencies caught', value: '94%', color: 'text-safe' },
                        { label: 'Setup time', value: '< 30s', color: 'text-text-primary' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between glass-2 px-4 py-3 rounded-lg border border-white/5">
                            <span className="text-xs text-text-secondary font-mono">{stat.label}</span>
                            <span className={`text-sm font-bold font-mono ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — signup form */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="w-full max-w-md">
                    <div className="glass-2 p-8 rounded-2xl border border-border-medium shadow-2xl">
                        <div className="text-center mb-8">
                            <h3 className="font-display text-2xl font-medium mb-2">Create your account</h3>
                            <p className="text-text-secondary text-sm">Enter your details to get started with Sentinel.</p>
                        </div>

                        {/* OAuth */}
                        <div className="space-y-3">
                            <a href={`${BASE_URL}/auth/oauth/google`}>
                                <Button variant="glass" className="w-full justify-start gap-3 h-12" type="button">
                                    <Chrome className="w-5 h-5" />
                                    Sign up with Google
                                </Button>
                            </a>
                            <a href={`${BASE_URL}/auth/oauth/github`}>
                                <Button variant="glass" className="w-full justify-start gap-3 h-12" type="button">
                                    <Github className="w-5 h-5" />
                                    Sign up with GitHub
                                </Button>
                            </a>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border-medium" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surface-2 px-2 text-text-tertiary">Or sign up with email</span>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-3 h-3" /> Full Name
                                    </span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Jane Smith"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Workspace Name */}
                            <div className="space-y-2">
                                <Label htmlFor="workspace_name">
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-3 h-3" /> Workspace Name
                                    </span>
                                </Label>
                                <Input
                                    id="workspace_name"
                                    placeholder="Acme Engineering"
                                    type="text"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    placeholder="name@company.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <Button className="w-full h-11 mt-2" type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-text-secondary">
                            Already have an account?{' '}
                            <Link to="/login" className="text-amber-text hover:text-amber-primary font-semibold underline underline-offset-4 transition-colors">
                                Sign In
                            </Link>
                        </p>

                        <p className="mt-3 text-center text-xs text-text-tertiary">
                            By signing up, you agree to our{' '}
                            <a href="#" className="underline hover:text-text-secondary">Terms of Service</a>{' '}
                            and{' '}
                            <a href="#" className="underline hover:text-text-secondary">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}