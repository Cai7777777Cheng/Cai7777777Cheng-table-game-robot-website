const diagramSrc = `${import.meta.env.BASE_URL}ux-breakdown.jpg`
const demoUrl = 'https://cai7777777cheng.github.io/Table-robot-function/'

export function ScreenBreakdown({ id }: { id?: string }) {
  return (
    <section className="ux-block" id={id} aria-label="Screen content breakdown">
      <div className="ux-frame">
        <img
          src={diagramSrc}
          alt="Exploded view of the screen: status bar, state filters, skill filters, effects, character, and environment"
          width={2400}
          height={1216}
        />
      </div>
      <div className="ux-copy">
        <p>How the wraparound screen is built, one layer at a time.</p>
        <a className="ux-more" href={demoUrl} target="_blank" rel="noreferrer">
          See More UX?
        </a>
      </div>
    </section>
  )
}
