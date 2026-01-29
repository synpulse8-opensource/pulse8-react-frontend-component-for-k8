import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', 'build', '*.config.js', '*.config.ts'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: './tsconfig.json',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            // Formatting rules
            'semi': ['error', 'never'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'indent': ['error', 4, { SwitchCase: 1 }],
            'comma-dangle': ['error', 'always-multiline'],
            'arrow-parens': ['error', 'always'],
            'max-len': ['error', { code: 100, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
        },
    }
)
