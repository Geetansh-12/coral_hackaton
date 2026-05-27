'use client'
// ============================================================
// LOGIN / AUTH PAGE
// Beautiful animated login screen with multiple auth providers
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState<'login' | 'signup'>('login')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate auth delay for demo
    setTimeout(() => {
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 800)
    }, 1200)
  }

  const handleOAuth = (provider: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 800)
    }, 1000)
  }

  const oauthProviders = [
    {
      name: 'Google',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      color: '#fff',
      bg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.12)',
    },
    {
      name: 'GitHub',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      color: '#fff',
      bg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.12)',
    },
    {
      name: 'Slack',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
          <path d="M15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" fill="#ECB22E"/>
        </svg>
      ),
      color: '#fff',
      bg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.12)',
    },
  ]

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0a0a08',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            borderRadius: '50%',
            background: `rgba(${Math.random() > 0.5 ? '250,204,21' : '96,165,250'}, ${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
      </div>

      {/* Left side — branding */}
      <div className="branding-side" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Gradient accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(250,204,21,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #facc15, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#0a0a08',
              boxShadow: '0 0 30px rgba(250,204,21,0.3)',
            }}>C</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f5f5f0', letterSpacing: '-0.02em' }}>
              Coral CRM
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 44, fontWeight: 800, color: '#f5f5f0',
            lineHeight: 1.15, letterSpacing: '-0.03em',
            marginBottom: 20, maxWidth: 500,
          }}>
            Your relationships,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #facc15, #f59e0b, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              intelligently managed
            </span>
          </h1>

          <p style={{
            fontSize: 16, color: 'rgba(245,245,240,0.5)',
            lineHeight: 1.7, maxWidth: 440, marginBottom: 40,
          }}>
            One SQL query across Gmail, Calendar, Slack, LinkedIn, X, and Notion.
            Know who to reach out to, why, and what to say — before the opportunity gets cold.
          </p>

          {/* Source badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['📧 Gmail', '📅 Calendar', '💬 Slack', '💼 LinkedIn', '𝕏 Twitter', '📝 Notion'].map(s => (
              <span key={s} style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(245,245,240,0.6)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>{s}</span>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 32, marginTop: 48,
            paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { value: '6', label: 'Data Sources' },
              { value: '34', label: 'Contacts Tracked' },
              { value: '1', label: 'SQL Query' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontSize: 28, fontWeight: 800, color: '#facc15',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(245,245,240,0.4)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — auth form */}
      <div className="auth-side" style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Glass card */}
        <div className="auth-card" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '40px 36px',
          backdropFilter: 'blur(24px)',
          animation: showSuccess ? 'pulse-success 0.5s ease' : 'fadeInUp 0.6s ease-out',
          transition: 'all 0.3s ease',
          boxShadow: showSuccess
            ? '0 0 60px rgba(74,222,128,0.15)'
            : '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Success state */}
          {showSuccess ? (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              animation: 'fadeInUp 0.4s ease-out',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(74,222,128,0.15)',
                border: '2px solid rgba(74,222,128,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>✓</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>
                Welcome back!
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(245,245,240,0.5)' }}>
                Redirecting to your command center...
              </p>
            </div>
          ) : (
            <>
              {/* Tab toggle */}
              <div style={{
                display: 'flex', gap: 0, marginBottom: 28,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10, padding: 3,
              }}>
                {(['login', 'signup'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setAuthMethod(method)}
                    style={{
                      flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: authMethod === method ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: authMethod === method ? '#f5f5f0' : 'rgba(245,245,240,0.4)',
                    }}
                  >
                    {method === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* OAuth buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {oauthProviders.map(provider => (
                  <button
                    key={provider.name}
                    onClick={() => handleOAuth(provider.name)}
                    disabled={isLoading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '12px 20px', border: `1px solid ${provider.border}`,
                      borderRadius: 10, background: provider.bg,
                      color: provider.color, fontSize: 14, fontWeight: 500,
                      cursor: isLoading ? 'wait' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!isLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = provider.bg
                    }}
                  >
                    {provider.icon}
                    Continue with {provider.name}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 12, color: 'rgba(245,245,240,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  or
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email/password form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{
                    fontSize: 12, fontWeight: 500, color: 'rgba(245,245,240,0.5)',
                    display: 'block', marginBottom: 6,
                  }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    style={{
                      width: '100%', padding: '12px 16px', fontSize: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, color: '#f5f5f0',
                      outline: 'none', transition: 'border-color 0.2s',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(250,204,21,0.4)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: 12, fontWeight: 500, color: 'rgba(245,245,240,0.5)',
                    display: 'block', marginBottom: 6,
                  }}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%', padding: '12px 16px', fontSize: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, color: '#f5f5f0',
                      outline: 'none', transition: 'border-color 0.2s',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(250,204,21,0.4)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {authMethod === 'login' && (
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: 'rgba(250,204,21,0.7)',
                    }}>Forgot password?</button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: 4,
                    padding: '14px 24px',
                    background: isLoading
                      ? 'rgba(250,204,21,0.4)'
                      : 'linear-gradient(135deg, #facc15, #f59e0b)',
                    border: 'none', borderRadius: 10,
                    color: '#0a0a08', fontSize: 14, fontWeight: 700,
                    cursor: isLoading ? 'wait' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: isLoading ? 'none' : '0 4px 24px rgba(250,204,21,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid rgba(10,10,8,0.3)',
                        borderTopColor: '#0a0a08', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', display: 'inline-block',
                      }} />
                      Connecting...
                    </>
                  ) : (
                    authMethod === 'login' ? 'Sign In to Coral CRM' : 'Create Your Account'
                  )}
                </button>
              </form>

              {/* Footer */}
              <p style={{
                textAlign: 'center', fontSize: 12,
                color: 'rgba(245,245,240,0.3)', marginTop: 20,
              }}>
                {authMethod === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === 'login' ? 'signup' : 'login')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(250,204,21,0.7)', fontSize: 12, fontWeight: 600,
                  }}
                >
                  {authMethod === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Terms */}
        <p style={{
          textAlign: 'center', fontSize: 11,
          color: 'rgba(245,245,240,0.2)', marginTop: 20,
          lineHeight: 1.6,
        }}>
          By continuing, you agree to Coral CRM&apos;s{' '}
          <span style={{ color: 'rgba(245,245,240,0.35)', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: 'rgba(245,245,240,0.35)', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(8px); opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-success {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        input::placeholder {
          color: rgba(245,245,240,0.2);
        }
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .branding-side {
            padding: 40px 24px !important;
            flex: none !important;
          }
          .auth-side {
            width: 100% !important;
            padding: 20px 24px 60px !important;
            align-items: center;
          }
          .auth-card {
            width: 100% !important;
            padding: 30px 20px !important;
          }
        }
      `}</style>
    </div>
  )
}
