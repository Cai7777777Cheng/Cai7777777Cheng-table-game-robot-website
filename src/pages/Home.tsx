import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenBreakdown } from '../components/ScreenBreakdown.tsx'

const heroSrc = `${import.meta.env.BASE_URL}hero.jpg`
const coverSrc = `${import.meta.env.BASE_URL}hero-v5.jpg`
const page2VideoSrc = `${import.meta.env.BASE_URL}page2-assemble.mp4`
const page2PosterSrc = `${import.meta.env.BASE_URL}page2-assemble-poster.jpg`
const repoUrl = 'https://github.com/Cai7777777Cheng/Table-robot-function'

const features = [
  {
    title: 'Build Connections',
    body: 'It senses the mood at the table, draws players closer, and deepens immersion.',
  },
  {
    title: 'At the table',
    body: 'The cards stay in your hands. It doesn’t play for you. It only lights the round.',
  },
  {
    title: 'Eyes',
    body: 'Two slanted lights. When the table is quiet, it’s just an object sitting there.',
  },
] as const

const ease = [0.22, 1, 0.36, 1] as const

function page2Progress(figure: HTMLElement) {
  const rect = figure.getBoundingClientRect()
  const viewHeight = window.innerHeight
  const startTop = viewHeight / 3
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

      <section className="table-band" id="features" aria-label="Table">
        <h2>
          A ring of light.
          <br />
          The whole table can see.
        </h2>
        <ol className="table-list">
          {features.map((item, index) => (
            <li key={item.title} className={index === 1 ? 'frame-left' : 'frame-right'}>
              <div className="table-copy">
                <span className="table-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <div className="table-frame" role="img" aria-label="Photo to come">
                <span>Photo to come</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="band" id="craft">
        <motion.div className="center narrow" {...rise()}>
          <h2>Made for the table.</h2>
          <p>The screen, the eyes, and the body all answer to this table. The technology stays inside the object.</p>
        </motion.div>
      </section>

      <section className="cards" id="cards" aria-label="Details">
        <article className="card gray" aria-label="Photo to come">
          <span>Photo to come</span>
        </article>
        <article className="card gray" aria-label="Photo to come">
          <span>Photo to come</span>
        </article>
        <article className="card gray" aria-label="Photo to come">
          <span>Photo to come</span>
        </article>
      </section>

      <section className="band" id="lab">
        <motion.div className="center" {...rise()}>
          <h2>The screen, taken apart.</h2>
          <p>Status, expression, skill, and the world behind the character.</p>
          <div className="actions">
            <a className="pill" href="/#ux">
              Open the prototype
            </a>
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
          <a className="pill" href="/#ux">
            Open the prototype
          </a>
        </div>
      </section>

      <ScreenBreakdown id="ux" />
    </main>
  )
}
