import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')

    try {
      // Test password against /api/auth — auth middleware validates x-access-token
      const res = await fetch('/api/auth', {
        headers: { 'x-access-token': password.trim() },
      })

      if (res.ok) {
        localStorage.setItem('radhikaToken', password.trim())
        onLogin()
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch (e) {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F0EAE0 50%, #D8F3DC 100%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          {/* Lotus symbol */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
            style={{
              background: 'linear-gradient(135deg, #FDF3DC, #D8F3DC)',
              border: '2px solid #DDD3C2',
              boxShadow: '0 4px 20px rgba(201, 151, 44, 0.2)',
            }}
          >
            🌸
          </div>
          <h1
            className="text-3xl mb-1"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#2C2416',
              fontWeight: 700,
            }}
          >
            Radhika
          </h1>
          <p style={{ color: '#6B5B45', fontSize: '0.9rem', fontWeight: 500 }}>
            Content Studio
          </p>
        </div>

        {/* Login card */}
        <div
          className="card"
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #DDD3C2',
            boxShadow: '0 8px 32px rgba(44, 36, 22, 0.1)',
          }}
        >
          <p
            className="text-center mb-6"
            style={{ color: '#6B5B45', fontSize: '0.9rem' }}
          >
            Enter your studio password to continue
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: error ? '1.5px solid #C4724A' : '1.5px solid #DDD3C2',
                fontSize: '1rem',
                fontFamily: 'DM Sans, sans-serif',
                color: '#2C2416',
                background: '#FAF7F2',
                outline: 'none',
                marginBottom: '0.75rem',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => {
                if (!error) e.target.style.borderColor = '#2D6A4F'
              }}
              onBlur={e => {
                if (!error) e.target.style.borderColor = '#DDD3C2'
              }}
            />

            {error && (
              <p
                className="mb-3 text-sm"
                style={{ color: '#C4724A', fontSize: '0.85rem' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="btn-gold w-full"
              style={{ width: '100%' }}
            >
              {loading ? 'Checking...' : 'Enter Studio →'}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-6 text-sm"
          style={{ color: '#A89880', fontSize: '0.8rem' }}
        >
          Radhika Community · Bhakti Yoga
        </p>
      </div>
    </div>
  )
}
