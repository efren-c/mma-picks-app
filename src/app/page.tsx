import { prisma } from "@/lib/prisma"
import { EventCard } from "@/components/EventCard"
import { getDictionary } from "@/lib/i18n"
import { toZonedTime } from 'date-fns-tz'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const dict = await getDictionary()
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    where: {
      date: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) // Show events from last year onwards for demo
      }
    }
  })

  // Filter events into today and upcoming
  // Get current time in Mexico City timezone (America/Mexico_City, UTC-6)
  const timeZone = 'America/Mexico_City'
  const now = new Date()
  const zonedNow = toZonedTime(now, timeZone)

  const todaysEvents = events.filter(event => {
    const zonedEventDate = toZonedTime(event.date, timeZone)
    return zonedEventDate.getFullYear() === zonedNow.getFullYear() &&
      zonedEventDate.getMonth() === zonedNow.getMonth() &&
      zonedEventDate.getDate() === zonedNow.getDate()
  })

  const upcomingEvents = events.filter(event => {
    const zonedEventDate = toZonedTime(event.date, timeZone)
    // Create start of tomorrow in Mexico City time for comparison
    const startOfTomorrow = new Date(zonedNow.getFullYear(), zonedNow.getMonth(), zonedNow.getDate() + 1)

    // Check if event is strictly after the end of today (Mexico City time)
    return zonedEventDate >= startOfTomorrow
  })

  const pastEvents = events.filter(event => {
    const zonedEventDate = toZonedTime(event.date, timeZone)
    // Create start of today in Mexico City time for comparison
    const startOfToday = new Date(zonedNow.getFullYear(), zonedNow.getMonth(), zonedNow.getDate())

    // Check if event is strictly before the start of today (Mexico City time)
    return zonedEventDate < startOfToday
  }).reverse()

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            MMA <span className="text-red-600">Picks</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            {dict.home.title}
          </p>
        </header>

        {/* Today's Events Section */}
        {todaysEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <span className="bg-green-600 w-1 h-8 mr-3 rounded-full"></span>
              {dict.home.todaysEvents}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={event.date}
                  image={event.image}
                  slug={event.slug}
                  labels={dict.eventCard}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <span className="bg-blue-600 w-1 h-8 mr-3 rounded-full"></span>
            {dict.home.upcomingEvents}
          </h2>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {dict.home.noUpcoming}
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
                  slug={event.slug}
                  labels={dict.eventCard}
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
              {dict.home.pastEvents}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={event.date}
                  image={event.image}
                  slug={event.slug}
                  labels={dict.eventCard}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
