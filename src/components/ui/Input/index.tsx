import React from 'react'
import type { IInputProps } from './types'

export const Input: React.FC<IInputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className='w-full'>
            {label && <label className='block text-[#394253] font-medium mb-2'>{label}</label>}
            <input
                className={`w-full px-4 py-3 bg-white/5 border border-dark-border rounded-xl text-[#394253] 
          placeholder-gray-400 backdrop-blur-lg transition-all duration-300
          focus:bg-white/8 focus:border-[#394253] focus:outline-none focus:ring-2 focus:ring-[#394253]/20
          ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
        </div>
    )
}

export type { IInputProps } from './types'
