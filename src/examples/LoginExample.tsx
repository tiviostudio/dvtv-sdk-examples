import { useUser, useTivioData } from '@tivio/sdk-react'
import { useState } from 'react'

type AuthMode = 'sign-in' | 'register'

export function LoginExample() {
    const { user, isSignedIn, isInitialized } = useUser()
    const bundle = useTivioData()
    const [mode, setMode] = useState<AuthMode>('sign-in')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const signIn = async () => {
        setError(null)
        setLoading(true)
        try {
            await bundle.auth?.signInWithEmailAndPassword(email, password)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }

    const register = async () => {
        setError(null)
        setLoading(true)
        try {
            await bundle.auth?.createUserWithEmailAndPassword(email, password, username)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        setError(null)
        setLoading(true)
        try {
            await bundle.auth?.signOut()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="example">
            <h2>Login &amp; registration</h2>
            <p className="example-muted">
                <code>useUser</code>, <code>bundle.auth.signInWithEmailAndPassword</code>,{' '}
                <code>createUserWithEmailAndPassword</code>, <code>signOut</code>
            </p>

            <p>Initialized: {String(isInitialized)} · Signed in: {String(isSignedIn)}</p>
            {user && <pre>{JSON.stringify({ email: user.email, name: user.name }, null, 2)}</pre>}

            {!isSignedIn && (
                <>
                    <div className="example-actions">
                        <button
                            type="button"
                            className={mode === 'sign-in' ? 'primary' : ''}
                            disabled={loading}
                            onClick={() => setMode('sign-in')}
                        >
                            Sign in
                        </button>
                        <button
                            type="button"
                            className={mode === 'register' ? 'primary' : ''}
                            disabled={loading}
                            onClick={() => setMode('register')}
                        >
                            Register
                        </button>
                    </div>

                    <div className="example-actions">
                        <input
                            type="email"
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {mode === 'register' && (
                            <input
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        )}
                        <input
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="primary"
                            disabled={loading}
                            onClick={mode === 'sign-in' ? signIn : register}
                        >
                            {mode === 'sign-in' ? 'Sign in' : 'Register'}
                        </button>
                    </div>
                </>
            )}

            {isSignedIn && (
                <div className="example-actions">
                    <button disabled={loading} onClick={signOut}>Sign out</button>
                </div>
            )}

            {error && <p className="example-error">{error}</p>}
        </div>
    )
}
