export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type SupportedComponentType = 'Button' | 'Input' | 'Card'

export type DesignTokens = {
  backgroundColor?: string
  directBackgroundColor?: string
  textColor?: string
  borderColor?: string
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  padding?: string
  paddingX?: number
  paddingY?: number
  margin?: string | number
  borderRadius?: number
  width?: number
  height?: number
  display?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  gridTemplateColumns?: string
  gap?: number
  boxShadow?: string
}

export type ConnectedFile = {
  id: string
  fileKey: string
  nodeId?: string
  figmaUrl: string
  fileName?: string
  webhookId?: string
  lastSyncedAt?: string
  createdAt: string
}

export type FigmaComponent = {
  id: string
  fileKey: string
  nodeId: string
  name: string
  type: string
  componentType: SupportedComponentType
  previewUrl?: string
  previewEmbedUrl?: string
  previewSource?: 'figma-image-api' | 'figma-public-thumbnail' | 'figma-visual-capture' | 'figma-embed' | 'fallback'
  tokens: DesignTokens
  rawNode?: unknown
  updatedAt: string
}

export type CodeComponentMapping = {
  id: string
  figmaNodeId: string
  figmaName: string
  codeComponentName: string
  codePath?: string
  variant?: string
  updatedAt: string
}

export type ImplementationSnapshot = {
  id: string
  source: 'live-url' | 'upload'
  componentType: SupportedComponentType
  url?: string
  imageUrl: string
  captureBounds?: { x: number; y: number; width: number; height: number }
  pageTitle?: string
  capturedAt: string
  tokens: DesignTokens
  elements?: ImplementationElement[]
  textContent?: string
}

export type ImplementationElement = {
  id: string
  selector: string
  label?: string
  role: 'button' | 'link' | 'input' | 'card' | 'nav' | 'text' | 'container' | 'image' | 'table' | 'badge' | 'search'
  tokens: DesignTokens
  colorSamples?: string[]
  coordinates: { x: number; y: number; width: number; height: number }
}

export type SyncMismatch = {
  field: keyof DesignTokens | string
  figma: string | number | null
  code: string | number | null
  severity: Severity
  reason: string
  rootCause: string
  suggestedFix?: string
  suggestedCssFix?: string
  suggestedTailwindFix?: string
  coordinates?: { x: number; y: number; width: number; height: number }
  reviewStatus?: 'correct' | 'partial' | 'incorrect'
  verification?: 'verified' | 'not_verified'
  colorAudit?: {
    expectedFigmaHex?: string
    observedAppearance: string
    implementationHex: string
    suggestedFixHex?: string
    implementationHexSource: 'computed-style' | 'css-source' | 'pixel-sample' | 'not_verified'
  }
}

export type SyncReviewSummary = {
  correct: string[]
  incorrect: string[]
  corrected: string[]
  accuracyScore: number
}

export type SyncResult = {
  id: string
  fileKey: string
  figmaNodeId: string
  componentName: string
  componentType: SupportedComponentType
  status: 'synced' | 'drifted'
  mismatchCount: number
  figmaPreviewUrl?: string
  implementationPreviewUrl?: string
  mismatches: SyncMismatch[]
  reviewSummary?: SyncReviewSummary
  comparedAt: string
}

export type PixelPerfectStore = {
  connectedFiles: ConnectedFile[]
  figmaComponents: FigmaComponent[]
  mappings: CodeComponentMapping[]
  implementationSnapshots: ImplementationSnapshot[]
  syncResults: SyncResult[]
}
