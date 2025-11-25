import { PrismaClient } from '@prisma/client'
import { getUpcomingEvents, MOCK_EVENTS } from '../src/lib/mma-api'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Create a test user
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            username: 'testuser',
            password: '$2a$10$CwTycUXWue0Thq9StjUM0u.Jg.M.k.k.k.k.k.k.k.k.k.k.k.k', // hash for 'password' (placeholder)
        },
    })
    console.log({ user })

    // Fetch events (using mock for now to ensure stability, can switch to API)
    // In a real scenario, we would map the API response to our schema
    // For this MVP, let's seed the MOCK_EVENTS to guarantee we have data to display

    for (const eventData of MOCK_EVENTS) {
        const event = await prisma.event.create({
            data: {
                name: eventData.name,
                date: eventData.date,
                image: eventData.image,
                fights: {
                    create: eventData.fights.map(f => ({
                        fighterA: f.fighterA,
                        fighterB: f.fighterB,
                        order: f.order
                    }))
                }
            }
        })
        console.log(`Created event with id: ${event.id}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
