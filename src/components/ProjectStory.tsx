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
            width={2160}
            height={2640}
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
            The tabletop community has a social problem too. At Pokémon gyms, many people are unwilling to form a play group or team with strangers.
          </motion.p>
          <motion.p className="story-body" {...rise(0.08)}>
            Many players line up at the shop door to buy cards, but few actually sit down and play together.
          </motion.p>
        </div>
        <figure className="story-pane story-photo scrim">
          <StoryPhoto
            src={photo75Src}
            alt="Pokémon TCG Official Gym in Shanghai: the storefront sign, a crowded shop, and people playing at tables."
            width={5346}
            height={5940}
          />
          <p className="story-source">Source: Circana, March 2025</p>
          <div className="stat-photo-copy">
            <p className="stat-num">75%</p>
            <p className="stat-line stat-two">
              of adult Pokémon card buyers collect — but they don't play because of social anxiety.
            </p>
          </div>
        </figure>
      </section>

      <section className="story-split" aria-label="Challenge">
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
            Challenge
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Online competitors have greater visual appeal. In the short term, they are a strong rival to offline products and can attract a large number of users.
          </motion.p>
          <motion.p className="story-body" {...rise(0.08)}>
            Because they lack a sense of companionship and atmosphere, mid-term churn in online products is also high.
          </motion.p>
        </div>
      </section>
    </>
  )
}
