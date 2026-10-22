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

export interface GitState {
  commits: Commit[]
  branches: Branch[]
  head: string
}
