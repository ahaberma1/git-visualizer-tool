export interface Commit {
  id: string
  message: string
  parents: string[]
  branch: string
  timestamp: number
}

export interface Branch {
  name: string
  commitId: string
  color: string
}

export type Head =
  | { type: 'branch'; name: string }
  | { type: 'commit'; id: string }

export interface GitState {
  commits: Commit[]
  branches: Branch[]
  head: Head
  log: string[]
}
