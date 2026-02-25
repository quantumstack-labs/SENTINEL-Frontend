import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Slack, Activity, Zap, Mail, Shield, BellRing, Target, Github, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-bg selection:bg-amber-primary/30">
      {/* Background dot grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Ambient glows */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-amber-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-100px] w-[500px] h-[500px] bg-purple-ai/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between glass-frosted rounded-2xl px-6 py-3 border border-white/[0.07]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size="sm" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-white transition-colors">Platform</a>
            <a href="#security" className="text-sm text-text-secondary hover:text-white transition-colors">Security</a>
            <Link to="/login" className="text-sm text-text-secondary hover:text-white transition-colors">Log In</Link>
            <Link to="/signup">
              <Button variant="default" size="sm" className="bg-amber-primary hover:bg-amber-primary/90 text-white border-none rounded-xl px-5 h-9 text-sm font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-grow relative z-10">
        <section className="min-h-screen flex items-center px-6 pt-24 pb-10">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: Content ── */}
            <div className="space-y-7">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-2 border border-white/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-primary animate-pulse shadow-[0_0_8px_rgba(237,88,0,0.8)]" />
                <span className="text-[11px] font-mono text-amber-text uppercase tracking-widest font-semibold">AI Execution Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl xl:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-white"
              >
                Every promise your team makes —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-primary via-orange-400 to-amber-primary/80">
                  tracked automatically.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-text-secondary leading-relaxed max-w-lg"
              >
                Sentinel silently monitors Slack and Gmail, extracts every commitment with Groq AI, scores risk in real time, and alerts owners before deadlines slip.{' '}
                <span className="text-white/60">Zero setup for your team.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/dashboard">
                  <Button
                    variant="default"
                    className="h-12 px-8 text-base bg-amber-primary hover:bg-amber-primary/90 text-white rounded-xl shadow-lg shadow-amber-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold gap-2"
                  >
                    Launch Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="h-12 px-8 text-base border border-white/10 glass-1 hover:bg-white/5 rounded-xl transition-all text-text-secondary hover:text-white"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See how it works <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap gap-6 text-xs font-mono text-text-tertiary pt-2"
              >
                {[
                  { icon: Slack, label: 'Slack Integration' },
                  { icon: Mail, label: 'Gmail Monitoring' },
                  { icon: Shield, label: 'Enterprise Grade', color: 'text-safe' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className={cn('w-3.5 h-3.5', color ?? 'text-text-secondary')} />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: Product Mockup ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-x-0 bottom-[-30px] h-24 bg-amber-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="glass-frosted rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Window chrome */}
                <div className="px-5 py-3.5 flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-widest">Live Commitment Stream</span>
                  </div>
                  <Badge variant="ok" label="Active" />
                </div>

                <div className="p-6 space-y-5">
                  {/* Slack message */}
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-primary/10 border border-amber-primary/20 flex items-center justify-center text-sm font-bold text-amber-primary shrink-0">JD</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">James Doe</span>
                        <span className="text-[10px] font-mono text-text-tertiary">14:32:05</span>
                      </div>
                      <div className="text-sm text-text-secondary leading-relaxed p-3.5 glass-1 rounded-xl border border-white/[0.05]">
                        "I'll have the{' '}
                        <span className="text-white font-medium underline decoration-amber-primary/40 underline-offset-2">
                          API documentation ready by Friday morning
                        </span>{' '}
                        for the team review."
                      </div>
                    </div>
                  </div>

                  {/* AI extraction result */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                    className="ml-14 relative"
                  >
                    <div className="absolute -left-7 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-ai/60 via-purple-ai/20 to-transparent" />
                    <div className="glass-2 p-4 rounded-xl border border-purple-ai/20 bg-purple-ai/[0.03] shadow-[0_0_24px_rgba(168,85,247,0.08)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-purple-ai" />
                          <span className="text-xs font-mono text-purple-ai uppercase tracking-wider font-bold">Llama-3-70B Pipeline</span>
                        </div>
                        <span className="text-[10px] font-mono text-text-tertiary">142ms</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Commitment</p>
                          <p className="text-sm text-white font-medium">API Documentation</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Target Date</p>
                          <p className="text-sm text-white font-medium">Feb 28, 2026</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">Confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="w-[98%] h-full bg-safe shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                            </div>
                            <span className="text-xs text-safe font-mono font-bold">98%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">Risk Level</p>
                          <Badge variant="ok" label="Low" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section id="features" className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xs font-mono text-amber-text uppercase tracking-widest mb-4"
              >
                How it works
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-display font-bold text-white"
              >
                From conversation to insight — <span className="text-amber-primary">automatically.</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: 'Silent Monitoring',
                  desc: 'Reads Slack channels and Gmail threads every 30 minutes. No forms. No task creation. Just your team talking like they always do.',
                  icon: Activity,
                  color: 'amber',
                },
                {
                  title: '4-Factor Risk Scoring',
                  desc: 'Live risk scores based on deadline proximity, dependency chains, owner silence, and workload. Updated every 6 hours.',
                  icon: Target,
                  color: 'orange',
                  dynamic: true,
                },
                {
                  title: 'Smart Owner Alerts',
                  desc: "When risk crosses thresholds, owners get a Slack DM with options to 'Snooze' or draft an AI-generated status update.",
                  icon: BellRing,
                  color: 'green',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <GlassCard className="p-6 h-full glass-frosted border-white/[0.06] hover:border-white/10 transition-all flex flex-col">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110 duration-300',
                        feature.color === 'amber' && 'bg-amber-primary/10 border-amber-primary/20 text-amber-primary',
                        feature.color === 'purple' && 'bg-purple-ai/10 border-purple-ai/20 text-purple-ai',
                        feature.color === 'orange' && 'bg-orange-500/10 border-orange-500/20 text-orange-500',
                        feature.color === 'green' && 'bg-safe/10 border-safe/20 text-safe'
                      )}
                    >
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-display font-bold text-white mb-3 group-hover:text-amber-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-5">{feature.desc}</p>

                    {feature.dynamic && (
                      <div className="mt-auto space-y-3 p-4 glass-1 rounded-xl border border-white/[0.05]">
                        {[
                          { label: 'Proximity', val: 88, color: 'bg-red-500' },
                          { label: 'Dependencies', val: 42, color: 'bg-amber-500' },
                          { label: 'Silence', val: 15, color: 'bg-safe' },
                          { label: 'Workload', val: 72, color: 'bg-amber-500' },
                        ].map((metric, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-text-tertiary uppercase">
                              <span>{metric.label}</span>
                              <span>{metric.val}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${metric.val}%` }}
                                transition={{ duration: 1.2, delay: 0.4 + idx * 0.1 }}
                                className={cn('h-full', metric.color)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section id="security" className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative glass-frosted rounded-3xl p-12 text-center border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-primary/5 via-transparent to-purple-ai/5 pointer-events-none" />
              <p className="text-xs font-mono text-amber-text uppercase tracking-widest mb-4">Enterprise Ready</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Start tracking commitments today.
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Connect Slack and Gmail in under 5 minutes. Sentinel handles the rest — no training required for your team.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <Link to="/signup">
                  <Button className="h-12 px-8 bg-amber-primary hover:bg-amber-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-amber-primary/20 gap-2">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="h-12 px-8 border border-white/10 glass-1 hover:bg-white/5 rounded-xl text-text-secondary hover:text-white">
                    Already have an account
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-text-tertiary">
                {['SOC2 Type II', 'GDPR Compliant', 'End-to-End Encrypted', 'No data retention policy'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-10 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="flex flex-wrap justify-center gap-8 text-xs font-mono text-text-tertiary">
            {['SOC2 Type II', 'GDPR Compliant', 'Enterprise Ready'].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-tertiary font-mono">© 2026 QuantumStacks Lab.</p>
        </div>
      </footer>
    </div >
  );
}

function Badge({ variant, label, className }: { variant: 'cyan' | 'watch' | 'risk' | 'ok'; label: string; className?: string }) {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    watch: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    risk: 'bg-red-500/10 text-red-500 border-red-500/20',
    ok: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-widest', styles[variant], className)}>
      {label}
    </span>
  );
}
