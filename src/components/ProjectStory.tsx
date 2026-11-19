import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const gymSrc = `${import.meta.env.BASE_URL}nomo-gym-25d.jpg`
const photo65Src = `${import.meta.env.BASE_URL}stat-65-gym.jpg`
const photo75Src = `${import.meta.env.BASE_URL}stat-75-vending.jpg`
const photo64Src = `${import.meta.env.BASE_URL}stat-64-together.jpg`

const ease = [0.22, 1, 0.36, 1] as const

function StoryPhoto({
  src,
  alt,
  width,
  height,
}: {
  src: string
  alt: string
  width: number
  height: number
}) {
  const tries = useRef(0)
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      onError={(event) => {
        const img = event.currentTarget
        if (tries.current >= 2) return
        tries.current += 1
        img.src = `${src}${src.includes('?') ? '&' : '?'}try=${tries.current}`
      }}
    />
  )
}

export function ProjectStory() {
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
    <>
      <section className="project-intro" aria-label="Project">
        <div className="inset">
          <motion.h2 {...rise()}>Nomo</motion.h2>
          <motion.p className="project-duration" {...rise(0.04)}>
            June 2026 – Present.
          </motion.p>
          <motion.div className="about-chips" {...rise(0.08)}>
            <span>Industrial Design</span>
            <span>Interaction Design</span>
          </motion.div>
          <motion.p className="project-lede" {...rise(0.12)}>
            Nomo is a tabletop companion robot to enhance board game social interaction and gameplay experience.
          </motion.p>
        </div>
      </section>

      <section className="gym-scene" aria-label="Card gym">
        <div className="gym-frame">
          <img
            src={gymSrc}
            alt="A 2.5D card gym: two players sit face to face at a white table, with a playmat and vertical cards between them"
            width={2560}
            height={1440}
          />
        </div>
      </section>

      <section className="story-split" aria-label="Trend">
        <figure className="story-pane story-photo photo-65 scrim">
          <StoryPhoto
            src={photo65Src}
            alt="Two players at a card-shop table, with empty orange chairs in the foreground"
            width={1440}
            height={2560}
          />
          <div className="stat-photo-copy">
            <p className="stat-num">65%</p>
            <p className="stat-line stat-two">
              <span>of Pokémon tabletop gym seats sit empty</span>
              <span>or occupied — even at peak hours.</span>
            </p>
          </div>
        </figure>
        <div className="story-pane story-copy">
          <motion.p className="story-label" {...rise()}>
            Trend
          </motion.p>
          <motion.p className="story-body" {...rise(0.06)}>
            Tabletop games bind friends and help like-minded players meet, but how many people take part — and how often — is not encouraging.
          </motion.p>
        </div>
      </section>

      <section className="story-split wide-right" aria-label="Challenge">
        <div className="story-pane story-copy">
          <motion.p className="story-label" {...rise()}>
            Challenge
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Offline products struggle to get existing players to bring in new ones, and the barrier for beginners is high. Even players in the same circle find it hard to break the ice.
          </motion.p>
          <motion.p className="story-body" {...rise(0.08)}>
            Online games, meanwhile, are more visually appealing.
          </motion.p>
        </div>
        <figure className="story-pane story-photo scrim">
          <StoryPhoto
            src={photo75Src}
            alt="A man smiling at a Pokémon card in front of a Pokémon vending machine"
            width={1440}
            height={2560}
          />
          <p className="story-source">Source: Circana, March 2025</p>
          <div className="stat-photo-copy">
            <p className="stat-num">75%</p>
            <p className="stat-line stat-two">
              <span>of adult Pokémon card buyers</span>
              <span>collect or resell — they don’t play.</span>
            </p>
          </div>
        </figure>
      </section>

      <section className="story-split" aria-label="Opportunity">
        <figure className="story-pane story-photo photo-64 scrim">
          <StoryPhoto
            src={photo64Src}
            alt="Four friends playing UNO around a wooden table in a warm evening living room"
            width={683}
            height={1024}
          />
          <p className="story-source">Source: Asmodee × Censuswide, July 2025</p>
          <div className="stat-photo-copy">
            <p className="stat-num">64%</p>
            <p className="stat-line">use tabletop games to bring family and friends together.</p>
          </div>
        </figure>
        <div className="story-pane story-copy">
          <motion.p className="story-label" {...rise()}>
            Opportunity
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Online games are weakly social, and player churn is high. Many offline tabletop games already have a community effect.
          </motion.p>
          <motion.p className="story-body" {...rise(0.08)}>
            The opportunity is to provide visual stimulus, instant emotional interaction, and a lift in the mood at the table.
          </motion.p>
        </div>
      </section>
    </>
  )
}
