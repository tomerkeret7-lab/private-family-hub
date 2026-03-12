import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-sans font-semibold text-stone-900 tracking-tight">Welcome to FamilyHub</h1>
                <p className="text-stone-500 mt-2 text-sm">Sign in or create an account to share memories.</p>
            </div>

            <form className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col space-y-3 pt-2">
                    <button
                        formAction={login}
                        className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Sign in
                    </button>
                    <button
                        formAction={signup}
                        className="w-full bg-white text-blue-700 border border-blue-200 rounded-xl py-3 px-4 font-medium hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        Create account
                    </button>
                </div>
            </form>
        </div>
    )
}
