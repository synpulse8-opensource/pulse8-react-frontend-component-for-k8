import type React from 'react'

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
    children: React.ReactNode
}
