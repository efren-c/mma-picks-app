import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prismaClient = globalForPrisma.prisma || new PrismaClient()

export const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                const start = performance.now()

                // Default timeout: 5000ms
                const timeout = 5000

                try {
                    // Race between query and timeout
                    const result = await Promise.race([
                        query(args),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Query timeout')), timeout)
                        )
                    ])

                    const end = performance.now()
                    const duration = end - start

                    // Log slow queries (> 1000ms)
                    if (duration > 1000) {
                        console.warn(`[SLOW QUERY] ${duration.toFixed(2)}ms ${model}.${operation}`)
                    }

                    return result
                } catch (error) {
                    if (error instanceof Error && error.message === 'Query timeout') {
                        console.error(`[QUERY TIMEOUT] ${model}.${operation} exceeded ${timeout}ms`)
                        throw new Error('Database request timed out. Please try again.')
                    }
                    throw error
                }
            },
        },
    },
}) as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
