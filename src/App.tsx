import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer.tsx'
import { Nav } from './components/Nav.tsx'
import { Home } from './pages/Home.tsx'
import { Missing } from './pages/Missing.tsx'

function ScrollWithRoute() {
  const { pathname, hash } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'

  useEffect(() => {
    document.title = path === '/prototype' ? 'Prototype — Nomo' : 'Nomo — Tabletop companion'
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    const hashId = hash.replace('#', '')
    const id = hashId || (path === '/prototype' ? 'ux' : '')
    if (id) document.getElementById(id)?.scrollIntoView()
    else window.scrollTo(0, 0)
    root.style.scrollBehavior = previous
  }, [path, hash])

  return null
}

export default function App() {
  return (
    <>
      <ScrollWithRoute />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Navigate to="/" replace />} />
        <Route path="/prototype" element={<Home />} />
        <Route path="/companion" element={<Navigate to="/prototype" replace />} />
        <Route path="*" element={<Missing />} />
      </Routes>
      <Footer />
    </>
  )
}
