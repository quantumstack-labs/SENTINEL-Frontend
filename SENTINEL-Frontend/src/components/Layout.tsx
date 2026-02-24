import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import DemoNav from './navigation/DemoNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-amber-primary/30 selection:text-amber-primary">
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
      
      <DemoNav />

      {/* Ambient Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Primary Ambient Glow - Changes based on page */}
        <div 
          className={`absolute transition-all duration-1000 ease-in-out rounded-full blur-[120px] opacity-40
            ${isLanding 
              ? 'top-1/4 -right-20 w-[600px] h-[600px] bg-amber-primary/20' 
              : 'top-[-100px] left-[-100px] w-[400px] h-[400px] bg-amber-primary/10'
            }`}
        />
        
        {/* Secondary subtle glow for depth */}
        <div className="absolute bottom-0 left-1/3 w-[800px] h-[300px] bg-amber-primary/5 blur-[100px] rounded-full opacity-20" />
      </div>

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
    </div>
  );
}
