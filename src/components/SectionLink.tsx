import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Hash routing owns the URL hash, so in-page anchors are handled here:
// on the home page we scroll, elsewhere we navigate home and ask it to scroll.

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return false
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const focusTarget = el.querySelector<HTMLElement>('h2') ?? el
  focusTarget.setAttribute('tabindex', '-1')
  focusTarget.focus({ preventScroll: true })
  return true
}

export function SectionLink({ section, children, className, onNavigate }: { section: string; children: ReactNode; className?: string; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <a
      href={`#/?s=${section}`}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        onNavigate?.()
        if (pathname === '/') scrollToSection(section)
        else navigate('/', { state: { section } })
      }}
    >
      {children}
    </a>
  )
}

/** Used by Home: honours `state.section` and `?s=` after navigation or a direct link. */
export function useSectionScroll() {
  const { state, search } = useLocation()
  useEffect(() => {
    const target = (state as { section?: string } | null)?.section ?? new URLSearchParams(search).get('s')
    if (!target) return
    const t = setTimeout(() => scrollToSection(target), 60)
    return () => clearTimeout(t)
  }, [state, search])
}
