'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    Bell, 
    BellOff, 
    CheckCircle2, 
    Flame, 
    AlertTriangle, 
    Mail, 
    Check, 
    Loader2 
} from 'lucide-react'
import { 
    UserNotificationItem, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    toggleUserEmailPreference 
} from '@/lib/notifications'

interface NotificationBellProps {
    userId: string
    initialNotifications: UserNotificationItem[]
    initialUnreadCount: number
    initialNotifyEmail: boolean
    dict: {
        title: string
        markAllAsRead: string
        noNotifications: string
        noNotificationsDesc: string
        emailOptIn: {
            bannerText: string
            enable: string
            disable: string
            active: string
            loading: string
        }
        types: {
            eventCreated: {
                badge: string
                title: string
                message: string
            }
            cardFinalized: {
                badge: string
                title: string
                message: string
            }
            cardUpdated: {
                badge: string
                title: string
                message: string
                defaultNote: string
            }
        }
    }
}

function formatRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))
        if (diffInSeconds < 60) return 'just now'
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 30) return `${diffInDays}d ago`
        return date.toLocaleDateString()
    } catch {
        return ''
    }
}

export function NotificationBell({
    userId,
    initialNotifications,
    initialUnreadCount,
    initialNotifyEmail,
    dict,
}: NotificationBellProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<UserNotificationItem[]>(initialNotifications)
    const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount)
    const [notifyEmail, setNotifyEmail] = useState<boolean>(initialNotifyEmail)
    const [isTogglingEmail, setIsTogglingEmail] = useState(false)
    const [isMarkingAll, setIsMarkingAll] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Sync state with props when revalidated
    useEffect(() => {
        setNotifications(initialNotifications)
    }, [initialNotifications])

    useEffect(() => {
        setUnreadCount(initialUnreadCount)
    }, [initialUnreadCount])

    useEffect(() => {
        setNotifyEmail(initialNotifyEmail)
    }, [initialNotifyEmail])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleMarkAllRead = async () => {
        if (unreadCount === 0 || isMarkingAll) return
        setIsMarkingAll(true)
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        try {
            await markAllNotificationsAsRead(userId)
        } catch (e) {
            console.error('Failed to mark all notifications as read:', e)
        } finally {
            setIsMarkingAll(false)
        }
    }

    const handleItemClick = async (item: UserNotificationItem) => {
        if (!item.isRead) {
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
            markNotificationAsRead(userId, item.id).catch(console.error)
        }
        setIsOpen(false)
        if (item.link) {
            router.push(item.link)
        }
    }

    const handleToggleEmail = async () => {
        if (isTogglingEmail) return
        setIsTogglingEmail(true)
        const nextState = !notifyEmail
        setNotifyEmail(nextState)
        try {
            await toggleUserEmailPreference(userId, nextState)
        } catch (e) {
            setNotifyEmail(!nextState)
            console.error('Failed to toggle email preference:', e)
        } finally {
            setIsTogglingEmail(false)
        }
    }

    const renderNotificationContent = (item: UserNotificationItem) => {
        const { type, data } = item
        if (type === 'EVENT_CREATED') {
            const title = dict.types.eventCreated.title.replace('{eventName}', data.eventName || '')
            const message = dict.types.eventCreated.message
                .replace('{eventName}', data.eventName || '')
                .replace('{eventDate}', data.eventDate || '')
                .replace('{fightCount}', String(data.fightCount || ''))
            return {
                badge: dict.types.eventCreated.badge,
                badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
                icon: <Flame className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
                title,
                message,
            }
        }
        if (type === 'CARD_FINALIZED') {
            const title = dict.types.cardFinalized.title.replace('{eventName}', data.eventName || '')
            const message = dict.types.cardFinalized.message
                .replace('{totalFights}', String(data.totalFights || ''))
                .replace('{eventName}', data.eventName || '')
            return {
                badge: dict.types.cardFinalized.badge,
                badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
                title,
                message,
            }
        }
        // CARD_UPDATED
        const defaultNote = dict.types.cardUpdated.defaultNote
            .replace('{fighterA}', data.fighterA || '')
            .replace('{fighterB}', data.fighterB || '')
        const note = data.note || defaultNote
        const title = dict.types.cardUpdated.title.replace('{eventName}', data.eventName || '')
        const message = dict.types.cardUpdated.message
            .replace('{eventName}', data.eventName || '')
            .replace('{note}', note)
        return {
            badge: dict.types.cardUpdated.badge,
            badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
            title,
            message,
        }
    }

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Bell trigger button */}
            <button
                type="button"
                aria-label={dict.title}
                onClick={() => setIsOpen(prev => !prev)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{dict.title}</span>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-950 text-red-400 border border-red-800/60 px-1.5 py-0.5 rounded-full font-medium">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                disabled={isMarkingAll}
                                onClick={handleMarkAllRead}
                                className="text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                            >
                                {dict.markAllAsRead}
                            </button>
                        )}
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 overscroll-contain">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-400">
                                <BellOff className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                                <p className="text-sm font-medium text-slate-300">{dict.noNotifications}</p>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                    {dict.noNotificationsDesc}
                                </p>
                            </div>
                        ) : (
                            notifications.map(item => {
                                const content = renderNotificationContent(item)
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`p-3.5 flex gap-3 cursor-pointer transition-colors hover:bg-slate-800/50 ${
                                            !item.isRead ? 'bg-slate-800/25' : 'bg-transparent'
                                        }`}
                                    >
                                        <div className="shrink-0">{content.icon}</div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${content.badgeColor}`}
                                                >
                                                    {content.badge}
                                                </span>
                                                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                                                    {formatRelativeTime(item.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-semibold leading-snug ${!item.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                {content.title}
                                            </p>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {content.message}
                                            </p>
                                        </div>
                                        {!item.isRead && (
                                            <div className="shrink-0 self-center">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Email Opt-in Banner */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-300 min-w-0">
                            <Mail className={`w-4 h-4 shrink-0 ${notifyEmail ? 'text-red-500' : 'text-slate-500'}`} />
                            <span className="truncate">
                                {notifyEmail ? dict.emailOptIn.active : dict.emailOptIn.bannerText}
                            </span>
                        </div>
                        <button
                            type="button"
                            disabled={isTogglingEmail}
                            onClick={handleToggleEmail}
                            className={`shrink-0 px-2.5 py-1 rounded text-xs font-medium transition-colors border flex items-center gap-1 ${
                                notifyEmail
                                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                                    : 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
                            } disabled:opacity-50`}
                        >
                            {isTogglingEmail ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>{dict.emailOptIn.loading}</span>
                                </>
                            ) : notifyEmail ? (
                                <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>{dict.emailOptIn.disable}</span>
                                </>
                            ) : (
                                <span>{dict.emailOptIn.enable}</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
