'use client'

import { generateICS } from '../utils/ics'
import { CalendarPlus, Clock } from 'lucide-react'

interface Announcement {
    id: string;
    created_at: string;
    content: string;
    author_name: string;
    event_time: string;
}

interface AnnouncementListProps {
    announcements: Announcement[];
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {

    const handleAddToCalendar = (announcement: Announcement) => {
        const eventDate = new Date(announcement.event_time)
        const icsContent = generateICS(
            `Family Hub: ${announcement.content.substring(0, 30)}${announcement.content.length > 30 ? '...' : ''}`,
            announcement.content,
            eventDate
        )

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `event-${announcement.id}.ics`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (announcements.length === 0) {
        return (
            <div className="bg-white/10 rounded-xl shadow-sm border border-white/20 p-8 text-center backdrop-blur-sm">
                <p className="text-white">No announcements yet. Be the first to post!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {announcements.map((announcement) => {
                const eventDate = new Date(announcement.event_time)
                const isPast = eventDate < new Date()

                return (
                    <div key={announcement.id} className={`bg-white rounded-xl shadow-sm border ${isPast ? 'border-stone-200 opacity-75' : 'border-green-200'} p-4 sm:p-5 transition-all hover:shadow-md flex flex-col sm:flex-row gap-4`}>
                        <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-800 font-semibold text-sm">
                                        {announcement.author_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-stone-900 block truncate">{announcement.author_name}</span>
                                    <span className="text-xs text-stone-500 block">
                                        Posted {new Date(announcement.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <p className="text-stone-800 text-sm sm:text-base whitespace-pre-wrap break-words">
                                {announcement.content}
                            </p>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-stone-50 rounded-lg p-3 sm:w-48 flex-shrink-0 border border-stone-100">
                            <div className="flex flex-col items-start sm:items-end w-full">
                                <span className={`text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1 ${isPast ? 'text-stone-400' : 'text-green-600'}`}>
                                    <Clock className="w-3 h-3" />
                                    {isPast ? 'Past Event' : 'Upcoming'}
                                </span>
                                <span className="font-bold text-stone-900 text-lg sm:text-right">
                                    {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-sm font-medium text-stone-600 sm:text-right">
                                    {eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <button
                                onClick={() => handleAddToCalendar(announcement)}
                                className="mt-0 sm:mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors w-auto sm:w-full justify-center"
                                title="Add to my Calendar"
                            >
                                <CalendarPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add to Calendar</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
