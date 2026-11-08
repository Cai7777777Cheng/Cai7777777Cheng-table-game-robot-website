import { Link } from 'react-router-dom'

export function Missing() {
  return (
    <main className="missing">
      <div>
        <h1>This page isn’t here</h1>
        <p>The cover, the screen, and the prototype are all on the same scroll.</p>
        <Link className="pill" to="/">
          Back to the cover
        </Link>
      </div>
    </main>
  )
}
