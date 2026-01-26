import React from 'react'
import type { ITextareaProps } from './types'

export const Textarea: React.FC<ITextareaProps> = ({ label, className = '', ...props }) => {
    return (
        <div className='w-full'>
            {label && <label className='block text-black font-medium mb-2'>{label}</label>}
            <textarea
                className={`w-full px-4 py-3 bg-white/5 border border-dark-border rounded-xl text-black 
          placeholder-gray-400 backdrop-blur-lg transition-all duration-300 resize-none
          focus:bg-white/8 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
          ${className}`}
                {...props}
            />
        </div>
    )
}

export type { ITextareaProps } from './types'
