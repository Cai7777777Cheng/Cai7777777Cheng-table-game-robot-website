import { motion, useReducedMotion } from 'framer-motion'

const gymSrc = `${import.meta.env.BASE_URL}nomo-gym-25d.jpg`
const photo75Src = `${import.meta.env.BASE_URL}stat-75-collect.jpg`
const photo64Src = `${import.meta.env.BASE_URL}stat-64-together.jpg`

const ease = [0.22, 1, 0.36, 1] as const

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
        <div className="story-pane stat-type-pane">
          <p className="stat-num">40%</p>
          <p className="stat-line">
            say tabletop games make it easier to open up than regular conversation.
          </p>
          <p className="stat-source">Source: Asmodee × Censuswide, July 2025</p>
        </div>
        <div className="story-pane story-copy">
          <motion.p className="story-label" {...rise()}>
            Trend
          </motion.p>
          <motion.p className="story-body" {...rise(0.06)}>
            Interest arrives quickly, and fades just as fast. Buying the cards is not the same as
            playing. Arriving at the venue is not the same as starting a match.
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
          <img
            src={photo75Src}
            alt="Two people inspecting a card binder and a sleeved card, with an unused playmat in the foreground"
            width={864}
            height={1152}
            loading="lazy"
          />
          <p className="story-source">Source: Circana, March 2025</p>
          <div className="stat-photo-copy">
            <p className="stat-num">75%</p>
            <p className="stat-line">
              of adult Pokémon card buyers collect or resell — they don’t play.
            </p>
          </div>
        </figure>
      </section>

      <section className="story-split" aria-label="Opportunity">
        <figure className="story-pane story-photo scrim">
          <img
            src={photo64Src}
            alt="Four friends laughing around a white table in the middle of a card game"
            width={864}
            height={1152}
            loading="lazy"
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

      <section className="story-block" aria-label="Approach">
        <div className="inset">
          <motion.p className="story-label" {...rise()}>
            Approach
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Hardware and software together: layered generation for the visual hit, expression and
            body for presence. Beginner guidance lives on a smaller, separate robot.
          </motion.p>
        </div>
      </section>

      <section className="story-block story-end" aria-label="Success">
        <div className="inset">
          <motion.p className="story-label" {...rise()}>
            Success
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Judge it by behavior: start rate, match completion, and same-table replay, against the
            table without it. It should feel funnier and more atmospheric — not that the robot was
            clever.
          </motion.p>
        </div>
      </section>
    </>
  )
}
