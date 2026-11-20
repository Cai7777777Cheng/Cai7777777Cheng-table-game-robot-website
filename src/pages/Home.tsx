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
const howLeftSrc = `${import.meta.env.BASE_URL}how-to-use-nomo-left.mp4`
const howLeftPosterSrc = `${import.meta.env.BASE_URL}how-to-use-nomo-left-poster.jpg`
const repoUrl = 'https://github.com/Cai7777777Cheng/Table-robot-function'

let howSample: HTMLCanvasElement | null = null

function howFrameIsBad(video: HTMLVideoElement) {
  if (video.readyState < 2 || video.seeking) return true
  if (!howSample) {
    howSample = document.createElement('canvas')
    howSample.width = 80
    howSample.height = 60
  }
  const ctx = howSample.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  const srcW = video.videoWidth || 1920
  const srcH = video.videoHeight || 1080
  const cropW = Math.round(srcW * 0.75)
  const cropX = Math.round((srcW - cropW) / 2)
  ctx.drawImage(video, cropX, 0, cropW, srcH, 0, 0, 80, 60)
  const { data } = ctx.getImageData(0, 0, 80, 60)
  const luma = (x: number, y: number) => {
    const i = (y * 80 + x) * 4
    return (data[i] + data[i + 1] + data[i + 2]) / 3
  }
  let sum = 0
  for (let y = 0; y < 60; y++) for (let x = 0; x < 80; x++) sum += luma(x, y)
  if (sum / (80 * 60) < 160) return true
  const flatGray = (x0: number, y0: number) => {
    let s = 0
    let s2 = 0
    const n = 16 * 12
    for (let y = y0; y < y0 + 12; y++) {
      for (let x = x0; x < x0 + 16; x++) {
        const v = luma(x, y)
        s += v
        s2 += v * v
      }
    }
    const mean = s / n
    const variance = s2 / n - mean * mean
    return variance < 20 && mean > 140 && mean < 210
  }
  for (let y = 0; y <= 48; y += 12) {
    for (let x = 0; x <= 64; x += 16) {
      if (flatGray(x, y)) return true
    }
  }
  return false
}

// The video element stays invisible. Playback is copied onto the canvas, and a flat gray tile (baked into one source frame) is left out so the previous frame stays up.
const HowToClip = memo(function HowToClip() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const holdRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef('mouse')
  const touchAtRef = useRef(0)
  const playToken = useRef(0)
  const hoveringRef = useRef(false)
  const loopRef = useRef(false)
  const wrappingRef = useRef(false)

  const paint = (video: HTMLVideoElement) => {
    const hold = holdRef.current
    if (!hold || howFrameIsBad(video)) return false
    const w = video.videoWidth || 1920
    const h = video.videoHeight || 1080
    if (hold.width !== w || hold.height !== h) {
      hold.width = w
      hold.height = h
    }
    const ctx = hold.getContext('2d', { alpha: false })
    if (!ctx) return false
    ctx.drawImage(video, 0, 0, w, h)
    hold.classList.add('on')
    return true
  }

  const showHowStill = () => {
    const token = ++playToken.current
    hoveringRef.current = false
    loopRef.current = false
    wrappingRef.current = false
    posterRef.current?.classList.add('on')
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.loop = false
    const park = () => {
      if (playToken.current !== token) return
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

  const watch = (video: HTMLVideoElement, token: number) => {
    if (typeof video.requestVideoFrameCallback !== 'function') return
    video.requestVideoFrameCallback(() => {
      if (playToken.current !== token) return
      if (!video.seeking && paint(video)) posterRef.current?.classList.remove('on')
      const duration = video.duration
      if (loopRef.current && duration && video.currentTime >= duration - 0.05) {
        if (!wrappingRef.current) {
          wrappingRef.current = true
          try {
            video.currentTime = 0
          } catch {
            wrappingRef.current = false
          }
        }
      } else if (video.currentTime < 0.12) {
        wrappingRef.current = false
      }
      if (video.ended) {
        if (loopRef.current) {
          wrappingRef.current = true
          try {
            video.currentTime = 0
          } catch {
            /* ignore */
          }
          video.play()?.catch(() => {})
        } else {
          showHowStill()
          return
        }
      }
      watch(video, token)
    })
  }

  const playHow = (loop: boolean) => {
    const video = videoRef.current
    if (!video) return
    const token = ++playToken.current
    loopRef.current = loop
    wrappingRef.current = false
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.loop = false
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
      attempt(true)
      watch(video, token)
    }
    const start = () => {
      if (playToken.current !== token) return
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
      <video
        ref={videoRef}
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
        onEnded={() => {
          const video = videoRef.current
          if (!video) return
          if (loopRef.current) {
            wrappingRef.current = true
            try {
              video.currentTime = 0
            } catch {
              /* ignore */
            }
            video.play()?.catch(() => {})
            return
          }
          showHowStill()
        }}
      />
      <canvas ref={holdRef} className="how-hold" aria-hidden="true" />
    </article>
  )
})

const HowToLeftClip = memo(function HowToLeftClip() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const holdRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef('mouse')
  const touchAtRef = useRef(0)
  const playToken = useRef(0)
  const hoveringRef = useRef(false)
  const loopRef = useRef(false)
  const wrappingRef = useRef(false)

  const lastFrameTime = (video: HTMLVideoElement) =>
    Number.isFinite(video.duration) ? Math.max(0, video.duration - 1 / 30) : 0

  const paint = (video: HTMLVideoElement) => {
    const hold = holdRef.current
    if (!hold || video.readyState < 2 || video.seeking) return false
    const w = video.videoWidth || 1920
    const h = video.videoHeight || 1080
    if (hold.width !== w || hold.height !== h) {
      hold.width = w
      hold.height = h
    }
    const ctx = hold.getContext('2d', { alpha: false })
    if (!ctx) return false
    ctx.drawImage(video, 0, 0, w, h)
    hold.classList.add('on')
    return true
  }

  const showLastFrame = () => {
    const token = ++playToken.current
    hoveringRef.current = false
    loopRef.current = false
    wrappingRef.current = false
    posterRef.current?.classList.add('on')
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.loop = false
    const place = () => {
      if (playToken.current !== token) return
      const end = lastFrameTime(video)
      if (Math.abs(video.currentTime - end) < 0.04) return
      try {
        video.currentTime = end
      } catch {
        /* metadata not ready */
      }
    }
    if (video.readyState >= 1) place()
    else video.addEventListener('loadedmetadata', place, { once: true })
  }

  const watch = (video: HTMLVideoElement, token: number) => {
    if (typeof video.requestVideoFrameCallback !== 'function') return
    video.requestVideoFrameCallback(() => {
      if (playToken.current !== token) return
      if (!video.seeking && paint(video)) posterRef.current?.classList.remove('on')
      const duration = video.duration
      if (loopRef.current && duration && video.currentTime >= duration - 0.05) {
        if (!wrappingRef.current) {
          wrappingRef.current = true
          try {
            video.currentTime = 0
          } catch {
            wrappingRef.current = false
          }
        }
      } else if (video.currentTime < 0.12) {
        wrappingRef.current = false
      }
      if (video.ended) {
        if (loopRef.current) {
          wrappingRef.current = true
          try {
            video.currentTime = 0
          } catch {
            /* ignore */
          }
          video.play()?.catch(() => {})
        } else {
          showLastFrame()
          return
        }
      }
      watch(video, token)
    })
  }

  const playHow = (loop: boolean) => {
    const video = videoRef.current
    if (!video) return
    const token = ++playToken.current
    loopRef.current = loop
    wrappingRef.current = false
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.loop = false
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
      attempt(true)
      watch(video, token)
    }
    const start = () => {
      if (playToken.current !== token) return
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

  const beginHover = (pointerType?: string) => {
    if (pointerType === 'touch') return
    if (pointerType && pointerType !== 'mouse' && pointerType !== 'pen') return
    if (recentTouch()) return
    if (hoveringRef.current) return
    hoveringRef.current = true
    playHow(true)
  }

  const endHover = (pointerType?: string) => {
    if (pointerType === 'touch') return
    if (pointerType && pointerType !== 'mouse' && pointerType !== 'pen') return
    if (recentTouch()) return
    if (!hoveringRef.current) return
    showLastFrame()
  }

  useEffect(() => {
    showLastFrame()
  }, [])

  return (
    <article
      className="card how how-left"
      aria-label="Nomo opening a drawer of cards"
      tabIndex={0}
      onPointerDown={(event) => {
        pointerRef.current = event.pointerType
        if (event.pointerType === 'touch') touchAtRef.current = performance.now()
      }}
      onMouseEnter={() => beginHover()}
      onMouseLeave={() => endHover()}
      onPointerEnter={(event) => beginHover(event.pointerType)}
      onPointerLeave={(event) => endHover(event.pointerType)}
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
        showLastFrame()
      }}
    >
      <img ref={posterRef} className="how-still on" src={howLeftPosterSrc} alt="" />
      <video
        ref={videoRef}
        src={howLeftSrc}
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
        onEnded={() => {
          const video = videoRef.current
          if (!video) return
          if (loopRef.current) {
            wrappingRef.current = true
            try {
              video.currentTime = 0
            } catch {
              /* ignore */
            }
            video.play()?.catch(() => {})
            return
          }
          showLastFrame()
        }}
      />
      <canvas ref={holdRef} className="how-hold" aria-hidden="true" />
    </article>
  )
})

const features = [
  {
    title: 'Build Connections',
    body: 'It reads the mood and the players’ personalities, then answers in real time with motion, light, and sound to bring players closer.',
  },
  {
    title: 'In the game',
    body: 'It answers the state of the game with motion and expression, and projects visuals that deepen immersion.',
  },
  {
    title: 'Companion UX',
    body: 'Nomo and its companion robots guide new players, and offer encouragement or comfort when the game is won or lost.',
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
        <motion.h2 {...rise()}>The whole table can enjoy.</motion.h2>
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
        </motion.div>
      </section>

      <section className="cards" id="cards" aria-label="Details">
        <HowToLeftClip />
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
