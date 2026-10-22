import { BRANCH_COLORS, createInitialState } from './gitReducer'
import type { Commit, GitState } from './types'

const c = (
  id: string,
  message: string,
  parents: string[],
  branch: string,
  timestamp: number,
): Commit => ({ id, message, parents, branch, timestamp })

export interface Preset {
  name: string
  build: () => GitState
}

export const presets: Preset[] = [
  {
    name: 'Empty Repo',
    build: createInitialState,
  },
  {
    name: 'Feature Branch',
    build: () => ({
      commits: [
        c('a1b2c3d', 'Initial commit', [], 'main', 1),
        c('e4f5a6b', 'Add README', ['a1b2c3d'], 'main', 2),
        c('c7d8e9f', 'Start feature', ['e4f5a6b'], 'feature', 3),
        c('1a2b3c4', 'Finish feature', ['c7d8e9f'], 'feature', 4),
      ],
      branches: [
        { name: 'main', commitId: 'e4f5a6b', color: BRANCH_COLORS[0] },
        { name: 'feature', commitId: '1a2b3c4', color: BRANCH_COLORS[1] },
      ],
      head: { type: 'branch', name: 'feature' },
      log: ['$ git init', '$ git checkout -b feature', '# preset: Feature Branch'],
    }),
  },
  {
    name: 'Merge Conflict',
    build: () => ({
      commits: [
        c('a1b2c3d', 'Initial commit', [], 'main', 1),
        c('b2c3d4e', 'Edit config on main', ['a1b2c3d'], 'main', 2),
        c('d4e5f6a', 'Edit config on fix', ['a1b2c3d'], 'fix', 3),
        c('f6a7b8c', 'Merge fix into main', ['b2c3d4e', 'd4e5f6a'], 'main', 4),
      ],
      branches: [
        { name: 'main', commitId: 'f6a7b8c', color: BRANCH_COLORS[0] },
        { name: 'fix', commitId: 'd4e5f6a', color: BRANCH_COLORS[1] },
      ],
      head: { type: 'branch', name: 'main' },
      log: ['$ git init', '$ git merge fix', '# preset: Merge Conflict'],
    }),
  },
]
