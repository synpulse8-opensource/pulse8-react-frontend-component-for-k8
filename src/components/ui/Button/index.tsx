import React from 'react'
import type { IButtonProps } from './types'

export const Button: React.FC<IButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    ...props
}) => {
    const baseClasses =
        'px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
        primary: 'bg-primary-gray text-white hover:shadow-glow hover:-translate-y-0.5',
        secondary:
            'bg-white/10 text-white border border-dark-border backdrop-blur-lg hover:bg-white/15 hover:-translate-y-0.5',
    }

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}

export type { IButtonProps } from './types'
