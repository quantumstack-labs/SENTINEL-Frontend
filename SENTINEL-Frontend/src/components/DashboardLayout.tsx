import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  ListTodo,
  AlertTriangle,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Zap,
  RefreshCw,
  ExternalLink,
  Command,
  CheckCircle2
} from 'lucide-react';
import HealthOrb from './HealthOrb';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/context/DashboardContext';
import { GlassCard } from './glass/GlassCard';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import NotificationsDropdown from './navigation/NotificationsDropdown';
import UserMenu from './navigation/UserMenu';
import CommandPalette from './navigation/CommandPalette';
import { useTeamMembers, useWorkspaceSettings } from '@/hooks/useData';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { view, setView } = useDashboard();
  const { data: settings } = useWorkspaceSettings();
  const workspaceName = settings?.workspaceName ?? 'Workspace';
  const workspaceInitial = workspaceName[0]?.toUpperCase() ?? 'W';

  const isDashboard = location.pathname === '/dashboard';

  const handleNavClick = (path: string, targetView?: 'brief' | 'graph' | 'table') => {
    if (path === '/dashboard' && targetView) {
      setView(targetView);
      navigate('/dashboard');
    } else {
      navigate(path);
    }
    if (onClose) onClose();
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Brief', path: '/dashboard', view: 'brief' },
    { icon: Network, label: 'Graph', path: '/dashboard', view: 'graph' },
    { icon: ListTodo, label: 'Commitments', path: '/dashboard', view: 'table' },
    { icon: AlertTriangle, label: 'Alerts', path: '/dashboard/alerts' },
    { icon: Users, label: 'Members', path: '/dashboard/members' },
    { icon: Network, label: 'Integrations', path: '/dashboard/integrations' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="h-14 flex items-center px-4 border-b border-border-soft gap-3 flex-shrink-0">
        <HealthOrb status="safe" size={12} />
        <span className="font-display font-medium text-lg tracking-tight">Sentinel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          let isActive = false;
          if (item.path === '/dashboard' && isDashboard) {
            if (item.view) {
              isActive = view === item.view;
            } else {
              isActive = true;
            }
          } else {
            isActive = location.pathname === item.path;
          }

          return (
            <button
              key={`${item.path}-${item.view || 'root'}`}
              onClick={() => handleNavClick(item.path, item.view as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-amber-primary/10 text-amber-text border border-amber-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-amber-primary" : "text-text-tertiary")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Enhanced Workspace Info (Bottom-Left) */}
      <div className="p-4 border-t border-border-soft flex-shrink-0 space-y-4">
        <div className="group cursor-pointer">
          <div className="glass-frosted p-3 rounded-xl flex items-center gap-3 border border-white/10 hover:border-amber-primary/30 transition-all shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-primary to-orange-600 flex items-center justify-center text-bg font-bold text-xs shadow-lg shadow-amber-primary/10">
              {workspaceInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-primary truncate">{workspaceName}</p>
                <RefreshCw className="w-2.5 h-2.5 text-amber-primary animate-spin-slow" />
              </div>
              <p className="text-[10px] text-text-secondary font-medium truncate">Active Syncing...</p>
            </div>
          </div>
        </div>

        <div className="px-1 space-y-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-text-secondary flex items-center gap-1 font-bold"> <Zap className="w-2.5 h-2.5 text-amber-primary" /> CAPACITY</span>
              <span className="text-text-primary font-mono font-bold">3 / 8 Tools</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '37.5%' }}
                className="h-full bg-gradient-to-r from-amber-primary to-orange-500 shadow-[0_0_8px_rgba(245,166,35,0.4)]"
              />
            </div>
          </div>

          <button
            onClick={() => { navigate('/settings'); if (onClose) onClose(); }}
            className="w-full py-1.5 rounded-md border border-border-soft text-[10px] font-medium text-text-tertiary hover:text-amber-text hover:bg-white/5 hover:border-amber-primary/20 transition-all flex items-center justify-center gap-1.5"
          >
            MANAGE WORKSPACE <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'profile' | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { view } = useDashboard();
  const { data: members } = useTeamMembers();
  const { data: settings } = useWorkspaceSettings();
  const topbarWorkspaceName = settings?.workspaceName ?? 'Workspace';
  const topbarInitials = members?.[0]?.initials ?? members?.[0]?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleToggleNotifs = () => {
      setActiveDropdown('notifications');
    };
    window.addEventListener('sentinel-toggle-notifications', handleToggleNotifs);
    return () => window.removeEventListener('sentinel-toggle-notifications', handleToggleNotifs);
  }, []);

  const toggleDropdown = (type: 'notifications' | 'profile') => {
    setActiveDropdown(prev => prev === type ? null : type);
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] fixed left-0 top-0 bottom-0 border-r border-border-soft bg-surface-1 z-30 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-surface-1 border-r border-border-soft z-50 lg:hidden"
            >
              <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="h-14 fixed top-0 right-0 left-0 lg:left-[240px] bg-bg/80 backdrop-blur-md border-b border-border-soft z-20 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-2 text-text-secondary"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Commandment 2: Visibility (Global Sync Status) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-safe/10 border border-safe/20 shadow-[0_0_12px_rgba(52,211,153,0.1)] group/sync cursor-default hover:bg-safe/15 transition-all">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-bold text-safe uppercase tracking-widest leading-none">Signals Live</span>
                <span className="text-[8px] text-safe/70 font-medium">SYNCED 2M AGO</span>
              </div>
              <button
                onClick={() => toast.success('Sync triggered — next update in ~30s')}
                className="ml-2 p-1 rounded hover:bg-safe/20 text-safe transition-colors" title="Sync Now"
              >
                <RefreshCw className="w-2.5 h-2.5 group-hover/sync:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[11px] font-medium tracking-tight text-text-secondary ml-3 border-l border-white/10 pl-4">
              <span className="text-text-primary">{topbarWorkspaceName}</span>
              <span className="text-text-secondary opacity-30">/</span>
              <span className="text-text-primary">Dashboard</span>
              <span className="text-text-secondary opacity-30">/</span>
              <span className="text-text-secondary">Brief</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-border-soft hover:border-amber-primary/30 hover:bg-white/10 transition-all min-w-[200px] text-left group"
            >
              <Search className="w-3.5 h-3.5 text-text-tertiary group-hover:text-amber-primary transition-colors" />
              <span className="text-xs text-text-tertiary">Quick Search...</span>
              <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded border border-border-soft bg-surface-3 text-[9px] font-mono text-text-tertiary group-hover:text-text-secondary group-hover:border-border-medium transition-all shadow-sm">
                <Command className="w-2 h-2" />
                <span>K</span>
              </div>
            </button>

            <div className="h-4 w-[1px] bg-border-medium hidden md:block" />

            <div className="relative">
              <button
                onClick={() => toggleDropdown('notifications')}
                className={cn(
                  "relative text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/5",
                  activeDropdown === 'notifications' && "text-amber-primary bg-white/5"
                )}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk border border-bg shadow-[0_0_4px_rgba(255,68,68,0.5)]" />
              </button>

              <AnimatePresence>
                {activeDropdown === 'notifications' && (
                  <NotificationsDropdown onClose={() => setActiveDropdown(null)} />
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropdown('profile')}
                className={cn(
                  "flex items-center gap-2 pl-2 p-1 rounded-lg hover:bg-white/5 transition-all",
                  activeDropdown === 'profile' && "bg-white/5"
                )}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-primary to-orange-600 flex items-center justify-center text-bg font-bold text-[10px]">
                  {topbarInitials}
                </div>
                <ChevronDown className={cn(
                  "w-3 h-3 text-text-tertiary hidden sm:block transition-transform duration-200",
                  activeDropdown === 'profile' && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'profile' && (
                  <UserMenu onClose={() => setActiveDropdown(null)} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className={cn(
          "flex-1 mt-14 relative overflow-x-hidden",
          view === 'graph' ? "p-0 overflow-hidden" : "p-4 lg:p-8"
        )}>
          {view !== 'graph' && (
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-primary/5 blur-[120px] rounded-full pointer-events-none" />
          )}

          <div className={cn(
            "relative z-10 mx-auto w-full",
            view === 'graph' ? "max-w-none h-[calc(100vh-theme(spacing.14))]" : "max-w-5xl"
          )}>
            {children}
          </div>
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div >
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}
