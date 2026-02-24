import { motion } from 'motion/react';

interface HealthOrbProps {
  status?: 'safe' | 'watch' | 'risk';
  size?: number;
}

export default function HealthOrb({ status = 'safe', size = 24 }: HealthOrbProps) {
  const colors = {
    safe: 'bg-safe shadow-[0_0_20px_rgba(52,211,153,0.4)]',
    watch: 'bg-watch shadow-[0_0_20px_rgba(255,184,0,0.4)]',
    risk: 'bg-risk shadow-[0_0_20px_rgba(255,68,68,0.4)]',
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Pulse Effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${colors[status]} opacity-50`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: status === 'risk' ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Core Orb */}
      <div className={`relative z-10 w-full h-full rounded-full ${colors[status]}`} />
    </div>
  );
}
