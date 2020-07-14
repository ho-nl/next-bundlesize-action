declare namespace NodeJS {
  export interface ProcessEnv {
    CI: 'true'
    HOME: string
    GITHUB_WORKFLOW: string
    GITHUB_RUN_ID: string
    GITHUB_RUN_NUMBER: string
    GITHUB_ACTION: string
    GITHUB_ACTIONS: string
    GITHUB_ACTOR: string
    GITHUB_REPOSITORY: string
    GITHUB_EVENT_NAME: string
    GITHUB_EVENT_PATH: string
    GITHUB_WORKSPACE: string
    GITHUB_SHA: string
    GITHUB_REF: string
    GITHUB_HEAD_REF: string
    GITHUB_BASE_REF: string
  }
}

declare module 'node-shell-parser'
declare module 'as-table'
