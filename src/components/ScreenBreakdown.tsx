const diagramSrc = `${import.meta.env.BASE_URL}ux-breakdown-v2.jpg`
const demoVideoSrc = `${import.meta.env.BASE_URL}wraparound-screen-content-generation.mp4`
const demoPosterSrc = `${import.meta.env.BASE_URL}wraparound-screen-content-generation-poster.jpg`
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
        <p>A demonstration of how wraparound-screen content is generated.</p>
        <video
          className="ux-demo"
          src={demoVideoSrc}
          poster={demoPosterSrc}
          controls
          playsInline
          preload="metadata"
          width={1920}
          height={1080}
        />
        <a className="ux-more" href={demoUrl} target="_blank" rel="noreferrer">
          See More UX?
        </a>
      </div>
    </section>
  )
}
