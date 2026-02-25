import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import DemoNav from './navigation/DemoNav';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative selection:bg-amber-primary/30 selection:text-amber-primary">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#181510',
            color: '#F2EDE4',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#34D399',
              secondary: '#181510',
            },
          },
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <DemoNav />
    </div>
  );
}
