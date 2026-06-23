import { useUser, useTivioData } from '@tivio/sdk-react'
import { useState } from 'react'

export function LoginExample() {
    const { user, isSignedIn, isInitialized } = useUser()
    const bundle = useTivioData()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
            <h2>Login</h2>
            <p className="example-muted">
                <code>useUser</code>, <code>bundle.auth.signInWithEmailAndPassword</code>, <code>signOut</code>
            </p>

            <p>Initialized: {String(isInitialized)} · Signed in: {String(isSignedIn)}</p>
            {user && <pre>{JSON.stringify({ email: user.email, name: user.name }, null, 2)}</pre>}

            {!isSignedIn && (
                <div className="example-actions">
                    <input
                        type="email"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="primary" disabled={loading} onClick={signIn}>Sign in</button>
                </div>
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
