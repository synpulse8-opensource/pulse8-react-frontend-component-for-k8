import type { Meta, StoryObj } from '@storybook/react'
import { ChatInput } from './index'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { IPdfFile } from '../../types'

const meta: Meta<typeof ChatInput> = {
    title: 'Components/ChatInput',
    component: ChatInput,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ChatInput>

export const Default: Story = {
    render: () => {
        const [uploadedPdfs, setUploadedPdfs] = useState<IPdfFile[]>([])

        const handleSend = (message: string) => {
            console.log('Message sent:', message)
        }

        const handleUploadPdf = async (
            file: File,
            onProgress: (percent: number) => void,
        ): Promise<string> => {
            // Simulate upload
            for (let i = 0; i <= 100; i += 10) {
                await new Promise((resolve) => setTimeout(resolve, 100))
                onProgress(i)
            }
            const uuid = uuidv4()
            setUploadedPdfs((prev) => [...prev, { uuid, name: file.name }])
            return uuid
        }

        const handleRemovePdf = (uuid: string) => {
            setUploadedPdfs((prev) => prev.filter((pdf) => pdf.uuid !== uuid))
        }

        return (
            <div className='p-4 bg-gray-900 min-h-screen'>
                <ChatInput
                    onSend={handleSend}
                    onStop={() => console.log('Stop clicked')}
                    disabled={false}
                    uploadedPdfs={uploadedPdfs}
                    onUploadPdf={handleUploadPdf}
                    onRemovePdf={handleRemovePdf}
                />
            </div>
        )
    },
}

export const WithUploadedPdfs: Story = {
    render: () => {
        const [uploadedPdfs] = useState<IPdfFile[]>([
            { uuid: '1', name: 'document1.pdf' },
            { uuid: '2', name: 'document2.pdf' },
        ])

        const handleSend = (message: string) => {
            console.log('Message sent:', message)
        }

        const handleUploadPdf = async (
            _file: File,
            onProgress: (percent: number) => void,
        ): Promise<string> => {
            for (let i = 0; i <= 100; i += 10) {
                await new Promise((resolve) => setTimeout(resolve, 100))
                onProgress(i)
            }
            return uuidv4()
        }

        return (
            <div className='p-4 bg-gray-900 min-h-screen'>
                <ChatInput
                    onSend={handleSend}
                    onStop={() => console.log('Stop clicked')}
                    disabled={false}
                    uploadedPdfs={uploadedPdfs}
                    onUploadPdf={handleUploadPdf}
                    onRemovePdf={() => {}}
                />
            </div>
        )
    },
}

export const Disabled: Story = {
    render: () => {
        const handleSend = (message: string) => {
            console.log('Message sent:', message)
        }

        return (
            <div className='p-4 bg-gray-900 min-h-screen'>
                <ChatInput
                    onSend={handleSend}
                    onStop={() => console.log('Stop clicked')}
                    disabled={true}
                />
            </div>
        )
    },
}
