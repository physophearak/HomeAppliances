import { useRef, useState } from 'react'

const ACTION_WIDTH = 96 // px — width of each revealed action panel
const OPEN_THRESHOLD = ACTION_WIDTH / 2
const TAP_SLOP = 6 // px of movement below which a gesture counts as a tap, not a drag

// A list row that can be swiped left to reveal a delete action or right to
// reveal an edit action, instead of showing always-visible buttons. Only one
// row is ever open at a time: starting a gesture on any row closes whichever
// other row was open (`onInteract`), and tapping an already-open row closes
// it back up. A plain tap on a closed row calls `onTap` directly rather than
// relying on a native click bubbling through the pointer-captured wrapper,
// which some WebKit versions swallow.
export default function SwipeableRow({
  id,
  open,
  onInteract,
  onOpen,
  onClose,
  onTap,
  leftAction,
  rightAction,
  children,
}) {
  const [x, setX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startVal = useRef(0)
  const moved = useRef(false)

  // While dragging, follow the finger live. Once released, only show the
  // snapped `x` if this row is the one the parent has marked open — a
  // forced close (another row opened) collapses it without needing an
  // effect to resync local state.
  const displayX = dragging ? x : open ? x : 0

  const hasLeft = Boolean(leftAction)
  const hasRight = Boolean(rightAction)

  const handlePointerDown = (e) => {
    onInteract(id)
    setDragging(true)
    startX.current = e.clientX
    startVal.current = x
    moved.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragging) return
    const delta = e.clientX - startX.current
    if (Math.abs(delta) > TAP_SLOP) moved.current = true
    const max = hasLeft ? ACTION_WIDTH : 0
    const min = hasRight ? -ACTION_WIDTH : 0
    const next = Math.min(max, Math.max(min, startVal.current + delta))
    setX(next)
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)

    if (!moved.current && x !== 0) {
      setX(0)
      onClose(id)
      return
    }

    if (!moved.current && x === 0) {
      onTap?.()
      return
    }

    if (x <= -OPEN_THRESHOLD && hasRight) {
      setX(-ACTION_WIDTH)
      onOpen(id)
    } else if (x >= OPEN_THRESHOLD && hasLeft) {
      setX(ACTION_WIDTH)
      onOpen(id)
    } else {
      setX(0)
      onClose(id)
    }
  }

  const runAction = (action) => {
    setX(0)
    onClose(id)
    action.onClick()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-stretch justify-between">
        {hasLeft ? (
          <button
            type="button"
            onClick={() => runAction(leftAction)}
            style={{ width: ACTION_WIDTH }}
            className="flex flex-col items-center justify-center gap-0.5 bg-gray-800 text-white text-sm font-extrabold"
          >
            <span className="text-xl">{leftAction.icon}</span>
            {leftAction.label}
          </button>
        ) : (
          <span />
        )}
        {hasRight ? (
          <button
            type="button"
            onClick={() => runAction(rightAction)}
            style={{ width: ACTION_WIDTH }}
            className="flex flex-col items-center justify-center gap-0.5 bg-red-600 text-white text-sm font-extrabold"
          >
            <span className="text-xl">{rightAction.icon}</span>
            {rightAction.label}
          </button>
        ) : (
          <span />
        )}
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${displayX}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  )
}
