# Git Visualizer & Branch Simulator - Technical Spec

## 1. Goal
A client-side interactive web app where users can run or simulate Git commands (`commit`, `branch`, `checkout`, `merge`, `rebase`) and see an SVG graph dynamically update with commits, branch pointers, and HEAD status.

## 2. Tech Stack
- Framework: React (TypeScript) + Vite
- Styling: Tailwind CSS v4 (Dark mode default, modern developer aesthetic)
- Icons: Lucide React (`lucide-react`)
- State Management: React useState / useReducer (client-side only, zero backend)

## 3. Core Data Models

```typescript
export interface Commit {
  id: string;              // 7-char short hash (e.g. "a1b2c3d")
  message: string;
  parents: string[];       // Parent commit IDs (empty for root, 2 for merge)
  branch: string;          // Originating branch name
  timestamp: number;
}

export interface Branch {
  name: string;
  commitId: string;        // The commit hash this branch points to
  color: string;           // Hex or Tailwind color token for rendering lines/nodes
}

export interface GitState {
  commits: Record<string, Commit>;
  branches: Record<string, Branch>;
  headBranch: string;      // Current active branch name (or null if detached HEAD)
  headCommitId: string;    // Current active commit hash
}