type FigmaAuthContext = {
  mode?: 'demo-server-token' | 'oauth-user-token'
  userId?: string
}

export function getFigmaAccessToken(_context: FigmaAuthContext = {}) {
  return process.env.FIGMA_ACCESS_TOKEN
}

export function isFigmaConfigured() {
  return Boolean(getFigmaAccessToken())
}

export function getFigmaAuthMode() {
  return 'demo-server-token' as const
}

