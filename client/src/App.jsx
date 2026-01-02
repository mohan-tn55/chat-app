import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'

const App = () => {
  // Added isCheckingAuth from your AuthContext to handle page refreshes
  const { authUser, isCheckingAuth } = useContext(AuthContext);

  // While we are waiting for the backend to verify the token, show a loader
  // This prevents the user from being redirected to /login incorrectly
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    // Fixed the path for bgImage. Use relative paths if assets are in public or src
    <div className="bg-[url('/bgImage.svg')] bg-cover bg-center min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* If logged in, go Home. Otherwise, go to Login */}
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        
        {/* If logged in, block Login page and redirect to Home */}
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        
        {/* Profile is protected */}
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        
        {/* Catch-all: Redirect unknown routes to Home */}
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App