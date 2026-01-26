import React from 'react'

export interface AssistantIconProps {
    className?: string
    style?: React.CSSProperties
}

/**
 * Default assistant icon - a simple chat bubble with bot indicator.
 * Users can override this via ChatConfigProvider's icons.assistant property.
 */
export const AssistantIcon: React.FC<AssistantIconProps> = ({ className, style }) => {
    return (
        <svg
            width='120'
            height='120'
            viewBox='0 0 120 120'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
            style={style}
        >
            {/* Outer gradient ring */}
            <circle
                cx='60'
                cy='60'
                r='58'
                stroke='url(#assistantGradient)'
                strokeWidth='4'
                fill='none'
            />
            {/* Inner circle */}
            <circle cx='60' cy='60' r='42' fill='#2D2D2D' stroke='white' strokeWidth='3' />
            {/* Chat icon */}
            <path
                d='M45 50C45 47.2386 47.2386 45 50 45H70C72.7614 45 75 47.2386 75 50V65C75 67.7614 72.7614 70 70 70H65L60 77L55 70H50C47.2386 70 45 67.7614 45 65V50Z'
                fill='white'
            />
            {/* Bot indicator dots */}
            <circle cx='52' cy='57' r='3' fill='#2D2D2D' />
            <circle cx='60' cy='57' r='3' fill='#2D2D2D' />
            <circle cx='68' cy='57' r='3' fill='#2D2D2D' />
            <defs>
                <linearGradient
                    id='assistantGradient'
                    x1='0'
                    y1='0'
                    x2='120'
                    y2='120'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop stopColor='#9747FF' />
                    <stop offset='0.5' stopColor='#4376EB' />
                    <stop offset='1' stopColor='#8650FA' />
                </linearGradient>
            </defs>
        </svg>
    )
}

// Re-export as default for convenience
export default AssistantIcon
