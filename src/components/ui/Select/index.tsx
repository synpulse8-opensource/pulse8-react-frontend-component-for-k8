import React from 'react'
import type { ISelectProps } from './types'

export const Select: React.FC<ISelectProps> = ({ label, options, className = '', ...props }) => {
    return (
        <div className='flex items-center gap-2'>
            {label && (
                <label className='text-gray-400 text-sm font-medium whitespace-nowrap'>
                    {label}
                </label>
            )}
            <select
                className={`px-3 py-2 bg-white/5 border border-dark-border rounded-lg text-white text-sm
          backdrop-blur-lg transition-all duration-300 cursor-pointer
          focus:bg-white/8 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
          ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className='bg-dark-card text-white'
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export type { ISelectProps } from './types'
