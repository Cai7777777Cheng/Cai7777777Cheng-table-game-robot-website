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
    const fromPath = path === '/features' ? 'features' : path === '/prototype' ? 'ux' : ''
    const id = fromPath || hash.replace('#', '')
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    if (id) {
      document.getElementById(id)?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
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
        <Route path="/features" element={<Home />} />
        <Route path="/prototype" element={<Home />} />
        <Route path="/companion" element={<Navigate to="/prototype" replace />} />
        <Route path="*" element={<Missing />} />
      </Routes>
      <Footer />
    </>
  )
}
