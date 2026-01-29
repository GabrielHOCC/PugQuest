import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'join';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-serif-epic transition-all duration-300 focus:outline-none uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "rpg-button-primary hover:brightness-110",
    join: "rpg-button-join hover:brightness-110",
    secondary: "bg-stone-800 text-stone-200 border border-amber-900/40 rounded-xl hover:bg-stone-700 hover:border-amber-700",
    outline: "bg-transparent text-amber-500 border-2 border-amber-900/50 rounded-xl hover:border-amber-500 hover:bg-amber-500/5",
    danger: "bg-red-950/60 text-red-200 border border-red-900 rounded-xl hover:bg-red-900/80",
  };

  const sizes = {
    sm: "px-5 py-2 text-[10px]",
    md: "px-8 py-3 text-[12px]",
    lg: "px-12 py-5 text-sm tracking-[0.2em]",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};