import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'Sportboxd',
  description: 'Rate games, players, and moments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0e1015', color: '#e8e4dc', fontFamily: 'sans-serif' }}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}