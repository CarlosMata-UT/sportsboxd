'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  targetId: string
  targetType: 'game' | 'player'
  targetName: string
  onClose: () => void
  onSuccess: () => void
}

export default function RatingModal({ targetId, targetType, targetName, onClose, onSuccess }: Props) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    // Make sure user selected a star rating before submitting
    if (stars === 0) {
      setMessage('Please select a star rating.')
      return
    }

    setLoading(true)
    setMessage('')

    // Check if user is logged in before allowing a rating
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You need to be signed in to rate.')
      setLoading(false)
      return
    }

    // Upsert means insert if it doesn't exist, update if it does
    // This prevents one user from submitting multiple ratings for the same game/player
    const { error } = await supabase
      .from('ratings')
      .upsert({
        user_id: user.id,
        target_id: targetId,
        target_type: targetType,
        stars: stars,
        review: review.trim() || null,
      }, {
        onConflict: 'user_id,target_id'
      })

    if (error) {
      setMessage('Something went wrong. Please try again.')
    } else {
      onSuccess()
      onClose()
    }

    setLoading(false)
  }

  return (
    // Dark overlay behind the modal
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Modal card — stop clicks from bubbling up to the overlay */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#151820',
          border: '1px solid #2a2f3e',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden'
        }}
      >

        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #1e2330'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#e8e4dc'
          }}>
            Rate this {targetType}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#3a4055',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px' }}>

          {/* Game or player name */}
          <div style={{
            background: '#1a1d26',
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#c8c4bc' }}>
              {targetName}
            </div>
            <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
              {targetType}
            </div>
          </div>

          {/* Star picker — highlights stars on hover and locks them on click */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '10px',
              color: '#3a4055',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '700',
              marginBottom: '10px'
            }}>
              Your rating
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '32px',
                    cursor: 'pointer',
                    color: star <= (hovered || stars) ? '#e8a432' : '#2a2f3e',
                    padding: '0',
                    lineHeight: 1,
                    transition: 'color 0.1s, transform 0.1s',
                    transform: star <= (hovered || stars) ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Label that describes the selected rating */}
            {(hovered || stars) > 0 && (
              <div style={{ fontSize: '12px', color: '#e8a432', marginTop: '8px', fontStyle: 'italic' }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'All time classic'][hovered || stars]}
              </div>
            )}
          </div>

          {/* Optional review text */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '10px',
              color: '#3a4055',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Review (optional)
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={targetType === 'game' ? 'What made this game memorable?' : 'What makes this player great?'}
              style={{
                width: '100%',
                background: '#1a1d26',
                border: '1px solid #2a2f3e',
                borderRadius: '6px',
                color: '#e8e4dc',
                fontSize: '13px',
                padding: '10px 12px',
                minHeight: '80px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Error message */}
          {message && (
            <p style={{ color: '#e85b5b', fontSize: '12px', marginBottom: '12px' }}>
              {message}
            </p>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                background: '#1e2330',
                color: '#5a6070',
                border: 'none',
                borderRadius: '4px',
                padding: '9px 20px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: '#e8a432',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                padding: '9px 20px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save rating'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}