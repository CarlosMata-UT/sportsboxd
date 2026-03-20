'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  // Shared fields for both login and signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Signup-only fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleAuth = async () => {
    // If signing up, validate passwords match before doing anything
    if (!isLogin && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('')

    if (isLogin) {
      // Sign in existing user
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Logged in successfully!')
    } else {
      // Sign up new user — pass extra profile fields into metadata so we can save them later
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
          }
        }
      })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    }

    setLoading(false)
  }

  return (
    // Full screen with sports background
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      {/* Sports background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.2)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(14,16,21,0.85) 0%, rgba(14,16,21,0.95) 100%)',
        zIndex: 0,
      }} />

      {/* The login/signup card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(21,24,32,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid #1e2330',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
      }}>

        {/* Logo, slogan, and sport icons */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
            color: '#e8a432',
            fontSize: '32px',
            fontWeight: '900',
            letterSpacing: '4px',
            marginBottom: '6px',
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: 'uppercase',
            fontStyle: 'italic',
        }}>
            SPORTBOXD
        </h1>

        {/* Sport icons */}
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '10px'
        }}>
            {['🏈', '🏀', '⚾'].map((icon) => (
            <div key={icon} style={{
                width: '36px',
                height: '36px',
                background: '#1a1d26',
                border: '1px solid #2a2f3e',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
            }}>
                {icon}
            </div>
            ))}
        </div>

        {/* Slogan */}
        <p style={{
            color: '#5a6070',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: '600'
        }}>
            Games · Players · Rankings
        </p>

        {/* Login/signup subtitle */}
        <p style={{
            color: '#3a4055',
            fontSize: '12px',
            marginTop: '20px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
        }}>
            {isLogin ? 'Sign in to your account' : 'Create an account'}
        </p>
        </div>

        {/* First name and last name — only shown on signup */}
        {!isLogin && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="LeBron"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="James"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Username — only shown on signup */}
        {!isLogin && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="LeBronJames"
              style={inputStyle}
            />
          </div>
        )}

        {/* Email field — shown on both login and signup */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="TheKidFromAkron@example.com"
            style={inputStyle}
          />
        </div>

        {/* Password field — shown on both login and signup */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={inputStyle}
          />
        </div>

        {/* Confirm password — only shown on signup, turns red border if passwords don't match */}
        {!isLogin && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                ...inputStyle,
                border: confirmPassword && password !== confirmPassword
                  ? '1px solid #e85b5b'
                  : '1px solid #2a2f3e'
              }}
            />
            {/* Small inline warning that appears as the user types */}
            {confirmPassword && password !== confirmPassword && (
              <p style={{ color: '#e85b5b', fontSize: '12px', marginTop: '6px' }}>
                Passwords do not match
              </p>
            )}
          </div>
        )}

        {/* Bottom margin adjustment for login form which has no confirm password */}
        {isLogin && <div style={{ marginBottom: '8px' }} />}

        {/* Submit button */}
        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: '100%',
            background: '#e8a432',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: '16px'
          }}
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        {/* Success or error message */}
        {message && (
          <p style={{
            color: message.includes('error') || message.includes('Error') || message.includes('match')
              ? '#e85b5b'
              : '#5bbf7a',
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            {message}
          </p>
        )}

        {/* Toggle between login and signup */}
        <p style={{ color: '#5a6070', fontSize: '13px', textAlign: 'center' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
              setConfirmPassword('')
            }}
            style={{ color: '#e8a432', cursor: 'pointer', fontWeight: '600' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>

      </div>
    </div>
  )
}

// Pulled out as variables so we're not repeating the same style objects on every input
const labelStyle: React.CSSProperties = {
  color: '#7a8099',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'block',
  marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1d26',
  border: '1px solid #2a2f3e',
  borderRadius: '6px',
  color: '#e8e4dc',
  fontSize: '14px',
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box'
}