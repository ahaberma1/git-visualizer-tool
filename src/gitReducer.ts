import type { Branch, Commit, GitState } from './types'

export const BRANCH_COLORS = [
  '#38bdf8',
  '#f472b6',
  '#a3e635',
  '#fbbf24',
  '#c084fc',
  '#fb7185',
  '#2dd4bf',
  '#fb923c',
]

export const createInitialState = (): GitState => ({
  commits: [
    { id: 'a1b2c3d', message: 'Initial commit', parents: [], branch: 'main', timestamp: 1 },
  ],
  branches: [{ name: 'main', commitId: 'a1b2c3d', color: BRANCH_COLORS[0] }],
  head: { type: 'branch', name: 'main' },
  log: ['$ git init'],
})

export const randomId = (): string =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

export type Action =
  | { type: 'commit'; message: string; id: string; timestamp: number }
  | { type: 'branch'; name: string }
  | { type: 'checkout'; target: string }
  | { type: 'load'; state: GitState }

export function headCommitId(state: GitState): string {
  return state.head.type === 'commit'
    ? state.head.id
    : state.branches.find((b) => b.name === (state.head as { name: string }).name)!.commitId
}

export function reducer(state: GitState, action: Action): GitState {
  switch (action.type) {
    case 'commit': {
      const message = action.message.trim()
      if (!message || state.commits.some((c) => c.id === action.id)) return state
      const parentId = headCommitId(state)
      const parent = state.commits.find((c) => c.id === parentId)!
      const onBranch = state.head.type === 'branch' ? state.head.name : null
      const commit: Commit = {
        id: action.id,
        message,
        parents: [parentId],
        branch: onBranch ?? parent.branch,
        timestamp: action.timestamp,
      }
      return {
        ...state,
        commits: [...state.commits, commit],
        branches: onBranch
          ? state.branches.map((b) => (b.name === onBranch ? { ...b, commitId: commit.id } : b))
          : state.branches,
        head: onBranch ? state.head : { type: 'commit', id: commit.id },
        log: [...state.log, `$ git commit -m "${message}"`],
      }
    }
    case 'branch': {
      const name = action.name.trim()
      if (!name || /\s/.test(name) || state.branches.some((b) => b.name === name)) return state
      const branch: Branch = {
        name,
        commitId: headCommitId(state),
        color: BRANCH_COLORS[state.branches.length % BRANCH_COLORS.length],
      }
      return {
        ...state,
        branches: [...state.branches, branch],
        log: [...state.log, `$ git branch ${name}`],
      }
    }
    case 'checkout': {
      const { target } = action
      if (state.branches.some((b) => b.name === target)) {
        return {
          ...state,
          head: { type: 'branch', name: target },
          log: [...state.log, `$ git checkout ${target}`],
        }
      }
      if (state.commits.some((c) => c.id === target)) {
        return {
          ...state,
          head: { type: 'commit', id: target },
          log: [...state.log, `$ git checkout ${target}`, 'HEAD is now in detached state'],
        }
      }
      return state
    }
    case 'load':
      return action.state
  }
}
