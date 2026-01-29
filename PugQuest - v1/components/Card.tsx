import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverEffect = true,
  highlighted = false
}) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={hoverEffect ? { 
        y: -6,
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(217, 119, 6, 0.1)' 
      } : {}}
      className={`
        glass-card p-6 relative group cursor-pointer overflow-hidden
        ${highlighted ? 'border-amber-600 ring-2 ring-amber-600/20' : ''}
        ${className}
      `}
    >
      {/* Decorative inner border shadow */}
      <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]" />
      
      {highlighted && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};