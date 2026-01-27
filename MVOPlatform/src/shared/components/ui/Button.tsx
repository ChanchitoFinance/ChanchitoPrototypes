'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationIteration' | 'onAnimationCancel'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-md transition-all duration-250 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-premium-cta text-white hover:bg-premium-cta/90 focus:ring-premium-cta',
    secondary: 'bg-transparent border-2 border-primary-accent text-primary-accent hover:bg-primary-accent hover:text-white focus:ring-primary-accent',
    outline: 'border-2 border-primary-accent text-primary-accent hover:bg-primary-accent hover:text-white focus:ring-primary-accent',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    // @ts-ignore - Framer Motion props conflict with HTML button props
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} inline-flex items-center justify-center gap-2 ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}

