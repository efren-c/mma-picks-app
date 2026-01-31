import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function GET() {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            return NextResponse.json(
                { success: false, error: 'Missing Upstash environment variables' },
                { status: 500 }
            )
        }

        // Simple update to keep the DB active
        await redis.set('keep-alive-ping', new Date().toISOString())
        
        console.log('Upstash Redis keep-alive ping successful')
        
        return NextResponse.json({ 
            success: true, 
            message: 'Upstash Redis pinged successfully',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Keep-alive ping failed:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to ping Upstash Redis' }, 
            { status: 500 }
        )
    }
}
