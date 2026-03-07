'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="hover:text-stone-900 transition-colors flex items-center"
            title="Log out"
        >
            <LogOut className="w-5 h-5" />
        </button>
    )
}
