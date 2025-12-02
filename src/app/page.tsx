import { prisma } from "@/lib/prisma"
import { EventCard } from "@/components/EventCard"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    where: {
      date: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) // Show events from last year onwards for demo
      }
    }
  })

  // Filter events into today and upcoming
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const todaysEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= todayStart && eventDate <= todayEnd
  })

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate > todayEnd
  })

  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate < todayStart
  })

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            MMA <span className="text-red-600">Picks</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Predict fight outcomes, compete with friends, and climb the leaderboard.
          </p>
        </header>

        {/* Today's Events Section */}
        {todaysEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <span className="bg-green-600 w-1 h-8 mr-3 rounded-full"></span>
              Today's Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={event.date}
                  image={event.image}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-blue-600 w-1 h-8 mr-3 rounded-full"></span>
            Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No upcoming events found. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={event.date}
                  image={event.image}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-slate-400 mb-6 flex items-center">
              <span className="bg-slate-600 w-1 h-8 mr-3 rounded-full"></span>
              Past Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={event.date}
                  image={event.image}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
