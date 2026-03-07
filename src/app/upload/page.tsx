import PhotoUpload from '@/components/PhotoUpload'

export const metadata = {
    title: 'Upload Photo | Family Hub',
}

export default function UploadPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <PhotoUpload />
        </div>
    )
}
