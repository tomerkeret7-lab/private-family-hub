import { createClient } from '../../../utils/supabase/server'
import { AnnouncementForm } from '../../components/AnnouncementForm'
import { AnnouncementList } from '../../components/AnnouncementList'
import { redirect } from 'next/navigation'
import { ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BulletinBoardPage() {
    const supabase = await createClient()

    // 1. Check if user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Determine authorName for posting (fallback to email start if no metadata found)
    const authorName = user.user_metadata?.full_name
        || user.email?.split('@')[0]
        || 'Family Member';

    // 3. Fetch announcements
    const { data: announcements, error: fetchError } = await supabase
        .from('announcements')
        .select('*')
        .order('event_time', { ascending: false }) // Sort by event_time to show upcoming things first/last depending on preference (we'll do newest dates at top)

    if (fetchError) {
        console.error('Error fetching announcements:', fetchError)
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ClipboardList className="w-8 h-8 text-orange-600" />
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Bulletin Board</h1>
                </div>
                <p className="text-stone-600 text-lg">
                    Post reminders and upcoming family events.
                </p>
            </header>

            <main className="space-y-8">
                <section>
                    <AnnouncementForm authorName={authorName} />
                </section>

                <section>
                    <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center justify-between">
                        <span>Upcoming</span>
                        <span className="text-sm font-medium bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
                            {announcements?.length || 0} Events
                        </span>
                    </h2>
                    <AnnouncementList announcements={announcements || []} />
                </section>
            </main>
        </div>
    )
}
