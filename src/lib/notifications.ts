'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendNotificationEmail } from '@/lib/email'

export type NotificationType = 'EVENT_CREATED' | 'CARD_FINALIZED' | 'CARD_UPDATED'

export interface NotificationPayload {
    type: NotificationType
    data: Record<string, any>
    link: string
}

export interface UserNotificationItem {
    id: string
    type: NotificationType
    data: Record<string, any>
    link: string
    createdAt: string
    isRead: boolean
}

/**
 * Broadcasts an in-app notification to all users,
 * and delivers an email to users who have opted into email notifications.
 */
export async function broadcastNotification({ type, data, link }: NotificationPayload) {
    try {
        const notification = await prisma.notification.create({
            data: {
                type,
                data: JSON.stringify(data),
                link,
            },
        })

        // Find verified users who have opted in to email notifications
        const optedInUsers = await prisma.user.findMany({
            where: {
                notifyEmail: true,
                emailVerified: { not: null },
            },
            select: {
                email: true,
                username: true,
            },
        })

        if (optedInUsers.length > 0) {
            const appUrl = process.env.NEXTAUTH_URL || 'https://picks-mma.com'
            const fullLink = `${appUrl}${link}`

            // Construct plain email text and subject depending on notification type
            let subject = 'MMA Picks Update'
            let emailTitle = 'Card Update'
            let emailMessage = 'A new update is available on MMA Picks.'

            if (type === 'EVENT_CREATED') {
                subject = `New Event: ${data.eventName || 'Upcoming UFC Card'}`
                emailTitle = `New Event: ${data.eventName}`
                emailMessage = `Fights are now available for ${data.eventName} (${data.eventDate || ''}). Check out the ${data.fightCount || ''} fights and start making your picks!`
            } else if (type === 'CARD_FINALIZED') {
                subject = `Card Finalized: ${data.eventName || 'Upcoming Card'}`
                emailTitle = `All Fights Uploaded: ${data.eventName}`
                emailMessage = `All ${data.totalFights || ''} fights have been uploaded and picks are fully open! Lock in your picks before the event starts.`
            } else if (type === 'CARD_UPDATED') {
                subject = `Card Update: ${data.eventName || 'UFC Card'}`
                emailTitle = `Card Update: ${data.eventName}`
                emailMessage = `Update for ${data.eventName}: ${data.note || 'A matchup has been updated.'} Please review your pick!`
            }

            // Send emails in background (avoid blocking admin response)
            Promise.allSettled(
                optedInUsers.map(user =>
                    sendNotificationEmail({
                        to: user.email,
                        username: user.username,
                        subject,
                        title: emailTitle,
                        message: emailMessage,
                        ctaLink: fullLink,
                    })
                )
            ).catch(err => {
                console.error('Failed to send broadcast emails:', err)
            })
        }

        revalidatePath('/', 'layout')
        return { success: true, notificationId: notification.id }
    } catch (error) {
        console.error('Failed to broadcast notification:', error)
        return { success: false, error: 'Failed to broadcast notification' }
    }
}

/**
 * Retrieves the latest notifications for the specified user,
 * annotated with an `isRead` boolean flag.
 */
export async function getUserNotifications(userId: string, limit = 20): Promise<UserNotificationItem[]> {
    try {
        const notifications = await prisma.notification.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                reads: {
                    where: { userId },
                    select: { id: true },
                },
            },
        })

        return notifications.map(n => {
            let parsedData: Record<string, any> = {}
            try {
                parsedData = JSON.parse(n.data)
            } catch {
                parsedData = {}
            }

            return {
                id: n.id,
                type: n.type as NotificationType,
                data: parsedData,
                link: n.link,
                createdAt: n.createdAt.toISOString(),
                isRead: n.reads.length > 0,
            }
        })
    } catch (error) {
        console.error('Failed to get notifications:', error)
        return []
    }
}

/**
 * Returns the count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    try {
        const total = await prisma.notification.count()
        const read = await prisma.notificationRead.count({ where: { userId } })
        return Math.max(0, total - read)
    } catch (error) {
        console.error('Failed to count unread notifications:', error)
        return 0
    }
}

/**
 * Marks a single notification as read for a user.
 */
export async function markNotificationAsRead(userId: string, notificationId: string) {
    try {
        await prisma.notificationRead.upsert({
            where: {
                userId_notificationId: {
                    userId,
                    notificationId,
                },
            },
            create: {
                userId,
                notificationId,
            },
            update: {},
        })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark notification as read:', error)
        return { success: false }
    }
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string) {
    try {
        const allNotifications = await prisma.notification.findMany({
            select: { id: true },
        })

        const readNotifications = await prisma.notificationRead.findMany({
            where: { userId },
            select: { notificationId: true },
        })

        const readSet = new Set(readNotifications.map(r => r.notificationId))
        const unreadIds = allNotifications.filter(n => !readSet.has(n.id)).map(n => n.id)

        if (unreadIds.length > 0) {
            await prisma.notificationRead.createMany({
                data: unreadIds.map(notificationId => ({
                    userId,
                    notificationId,
                })),
                skipDuplicates: true,
            })
        }

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark all as read:', error)
        return { success: false }
    }
}

/**
 * Fetches user's current email notification opt-in preference.
 */
export async function getUserEmailPreference(userId: string): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notifyEmail: true },
        })
        return user?.notifyEmail ?? false
    } catch {
        return false
    }
}

/**
 * Toggles a user's email notification opt-in preference.
 */
export async function toggleUserEmailPreference(userId: string, enabled: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { notifyEmail: enabled },
        })
        revalidatePath('/', 'layout')
        return { success: true, notifyEmail: enabled }
    } catch (error) {
        console.error('Failed to toggle email preference:', error)
        return { success: false, error: 'Failed to update preference' }
    }
}
