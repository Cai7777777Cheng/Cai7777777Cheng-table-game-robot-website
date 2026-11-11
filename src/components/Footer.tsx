const demoUrl = 'https://cai7777777cheng.github.io/Table-robot-function/'

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <p className="mark">Nomo</p>
        <p>Tabletop companion. Nothing for sale.</p>
      </div>
      <nav aria-label="Footer">
        <a href="/#promise">Screen</a>
        <a href="/#features">Table</a>
        <a href="/#craft">Object</a>
        <a href="/#ux">Prototype</a>
        <a href={demoUrl} target="_blank" rel="noreferrer">
          Demo
        </a>
      </nav>
    </footer>
  )
}
