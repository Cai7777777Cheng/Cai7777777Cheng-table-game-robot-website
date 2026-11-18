import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ProjectStory } from '../components/ProjectStory.tsx'
import { ScreenBreakdown } from '../components/ScreenBreakdown.tsx'

const heroSrc = `${import.meta.env.BASE_URL}hero-v4.jpg`
const coverSrc = `${import.meta.env.BASE_URL}hero-v5.jpg`
const assembleSrc = `${import.meta.env.BASE_URL}page2-assemble.mp4`
const assemblePoster = `${import.meta.env.BASE_URL}page2-assemble-poster.jpg`
const assembleEnd = `${import.meta.env.BASE_URL}page2-assemble-end.jpg`
const lightsSrc = `${import.meta.env.BASE_URL}page2-lights-on.jpg`
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

export function Home() {
  const reduce = useReducedMotion()
  const reduceMotion = reduce === true
  const page2Ref = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lightsRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const section = page2Ref.current
    const video = videoRef.current
    const lights = lightsRef.current
    if (!section || !video || !lights) return

    const frameDuration = 1 / 30
    let raf = 0
    let watch = 0
    let cancelled = false
    let seeking = false
    let warmed = false
    let lastAssigned = -1
    let force = false

    const clearWatch = () => {
      if (!watch) return
      window.clearTimeout(watch)
      watch = 0
    }

    // One seek at a time. Setting currentTime on every frame cancels the
    // in-flight range request, so the first pass never lands and the clip
    // stays frozen until a later scroll happens to stick.
    const armWatch = () => {
      if (watch || cancelled) return
      watch = window.setTimeout(() => {
        watch = 0
        if (cancelled) return
        const next = targetTime()
        const moved = next != null && Math.abs(lastAssigned - next) >= frameDuration * 0.45
        if (moved) {
          // The scroll moved on while the previous range request was still open.
          seeking = false
          lastAssigned = -1
          force = true
          step()
          return
        }
        if (seeking || video.seeking) armWatch()
      }, 420)
    }

    const targetTime = () => {
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) return null
      const frameCount = Math.max(1, Math.round(duration / frameDuration))
      if (reduceMotion) return (frameCount - 1) * frameDuration
      const rect = section.getBoundingClientRect()
      const viewport = window.innerHeight
      const height = rect.height
      // First frame until 2/3 of the section is visible.
      const start = viewport - (height * 2) / 3
      // Last frame once the section is fully on screen, or fills the viewport if it is taller.
      const end = height <= viewport ? viewport - height : 0
      const span = start - end
      const progress =
        span <= 0 ? (rect.top <= end ? 1 : 0) : Math.min(1, Math.max(0, (start - rect.top) / span))
      const index = Math.round(progress * (frameCount - 1))
      return index * frameDuration
    }

    const holds = (time: number) => {
      const ranges = video.buffered
      for (let i = 0; i < ranges.length; i++) {
        if (time >= ranges.start(i) - 0.04 && time <= ranges.end(i) + 0.04) return true
      }
      return false
    }

    const step = () => {
      if (cancelled) return
      const next = targetTime()
      if (next == null || video.readyState < 1) {
        armWatch()
        return
      }
      const drift = next - video.currentTime
      if (Math.abs(drift) < frameDuration * 0.45) {
        seeking = false
        if (!video.paused) video.pause()
        clearWatch()
        applyFade()
        return
      }
      // Ahead of the buffer, play forward. Seeking past the buffered range
      // aborts the in-flight request and leaves the playhead stuck mid-clip.
      if (drift > 0 && !holds(next)) {
        if (video.paused) {
          const pending = video.play()
          if (pending && typeof pending.catch === 'function') pending.catch(() => armWatch())
        }
        armWatch()
        return
      }
      if (!video.paused) video.pause()
      // Leave the in-flight seek alone. Replacing currentTime on every frame
      // aborts its range request, which is what froze the first pass.
      if ((seeking || video.seeking) && !force) {
        seeking = true
        armWatch()
        return
      }
      force = false
      seeking = true
      lastAssigned = next
      try {
        video.currentTime = next
        armWatch()
      } catch {
        seeking = false
        armWatch()
      }
    }

    const onSeeked = () => {
      seeking = false
      clearWatch()
      applyFade()
      step()
    }

    const lastFrameTime = () => {
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) return null
      const frameCount = Math.max(1, Math.round(duration / frameDuration))
      return Math.min(duration, (frameCount - 1) * frameDuration)
    }

    // The last frame has to be the one on screen. A seek that has only been
    // requested, or a playhead stuck mid-clip, does not count.
    const showingLastFrame = () => {
      const last = lastFrameTime()
      if (last == null || video.seeking || video.readyState < 2) return false
      return video.currentTime >= last - frameDuration * 0.45
    }

    // Scrub still ends when the figure is fully in view, and a short further
    // scroll fades the lights-on still. That fade stays shut until the last
    // frame is actually showing, so a stalled seek cannot reveal the still.
    // Scrolling up clears the fade first; only then does the clip rewind.
    // The assembly start/end mapping is unchanged.
    const applyFade = () => {
      if (reduceMotion) {
        lights.style.opacity = '1'
        return
      }
      if (!showingLastFrame()) {
        lights.style.opacity = '0'
        return
      }
      const rect = section.getBoundingClientRect()
      const viewport = window.innerHeight
      const height = rect.height
      const videoEnd = height <= viewport ? viewport - height : 0
      const fadeSpan = Math.min(180, Math.max(96, viewport * 0.12))
      const fade = Math.min(1, Math.max(0, (videoEnd - rect.top) / fadeSpan))
      lights.style.opacity = fade.toFixed(4)
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        applyFade()
        step()
      })
    }

    const warm = () => {
      if (warmed || cancelled) return
      warmed = true
      if (video.preload !== 'auto') {
        video.preload = 'auto'
        video.load()
      }
      onScroll()
    }

    const onEnded = () => {
      seeking = false
      if (!video.paused) video.pause()
      applyFade()
    }

    let mediaTries = 0
    const onVideoError = () => {
      if (cancelled || mediaTries >= 1) return
      mediaTries += 1
      video.load()
    }

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.addEventListener('loadedmetadata', onScroll)
    video.addEventListener('canplay', onScroll)
    video.addEventListener('progress', onScroll)
    video.addEventListener('timeupdate', onScroll)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('ended', onEnded)
    video.addEventListener('waiting', armWatch)
    video.addEventListener('error', onVideoError)
    applyFade()
    if (video.readyState >= 1) onScroll()

    // Metadata only on first paint. Start the full download a couple of
    // screens early so the scrub can reach the last frame before the fade.
    const near = new IntersectionObserver(
      (entries) => {
        if (cancelled || !entries.some((entry) => entry.isIntersecting)) return
        near.disconnect()
        warm()
      },
      { rootMargin: '200% 0px' },
    )
    near.observe(section)

    if (!reduceMotion) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
    }

    return () => {
      cancelled = true
      clearWatch()
      if (raf) cancelAnimationFrame(raf)
      near.disconnect()
      video.pause()
      video.removeEventListener('loadedmetadata', onScroll)
      video.removeEventListener('canplay', onScroll)
      video.removeEventListener('progress', onScroll)
      video.removeEventListener('timeupdate', onScroll)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('waiting', armWatch)
      video.removeEventListener('error', onVideoError)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduceMotion])

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
          <a className="pill light" href="#lab">
            see more details
          </a>
        </motion.div>
      </section>

      <ProjectStory />

      <section
        className="page2"
        id="promise"
        ref={page2Ref}
        aria-label="It doesn’t look much like a robot"
      >
        <div className="page2-stage">
          <video
            ref={videoRef}
            className="page2-video"
            src={assembleSrc}
            poster={reduceMotion ? assembleEnd : assemblePoster}
            muted
            playsInline
            preload="metadata"
            width={2560}
            height={1440}
            aria-label="Nomo assembling on the table: the body, then the neck, then the wraparound screen"
          />
          <img
            ref={lightsRef}
            className="page2-lights"
            src={lightsSrc}
            alt=""
            width={3840}
            height={2160}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
        </div>
        <div className="page2-copy">
          <h2>It doesn’t look much like a robot.</h2>
          <p>
            Nomo sits between the cards and your hands. The wraparound screen around its neck
            brings dodges, HP bars, and moves to the whole table—no more huddling around a single
            screen.
          </p>
        </div>
      </section>

      <section className="table-band" id="features" aria-label="Table">
        <motion.h2 {...rise()}>
          A ring of light.
          <br />
          The whole table can see.
        </motion.h2>
        <ol className="table-list">
          {features.map((item, index) => (
            <li key={item.title} className={index % 2 === 0 ? 'side-right' : 'side-left'}>
              <div className="table-copy">
                <span className="table-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <figure className="table-frame" aria-label="Photo to come">
                <span>Photo to come</span>
              </figure>
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
            <a className="pill" href="#ux">
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
          <a className="pill" href="#ux">
            Open the prototype
          </a>
        </div>
      </section>

      <ScreenBreakdown id="ux" />
    </main>
  )
}
