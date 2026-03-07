import { createClient } from '../../utils/supabase/server'
import PostCard from './PostCard'

export default async function Feed() {
    const supabase = await createClient()

    // Fetch posts from the Supabase database along with likes and comments
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            likes(*),
            comments(*)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="text-center py-12 text-stone-500 bg-white/50 rounded-3xl border border-stone-200 backdrop-blur-sm">
                <p className="font-medium text-stone-800 mb-2">Could not load memories right now.</p>
                <p className="text-xs text-stone-500 bg-stone-100 p-3 rounded-xl inline-block font-mono">{error.message}</p>
            </div>
        )
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-20 px-4 md:px-12 rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 backdrop-blur-sm">
                <p className="text-stone-800 font-serif text-2xl mb-3">No memories yet</p>
                <p className="text-stone-500 text-sm max-w-md mx-auto">Be the first to share a moment with the family. Click the image icon above to upload a photo.</p>
            </div>
        )
    }

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}
