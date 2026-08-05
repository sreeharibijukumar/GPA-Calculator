import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <Spinner size={32}/>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace/>
  }

  return children
}