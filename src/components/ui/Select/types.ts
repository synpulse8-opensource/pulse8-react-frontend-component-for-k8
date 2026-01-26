import type React from 'react'

export interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    options: { value: string; label: string }[]
}
