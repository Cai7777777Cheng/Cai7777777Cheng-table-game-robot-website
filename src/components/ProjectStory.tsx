import { motion, useReducedMotion } from 'framer-motion'

const gymSrc = `${import.meta.env.BASE_URL}nomo-gym-25d.jpg`
const photoASrc = `${import.meta.env.BASE_URL}trend-photo-a-gym.jpg`
const photoBSrc = `${import.meta.env.BASE_URL}trend-photo-b-unused-deck.jpg`

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
          <motion.h2 {...rise()}>
            Nomo
            <br />
            Tabletop companion
          </motion.h2>
          <motion.p className="project-duration" {...rise(0.04)}>
            June 2026 – Present.
          </motion.p>
          <motion.div className="about-chips" {...rise(0.08)}>
            <span>Industrial Design</span>
            <span>Interaction Design</span>
          </motion.div>
          <motion.p className="project-lede" {...rise(0.12)}>
            Nomo is a tabletop companion that sits between the cards and your hands. The wraparound
            screen around its neck brings dodges, HP bars, and moves to the whole table—no more
            huddling around a single screen.
          </motion.p>
        </div>
      </section>

      <section className="gym-scene" aria-label="Card gym">
        <div className="gym-frame">
          <img
            src={gymSrc}
            alt="A 2.5D card gym: players at white tables, dragon murals on the wall, and plush toys on the floor"
            width={2560}
            height={1440}
          />
        </div>
      </section>

      <section className="trend-lead" aria-label="Trend">
        <div className="inset">
          <motion.p className="story-label" {...rise()}>
            Trend
          </motion.p>
          <motion.p className="story-body" {...rise(0.06)}>
            Interest arrives quickly, and fades just as fast. Buying the cards is not the same as
            playing. Arriving at the venue is not the same as starting a match.
          </motion.p>
        </div>
      </section>

      <section className="stat-photo scrim" aria-label="Stat">
        <img
          src={photoASrc}
          alt="A busy card gym, with a few people seated at tables and many more standing along the wall"
          width={1280}
          height={720}
          loading="lazy"
        />
        <div className="stat-photo-copy">
          <p className="stat-num">{'<30%'}</p>
          <p className="stat-line">of people at the gym were actually playing.</p>
        </div>
      </section>

      <section className="stat-type" aria-label="Stat">
        <div className="inset">
          <p className="stat-num">41.25%</p>
          <p className="stat-line">of users buy Pokémon cards — half only collect.</p>
        </div>
      </section>

      <section className="stat-photo" aria-label="Stat">
        <img
          src={photoBSrc}
          alt="Three friends looking at their phones, with a stack of cards left untouched on the table"
          width={1280}
          height={720}
          loading="lazy"
        />
        <div className="stat-photo-copy">
          <p className="stat-num">90%</p>
          <p className="stat-line">stopped touching the physical cards once the game went online.</p>
        </div>
      </section>

      <section className="stat-type" aria-label="Stat">
        <div className="inset">
          <p className="stat-num">80%</p>
          <p className="stat-line">come back only for an event or a new version.</p>
        </div>
      </section>

      <section className="story-block" aria-label="Challenge">
        <div className="inset">
          <motion.p className="story-label" {...rise()}>
            Challenge
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Offline has the people and the product, but no reliable way to start a match and keep
            it going. The heat is in collecting; the gap is at the table.
          </motion.p>
          <motion.p className="story-body" {...rise(0.08)}>
            Online wins on visuals, then loses the room. What’s missing is the teasing and
            encouragement that happens between friends.
          </motion.p>
        </div>
      </section>

      <section className="story-block" aria-label="Opportunity">
        <div className="inset">
          <motion.p className="story-label" {...rise()}>
            Opportunity
          </motion.p>
          <motion.p className="story-body" {...rise(0.05)}>
            Not an all-purpose companion. A quiet indoor role: set the atmosphere, get a match
            started, and make the table want another round.
          </motion.p>
        </div>
      </section>

      <section className="story-block hmw" aria-label="How might we">
        <div className="inset">
          <motion.p className="story-label" {...rise()}>
            How might we
          </motion.p>
          <motion.p className="hmw-line" {...rise(0.06)}>
            How might we bring the visual punch a table lacks, and the{' '}
            <span className="keep">in-the-room</span> presence a screen can’t give?
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
