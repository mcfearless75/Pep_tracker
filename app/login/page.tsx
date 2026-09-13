import { LoginForm } from './LoginForm'

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-md mx-auto">
      <p className="text-xs font-bold tracking-[0.12em] uppercase text-accent">Tracked</p>
      <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-balance">
        Lose the fat. Keep the muscle. Sleep like it matters.
      </h1>
      <p className="text-muted mt-3">
        The GLP-1 companion that teaches you as you go. Sign in with a magic link, no password to remember.
      </p>
      <div className="mt-8">
        <LoginForm next={searchParams.next} initialError={searchParams.error === 'link' ? 'That link has expired. Request a new one.' : null} />
      </div>
      <p className="text-xs text-muted mt-10">
        Tracked is an educational companion, not medical advice. It never recommends a dose. 18+ only.
      </p>
    </main>
  )
}
