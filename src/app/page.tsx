import { prisma } from "@/lib/prisma"
import { EventCard } from "@/components/EventCard"
import { getDictionary } from "@/lib/i18n"
import { formatInTimeZone } from 'date-fns-tz'

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

interface HomeProps {
    searchParams: Promise<{
        page?: string
    }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1", 10))
  const pageSize = 6

  const dict = await getDictionary()
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    where: {
      date: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) // Show events from last year onwards for demo
      }
    }
  })

  // Filter events into today, upcoming, and past
  // Using string comparison of the localized date to strictly avoid server-side timezone offset bugs
  const timeZone = 'America/Mexico_City'
  const now = new Date()
  const todayStr = formatInTimeZone(now, timeZone, 'yyyy-MM-dd')

  const todaysEvents = events.filter(event => {
    return formatInTimeZone(event.date, timeZone, 'yyyy-MM-dd') === todayStr
  })

  const upcomingEvents = events.filter(event => {
    return formatInTimeZone(event.date, timeZone, 'yyyy-MM-dd') > todayStr
  })

  const pastEvents = events.filter(event => {
    return formatInTimeZone(event.date, timeZone, 'yyyy-MM-dd') < todayStr
  }).reverse()

  const totalPastEvents = pastEvents.length
  const totalPages = Math.ceil(totalPastEvents / pageSize)
  const paginatedPastEvents = pastEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="w-full sm:max-w-7xl sm:mx-auto space-y-8">
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
              {paginatedPastEvents.map((event) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-4">
                {currentPage > 1 ? (
                  <Link
                    href={`/?page=${currentPage - 1}`}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900/50 text-slate-600 rounded-lg cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                
                <span className="text-slate-500 text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/?page=${currentPage + 1}`}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900/50 text-slate-600 rounded-lg cursor-not-allowed">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
