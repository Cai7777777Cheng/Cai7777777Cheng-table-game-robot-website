import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function Nav() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={stuck ? 'nav stuck' : 'nav'}>
      <Link to="/" className="mark">
        Nomo
      </Link>
      <nav className="nav-links" aria-label="Sections" />
      <div className="nav-actions">
        <a className="nav-personal" href="https://cai7777777cheng.github.io/Personal-Website/">
          Personal site
        </a>
        <a className="pill" href="#ux">
          Open prototype
        </a>
      </div>
    </header>
  )
}
