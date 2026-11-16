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
    body: 'Senses the mood at the table, draws players closer, and deepens immersion.',
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
    let seeking = false
    let want = 0

    const endTime = () => {
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) return 0
      return Math.max(0, duration - 1 / 30)
    }

    const covers = (time: number) => {
      const ranges = video.buffered
      for (let i = 0; i < ranges.length; i++) {
        if (time >= ranges.start(i) - 0.05 && time <= ranges.end(i) + 0.001) return true
      }
      return false
    }

    const nearestBuffered = (time: number) => {
      const ranges = video.buffered
      if (ranges.length === 0) return null
      let best = ranges.start(0)
      let bestDist = Math.abs(best - time)
      for (let i = 0; i < ranges.length; i++) {
        const clamped = Math.min(ranges.end(i), Math.max(ranges.start(i), time))
        const dist = Math.abs(clamped - time)
        if (dist < bestDist) {
          best = clamped
          bestDist = dist
        }
      }
      return best
    }

    const apply = () => {
      frame = 0
      if (cancelled || seeking || video.readyState < 2) return
      const end = endTime()
      if (end <= 0) return
      want = reduce ? end : page2Progress(figure) * end
      const target = covers(want) ? want : nearestBuffered(want)
      if (target == null || Math.abs(video.currentTime - target) < 1 / 60) return
      seeking = true
      video.currentTime = target
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(apply)
    }

    const onSeeked = () => {
      seeking = false
      if (cancelled) return
      if (Math.abs(video.currentTime - want) > 1 / 30) apply()
    }

    const wakeDecoder = () => {
      if (primed || reduce) return
      primed = true
      video.muted = true
      const pending = video.play()
      const settle = () => {
        if (cancelled) return
        video.pause()
        apply()
      }
      if (pending && typeof pending.then === 'function') pending.then(settle, settle)
      else settle()
    }

    const onReady = () => {
      if (video.readyState >= 2) apply()
      if (video.readyState >= 3) wakeDecoder()
    }

    video.preload = 'auto'
    video.muted = true
    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', onReady)
    video.addEventListener('progress', schedule)
    video.addEventListener('seeked', onSeeked)
    if (video.readyState >= 2) onReady()
    if (!reduce) {
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule, { passive: true })
    }

    return () => {
      cancelled = true
      video.pause()
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
      video.removeEventListener('progress', schedule)
      video.removeEventListener('seeked', onSeeked)
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
          <h2>More details to see.</h2>
          <p>The screens, the eyes, and the body were made to heighten the mood at the table.</p>
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
          <h2>Screen UX Breakdown.</h2>
          <a className="pill" href="/#ux">
            Open the prototype
          </a>
        </div>
      </section>

      <ScreenBreakdown id="ux" />
    </main>
  )
}
