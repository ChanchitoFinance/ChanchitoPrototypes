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
    primary: 'bg-accent text-text-primary hover:bg-accent/90 focus:ring-accent',
    secondary: 'bg-accent-alt text-text-primary hover:bg-accent-alt/90 focus:ring-accent-alt',
    outline: 'border-2 border-text-primary text-text-primary hover:bg-text-primary hover:text-white focus:ring-text-primary',
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
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}

