import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { DesignTokens, SupportedComponentType } from '@/lib/pixelperfect/types'

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'generated')

export function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

export function normalizeNodeId(nodeId?: string | null) {
  if (!nodeId) {
    return undefined
  }

  return nodeId.replace(/-/g, ':')
}

export function parseFigmaUrl(figmaUrl: string) {
  try {
    const parsed = new URL(figmaUrl)
    const segments = parsed.pathname.split('/').filter(Boolean)
    const fileKeyIndex = segments.findIndex((segment) =>
      ['file', 'design', 'proto'].includes(segment)
    )

    if (fileKeyIndex === -1 || !segments[fileKeyIndex + 1]) {
      return null
    }

    return {
      fileKey: segments[fileKeyIndex + 1],
      nodeId: normalizeNodeId(parsed.searchParams.get('node-id')),
    }
  } catch {
    return null
  }
}

export function classifyComponent(name: string) {
  const normalized = name.toLowerCase()

  if (normalized.includes('input')) {
    return 'Input' as const
  }

  if (normalized.includes('card')) {
    return 'Card' as const
  }

  return 'Button' as const
}

export function getDefaultTokens(componentType: SupportedComponentType): DesignTokens {
  switch (componentType) {
    case 'Input':
      return {
        backgroundColor: '#111827',
        textColor: '#E5E7EB',
        borderColor: '#334155',
        fontSize: 15,
        fontWeight: 500,
        lineHeight: 22,
        paddingX: 14,
        paddingY: 12,
        borderRadius: 10,
        width: 320,
        height: 48,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 8,
      }
    case 'Card':
      return {
        backgroundColor: '#101828',
        textColor: '#F8FAFC',
        borderColor: '#1E293B',
        fontSize: 18,
        fontWeight: 600,
        lineHeight: 28,
        paddingX: 24,
        paddingY: 20,
        borderRadius: 20,
        width: 360,
        height: 220,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 16,
      }
    case 'Button':
    default:
      return {
        backgroundColor: '#194390',
        textColor: '#FFFFFF',
        borderColor: '#194390',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 24,
        paddingX: 16,
        paddingY: 12,
        borderRadius: 8,
        width: 156,
        height: 48,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
      }
  }
}

function renderComponentPreview(
  componentType: SupportedComponentType,
  tokens: DesignTokens,
  title: string,
  subtitle: string
) {
  const backgroundColor = tokens.backgroundColor ?? '#194390'
  const textColor = tokens.textColor ?? '#FFFFFF'
  const borderColor = tokens.borderColor ?? backgroundColor
  const borderRadius = tokens.borderRadius ?? 12

  let content = ''

  if (componentType === 'Input') {
    content = `
      <rect x="74" y="108" width="332" height="64" rx="${borderRadius}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2" />
      <text x="98" y="146" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" opacity="0.72">Search documentation</text>
    `
  } else if (componentType === 'Card') {
    content = `
      <rect x="56" y="84" width="368" height="210" rx="${borderRadius}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2" />
      <text x="88" y="134" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${textColor}">Pixel drift detected</text>
      <text x="88" y="170" font-family="Arial, sans-serif" font-size="15" fill="${textColor}" opacity="0.72">Button radius is 2px off the Figma source.</text>
      <rect x="88" y="210" width="128" height="40" rx="12" fill="${borderColor}" opacity="0.9" />
      <text x="128" y="235" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#ffffff">Fix now</text>
    `
  } else {
    content = `
      <rect x="138" y="108" width="204" height="68" rx="${borderRadius}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2" />
      <text x="192" y="149" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="${textColor}">Compare screens</text>
    `
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#07111f" />
          <stop offset="100%" stop-color="#101c2f" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="24" fill="url(#bg)" />
      <rect x="24" y="24" width="432" height="272" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(148,163,184,0.18)" />
      <text x="40" y="58" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#F8FAFC">${title}</text>
      <text x="40" y="82" font-family="Arial, sans-serif" font-size="12" fill="#94A3B8">${subtitle}</text>
      ${content}
    </svg>
  `
}

export async function writePreviewAsset(
  kind: 'figma' | 'implementation',
  componentType: SupportedComponentType,
  tokens: DesignTokens,
  title: string,
  subtitle: string
) {
  const directory = path.join(PUBLIC_DIR, kind)
  await mkdir(directory, { recursive: true })

  const filename = `${kind}-${componentType.toLowerCase()}-${Date.now()}.svg`
  const assetPath = path.join(directory, filename)
  const svg = renderComponentPreview(componentType, tokens, title, subtitle)
  await writeFile(assetPath, svg, 'utf8')

  return `/generated/${kind}/${filename}`
}

export function toHexColor(
  color?: { r?: number; g?: number; b?: number; a?: number } | null
) {
  if (!color) {
    return undefined
  }

  const channel = (value?: number) =>
    Math.max(0, Math.min(255, Math.round((value ?? 0) * 255)))
      .toString(16)
      .padStart(2, '0')

  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`.toUpperCase()
}

export function inferImplementationTokensFromUrl(
  url: string,
  componentType: SupportedComponentType
) {
  const tokens = { ...getDefaultTokens(componentType) }

  if (url.includes('beta') || url.includes('staging')) {
    tokens.backgroundColor = componentType === 'Button' ? '#1A4580' : tokens.backgroundColor
    tokens.borderRadius = (tokens.borderRadius ?? 8) + 2
  }

  if (url.includes('mobile')) {
    tokens.paddingX = Math.max(8, (tokens.paddingX ?? 16) - 4)
  }

  return tokens
}
