'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'
import { UploadCloud, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function PhotoUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [previewSize, setPreviewSize] = useState<{ width: number, height: number } | null>(null)
    const [caption, setCaption] = useState('')
    const [authorName, setAuthorName] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            // Load image to get true dimensions
            const img = document.createElement('img')
            img.onload = () => {
                setPreviewSize({ width: img.width, height: img.height })
            }
            img.src = URL.createObjectURL(selectedFile)
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setError('Please select a photo to upload.')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            // 1. Check Auth state (Warning: for a totally public app you'd need anonymous uploads enabled)
            // Assuming the user needs to be logged in, or we bypass user_id if we want it fully open
            // Since we don't have auth fully wired yet, we can try to upload anonymously or use a dummy ID
            // *For this MVP to work easily before Auth is fully implemented, you either need Anonymos users enabled in Supabase
            // or you will need to add a real user.* Let's fetch the user first:

            const { data: { user } } = await supabase.auth.getUser()

            // If no user, we might fail RLS policies depending on your Supabase config.
            // If your policies are "Anyone can insert", you might still need a dummy UUID for the user_id column
            // Let's assume we require the user to be logged in eventually, but for now we'll just try the upload.

            // 2. Upload image to Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
            const filePath = `${fileName}` // Upload to root of 'family_photos'

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('family_photos')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 3. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('family_photos')
                .getPublicUrl(filePath)

            // 4. Save to database
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    image_url: publicUrl,
                    caption: caption,
                    author_name: authorName || 'Family Member',
                    // Note: If user_id is NOT null in your SQL schema, this will fail if user is null.
                    // Since it's a private family hub, we should be using the authenticated user.
                    // For testing without auth, the schema needs `user_id uuid references auth.users` removed or made nullable.
                    // Or we pass a static ID if allowed.
                    ...(user ? { user_id: user.id } : {}) // DANGEROUS: If user_id is required, this will fail without auth.
                })

            if (dbError) throw dbError

            // 5. Success -> Redirect home
            router.push('/')
            router.refresh()

        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'An error occurred during upload.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-orange-100/50 overflow-hidden">
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-sans font-semibold text-stone-800 mb-6 tracking-tight">Share a Memory</h2>

                {error && (
                    <div className="bg-orange-50 text-orange-600 p-4 rounded-xl text-sm mb-6 border border-orange-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-6">

                    {/* Photo Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-stone-700">Photo</label>
                        <div className={`relative border-2 border-dashed rounded-2xl transition-colors ${file ? 'border-stone-200 bg-stone-50' : 'border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100'}`}>

                            {!file ? (
                                <div className="py-12 px-4 flex flex-col items-center justify-center text-center cursor-pointer">
                                    <UploadCloud className="w-10 h-10 text-stone-400 mb-3" />
                                    <p className="text-sm font-medium text-stone-600">Click to upload or drag and drop</p>
                                    <p className="text-xs text-stone-500 mt-1">SVG, PNG, JPG or GIF</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="relative p-2">
                                    <div className="relative w-full aspect-video md:aspect-square bg-stone-100 rounded-xl overflow-hidden">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            fill
                                            className="object-contain" // Use object-contain instead of cover to show whole aspect ratio
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-stone-700 p-2 rounded-full shadow-sm text-xs font-medium hover:bg-white"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author Name */}
                    <div className="space-y-2">
                        <label htmlFor="authorName" className="block text-sm font-medium text-stone-700">Your Name</label>
                        <input
                            id="authorName"
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="e.g. Uncle Bob"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Memory Description */}
                    <div className="space-y-2">
                        <label htmlFor="caption" className="block text-sm font-medium text-stone-700">Memory Description <span className="text-stone-400 font-normal">(optional)</span></label>
                        <textarea
                            id="caption"
                            rows={3}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write something about this moment..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!file || isUploading}
                        className="w-full bg-orange-600 text-white rounded-xl py-3.5 px-4 font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center space-x-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <span>Share Memory</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
