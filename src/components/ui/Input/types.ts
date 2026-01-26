import type React from 'react'

export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}
