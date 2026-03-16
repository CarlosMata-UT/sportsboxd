'use client'

import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      height: '56px',
      background: '#12151c',
      borderBottom: '1px solid #1e2330',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <a href="/" style={{
        fontSize: '22px',
        fontWeight: '700',
        letterSpacing: '4px',
        color: '#e8a432',
        textDecoration: 'none',
        flexShrink: 0
      }}>
        SPORTBOXD
      </a>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="/sports" style={navLinkStyle}>Sports</a>
        <a href="/games" style={navLinkStyle}>Games</a>
        <a href="/players" style={navLinkStyle}>Players</a>
        <a href="/moments" style={navLinkStyle}>Moments</a>
        <a href="/rankings" style={navLinkStyle}>Rankings</a>
      </div>

      {/* Right side — changes based on whether user is on the auth page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {isAuthPage ? (
          // User is on the login/signup page — show thank you message instead
          <span style={{
            color: '#5a6070',
            fontSize: '13px',
            fontStyle: 'italic',
            letterSpacing: '0.3px'
          }}>
            thank you for signing in :)
          </span>
        ) : (
          // User is on any other page — show nudge text and sign in button
          <>
            <span style={{
              color: '#3a4055',
              fontSize: '12px',
              fontStyle: 'italic',
              letterSpacing: '0.3px'
            }}>
              I noticed you haven't logged in →
            </span>
            <a href="/auth" style={{
              background: '#e8a432',
              color: '#000',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '7px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}>
              Sign in
            </a>
          </>
        )}
      </div>

    </nav>
  )
}

const navLinkStyle: React.CSSProperties = {
  color: '#7a8099',
  fontSize: '13px',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  textDecoration: 'none',
}