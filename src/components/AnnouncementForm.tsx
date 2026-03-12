'use client'

import { useState } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { CalendarIcon, Send } from 'lucide-react'

interface AnnouncementFormProps {
    authorName: string;
}

export function AnnouncementForm({ authorName }: AnnouncementFormProps) {
    const [content, setContent] = useState('')
    const [eventTime, setEventTime] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || !eventTime) return

        setIsSubmitting(true)
        try {
            // eventTime from input type="datetime-local" is in local time, we send it as ISO back
            const eventDate = new Date(eventTime)

            const { error } = await supabase
                .from('announcements')
                .insert([{
                    content: content.trim(),
                    author_name: authorName,
                    event_time: eventDate.toISOString()
                }])

            if (error) throw error

            setContent('')
            setEventTime('')
            router.refresh()
        } catch (error) {
            console.error('Error posting announcement:', error)
            alert('Failed to post announcement. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200">
            <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-800 font-semibold text-sm sm:text-base">
                        {authorName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Post a new announcement or reminder..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none text-sm sm:text-base text-stone-900 placeholder-stone-500"
                        rows={2}
                        required
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-y-3">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <label htmlFor="event-time" className="text-stone-500 hidden sm:block">
                                <CalendarIcon className="w-5 h-5" />
                            </label>
                            <input
                                id="event-time"
                                type="datetime-local"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                required
                                className="w-full sm:w-auto bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim() || !eventTime}
                            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 sm:py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
