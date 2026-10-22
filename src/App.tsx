import { GitBranch, GitCommit, GitMerge } from 'lucide-react'
import type { GitState } from './types'

const initialState: GitState = {
  head: 'main',
  commits: [
    { id: 'a1b2c3d', message: 'Initial commit', parents: [], branch: 'main', timestamp: 1 },
    { id: 'e4f5a6b', message: 'Add README', parents: ['a1b2c3d'], branch: 'main', timestamp: 2 },
    { id: 'c7d8e9f', message: 'Start feature', parents: ['e4f5a6b'], branch: 'feature', timestamp: 3 },
  ],
  branches: [
    { name: 'main', commitId: 'e4f5a6b', color: '#38bdf8' },
    { name: 'feature', commitId: 'c7d8e9f', color: '#f472b6' },
  ],
}

const presets = ['Empty Repo', 'Feature Branch', 'Merge Conflict']

const logLines = [
  '$ git init',
  '$ git commit -m "Initial commit"',
  '$ git commit -m "Add README"',
  '$ git branch feature',
  '$ git checkout feature',
  '$ git commit -m "Start feature"',
]

const X_START = 100
const X_STEP = 180
const ROW_Y: Record<string, number> = { main: 120, feature: 240 }

function App() {
  const state = initialState
  const colorOf = (name: string) =>
    state.branches.find((b) => b.name === name)?.color ?? '#94a3b8'
  const positions = new Map(
    state.commits.map((c, i) => [
      c.id,
      { x: X_START + i * X_STEP, y: ROW_Y[c.branch] ?? 120 },
    ]),
  )

  const inputCls =
    'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none'
  const btnCls =
    'flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500'
  const headingCls = 'text-xs font-semibold uppercase tracking-wider text-slate-400'

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
              key={p}
              type="button"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col gap-5 border-r border-slate-800 bg-slate-900/60 p-4">
          <section className="space-y-2">
            <h2 className={headingCls}>Commit</h2>
            <input className={inputCls} placeholder="Commit message" />
            <button type="button" className={btnCls}>
              <GitCommit className="h-4 w-4" /> Commit
            </button>
          </section>

          <section className="space-y-2">
            <h2 className={headingCls}>Branch</h2>
            <input className={inputCls} placeholder="New branch name" />
            <button type="button" className={btnCls}>
              <GitBranch className="h-4 w-4" /> Create Branch
            </button>
          </section>

          <section className="space-y-2">
            <h2 className={headingCls}>Checkout</h2>
            <select className={inputCls} defaultValue={state.head}>
              {state.branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
            <button type="button" className={btnCls}>
              Checkout
            </button>
          </section>

          <section className="flex min-h-0 flex-1 flex-col gap-2">
            <h2 className={headingCls}>Terminal</h2>
            <div className="flex-1 overflow-y-auto rounded-md border border-slate-800 bg-black p-3 font-mono text-xs leading-5 text-emerald-400">
              {logLines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </section>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-slate-950">
          <svg className="h-full w-full" viewBox="0 0 700 360" preserveAspectRatio="xMidYMid meet">
            {state.commits.flatMap((c) =>
              c.parents.map((pid) => {
                const from = positions.get(pid)!
                const to = positions.get(c.id)!
                return (
                  <line
                    key={`${pid}-${c.id}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={colorOf(c.branch)}
                    strokeWidth={3}
                  />
                )
              }),
            )}
            {state.commits.map((c) => {
              const { x, y } = positions.get(c.id)!
              return (
                <g key={c.id}>
                  <circle cx={x} cy={y} r={16} fill="#0f172a" stroke={colorOf(c.branch)} strokeWidth={3} />
                  <text x={x} y={y + 38} textAnchor="middle" fontSize={12} fill="#cbd5e1" fontFamily="monospace">
                    {c.id}
                  </text>
                  <text x={x} y={y + 54} textAnchor="middle" fontSize={11} fill="#64748b">
                    {c.message}
                  </text>
                </g>
              )
            })}
            {state.branches.map((b) => {
              const { x, y } = positions.get(b.commitId)!
              const w = b.name.length * 8 + 20
              return (
                <g key={b.name}>
                  <rect x={x - w / 2} y={y - 54} width={w} height={22} rx={11} fill={b.color} />
                  <text x={x} y={y - 39} textAnchor="middle" fontSize={12} fontWeight={600} fill="#0f172a">
                    {b.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </main>
      </div>
    </div>
  )
}

export default App
