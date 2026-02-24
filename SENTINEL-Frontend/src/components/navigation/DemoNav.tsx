import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '@/context/DashboardContext';
import { useExecutionScore } from '@/hooks/useData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Network,
  Settings,
  Bell,
  Zap,
  FileText,
  AppWindow,
  Activity,
  Users,
  AlertTriangle
} from 'lucide-react';
import { GlassCard } from '../glass/GlassCard';

export default function DemoNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { view, setView } = useDashboard();
  const { data: score } = useExecutionScore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isManagementPage = location.pathname.includes('/integrations') ||
    location.pathname.includes('/settings') ||
    location.pathname.includes('/alerts') ||
    location.pathname.includes('/members');

  const isDashboardBase = location.pathname === '/dashboard';

  // Rule: Only show on Brief page if scrolled down. Hide on Graph page.
  // On other pages (Integrations, Settings, Alerts, Members), show always
  const shouldShow = isManagementPage || (isDashboardBase && view !== 'graph' && (view !== 'brief' || isScrolled));

  const pages = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/dashboard/members', label: 'Members', icon: Users },
    { path: '/dashboard/integrations', label: 'Integrations', icon: Network },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {(shouldShow && location.pathname !== '/' && location.pathname !== '/login') && (
        <div className={cn(
          "fixed z-[9999] transition-all duration-500 ease-in-out",
          isManagementPage
            ? "bottom-6 right-6 translate-x-0"
            : "bottom-6 left-1/2 -translate-x-1/2"
        )}>
          <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, y: 50, scale: 0.9, backdropFilter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            className="flex items-center gap-3 will-change-[transform,opacity,backdrop-filter]"
          >
            {/* Health Pill Main Body */}
            <GlassCard className={cn(
              "p-1.5 flex items-center gap-1.5 glass-frosted rounded-full border-white/10 shadow-2xl transition-all",
              isManagementPage ? "bg-bg/80 backdrop-blur-xl" : "pr-4"
            )}>

              {/* Health Score Orb */}
              <div
                onClick={() => { setView('brief'); navigate('/dashboard'); }}
                className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group shrink-0"
              >
                <div className={cn(
                  "absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity",
                  score?.status === 'stable' ? "bg-safe" : score?.status === 'watch' ? "bg-watch" : "bg-risk"
                )} />
                <span className={cn(
                  "text-[13px] font-mono font-bold relative z-10",
                  score?.status === 'stable' ? "text-safe" : score?.status === 'watch' ? "text-amber-text" : "text-risk"
                )}>
                  {score?.current}
                </span>
              </div>

              <div className="h-6 w-[1px] bg-white/10 mx-1 shrink-0" />

              {/* Nav Items */}
              <div className="flex gap-1 shrink-0">
                {pages.map((page) => {
                  const isActive = location.pathname === page.path;
                  return (
                    <button
                      key={page.path}
                      onClick={() => navigate(page.path)}
                      title={page.label}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200",
                        isActive
                          ? "bg-amber-primary text-black"
                          : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                      )}
                    >
                      <page.icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* System Status Section */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10 group cursor-help" title="Morning Brief: An AI-distilled narrative of your daily project pulse.">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono font-bold text-text-tertiary uppercase tracking-widest leading-none">SYSTEM STATUS</span>
                  <span className="text-xs text-watch font-bold mt-0.5">Watching 4 risks</span>
                </div>

                <button
                  onClick={() => { setView('brief'); navigate('/dashboard'); }}
                  className="ml-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-risk/10 hover:border-risk/30 hover:text-risk transition-all group/brief shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-primary group-hover/brief:text-risk transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">MORNING BRIEF</span>
                </button>
              </div>
            </GlassCard>

            {/* Pulse Button - Hidden on Management pages for focus */}
            {!isManagementPage && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => alert("Sentinel is actively syncing live signals from Slack and Gmail...")}
                title="Execution Pulse: Active Signal Syncing"
                className="w-12 h-12 rounded-full bg-amber-primary border border-white/20 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-black group shrink-0"
              >
                <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
