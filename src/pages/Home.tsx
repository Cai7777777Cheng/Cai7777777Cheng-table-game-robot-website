import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenBreakdown } from '../components/ScreenBreakdown.tsx'

const heroSrc = `${import.meta.env.BASE_URL}hero.jpg`
const coverSrc = `${import.meta.env.BASE_URL}hero-v4.jpg`
const page2VideoSrc = `${import.meta.env.BASE_URL}page2-assemble.mp4`
const page2PosterSrc = `${import.meta.env.BASE_URL}page2-assemble-poster.jpg`
const repoUrl = 'https://github.com/Cai7777777Cheng/Table-robot-function'

const features = [
  {
    title: 'Screen',
    body: 'A cylindrical screen around its neck. Every seat sees the same match.',
    icon: 'screen',
  },
  {
    title: 'At the table',
    body: 'The cards stay in your hands. It doesn’t play for you. It only lights the round.',
    icon: 'table',
  },
  {
    title: 'Eyes',
    body: 'Two slanted lights. When the table is quiet, it’s just an object sitting there.',
    icon: 'eye',
  },
] as const

function Icon({ name }: { name: (typeof features)[number]['icon'] }) {
    if (name === 'screen') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 22c0-4.2 8-7.5 18-7.5s18 3.3 18 7.5" />
        <path d="M14 22v9c0 4.2 8 7.5 18 7.5s18-3.3 18-7.5v-9" />
        <path d="M14 27.5c0 3.4 8 6 18 6s18-2.6 18-6" />
        <path d="M32 38.5V46" />
        <path d="M22 52c1.6-5 18.4-5 20 0" />
      </svg>
    )
  }
  if (name === 'table') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M8 42h48" />
        <path d="M16 42v12M48 42v12" />
        <path d="M20 28c2.4-4 7.2-4 8.4 0" />
        <path d="M35.6 28c1.2-4 6-4 8.4 0" />
        <path d="M24 32h16" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M16 30c6-2 10 4 12 4s6-6 12-4" />
      <path d="M18 40c6 2 10-3 14-3s8 5 14 3" />
    </svg>
  )
}

const ease = [0.22, 1, 0.36, 1] as const

function page2Progress(figure: HTMLElement) {
  const rect = figure.getBoundingClientRect()
  const viewHeight = window.innerHeight
  const startTop = viewHeight * 0.4
  const endTop = rect.height >= viewHeight ? 0 : Math.max(0, viewHeight - rect.height)
  const span = startTop - endTop
  if (span <= 0) return rect.top <= startTop ? 1 : 0
  return Math.min(1, Math.max(0, (startTop - rect.top) / span))
}

function Page2Assemble({ reduce }: { reduce: boolean }) {
  const figureRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const figure = figureRef.current
    const video = videoRef.current
    if (!figure || !video) return

    let frame = 0
    let cancelled = false
    let primed = false

    const seek = () => {
      frame = 0
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) return
      const end = Math.max(0, duration - 1 / 30)
      const next = reduce ? end : page2Progress(figure) * end
      if (Math.abs(video.currentTime - next) > 0.015) video.currentTime = next
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(seek)
    }

    const unlockSeeking = () => {
      if (primed || reduce) return
      primed = true
      const safari = /safari/i.test(navigator.userAgent) && !/chrome|chromium|android/i.test(navigator.userAgent)
      if (!safari) return
      const pending = video.play()
      if (!pending || typeof pending.then !== 'function') {
        video.pause()
        return
      }
      pending
        .then(() => {
          if (cancelled) return
          video.pause()
          seek()
        })
        .catch(() => {
          if (!cancelled) video.pause()
        })
    }

    const onReady = () => {
      video.pause()
      seek()
      unlockSeeking()
    }

    video.addEventListener('loadedmetadata', onReady)
    if (video.readyState >= 1) onReady()
    if (!reduce) {
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule, { passive: true })
    }

    return () => {
      cancelled = true
      video.pause()
      video.removeEventListener('loadedmetadata', onReady)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduce])

  return (
    <figure className="bleed page2" id="promise" ref={figureRef}>
      <video
        ref={videoRef}
        className="page2-video"
        src={page2VideoSrc}
        poster={page2PosterSrc}
        muted
        playsInline
        preload="auto"
        width={2560}
        height={1440}
        aria-label="Nomo assembling on the table"
      />
      <figcaption className="page2-copy">
        <h2>It doesn’t look much like a robot.</h2>
        <p>
          Nomo sits between the cards and your hands. The wraparound screen around its neck
          brings dodges, HP bars, and moves to the whole table—no more huddling around a single
          screen.
        </p>
      </figcaption>
    </figure>
  )
}

export function Home() {
  const reduce = useReducedMotion()
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-10% 0px' },
          transition: { duration: 0.8, delay, ease },
        }

  return (
    <main>
      <section className="hero" aria-label="Cover">
        <div className="hero-frame">
          <img
            className="hero-photo"
            src={coverSrc}
            alt="Nomo between two players, the wraparound screen showing the match"
            width={3840}
            height={2160}
            fetchPriority="high"
          />
        </div>
        <div className="hero-fade" />
        <motion.div
          className="hero-copy"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <h1>Nomo</h1>
          <p>Tabletop companion</p>
          <a className="pill light" href="#lab">
            see more details
          </a>
        </motion.div>
      </section>

      <Page2Assemble reduce={reduce === true} />

      <section className="band" id="features">
        <div className="feature-row">
          {features.map((item) => (
            <article key={item.title}>
              <Icon name={item.icon} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band tight" id="statement">
        <motion.h2 className="statement" {...rise()}>
          A ring of light.
          <br />
          The whole table can see.
        </motion.h2>
      </section>

      <figure className="bleed closeup">
        <img src={heroSrc} alt="Close view of Nomo’s wraparound screen" />
      </figure>

      <section className="band" id="craft">
        <motion.div className="center narrow" {...rise()}>
          <h2>Made for the table.</h2>
          <p>The screen, the eyes, and the body all answer to this table. The technology stays inside the object.</p>
        </motion.div>
      </section>

      <section className="cards" id="cards" aria-label="Details">
        <article className="card photo">
          <img src={heroSrc} alt="" />
        </article>
        <article className="card gray" aria-label="Table photo to come">
          <span>Photo to come</span>
        </article>
        <Link className="card gray link" to="/prototype">
          <span>Open the prototype</span>
          <em>→</em>
        </Link>
      </section>

      <section className="band" id="lab">
        <motion.div className="center" {...rise()}>
          <h2>The screen, taken apart.</h2>
          <p>Status, expression, skill, and the world behind the character.</p>
          <div className="actions">
            <Link className="pill" to="/prototype">
              Open the prototype
            </Link>
            <a className="quiet-link" href={repoUrl} target="_blank" rel="noreferrer">
              GitHub repo
            </a>
          </div>
        </motion.div>
      </section>

      <section className="close" id="close">
        <div className="close-frame">
          <img src={heroSrc} alt="" />
        </div>
        <div className="close-veil" />
        <div className="close-copy">
          <h2>Leave this round on the table.</h2>
          <Link className="pill" to="/prototype">
            Open the prototype
          </Link>
        </div>
      </section>

      <ScreenBreakdown id="ux" />
    </main>
  )
}
