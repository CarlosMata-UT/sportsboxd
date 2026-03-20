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
      height: '60px',
      background: 'rgba(14,16,21,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(30,35,48,0.7)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <a href="/" style={{
        fontSize: '22px',
        fontWeight: '900',
        letterSpacing: '3px',
        color: '#e8a432',
        textDecoration: 'none',
        flexShrink: 0,
        fontFamily: "'Barlow Condensed', sans-serif",
        textTransform: 'uppercase',
        fontStyle: 'italic',
      }}>
        SPORTBOXD
      </a>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        {[
          { href: '/sports', label: 'Sports' },
          { href: '/games', label: 'Games' },
          { href: '/players', label: 'Players' },
          { href: '/moments', label: 'Moments' },
          { href: '/rankings', label: 'Rankings' },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            style={{
              color: pathname === href ? '#e8a432' : '#7a8099',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              textDecoration: 'none',
              borderBottom: pathname === href ? '2px solid #e8a432' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'color 0.15s ease',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {isAuthPage ? (
          <span style={{ color: '#5a6070', fontSize: '13px', fontStyle: 'italic', letterSpacing: '0.3px' }}>
            thank you for signing in :)
          </span>
        ) : (
          <>
            <span style={{ color: '#3a4055', fontSize: '12px', fontStyle: 'italic', letterSpacing: '0.3px' }}>
              I noticed you haven&apos;t logged in →
            </span>
            <a href="/auth" style={{
              background: '#e8a432',
              color: '#000',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '7px 18px',
              borderRadius: '4px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              Sign in
            </a>
          </>
        )}
      </div>

    </nav>
  )
}
