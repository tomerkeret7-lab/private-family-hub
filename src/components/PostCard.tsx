'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface Like {
    id: string
    user_id: string
    post_id: string
}

interface Comment {
    id: string
    user_id: string
    post_id: string
    author_name: string
    text: string
    created_at: string
}

interface Post {
    id: string
    created_at: string
    user_id: string
    author_name: string
    image_url: string
    caption: string
    likes?: Like[]
    comments?: Comment[]
}

export default function PostCard({ post }: { post: Post }) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [likes, setLikes] = useState<Like[]>(post.likes || [])
    const [comments, setComments] = useState<Comment[]>(post.comments || [])
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUser(data.user)
        })

        // Subscribe to real-time events for this post
        const channel = supabase.channel(`public:interactions:${post.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` }, payload => {
                setLikes(prev => [...prev, payload.new as Like])
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` }, payload => {
                setLikes(prev => prev.filter(like => like.id !== payload.old.id))
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` }, payload => {
                setComments(prev => [...prev, payload.new as Comment])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [post.id, supabase])

    const hasLiked = currentUser && likes.some(l => l.user_id === currentUser.id)

    const toggleLike = async () => {
        if (!currentUser) {
            alert('Please log in to like this post.')
            return
        }

        if (hasLiked) {
            // Optimistic update
            const likeToDelete = likes.find(l => l.user_id === currentUser.id)
            setLikes(prev => prev.filter(l => l.user_id !== currentUser.id))

            if (likeToDelete) {
                await supabase.from('likes').delete().eq('id', likeToDelete.id)
            }
        } else {
            // Optimistic update
            const newLike = { id: 'temp', user_id: currentUser.id, post_id: post.id }
            setLikes(prev => [...prev, newLike])

            const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id })
            if (error) {
                // Revert on error
                setLikes(prev => prev.filter(l => l.id !== 'temp'))
            } else if (post.user_id && post.user_id !== currentUser.id) {
                // Generate notification
                await supabase.from('notifications').insert({
                    user_id: post.user_id,
                    actor_name: currentUser.email?.split('@')[0] || 'A family member',
                    type: 'like',
                    post_id: post.id
                })
            }
        }
    }

    const addComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentUser) {
            alert('Please log in to comment.')
            return
        }
        if (!newComment.trim() || isSubmitting) return

        setIsSubmitting(true)
        const commentData = {
            post_id: post.id,
            user_id: currentUser.id,
            author_name: currentUser.email?.split('@')[0] || 'User',
            text: newComment.trim()
        }

        const { error } = await supabase.from('comments').insert(commentData)
        if (!error) {
            setNewComment('')

            // Generate notification
            if (post.user_id && post.user_id !== currentUser.id) {
                await supabase.from('notifications').insert({
                    user_id: post.user_id,
                    actor_name: commentData.author_name,
                    type: 'comment',
                    post_id: post.id,
                    text: commentData.text.length > 30 ? commentData.text.substring(0, 30) + '...' : commentData.text
                })
            }
        }
        setIsSubmitting(false)
    }

    return (
        <article className="group break-inside-avoid mb-6 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm border border-orange-100/50 transition-all duration-300 hover:shadow-md hover:border-orange-200">
            <div className="p-4 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 font-sans font-medium text-sm border border-orange-200">
                    {post.author_name ? post.author_name[0].toUpperCase() : '?'}
                </div>
                <div>
                    <p className="font-sans font-medium text-sm text-stone-800 tracking-tight">{post.author_name || 'Family Member'}</p>
                    <p className="font-sans text-xs text-stone-500">
                        {new Date(post.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {post.image_url && (
                <div className="relative w-full bg-stone-100 overflow-hidden">
                    <Image
                        src={post.image_url}
                        alt={post.caption || "Family memory"}
                        width={800}
                        height={800}
                        className={`w-full h-auto object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        unoptimized
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
            )}

            <div className="p-4 sm:p-5">
                {post.caption && (
                    <p className="font-sans text-stone-600 text-[13px] leading-relaxed mb-4">
                        {post.caption}
                    </p>
                )}

                {/* Interaction Buttons */}
                <div className="flex items-center space-x-4 border-t border-orange-100/50 pt-3 mt-3">
                    <button
                        onClick={toggleLike}
                        className={`flex items-center space-x-1.5 transition-colors ${hasLiked ? 'text-orange-600' : 'text-stone-500 hover:text-orange-500'}`}
                    >
                        <Heart className={`w-5 h-5 ${hasLiked ? 'fill-orange-600' : ''}`} />
                        {likes.length > 0 && <span className="text-sm font-medium">{likes.length}</span>}
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1.5 text-stone-500 hover:text-orange-500 transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {comments.length > 0 && <span className="text-sm font-medium">{comments.length}</span>}
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 space-y-3">
                        {comments.length > 0 ? (
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {comments.map(c => (
                                    <div key={c.id} className="bg-stone-50 rounded-2xl p-3 text-sm border border-stone-100">
                                        <p className="font-semibold text-stone-800 tracking-tight text-xs mb-0.5">{c.author_name}</p>
                                        <p className="text-stone-600">{c.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-stone-400 text-center py-2">No comments yet. Be the first!</p>
                        )}

                        <form onSubmit={addComment} className="flex items-center space-x-2 pt-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-300 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="p-2 text-white bg-orange-600 rounded-full hover:bg-orange-700 disabled:opacity-50 transition-colors flex flex-shrink-0 items-center justify-center w-8 h-8"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </article>
    )
}
