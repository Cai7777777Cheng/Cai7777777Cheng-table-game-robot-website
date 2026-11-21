import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

type DragRevealProps = {
  src: string
  alt: string
  coverSrc?: string
}

export function DragReveal({ src, alt, coverSrc }: DragRevealProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef(0)
  const grabOffsetRef = useRef(0)
  const draggingRef = useRef(false)
  const [value, setValue] = useState(0)

  const commit = (next: number) => {
    const clamped = Math.min(100, Math.max(0, next))
    valueRef.current = clamped
    setValue(clamped)
  }

  const percentFromClientX = (clientX: number) => {
    const frame = frameRef.current
    if (!frame) return valueRef.current
    const rect = frame.getBoundingClientRect()
    if (rect.width <= 0) return valueRef.current
    if (clientX >= rect.right - 24) return 100
    if (clientX <= rect.left + 24) return 0
    const x = clientX - grabOffsetRef.current - rect.left
    return (x / rect.width) * 100
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const splitX = rect.left + (valueRef.current / 100) * rect.width
    grabOffsetRef.current = event.clientX - splitX
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return
    commit(percentFromClientX(event.clientX))
  }

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      commit(valueRef.current + step)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      commit(valueRef.current - step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commit(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      commit(100)
    }
  }

  return (
    <div className="reveal" ref={frameRef}>
      <img className="reveal-photo" src={src} alt={alt} width={3840} height={2160} />
      <div
        className="reveal-cover"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        aria-hidden="true"
      >
        {coverSrc ? (
          <img className="reveal-photo" src={coverSrc} alt="" />
        ) : (
          <div className="reveal-placeholder" />
        )}
      </div>
      <div className="reveal-line" style={{ left: `${value}%` }} />
      <button
        type="button"
        className="reveal-handle"
        style={{ left: `clamp(22px, ${value}%, calc(100% - 22px))` }}
        role="slider"
        aria-label="Drag to reveal comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-valuetext={`${Math.round(value)} percent revealed`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <span className="reveal-chevron" aria-hidden="true" />
      </button>
    </div>
  )
}
