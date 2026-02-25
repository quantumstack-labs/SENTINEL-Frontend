import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '@/context/DashboardContext';
import { useExecutionScore, useCommitments, useWorkspaceSettings } from '@/hooks/useData';
import { useIsFetching } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Network,
  Settings,
  FileText,
  Activity,
  Users,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '../brand/Logo';

export default function DemoNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { view, setView } = useDashboard();
  const { data: score } = useExecutionScore();
  const { data: commitments } = useCommitments();
  const isFetching = useIsFetching();
  const [isScrolled, setIsScrolled] = useState(false);

  const isSyncing = isFetching > 0;

  const handleSync = () => {
    toast.success('Triggering live signal sync...', {
      icon: '📡',
      duration: 2000
    });
  };

  const risksCount = (commitments ?? []).filter((c: any) => c.risk === 'at-risk' || c.risk === 'watch').length;

  const getBriefTitle = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "MORNING BRIEF";
    if (hour < 17) return "AFTERNOON BRIEF";
    if (hour < 22) return "EVENING BRIEF";
    return "NIGHT BRIEF";
  };

  const briefTitle = getBriefTitle();

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

  // Show if on a management page or the dashboard (except graph view where it might overlap too much)
  const shouldShow = isManagementPage || (isDashboardBase && view !== 'graph');

  const pages = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/dashboard/members', label: 'Members', icon: Users },
    { path: '/dashboard/integrations', label: 'Integrations', icon: Network },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isVisible = shouldShow && location.pathname !== '/' && location.pathname !== '/login';

  return (
    <div className={cn(
      "fixed z-[9999] p-6 pointer-events-none inset-0 flex items-end transition-all duration-700 ease-in-out",
      isManagementPage ? "justify-end" : "justify-center"
    )}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            layout
            key="navigation-pill"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              layout: { duration: 0.6, type: 'spring', bounce: 0.15 }
            }}
            className={cn(
              "pointer-events-auto p-1.5 flex items-center gap-2 rounded-full border border-white/10 shadow-2xl glass-frosted relative overflow-hidden",
              isManagementPage ? "" : "pr-4"
            )}
          >
            {/* Sentinel Brand Icon */}
            <div className="pl-2 pr-1 shrink-0">
              <Logo variant="icon" size="sm" />
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-1 shrink-0" />

            {/* Health Score Orb */}
            <motion.div
              layout
              onClick={() => { setView('brief'); navigate('/dashboard'); }}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden group shrink-0"
            >
              <div className={cn(
                "absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity",
                score?.status === 'stable' ? "bg-safe" : "bg-white/20"
              )} />
              <span className={cn(
                "text-[14px] font-mono font-bold relative z-10",
                score?.status === 'stable' ? "text-safe" : "text-text-primary"
              )}>
                {score?.current}
              </span>
            </motion.div>

            <motion.div layout className="h-6 w-[1px] bg-white/10 mx-1 shrink-0" />

            {/* Nav Items */}
            <motion.div layout className="flex gap-1 shrink-0">
              {pages.map((page) => {
                const isActive = location.pathname === page.path;
                return (
                  <button
                    key={page.path}
                    onClick={() => navigate(page.path)}
                    title={page.label}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300",
                      isActive
                        ? "bg-amber-primary text-white shadow-[0_0_15px_rgba(237,88,0,0.3)]"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    )}
                  >
                    <page.icon className="w-4.5 h-4.5" />
                  </button>
                );
              })}
            </motion.div>

            {/* System Status Section (Only on Dashboard) */}
            <AnimatePresence>
              {!isManagementPage && (
                <motion.div
                  layout
                  initial={{ opacity: 0, width: 0, x: -20 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -20 }}
                  className="flex items-center gap-3 pl-3 border-l border-white/10 group cursor-help overflow-hidden whitespace-nowrap"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-bold text-text-tertiary uppercase tracking-widest leading-none">SYSTEM STATUS</span>
                    <span className="text-xs text-text-secondary font-bold mt-1">
                      {risksCount === 0 ? 'No active risks' : `Watching ${risksCount} risk${risksCount === 1 ? '' : 's'}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 group relative">
                    <Activity className={cn(
                      "w-4 h-4 transition-all duration-500",
                      isSyncing ? "text-amber-primary fill-amber-primary scale-110" : "text-text-tertiary group-hover:text-text-primary",
                    )} />
                    <span className="text-[10px] font-bold text-text-tertiary group-hover:text-text-primary uppercase tracking-wider">
                      {isSyncing ? "Syncing..." : "Pulse"}
                    </span>
                    <button
                      onClick={handleSync}
                      className="absolute inset-0 z-10"
                    />
                  </div>

                  <button
                    onClick={() => { setView('brief'); navigate('/dashboard'); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-primary/10 border border-amber-primary/20 hover:bg-amber-primary/20 transition-all group/brief shadow-sm"
                  >
                    <FileText className="w-4 h-4 text-amber-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-text">{briefTitle}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Pulse Button */}
            {!isManagementPage && (
              <motion.button
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleSync}
                className={cn(
                  "w-11 h-11 rounded-full border border-white/10 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group shrink-0 relative overflow-hidden ml-2",
                  isSyncing ? "text-amber-primary" : "text-text-primary bg-white/5"
                )}
              >
                <div className={cn("absolute inset-0 bg-amber-primary/10 opacity-0 transition-opacity", isSyncing && "opacity-100 animate-pulse")} />
                <Activity className={cn("w-5 h-5 relative z-10 transition-transform", !isSyncing && "group-hover:rotate-12")} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
