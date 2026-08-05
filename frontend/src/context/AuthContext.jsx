import { React, createContext, useCallback, useContext, useEffect, useRef, useState, } from 'react'
import { authApi, clearToken, setToken } from '../utils/api'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [authError, setAuthError] = useState(null)
    const tokenRef = useRef(null)

    const login = useCallback(async (credential) => {
        setAuthError(null)
        try {
            const data = await authApi.googleLogin(credential)
            setToken(data.access_token)
            tokenRef.current = data.access_token
            setUser(data.user)
        } catch (err) {
            const msg = err.response?.data?.detail ?? "Sign-in failed. Please try again!"
            setAuthError(msg)
            console.error('[AuthContext] login error:', err)
        }
    }, [])

    const logout = useCallback(async () => {
        try { await authApi.logout() } catch (_) {}
        clearToken()
        tokenRef.current = null
        setUser(null)
        window.google?.accounts?.id?.disableAutoSelect()
    }, [])

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId) {
            console.warn('[AuthContext] VITE_GOOGLE_CLIENT_ID is not set.')
            setIsLoading(false)
            return
        }

        // Poll until the async GSI script has loaded
        const init = () => {
            if (!window.google?.accounts?.id) {
                setTimeout(init, 100)
                return
            }
            window.google.accounts.id.initialize({
                client_Id: clientId,
                callback: (response) => login(response.credential),
                auto_select: false,
                cancel_on_tap_outside: true,
                itp_support: true,
            })
            setIsLoading(false)
        }
        init()
    }, [login])

    useEffect(() => {
        const handle = () => logout()
        window.addEventListener('auth:unauthorized', handle)
        return () => window.removeEventListener('auth:unauthorized', handle)
    }, [logout])

    const promptOneTap = useCallback(() => {
        window.google?.accounts?.id?.prompt()
    }, [])

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, isLoading, authError, login, logout, promptOneTap,
        }}>
            {children}
        </AuthContext.Provider>
    )
}