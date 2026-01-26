import React from 'react'

interface MicIconProps {
    className?: string
    style?: React.CSSProperties
}

export const MicIcon: React.FC<MicIconProps> = ({ className, style }) => {
    return (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
            style={style}
        >
            <path
                d='M12 2.25H12C12.9946 2.25 13.9484 2.64509 14.6517 3.34835C15.3549 4.05161 15.75 5.00544 15.75 6V12C15.75 12.9946 15.3549 13.9484 14.6517 14.6517C13.9484 15.3549 12.9946 15.75 12 15.75H12C11.5075 15.75 11.0199 15.653 10.5649 15.4645C10.11 15.2761 9.69657 14.9999 9.34835 14.6517C9.00013 14.3034 8.72391 13.89 8.53545 13.4351C8.347 12.9801 8.25 12.4925 8.25 12V5.99999C8.25 5.00543 8.64509 4.05161 9.34835 3.34835C10.0516 2.64509 11.0054 2.25 12 2.25V2.25Z'
                stroke='url(#paint0_linear_4043_1061)'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M12 18.75V21.75'
                stroke='url(#paint1_linear_4043_1061)'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M18.7086 12.75C18.524 14.4001 17.7377 15.9243 16.5 17.0312C15.2624 18.1381 13.6602 18.75 11.9998 18.75C10.3394 18.75 8.73724 18.1381 7.4996 17.0312C6.26195 15.9243 5.47565 14.4001 5.29102 12.75'
                stroke='url(#paint2_linear_4043_1061)'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <defs>
                <linearGradient
                    id='paint0_linear_4043_1061'
                    x1='12'
                    y1='2.25'
                    x2='12'
                    y2='15.75'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop stopColor='white' />
                    <stop offset='1' stopColor='white' />
                </linearGradient>
                <linearGradient
                    id='paint1_linear_4043_1061'
                    x1='12.5'
                    y1='18.75'
                    x2='12.5'
                    y2='21.75'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop stopColor='white' />
                    <stop offset='1' stopColor='white' />
                </linearGradient>
                <linearGradient
                    id='paint2_linear_4043_1061'
                    x1='11.9998'
                    y1='12.75'
                    x2='11.9998'
                    y2='18.75'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop stopColor='white' />
                    <stop offset='1' stopColor='white' />
                </linearGradient>
            </defs>
        </svg>
    )
}
