export default function ErrorPage() {
    return (
        <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
            <h1 className="text-2xl font-serif text-stone-900 mb-4">Oops!</h1>
            <p className="text-stone-500 mb-6">Something went wrong with authentication.</p>
            <a
                href="/login"
                className="text-sm font-medium text-stone-900 hover:text-stone-600 underline underline-offset-4"
            >
                Back to Login
            </a>
        </div>
    )
}
