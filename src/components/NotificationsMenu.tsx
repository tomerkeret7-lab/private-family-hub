'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface Notification {
    id: string
    created_at: string
    user_id: string
    actor_name: string
    type: string
    post_id: string
    is_read: boolean
    text: string | null
}

export default function NotificationsMenu({ user }: { user: User }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        // Fetch initial notifications
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) setNotifications(data)
        }

        fetchNotifications()

        // Subscribe to real-time events
        const channel = supabase.channel(`public:notifications:${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, payload => {
                setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10))
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, payload => {
                setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id, supabase])

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const unreadCount = notifications.filter(n => !n.is_read).length

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    }

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length === 0) return

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10 focus:outline-none"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden z-50 transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="p-4 border-b border-stone-200/50 flex items-center justify-between bg-stone-50/50">
                        <h3 className="font-sans font-semibold text-stone-900 tracking-tight">Activity</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors flex items-center"
                            >
                                <Check className="w-3 h-3 mr-1" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto bg-white">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-stone-100">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/20' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {/* Simple avatar based on actor name */}
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-sans font-medium text-xs border border-blue-100">
                                                    {notification.actor_name[0].toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-sans text-stone-800 leading-snug">
                                                    <span className="font-semibold">{notification.actor_name}</span>
                                                    {notification.type === 'like' && ' liked your photo'}
                                                    {notification.type === 'comment' && ' commented on your photo'}
                                                </p>
                                                {notification.text && (
                                                    <p className="text-sm text-stone-500 truncate mt-0.5">
                                                        "{notification.text}"
                                                    </p>
                                                )}
                                                <p className="text-xs text-stone-400 mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white">
                                <Bell className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                                <p className="text-stone-500 font-sans text-sm">No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
