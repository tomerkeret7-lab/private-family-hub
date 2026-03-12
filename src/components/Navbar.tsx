import Link from 'next/link'
import { Home, Image as ImageIcon, Settings, User, LogOut, LogIn, ClipboardList } from 'lucide-react'
import { createClient } from '../../utils/supabase/server'
import { LogoutButton } from './LogoutButton'
import NotificationsMenu from './NotificationsMenu'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="font-sans text-2xl font-bold text-stone-800 tracking-tight">
                        FamilyHub
                    </Link>
                    <div className="flex items-center space-x-6 text-stone-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">
                            <Home className="w-5 h-5" />
                        </Link>

                        {user ? (
                            <>
                                <NotificationsMenu user={user} />
                                <Link href="/bulletin-board" className="hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50" title="Bulletin Board">
                                    <ClipboardList className="w-5 h-5" />
                                </Link>
                                <Link href="/upload" className="hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-orange-50" title="Upload Photo">
                                    <ImageIcon className="w-5 h-5" />
                                </Link>
                                <div className="w-px h-5 bg-stone-300 mx-2"></div>
                                <div className="text-xs font-medium px-2 text-stone-500">
                                    {user.email?.split('@')[0]}
                                </div>
                                <LogoutButton />
                            </>
                        ) : (
                            <>
                                <div className="w-px h-5 bg-stone-300 mx-2"></div>
                                <Link href="/login" className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium" title="Log In">
                                    <LogIn className="w-4 h-4" />
                                    <span>Log in</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
