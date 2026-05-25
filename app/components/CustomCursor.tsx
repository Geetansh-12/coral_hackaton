'use client'
// ============================================================
// CUSTOM CURSOR — Dual dot + glow ring with smooth trailing
// Inspired by gentlerain.ai
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const trailPos = useRef({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rafRef = useRef<number>(0)

  // Detect mobile / touch devices — disable custom cursor
  useEffect(() => {
    const check = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY }

    // Dot follows instantly
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
    }
  }, [])

  // Animation loop for ring + trail (smooth lerp follow)
  useEffect(() => {
    if (isMobile) return

    const animate = () => {
      // Ring lerp (follows with delay)
      const ringLerp = 0.15
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * ringLerp
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * ringLerp

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) scale(${hovering ? 1.8 : clicking ? 0.8 : 1})`
      }

      // Trail lerp (even slower follow)
      const trailLerp = 0.08
      trailPos.current.x += (mouse.current.x - trailPos.current.x) * trailLerp
      trailPos.current.y += (mouse.current.y - trailPos.current.y) * trailLerp

      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%) scale(${hovering ? 2.2 : 1})`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isMobile, hovering, clicking])

  // Hover detection for interactive elements
  useEffect(() => {
    if (isMobile) return

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.contact-card') ||
        target.closest('.glass-card') ||
        target.closest('.btn-primary') ||
        target.closest('.btn-ghost') ||
        target.closest('select') ||
        target.closest('input') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }

    const handleDown = () => setClicking(true)
    const handleUp = () => setClicking(false)
    const handleLeave = () => setHidden(true)
    const handleEnter = () => setHidden(false)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
    }
  }, [isMobile, handleMouseMove])

  // Don't render on mobile
  if (isMobile) return null

  return (
    <>
      {/* Outer trail glow — slowest, biggest, most transparent */}
      <div
        ref={trailRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,204,21,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9997,
          willChange: 'transform',
          opacity: hidden ? 0 : hovering ? 1 : 0.6,
          transition: 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease',
        }}
      />

      {/* Ring — follows with smooth delay */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `1.5px solid ${hovering ? 'rgba(250,204,21,0.6)' : 'rgba(240,236,228,0.2)'}`,
          background: hovering ? 'rgba(250,204,21,0.04)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.3s ease, border-color 0.25s ease, background 0.25s ease, width 0.2s ease, height 0.2s ease',
          mixBlendMode: 'difference',
        }}
      />

      {/* Dot — follows instantly */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: hovering ? 6 : 5,
          height: hovering ? 6 : 5,
          borderRadius: '50%',
          background: hovering ? 'var(--accent-gold)' : '#f0ece4',
          boxShadow: hovering ? '0 0 10px rgba(250,204,21,0.5)' : 'none',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.3s ease, width 0.15s ease, height 0.15s ease, background 0.2s ease, box-shadow 0.2s ease',
        }}
      />
    </>
  )
}
