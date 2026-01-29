
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'xl' }) => {
  const maxWidths = {
    md: 'max-w-md',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/95 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className={`relative w-full ${maxWidths[size]} bg-stone-900 border border-amber-900/30 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[95vh] z-[110]`}
          >
            {/* Inner Decorative Texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 md:px-10 md:py-8 border-b border-amber-900/10 relative z-10">
              <h3 className="text-xl md:text-2xl font-medieval text-stone-100 tracking-widest uppercase amber-glow truncate pr-4">
                {title}
              </h3>
              <button 
                onClick={onClose} 
                className="text-stone-500 hover:text-amber-500 transition-all p-2 bg-stone-950 rounded-xl border border-amber-900/20 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 md:p-10 overflow-y-auto custom-scrollbar relative z-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
