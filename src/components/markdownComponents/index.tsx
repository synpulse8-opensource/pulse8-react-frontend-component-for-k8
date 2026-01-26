import type { Components } from 'react-markdown'
import type { ChatTheme } from '../../types'
import { mergeTheme } from '../../theme'

export type MessageRole = 'user' | 'assistant'

/**
 * List of allowed URL protocols to prevent XSS attacks via javascript: or data: URLs
 */
const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']

/**
 * Sanitizes a URL to prevent XSS attacks.
 * Only allows http, https, mailto, and tel protocols.
 * Returns undefined for potentially dangerous URLs.
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or undefined if the URL is not safe
 */
const sanitizeUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined

    // Handle relative URLs (they're safe)
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('.')) {
        return url
    }

    try {
        const parsed = new URL(url, 'https://example.com')
        if (ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
            return url
        }
        // Block dangerous protocols like javascript:, data:, vbscript:, etc.
        console.warn(`Blocked potentially unsafe URL with protocol: ${parsed.protocol}`)
        return undefined
    } catch {
        // If URL parsing fails, it might be a relative URL without protocol
        // Only allow if it doesn't contain a colon (which could indicate a protocol)
        if (!url.includes(':')) {
            return url
        }
        console.warn(`Blocked malformed URL: ${url}`)
        return undefined
    }
}

export const markdownComponents = (
    theme?: Partial<ChatTheme>,
    role: MessageRole = 'assistant',
): Components => {
    const fullTheme = mergeTheme(theme)
    const colors = fullTheme.colors

    // Select text colors based on role
    const textColor = role === 'user' ? colors.userMessageText : colors.assistantMessageText
    const textSecondaryColor =
        role === 'user' ? colors.userMessageTextSecondary : colors.assistantMessageTextSecondary

    return {
        code: ({ children, className }) => {
            const isInline = !className

            if (isInline) {
                return (
                    <code
                        className='px-2 py-0.5 rounded-xl text-sm'
                        style={{
                            backgroundColor: colors.codeInlineBg,
                            color: textColor,
                        }}
                    >
                        {children}
                    </code>
                )
            }

            return (
                <pre
                    className='p-4 rounded-xl overflow-x-auto border'
                    style={{
                        backgroundColor: colors.codeBlockBg,
                        borderColor: colors.codeBlockBorder,
                    }}
                >
                    <code className='text-sm' style={{ color: textColor }}>
                        {children}
                    </code>
                </pre>
            )
        },
        h1: ({ children }) => (
            <div className='mt-6 mb-3'>
                <h1 className='text-2xl font-bold' style={{ color: textColor }}>
                    {children}
                </h1>
                <div className='mt-2 border-b' style={{ borderColor: colors.borderSecondary }} />
            </div>
        ),
        h2: ({ children }) => (
            <div className='mt-5 mb-2'>
                <h2 className='text-xl font-bold' style={{ color: textColor }}>
                    {children}
                </h2>
                <div className='mt-2 border-b' style={{ borderColor: colors.borderSecondary }} />
            </div>
        ),
        h3: ({ children }) => (
            <div className='mt-4 mb-2'>
                <h3 className='text-lg font-semibold' style={{ color: textColor }}>
                    {children}
                </h3>
                <div className='mt-1.5 border-b' style={{ borderColor: colors.borderSecondary }} />
            </div>
        ),
        h4: ({ children }) => (
            <h4 className='text-base font-semibold mt-3 mb-1' style={{ color: textColor }}>
                {children}
            </h4>
        ),
        h5: ({ children }) => (
            <h5 className='text-sm font-semibold mt-2 mb-1' style={{ color: textColor }}>
                {children}
            </h5>
        ),
        h6: ({ children }) => (
            <h6 className='text-sm font-medium mt-2 mb-1' style={{ color: textSecondaryColor }}>
                {children}
            </h6>
        ),
        p: ({ children }) => (
            <p className='mb-2 last:mb-0' style={{ color: textColor }}>
                {children}
            </p>
        ),
        ul: ({ children }) => (
            <ul
                className='list-disc list-outside mb-3 ml-4 space-y-1.5'
                style={{ color: textColor }}
            >
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol
                className='list-decimal list-outside mb-3 ml-4 space-y-1.5'
                style={{ color: textColor }}
            >
                {children}
            </ol>
        ),
        li: ({ children }) => (
            <li className='leading-relaxed' style={{ color: textColor }}>
                {children}
            </li>
        ),
        a: ({ href, children }) => {
            const safeHref = sanitizeUrl(href)

            // If URL is not safe, render as plain text
            if (!safeHref) {
                return (
                    <span className='underline' style={{ color: colors.textSecondary }}>
                        {children}
                    </span>
                )
            }

            return (
                <a
                    href={safeHref}
                    target='_blank'
                    rel='noopener noreferrer nofollow'
                    className='underline'
                    style={{ color: colors.link }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.linkHover!
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.link!
                    }}
                >
                    {children}
                </a>
            )
        },
        blockquote: ({ children }) => (
            <blockquote
                className='border-l-4 pl-4 italic my-2'
                style={{
                    borderColor: colors.borderSecondary,
                    color: textSecondaryColor,
                }}
            >
                {children}
            </blockquote>
        ),
        strong: ({ children }) => (
            <strong className='font-bold' style={{ color: textColor }}>
                {children}
            </strong>
        ),
        em: ({ children }) => (
            <em className='italic' style={{ color: textColor }}>
                {children}
            </em>
        ),
        hr: () => <hr className='my-4' style={{ borderColor: colors.borderSecondary }} />,
        table: ({ children }) => (
            <div className='overflow-x-auto my-4'>
                <table
                    className='min-w-full border-collapse border rounded-lg'
                    style={{ borderColor: colors.borderSecondary }}
                >
                    {children}
                </table>
            </div>
        ),
        thead: ({ children }) => (
            <thead
                className='border-b'
                style={{
                    backgroundColor: colors.backgroundTertiary,
                    borderColor: colors.borderSecondary,
                }}
            >
                {children}
            </thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
            <tr
                className='border-b last:border-b-0 hover:bg-opacity-5'
                style={{
                    borderColor: colors.borderSecondary,
                    transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                        colors.backgroundTertiary || 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                }}
            >
                {children}
            </tr>
        ),
        th: ({ children }) => (
            <th
                className='px-4 py-2 text-left font-semibold border-r last:border-r-0'
                style={{ color: textColor, borderColor: colors.borderSecondary }}
            >
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td
                className='px-4 py-2 border-r last:border-r-0'
                style={{ color: textColor, borderColor: colors.borderSecondary }}
            >
                {children}
            </td>
        ),
    }
}
