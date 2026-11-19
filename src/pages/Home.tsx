import { memo, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ProjectStory } from '../components/ProjectStory.tsx'
import { ScreenBreakdown } from '../components/ScreenBreakdown.tsx'

const heroSrc = `${import.meta.env.BASE_URL}hero-v4.jpg`
const coverSrc = `${import.meta.env.BASE_URL}hero-v5.jpg`
const assembleSrc = `${import.meta.env.BASE_URL}page2-assemble.mp4`
const assemblePoster = `${import.meta.env.BASE_URL}page2-assemble-poster.jpg`
const assembleEnd = `${import.meta.env.BASE_URL}page2-assemble-end.jpg`
const lightsSrc = `${import.meta.env.BASE_URL}page2-lights-on.jpg`
const howClipSrc = `${import.meta.env.BASE_URL}how-to-use-nomo-hover.mp4`
const howPosterSrc = `${import.meta.env.BASE_URL}how-to-use-nomo-hover-poster.jpg`
const repoUrl = 'https://github.com/Cai7777777Cheng/Table-robot-function'

let howSample: HTMLCanvasElement | null = null

function howFrameIsBlack(video: HTMLVideoElement) {
  if (video.readyState < 2 || video.seeking) return true
  if (!howSample) {
    howSample = document.createElement('canvas')
    howSample.width = 32
    howSample.height = 18
  }
  const ctx = howSample.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  ctx.drawImage(video, 0, 0, howSample.width, howSample.height)
  const data = ctx.getImageData(0, 0, howSample.width, howSample.height).data
  let sum = 0
  for (let i = 0; i < data.length; i += 4) sum += data[i] + data[i + 1] + data[i + 2]
  return sum / (howSample.width * howSample.height * 3) < 28
}

// The clip has no black frames. The element paints black while seeking, including a native loop wrap, so a second video is primed at 0 and a canvas keeps the last real frame up until that frame is on screen.
const HowToClip = memo(function HowToClip() {
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const posterRef = useRef<HTMLImageElement>(null)
  const holdRef = useRef<HTMLCanvasElement>(null)
  const frontIndex = useRef(0)
  const pointerRef = useRef('mouse')
  const touchAtRef = useRef(0)
  const playToken = useRef(0)
  const hoveringRef = useRef(false)
  const loopRef = useRef(false)
  const wrappingRef = useRef(false)

  const videos = () => videoRefs.map((ref) => ref.current).filter((video): video is HTMLVideoElement => Boolean(video))
  const frontVideo = () => videoRefs[frontIndex.current]?.current ?? null
  const backVideo = () => videoRefs[frontIndex.current === 0 ? 1 : 0]?.current ?? null

  const drawHold = (video: HTMLVideoElement) => {
    const hold = holdRef.current
    if (!hold || video.readyState < 2 || video.seeking || howFrameIsBlack(video)) return false
    if (hold.width !== 960) {
      hold.width = 960
      hold.height = 540
    }
    const ctx = hold.getContext('2d', { alpha: false })
    if (!ctx) return false
    ctx.drawImage(video, 0, 0, hold.width, hold.height)
    hold.dataset.ready = '1'
    return true
  }

  const showHold = () => {
    const hold = holdRef.current
    if (hold?.dataset.ready) hold.classList.add('on')
  }

  const hideHold = () => holdRef.current?.classList.remove('on')

  const showPoster = () => posterRef.current?.classList.add('on')

  const hidePoster = () => posterRef.current?.classList.remove('on')

  const parkAtStart = (video: HTMLVideoElement, token: number) => {
    const park = () => {
      if (playToken.current !== token) return
      video.pause()
      if (video.currentTime < 0.04 && !video.seeking) return
      try {
        video.currentTime = 0
      } catch {
        /* metadata not ready */
      }
    }
    if (video.readyState >= 1) park()
    else video.addEventListener('loadedmetadata', park, { once: true })
  }

  const revealWhenBright = (video: HTMLVideoElement, token: number, attempt: number, commit: () => void) => {
    const step = () => {
      if (playToken.current !== token) return
      if (howFrameIsBlack(video) && attempt < 8) {
        revealWhenBright(video, token, attempt + 1, commit)
        return
      }
      commit()
    }
    if (typeof video.requestVideoFrameCallback === 'function') video.requestVideoFrameCallback(() => step())
    else requestAnimationFrame(step)
  }

  const watchPlayback = (video: HTMLVideoElement, token: number) => {
    if (typeof video.requestVideoFrameCallback !== 'function') return
    video.requestVideoFrameCallback(() => {
      if (playToken.current !== token || video !== frontVideo()) return
      if (!wrappingRef.current) drawHold(video)
      const nearEnd = Boolean(video.duration) && video.currentTime >= video.duration - 0.08
      if (nearEnd && loopRef.current) {
        wrapLoop(video, token)
        return
      }
      if (nearEnd && !loopRef.current) showHold()
      watchPlayback(video, token)
    })
  }

  const wrapLoop = (outgoing: HTMLVideoElement, token: number) => {
    if (wrappingRef.current || playToken.current !== token || !loopRef.current) return
    if (outgoing !== frontVideo()) return
    wrappingRef.current = true
    drawHold(outgoing)
    showHold()
    const incoming = backVideo()
    if (!incoming) {
      wrappingRef.current = false
      return
    }
    frontIndex.current = frontIndex.current === 0 ? 1 : 0
    outgoing.pause()
    outgoing.classList.remove('is-front')
    parkAtStart(outgoing, token)
    incoming.classList.add('is-front')
    incoming.muted = true
    incoming.defaultMuted = true
    incoming.playsInline = true
    incoming.loop = false
    const startIncoming = () => {
      if (playToken.current !== token) return
      const pending = incoming.play()
      if (pending && typeof pending.catch === 'function') {
        pending.catch(() => {
          if (playToken.current !== token) return
          requestAnimationFrame(() => {
            incoming.play()?.catch(() => {})
          })
        })
      }
      revealWhenBright(incoming, token, 0, () => {
        if (playToken.current !== token) return
        hideHold()
        wrappingRef.current = false
        watchPlayback(incoming, token)
      })
    }
    if (incoming.readyState >= 2 && incoming.currentTime < 0.05 && !incoming.seeking) startIncoming()
    else {
      const onSeeked = () => {
        incoming.removeEventListener('seeked', onSeeked)
        startIncoming()
      }
      incoming.addEventListener('seeked', onSeeked)
      try {
        incoming.currentTime = 0
      } catch {
        startIncoming()
      }
    }
  }

  const showHowStill = () => {
    const token = ++playToken.current
    hoveringRef.current = false
    loopRef.current = false
    wrappingRef.current = false
    showPoster()
    hideHold()
    for (const video of videos()) {
      video.loop = false
      video.classList.remove('is-front')
      parkAtStart(video, token)
    }
  }

  const playHow = (loop: boolean) => {
    const video = frontVideo()
    if (!video) return
    const token = ++playToken.current
    loopRef.current = loop
    wrappingRef.current = false
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.loop = false
    const start = () => {
      if (playToken.current !== token) return
      const go = () => {
        if (playToken.current !== token) return
        const attempt = (retry: boolean) => {
          if (playToken.current !== token) return
          const pending = video.play()
          if (pending && typeof pending.catch === 'function') {
            pending.catch(() => {
              if (!retry || playToken.current !== token) return
              requestAnimationFrame(() => attempt(false))
            })
          }
        }
        video.classList.add('is-front')
        attempt(true)
        revealWhenBright(video, token, 0, () => {
          if (playToken.current !== token) return
          hidePoster()
          watchPlayback(video, token)
        })
      }
      if (video.readyState >= 2 && video.currentTime < 0.05 && !video.seeking) go()
      else {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          go()
        }
        video.addEventListener('seeked', onSeeked)
        try {
          video.currentTime = 0
        } catch {
          go()
        }
      }
    }
    if (video.readyState >= 1) start()
    else video.addEventListener('loadedmetadata', start, { once: true })
  }

  const recentTouch = () => performance.now() - touchAtRef.current < 800

  const beginHowHover = (pointerType?: string) => {
    if (pointerType === 'touch') return
    if (pointerType && pointerType !== 'mouse' && pointerType !== 'pen') return
    if (recentTouch()) return
    if (hoveringRef.current) return
    hoveringRef.current = true
    playHow(true)
  }

  const endHowHover = (pointerType?: string) => {
    if (pointerType === 'touch') return
    if (pointerType && pointerType !== 'mouse' && pointerType !== 'pen') return
    if (recentTouch()) return
    if (!hoveringRef.current) return
    showHowStill()
  }

  useEffect(() => {
    showHowStill()
  }, [])

  return (
    <article
      className="card how"
      aria-label="Nomo dispensing a card"
      tabIndex={0}
      onPointerDown={(event) => {
        pointerRef.current = event.pointerType
        if (event.pointerType === 'touch') touchAtRef.current = performance.now()
      }}
      onMouseEnter={() => beginHowHover()}
      onMouseLeave={() => endHowHover()}
      onPointerEnter={(event) => beginHowHover(event.pointerType)}
      onPointerLeave={(event) => endHowHover(event.pointerType)}
      onClick={() => {
        if (pointerRef.current !== 'touch') return
        playHow(false)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        playHow(false)
      }}
      onBlur={() => {
        if (hoveringRef.current || loopRef.current) return
        showHowStill()
      }}
    >
      <img ref={posterRef} className="how-still on" src={howPosterSrc} alt="" />
      {([0, 1] as const).map((index) => (
        <video
          key={index}
          ref={videoRefs[index]}
          src={howClipSrc}
          muted
          playsInline
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          width={1920}
          height={1080}
          aria-hidden="true"
          onEnded={(event) => {
            const video = event.currentTarget
            if (video !== frontVideo()) return
            if (loopRef.current) wrapLoop(video, playToken.current)
            else showHowStill()
          }}
        />
      ))}
      <canvas ref={holdRef} className="how-hold" aria-hidden="true" />
    </article>
  )
})

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

    const scrubMetrics = () => {
      const stage = section.querySelector('.page2-stage')
      const stageHeight = stage?.getBoundingClientRect().height ?? section.getBoundingClientRect().height
      const viewport = window.innerHeight
      // First frame when two-thirds of the picture is visible. The remaining
      // frames are spread across 1.8 viewports of scroll, not the short gap
      // until the picture merely fills the screen.
      const start = viewport - (stageHeight * 2) / 3
      const scrubSpan = viewport * 1.8
      const fadeSpan = Math.min(180, Math.max(96, viewport * 0.12))
      const traveled = start - section.getBoundingClientRect().top
      return { scrubSpan, fadeSpan, traveled }
    }

    const targetTime = () => {
      const duration = video.duration
      if (!Number.isFinite(duration) || duration <= 0) return null
      const frameCount = Math.max(1, Math.round(duration / frameDuration))
      const last = Math.min(duration, (frameCount - 1) * frameDuration)
      if (reduceMotion) return last
      const { scrubSpan, traveled } = scrubMetrics()
      const progress = Math.min(1, Math.max(0, traveled / scrubSpan))
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
      // Scrolling forward never jumps to a far frame. If more than one frame
      // is still ahead, or that frame is not buffered, play through the gap.
      if (drift > frameDuration * 1.05 || (drift > 0 && !holds(next))) {
        if (video.paused) {
          video.playbackRate = 1
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

    // After the long scrub, a short further scroll fades the lights-on still.
    // The fade stays shut until the last frame is actually showing. Scrolling
    // up clears that fade before the clip rewinds.
    const applyFade = () => {
      if (reduceMotion) {
        lights.style.opacity = '1'
        return
      }
      if (!showingLastFrame()) {
        lights.style.opacity = '0'
        return
      }
      const { scrubSpan, fadeSpan, traveled } = scrubMetrics()
      const fade = Math.min(1, Math.max(0, (traveled - scrubSpan) / fadeSpan))
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
          <div className="page2-copy">
            <h2>It doesn’t look much like a robot.</h2>
            <p>
              Nomo sits between the cards and your hands. The wraparound screen around its neck
              brings dodges, HP bars, and moves to the whole table—no more huddling around a single
              screen.
            </p>
          </div>
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
          <h2>How to use NOMO</h2>
          <p>The screens, the eyes, and the body were made to heighten the mood at the table.</p>
        </motion.div>
      </section>

      <section className="cards" id="cards" aria-label="Details">
        <article className="card gray" aria-label="Photo to come">
          <span>Photo to come</span>
        </article>
        <HowToClip />
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
