import { headCommitId } from './gitReducer'
import type { GitState } from './types'

export const X_STEP = 140
export const X_START = 80
export const MAIN_Y = 150
export const LANE_STEP = 80

export interface Node {
  id: string
  message: string
  x: number
  y: number
  color: string
}

export interface Edge {
  key: string
  d: string
  color: string
}

export interface BadgeStack {
  x: number
  y: number
  badges: { label: string; color: string; head: boolean }[]
  headDetached: boolean
}

export interface Layout {
  nodes: Node[]
  edges: Edge[]
  stacks: BadgeStack[]
  width: number
  height: number
}

export function computeLayout(state: GitState): Layout {
  // Lane order follows branch creation order; main is always lane 0.
  const lanes = new Map(state.branches.map((b, i) => [b.name, i]))
  const colorOf = (name: string) => state.branches.find((b) => b.name === name)?.color ?? '#94a3b8'

  const nodes = new Map<string, Node>()
  state.commits.forEach((commit, i) => {
    const lane = lanes.get(commit.branch) ?? 0
    nodes.set(commit.id, {
      id: commit.id,
      message: commit.message,
      x: i * X_STEP + X_START,
      y: MAIN_Y + lane * LANE_STEP,
      color: colorOf(commit.branch),
    })
  })

  const edges: Edge[] = state.commits.flatMap((commit) =>
    commit.parents.flatMap((pid) => {
      const from = nodes.get(pid)
      const to = nodes.get(commit.id)!
      if (!from) return []
      const mx = (from.x + to.x) / 2
      return [
        {
          key: `${pid}-${commit.id}`,
          d: `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`,
          color: to.color,
        },
      ]
    }),
  )

  const headId = headCommitId(state)
  const headBranch = state.head.type === 'branch' ? state.head.name : null
  const stacks = new Map<string, BadgeStack>()
  const stackFor = (id: string) => {
    const n = nodes.get(id)!
    let s = stacks.get(id)
    if (!s) {
      s = { x: n.x, y: n.y, badges: [], headDetached: false }
      stacks.set(id, s)
    }
    return s
  }
  state.branches.forEach((b) =>
    stackFor(b.commitId).badges.push({ label: b.name, color: b.color, head: b.name === headBranch }),
  )
  if (!headBranch) stackFor(headId).headDetached = true

  const all = [...nodes.values()]
  return {
    nodes: all,
    edges,
    stacks: [...stacks.values()],
    width: Math.max(700, Math.max(...all.map((n) => n.x)) + X_START),
    height: Math.max(360, Math.max(...all.map((n) => n.y)) + 120),
  }
}
