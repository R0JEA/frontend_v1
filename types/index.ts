export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  format: OutputFormat
  timestamp: Date
  filename?: string
}

export type OutputFormat = 'pytest' | 'unittest'

export interface GenerateRequest {
  code: string
  format: OutputFormat
  model: string
  testMode?: boolean
}

export interface GenerateResponse {
  tests: string
  model?: string
  tokens_used?: number
}

export interface AuthCheckResponse {
  authenticated: boolean
  username?: string
}
