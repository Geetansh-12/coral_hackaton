'use client'
// ============================================================
// VISUAL RELATIONSHIP NETWORK GRAPH
// Orbital connection layout mapping network nodes using SVGs
// Nodes click open to the contact detail panel.
// ============================================================

import { useState, useMemo } from 'react'
import type { Contact } from '@/lib/types'
import { getHealthColor } from '@/lib/types'

interface VisualGraphProps {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
  searchQuery?: string
}

export default function VisualGraph({ contacts, onSelect, searchQuery = '' }: VisualGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  
  // Dimensions
  const width = 850
  const height = 550
  const centerX = width / 2
  const centerY = height / 2

  // Distribute nodes in concentric orbits based on relationship health score
  const graphData = useMemo(() => {
    // Filter contacts based on search query first
    const filtered = contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const strong = filtered.filter(c => c.health_score >= 70)
    const fading = filtered.filter(c => c.health_score >= 40 && c.health_score < 70)
    const dormant = filtered.filter(c => c.health_score < 40)

    const orbits = [
      { list: strong, radius: 130, speedOffset: 0.1 },
      { list: fading, radius: 210, speedOffset: 0.2 },
      { list: dormant, radius: 290, speedOffset: 0.3 }
    ]

    const calculatedNodes: Array<{
      contact: Contact
      x: number
      y: number
      size: number
      color: string
      orbitIndex: number
    }> = []

    orbits.forEach((orbit, orbitIdx) => {
      const count = orbit.list.length
      orbit.list.forEach((contact, idx) => {
        // Distribute evenly along the circle
        const angle = (idx * 2 * Math.PI) / count + (orbitIdx * 0.4)
        const x = centerX + orbit.radius * Math.cos(angle)
        const y = centerY + orbit.radius * Math.sin(angle)
        const score = Math.round(contact.health_score)
        
        calculatedNodes.push({
          contact,
          x,
          y,
          size: Math.max(14, Math.min(24, 12 + (score / 8))),
          color: getHealthColor(score),
          orbitIndex: orbitIdx
        })
      })
    })

    return calculatedNodes
  }, [contacts, centerX, centerY, searchQuery])

  // Get current active hovered contact info
  const activeContact = useMemo(() => {
    if (!hoveredNode) return null
    return graphData.find(n => n.contact.page_id === hoveredNode)
  }, [hoveredNode, graphData])

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(5, 8, 7, 0.4)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Legend & Instructions */}
      <div style={{
        position: 'absolute', top: 18, left: 18, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 6,
        fontSize: 11, color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> Strong Connection (70+)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} /> Fading Touchpoint (40-69)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Dormant / At Risk (&lt;40)
        </div>
        <div style={{ marginTop: 8, fontSize: 10, fontStyle: 'italic' }}>
          * Click a node to open details and generate AI pre-meeting briefs.
        </div>
      </div>

      {/* SVG Container */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          maxWidth: '850px',
          height: 'auto',
          aspectRatio: `${width}/${height}`,
          cursor: 'grab'
        }}
      >
        {/* Orbit Grid Circles */}
        <circle cx={centerX} cy={centerY} r={130} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx={centerX} cy={centerY} r={210} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx={centerX} cy={centerY} r={290} fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1.5" strokeDasharray="5 5" />

        {/* Data cables / connection lines (edges) */}
        {graphData.map((node) => {
          const isHovered = hoveredNode === node.contact.page_id
          const totalTouchpoints = (node.contact.total_emails_received || 0) + 
                                   (node.contact.total_emails_sent || 0) + 
                                   (node.contact.total_meetings || 0) + 
                                   (node.contact.total_slack_messages || 0)
          
          const maxThickness = node.orbitIndex === 0 ? 2 : (node.orbitIndex === 1 ? 1.2 : 0.8)
          const strokeWidth = isHovered ? maxThickness + 1.5 : maxThickness
          const opacity = isHovered 
            ? 0.7 
            : Math.max(0.08, Math.min(0.4, totalTouchpoints / 60))

          return (
            <line
              key={`line-${node.contact.page_id}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke={node.color}
              strokeWidth={strokeWidth}
              strokeOpacity={opacity}
              style={{
                transition: 'stroke-width 0.25s ease, stroke-opacity 0.25s ease',
              }}
            />
          )
        })}

        {/* User Center Node ("Me") */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle
            r={24}
            fill="#050807"
            stroke="var(--accent-gold)"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 10px rgba(183,121,0,0.45))' }}
          />
          <text
            textAnchor="middle"
            dy="4"
            fill="var(--text-primary)"
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              pointerEvents: 'none'
            }}
          >
            YOU
          </text>
        </g>

        {/* Contact Nodes */}
        {graphData.map((node) => {
          const isHovered = hoveredNode === node.contact.page_id
          const initials = node.contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          
          return (
            <g
              key={`node-${node.contact.page_id}`}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node.contact.page_id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onSelect(node.contact)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer hover ring */}
              <circle
                r={node.size + 6}
                fill="none"
                stroke={node.color}
                strokeWidth="1.5"
                strokeOpacity={isHovered ? 0.6 : 0}
                style={{
                  transition: 'stroke-opacity 0.25s, r 0.25s',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                }}
              />
              
              {/* Main Node Circle */}
              <circle
                r={node.size}
                fill="#0a0c10"
                stroke={isHovered ? '#ffffff' : node.color}
                strokeWidth={isHovered ? 2.5 : 2}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 10px ${node.color})` : 'none',
                  transition: 'stroke 0.2s, stroke-width 0.2s, filter 0.2s'
                }}
              />

              {/* Node initials */}
              <text
                textAnchor="middle"
                dy="4"
                fill={isHovered ? '#ffffff' : 'var(--text-secondary)'}
                style={{
                  fontSize: `${node.size * 0.6}px`,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  pointerEvents: 'none',
                  transition: 'fill 0.2s'
                }}
              >
                {initials}
              </text>

              {/* Short name label below node (only for hovered or close orbits) */}
              {(isHovered || node.orbitIndex === 0) && (
                <text
                  textAnchor="middle"
                  y={node.size + 15}
                  fill={isHovered ? '#ffffff' : 'var(--text-muted)'}
                  style={{
                    fontSize: '10px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: isHovered ? 600 : 400,
                    pointerEvents: 'none',
                    backgroundColor: '#0a0a08'
                  }}
                >
                  {node.contact.name.split(' ')[0]}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Floating Hover Node Detail Card */}
      {activeContact && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: '260px',
          background: 'rgba(10, 12, 11, 0.95)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${activeContact.color}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow)',
          animation: 'fadeInUp 0.2s ease-out',
          zIndex: 20,
          pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{
              fontSize: '10px', fontWeight: 600, color: activeContact.color,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Health {Math.round(activeContact.contact.health_score)}/100
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              {activeContact.contact.days_since_contact ?? 'N/A'}d since touch
            </span>
          </div>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>
            {activeContact.contact.name}
          </strong>
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
            {activeContact.contact.role} at {activeContact.contact.company}
          </span>
          {activeContact.contact.linkedin_recent_signals && (
            <div style={{
              marginTop: 8, paddingTop: 8,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '10px', color: 'var(--accent-gold)',
              lineHeight: 1.4
            }}>
              ⚡ {activeContact.contact.linkedin_recent_signals.split('|')[0].trim()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
