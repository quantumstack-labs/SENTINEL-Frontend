import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Slack, MessageSquare, CheckCircle2, ChevronRight, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AmbientGlow } from '@/components/glass/AmbientGlow';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';
import HeroGraph from '@/components/landing/HeroGraph';
import AlertPreviewCard from '@/components/landing/AlertPreviewCard';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-bg">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 bg-bg/80 backdrop-blur-xl border-b border-border-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-full bg-amber-primary/20 border border-amber-primary/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-primary shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-text-primary">Sentinel</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Process</a>
            <a href="#security" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Security</a>
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
            <Link to="/login">
              <Button variant="glass" size="sm" className="text-amber-text border-amber-primary/20 hover:bg-amber-primary/10">
                Get Access
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center px-6 pt-32 relative">
        <AmbientGlow color="amber" size={1000} opacity={0.05} className="-top-20 right-0" />
        <AmbientGlow color="amber" size={800} opacity={0.03} className="bottom-0 -left-40" />

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-32">

          {/* Left Content */}
          <div className="space-y-8 relative z-10 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-2 border-amber-primary/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-primary animate-pulse" />
                <span className="text-[11px] font-mono text-amber-text uppercase tracking-wider">Execution Intelligence v2.0</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] tracking-tight text-text-primary mb-8">
                Your team is making <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">hidden promises.</span>
              </h1>

              <p className="text-xl text-text-secondary max-w-lg leading-relaxed mb-10">
                Sentinel listens to Slack and Gmail, extracts every silent commitment, and visualizes at-risk dependencies before they turn into delays.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button variant="default" size="lg" className="h-14 px-10 text-base shadow-[0_0_20px_rgba(245,166,35,0.2)] hover:shadow-[0_0_30px_rgba(245,166,35,0.3)] transition-all">
                    Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 px-10 text-base border-white/5 bg-white/5 hover:bg-white/10"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Watch Demo
                </Button>
              </div>

              <div className="pt-10 flex items-center gap-8 text-[11px] font-mono text-text-tertiary">
                <div className="flex items-center gap-2 group cursor-help">
                  <Zap className="w-3.5 h-3.5 text-amber-primary group-hover:scale-110 transition-transform" />
                  <span>Real-time extraction</span>
                </div>
                <div className="flex items-center gap-2 group cursor-help">
                  <Activity className="w-3.5 h-3.5 text-safe group-hover:scale-110 transition-transform" />
                  <span>Zero performance overhead</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Visual - Live Feed Mockup */}
          <div className="relative space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <GlassCard className="p-0 overflow-hidden border-border-medium shadow-2xl">
                <div className="bg-white/[0.03] border-b border-white/5 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Slack className="w-4 h-4 text-[#E01E5A]" />
                    <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">slack-signal-feed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                    <span className="text-[10px] font-mono text-safe">LIVE</span>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Signal 1 */}
                  <div className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-bold border border-white/10">JD</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary underline decoration-amber-primary/30 underline-offset-4">"I'll have the API docs ready by Friday morning."</span>
                        <Badge variant="cyan" label="COMMITMENT" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-tertiary font-mono">
                        <span>#engineering-core</span>
                        <span>14:32</span>
                      </div>
                    </div>
                  </div>

                  {/* Extraction Animation */}
                  <div className="pl-14 relative">
                    <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-amber-primary/40 to-transparent" />
                    <div className="glass-2 p-4 rounded-xl border-amber-primary/20 space-y-3 bg-amber-primary/[0.02]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-text uppercase tracking-widest">Sentinel Extraction</span>
                        <ChevronRight className="w-3 h-3 text-amber-primary" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-text-tertiary uppercase font-mono">Deadline</span>
                          <span className="text-xs text-text-primary block font-medium">Feb 21, 2026</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-text-tertiary uppercase font-mono">Confidence</span>
                          <span className="text-xs text-safe block font-medium">98.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signal 2 */}
                  <div className="flex gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-bold border border-white/10">SK</div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-text-secondary">"Just checking in on the sprint status."</div>
                      <div className="text-xs text-text-tertiary font-mono italic">Noise filtered</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Floating Visual Elements */}
            <div className="absolute -bottom-10 -left-10 w-full h-[600px] pointer-events-none">
              <HeroGraph />
            </div>
          </div>
        </div>

        {/* Feature Cards / Use Cases */}
        <div id="features" className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
          {[
            {
              title: "Dependency Mapping",
              desc: "Sentinel connects the dots between conversations to build a live graph of who is blocking whom.",
              icon: Activity
            },
            {
              title: "Risk Scoring",
              desc: "Proprietary algorithms calculate a health score for your execution, updating with every single message.",
              icon: Zap
            },
            {
              title: "Zero Friction",
              desc: "No new apps to install. No tasks to create. Sentinel works in the background of your existing tools.",
              icon: MessageSquare
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-8 h-full hover:border-amber-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border-soft flex items-center justify-center mb-6 group-hover:border-amber-primary/40 transition-all">
                  <feature.icon className="w-6 h-6 text-amber-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-text-primary mb-4">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="border-t border-border-soft py-12 px-6 bg-surface-1">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-primary/20 border border-amber-primary/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-primary" />
            </div>
            <span className="font-display font-semibold text-text-primary">Sentinel</span>
          </div>
          <div className="flex gap-8 text-sm text-text-tertiary font-mono">
            <span>Enterprise-ready</span>
            <span>GDPR Compliant</span>
            <span>End-to-end Encrypted</span>
          </div>
          <div className="text-xs text-text-tertiary font-mono">
            © 2026 QuantumStacks Lab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponent for Badge since it might not be imported or available globally in this view
function Badge({ variant, label }: { variant: 'cyan' | 'watch' | 'risk' | 'ok'; label: string }) {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    watch: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    risk: 'bg-red-500/10 text-red-500 border-red-500/20',
    ok: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-wider", styles[variant])}>
      {label}
    </span>
  );
}
