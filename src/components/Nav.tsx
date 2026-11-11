import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const sections = [
  { id: 'promise', label: 'Screen' },
  { id: 'features', label: 'Table' },
  { id: 'craft', label: 'Object' },
  { id: 'ux', label: 'Prototype' },
]

export function Nav() {
  const { pathname } = useLocation()
  const onPrototype = pathname.replace(/\/+$/, '') === '/prototype'
  const [stuck, setStuck] = useState(false)
  const [active, setActive] = useState('promise')

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0.15, 0.4] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <header className={stuck || onPrototype ? 'nav stuck' : 'nav'}>
      <Link to="/" className="mark">
        Nomo
      </Link>
      <nav className="nav-links" aria-label="Sections">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`/#${section.id}`}
            className={
              section.id === 'ux'
                ? onPrototype || (stuck && active === section.id)
                  ? 'on'
                  : undefined
                : !onPrototype && stuck && active === section.id
                  ? 'on'
                  : undefined
            }
          >
            {section.label}
          </a>
        ))}
      </nav>
      <a className="pill" href="/#ux">
        Open prototype
      </a>
    </header>
  )
}
