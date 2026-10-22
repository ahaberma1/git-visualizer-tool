import { useEffect, useReducer, useRef, useState } from 'react'
import { GitBranch, GitCommit, GitMerge } from 'lucide-react'
import { createInitialState, headCommitId, randomId, reducer } from './gitReducer'
import { computeLayout } from './layout'
import { presets } from './presets'

const inputCls =
  'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none'
const btnCls =
  'flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-sky-600'
const headingCls = 'text-xs font-semibold uppercase tracking-wider text-slate-400'

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [message, setMessage] = useState('')
  const [branchName, setBranchName] = useState('')
  const [target, setTarget] = useState('')
  const logEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: 'end' })
  }, [state.log.length])

  const layout = computeLayout(state)
  const headId = headCommitId(state)
  const currentValue =
    state.head.type === 'branch' ? state.head.name : state.head.id
  const selected = target || currentValue
  const trimmedBranch = branchName.trim()
  const branchInvalid =
    !trimmedBranch ||
    /\s/.test(trimmedBranch) ||
    state.branches.some((b) => b.name === trimmedBranch)

  const submitCommit = () => {
    if (!message.trim()) return
    dispatch({ type: 'commit', message, id: randomId(), timestamp: Date.now() })
    setMessage('')
  }

  const submitBranch = () => {
    if (branchInvalid) return
    dispatch({ type: 'branch', name: trimmedBranch })
    setBranchName('')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-white">
          <GitMerge className="h-5 w-5 text-sky-400" />
          Git Visualizer
        </h1>
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                dispatch({ type: 'load', state: p.build() })
                setTarget('')
              }}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {p.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col gap-5 border-r border-slate-800 bg-slate-900/60 p-4">
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              submitCommit()
            }}
          >
            <h2 className={headingCls}>Commit</h2>
            <input
              className={inputCls}
              placeholder="Commit message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className={btnCls} disabled={!message.trim()}>
              <GitCommit className="h-4 w-4" /> Commit
            </button>
          </form>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              submitBranch()
            }}
          >
            <h2 className={headingCls}>Branch</h2>
            <input
              className={inputCls}
              placeholder="New branch name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
            <button type="submit" className={btnCls} disabled={branchInvalid}>
              <GitBranch className="h-4 w-4" /> Create Branch
            </button>
          </form>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ type: 'checkout', target: selected })
              setTarget('')
            }}
          >
            <h2 className={headingCls}>Checkout</h2>
            <select
              className={inputCls}
              value={selected}
              onChange={(e) => setTarget(e.target.value)}
            >
              <optgroup label="Branches">
                {state.branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Commits">
                {state.commits.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.message}
                  </option>
                ))}
              </optgroup>
            </select>
            <button type="submit" className={btnCls} disabled={selected === currentValue}>
              Checkout
            </button>
          </form>

          <section className="flex min-h-0 flex-1 flex-col gap-2">
            <h2 className={headingCls}>Terminal</h2>
            <div className="flex-1 overflow-y-auto rounded-md border border-slate-800 bg-black p-3 font-mono text-xs leading-5 text-emerald-400">
              {state.log.map((l, i) => (
                <div key={i} className="break-words">
                  {l}
                </div>
              ))}
              <div ref={logEnd} />
            </div>
          </section>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-slate-950">
          <svg width={layout.width} height={layout.height} className="min-h-full min-w-full">
            {layout.edges.map((e) => (
              <path key={e.key} d={e.d} fill="none" stroke={e.color} strokeWidth={3} />
            ))}
            {layout.nodes.map((n) => (
              <g
                key={n.id}
                className="cursor-pointer"
                onClick={() => dispatch({ type: 'checkout', target: n.id })}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={16}
                  fill="#0f172a"
                  stroke={n.color}
                  strokeWidth={n.id === headId ? 5 : 3}
                />
                <text x={n.x} y={n.y + 38} textAnchor="middle" fontSize={12} fill="#cbd5e1" fontFamily="monospace">
                  {n.id}
                </text>
                <text x={n.x} y={n.y + 54} textAnchor="middle" fontSize={11} fill="#64748b">
                  {n.message.length > 18 ? `${n.message.slice(0, 17)}…` : n.message}
                </text>
              </g>
            ))}
            {layout.stacks.map((s) => {
              const items = [
                ...s.badges.map((b) => ({ ...b, label: b.head ? `HEAD → ${b.label}` : b.label })),
                ...(s.headDetached ? [{ label: 'HEAD', color: '#e2e8f0', head: true }] : []),
              ]
              return items.map((b, i) => {
                const w = b.label.length * 7.5 + 20
                const y = s.y - 54 - i * 26
                return (
                  <g key={`${s.x}-${b.label}`}>
                    <rect
                      x={s.x - w / 2}
                      y={y}
                      width={w}
                      height={22}
                      rx={11}
                      fill={b.color}
                      stroke={b.head ? '#ffffff' : 'none'}
                      strokeWidth={2}
                    />
                    <text x={s.x} y={y + 15} textAnchor="middle" fontSize={12} fontWeight={600} fill="#0f172a">
                      {b.label}
                    </text>
                  </g>
                )
              })
            })}
          </svg>
        </main>
      </div>
    </div>
  )
}

export default App
