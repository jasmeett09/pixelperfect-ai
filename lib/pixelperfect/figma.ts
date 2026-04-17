import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { DesignTokens, FigmaComponent } from '@/lib/pixelperfect/types'
import { getFigmaAccessToken } from '@/lib/pixelperfect/figma-auth'
import { classifyComponent, createId, getDefaultTokens, toHexColor, writePreviewAsset } from '@/lib/pixelperfect/utils'

type FigmaApiNode = {
  id?: string
  name?: string
  type?: string
  fills?: Array<{ type?: string; color?: { r?: number; g?: number; b?: number; a?: number } }>
  strokes?: Array<{ type?: string; color?: { r?: number; g?: number; b?: number; a?: number } }>
  style?: {
    fontSize?: number
    fontWeight?: number
    lineHeightPx?: number
  }
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  cornerRadius?: number
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID'
  primaryAxisAlignItems?: string
  counterAxisAlignItems?: string
  itemSpacing?: number
  layoutWrap?: string
  effects?: Array<{
    type?: string
    visible?: boolean
    color?: { r?: number; g?: number; b?: number; a?: number }
    offset?: { x?: number; y?: number }
    radius?: number
    spread?: number
  }>
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  children?: FigmaApiNode[]
}

type FigmaImageResponse = {
  err?: string | null
  images?: Record<string, string>
}

type FigmaOembedResponse = {
  title?: string
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

function findFirstTextNode(node?: FigmaApiNode): FigmaApiNode | undefined {
  if (!node) {
    return undefined
  }

  if (node.type === 'TEXT') {
    return node
  }

  for (const child of node.children ?? []) {
    const result = findFirstTextNode(child)
    if (result) {
      return result
    }
  }

  return undefined
}

function firstSolidColor(
  paints?: Array<{ type?: string; color?: { r?: number; g?: number; b?: number; a?: number } }>
) {
  const paint = paints?.find((item) => item.type === 'SOLID' && item.color)
  return toHexColor(paint?.color)
}

function normalizeFigmaAxisAlignment(value?: string) {
  const map: Record<string, string> = {
    MIN: 'flex-start',
    CENTER: 'center',
    MAX: 'flex-end',
    SPACE_BETWEEN: 'space-between',
  }

  return value ? map[value] ?? value.toLowerCase() : undefined
}

function normalizeBoxShadow(node: FigmaApiNode) {
  const shadow = node.effects?.find((effect) => effect.visible !== false && effect.type === 'DROP_SHADOW')

  if (!shadow) {
    return undefined
  }

  const color = toHexColor(shadow.color) ?? '#000000'
  const alpha = shadow.color?.a ?? 1
  return `${Math.round(shadow.offset?.x ?? 0)}px ${Math.round(shadow.offset?.y ?? 0)}px ${Math.round(
    shadow.radius ?? 0
  )}px ${Math.round(shadow.spread ?? 0)}px ${color}${alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : ''}`
}

function normalizeNodeTokens(node: FigmaApiNode, componentType: FigmaComponent['componentType']): DesignTokens {
  const defaults = getDefaultTokens(componentType)
  const textNode = findFirstTextNode(node)

  return {
    backgroundColor: firstSolidColor(node.fills) ?? defaults.backgroundColor,
    textColor: firstSolidColor(textNode?.fills) ?? defaults.textColor,
    borderColor: firstSolidColor(node.strokes) ?? defaults.borderColor,
    fontSize: textNode?.style?.fontSize ?? defaults.fontSize,
    fontWeight: textNode?.style?.fontWeight ?? defaults.fontWeight,
    lineHeight: textNode?.style?.lineHeightPx ?? defaults.lineHeight,
    paddingX:
      node.paddingLeft !== undefined && node.paddingRight !== undefined
        ? Math.round((node.paddingLeft + node.paddingRight) / 2)
        : defaults.paddingX,
    paddingY:
      node.paddingTop !== undefined && node.paddingBottom !== undefined
        ? Math.round((node.paddingTop + node.paddingBottom) / 2)
        : defaults.paddingY,
    padding:
      node.paddingTop !== undefined ||
      node.paddingRight !== undefined ||
      node.paddingBottom !== undefined ||
      node.paddingLeft !== undefined
        ? `${node.paddingTop ?? 0}px ${node.paddingRight ?? 0}px ${node.paddingBottom ?? 0}px ${node.paddingLeft ?? 0}px`
        : undefined,
    borderRadius: node.cornerRadius ?? defaults.borderRadius,
    width: Math.round(node.absoluteBoundingBox?.width ?? defaults.width ?? 0),
    height: Math.round(node.absoluteBoundingBox?.height ?? defaults.height ?? 0),
    display: node.layoutMode && node.layoutMode !== 'NONE' ? node.layoutMode === 'GRID' ? 'grid' : 'flex' : defaults.display,
    flexDirection:
      node.layoutMode === 'HORIZONTAL' ? 'row' : node.layoutMode === 'VERTICAL' ? 'column' : defaults.flexDirection,
    justifyContent: normalizeFigmaAxisAlignment(node.primaryAxisAlignItems) ?? defaults.justifyContent,
    alignItems: normalizeFigmaAxisAlignment(node.counterAxisAlignItems) ?? defaults.alignItems,
    gridTemplateColumns: node.layoutMode === 'GRID' ? 'figma-grid' : defaults.gridTemplateColumns,
    gap: node.itemSpacing ?? defaults.gap,
    boxShadow: normalizeBoxShadow(node) ?? defaults.boxShadow,
  }
}

async function fetchFigmaJson(endpoint: string) {
  const token = getFigmaAccessToken({ mode: 'demo-server-token' })

  if (!token) {
    throw new Error('Figma import is not configured on the server. Ask the app owner to connect the deployment Figma token.')
  }

  const response = await fetch(`https://api.figma.com${endpoint}`, {
    headers: {
      'X-Figma-Token': token,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Figma request failed with ${response.status}`)
  }

  return response.json()
}

async function fetchFigmaImageUrl(fileKey: string, nodeId: string) {
  const payload = (await fetchFigmaJson(
    `/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2&use_absolute_bounds=true`
  )) as FigmaImageResponse

  return payload.images?.[nodeId] ?? payload.images?.[nodeId.replace(/:/g, '-')]
}

function buildFigmaEmbedUrl(fileKey: string, nodeId: string) {
  const url = `https://www.figma.com/design/${fileKey}/Imported?node-id=${nodeId.replace(/:/g, '-')}`
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`
}

function buildFigmaDesignUrl(fileKey: string, nodeId: string) {
  return `https://www.figma.com/design/${fileKey}/Imported?node-id=${nodeId.replace(/:/g, '-')}`
}

async function fetchPublicFigmaThumbnail(fileKey: string, nodeId: string) {
  const designUrl = buildFigmaDesignUrl(fileKey, nodeId)
  const response = await fetch(`https://www.figma.com/api/oembed?url=${encodeURIComponent(designUrl)}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return undefined
  }

  const payload = (await response.json()) as FigmaOembedResponse

  if (!payload.thumbnail_url) {
    return undefined
  }

  const imageResponse = await fetch(payload.thumbnail_url, {
    cache: 'no-store',
  })

  if (!imageResponse.ok) {
    return undefined
  }

  const contentType = imageResponse.headers.get('content-type') ?? ''

  if (!contentType.includes('image')) {
    return undefined
  }

  const outputDir = path.join(process.cwd(), 'public', 'generated', 'figma')
  await mkdir(outputDir, { recursive: true })
  const safeNodeId = nodeId.replace(/[^a-z0-9_-]/gi, '-')
  const filename = `figma-thumb-${fileKey}-${safeNodeId}-${Date.now()}.png`
  const buffer = Buffer.from(await imageResponse.arrayBuffer())
  await writeFile(path.join(outputDir, filename), buffer)

  return `/generated/figma/${filename}`
}

async function captureFigmaPreview(fileKey: string, nodeId: string) {
  const importer = new Function('return import("playwright")')
  const playwright = await importer().catch(() => null)

  if (!playwright?.chromium) {
    return undefined
  }

  const browser = await playwright.chromium.launch({ headless: true })

  try {
    const page = await browser.newPage({
      deviceScaleFactor: 2,
      viewport: { width: 1440, height: 1024 },
    })
    await page.goto(buildFigmaEmbedUrl(fileKey, nodeId), {
      waitUntil: 'domcontentloaded',
      timeout: 12000,
    })
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => undefined)
    await page.waitForFunction(
      () => {
        const text = document.body.innerText.toLowerCase()
        const hasCanvas = document.querySelectorAll('canvas, iframe').length > 0
        return hasCanvas && !text.includes('loading')
      },
      { timeout: 8000 }
    ).catch(() => undefined)
    await page.waitForTimeout(2500)

    const outputDir = path.join(process.cwd(), 'public', 'generated', 'figma')
    await mkdir(outputDir, { recursive: true })
    const safeNodeId = nodeId.replace(/[^a-z0-9_-]/gi, '-')
    const filename = `figma-${fileKey}-${safeNodeId}-${Date.now()}.png`
    const screenshot = (await page.screenshot({
      type: 'png',
      fullPage: false,
    })) as Buffer

    const useful = await screenshotLooksUseful(browser, screenshot)

    if (!useful) {
      return undefined
    }

    await writeFile(path.join(outputDir, filename), screenshot)

    return `/generated/figma/${filename}`
  } catch {
    return undefined
  } finally {
    await browser.close()
  }
}

async function screenshotLooksUseful(browser: { newPage: (options?: unknown) => Promise<{ evaluate: <T>(fn: (src: string) => T | Promise<T>, arg: string) => Promise<T>; close: () => Promise<void> }> }, screenshot: Buffer) {
  const page = await browser.newPage({
    viewport: { width: 320, height: 240 },
  })

  try {
    return await page.evaluate(async (src: string) => {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image()
        element.onload = () => resolve(element)
        element.onerror = () => reject(new Error('Image load failed'))
        element.src = src
      })
      const width = 120
      const height = 90
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { willReadFrequently: true })

      if (!context) {
        return false
      }

      context.drawImage(image, 0, 0, width, height)
      const data = context.getImageData(0, 0, width, height).data
      const colors = new Set<string>()
      let nonWhite = 0
      let nonDark = 0

      for (let index = 0; index < data.length; index += 4 * 12) {
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const isWhite = r > 244 && g > 244 && b > 244
        const isDark = r < 20 && g < 20 && b < 24

        if (!isWhite) {
          nonWhite += 1
        }

        if (!isDark) {
          nonDark += 1
        }

        colors.add(`${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`)
      }

      return colors.size >= 18 && nonWhite >= 60 && nonDark >= 60
    }, `data:image/png;base64,${screenshot.toString('base64')}`)
  } catch {
    return false
  } finally {
    await page.close()
  }
}

export async function fetchFigmaFileMeta(fileKey: string) {
  try {
    const payload = await fetchFigmaJson(`/v1/files/${fileKey}`)
    return {
      fileName: payload?.name as string | undefined,
      source: payload ? 'figma' : 'fallback',
    }
  } catch {
    return {
      fileName: undefined,
      source: 'unverified',
    }
  }
}

function buildFallbackNode(nodeId: string, index: number): FigmaApiNode {
  const componentNames = ['Button/Primary', 'Input/Default', 'Card/Insight']
  const name = componentNames[index % componentNames.length]
  const componentType = classifyComponent(name)
  const tokens = getDefaultTokens(componentType)

  return {
    id: nodeId,
    name,
    type: 'COMPONENT',
    fills: [
      {
        type: 'SOLID',
        color: {
          r: parseInt((tokens.backgroundColor ?? '#194390').slice(1, 3), 16) / 255,
          g: parseInt((tokens.backgroundColor ?? '#194390').slice(3, 5), 16) / 255,
          b: parseInt((tokens.backgroundColor ?? '#194390').slice(5, 7), 16) / 255,
        },
      },
    ],
    strokes: [
      {
        type: 'SOLID',
        color: {
          r: parseInt((tokens.borderColor ?? '#194390').slice(1, 3), 16) / 255,
          g: parseInt((tokens.borderColor ?? '#194390').slice(3, 5), 16) / 255,
          b: parseInt((tokens.borderColor ?? '#194390').slice(5, 7), 16) / 255,
        },
      },
    ],
    cornerRadius: tokens.borderRadius,
    paddingLeft: tokens.paddingX,
    paddingRight: tokens.paddingX,
    paddingTop: tokens.paddingY,
    paddingBottom: tokens.paddingY,
    absoluteBoundingBox: {
      x: 40,
      y: 40,
      width: tokens.width ?? 200,
      height: tokens.height ?? 60,
    },
    children: [
      {
        id: `${nodeId}-text`,
        type: 'TEXT',
        style: {
          fontSize: tokens.fontSize,
          fontWeight: tokens.fontWeight,
          lineHeightPx: tokens.lineHeight,
        },
        fills: [
          {
            type: 'SOLID',
            color: {
              r: parseInt((tokens.textColor ?? '#FFFFFF').slice(1, 3), 16) / 255,
              g: parseInt((tokens.textColor ?? '#FFFFFF').slice(3, 5), 16) / 255,
              b: parseInt((tokens.textColor ?? '#FFFFFF').slice(5, 7), 16) / 255,
            },
          },
        ],
      },
    ],
  }
}

export async function importFigmaComponents(fileKey: string, nodeIds: string[]) {
  let sourceNodes: FigmaApiNode[] = []
  let liveFigmaImport = true

  try {
    const payload = await fetchFigmaJson(`/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeIds.join(','))}`)
    sourceNodes = nodeIds
      .map((id) => payload?.nodes?.[id]?.document as FigmaApiNode | undefined)
      .filter((node): node is FigmaApiNode => Boolean(node))
  } catch {
    liveFigmaImport = false
    sourceNodes = []
  }

  if (sourceNodes.length === 0) {
    liveFigmaImport = false
    sourceNodes = nodeIds.map((nodeId, index) => buildFallbackNode(nodeId, index))
  }

  const components = await Promise.all(
    sourceNodes.map(async (node, index) => {
      const nodeId = (node.id ?? nodeIds[index] ?? `fallback:${index}`).replace(/-/g, ':')
      const name = node.name ?? `Component/${index + 1}`
      const componentType = classifyComponent(name)
      const tokens = normalizeNodeTokens(node, componentType)
      const previewUrl = liveFigmaImport ? await fetchFigmaImageUrl(fileKey, nodeId).catch(() => undefined) : undefined
      const preferFocusedCapture =
        componentType === 'Button' ||
        ((tokens.width ?? 0) <= 320 && (tokens.height ?? 0) <= 180)
      const capturedPreviewUrl = previewUrl
        ? undefined
        : await captureFigmaPreview(fileKey, nodeId).catch(() => undefined)
      const publicThumbnailUrl = previewUrl
        ? undefined
        : await fetchPublicFigmaThumbnail(fileKey, nodeId).catch(() => undefined)
      const visualPreviewUrl = previewUrl
        ? previewUrl
        : preferFocusedCapture
          ? capturedPreviewUrl ?? publicThumbnailUrl
          : publicThumbnailUrl ?? capturedPreviewUrl
      const fallbackPreviewUrl =
        visualPreviewUrl
          ? undefined
          : await writePreviewAsset(
              'figma',
              componentType,
              tokens,
              name,
              liveFigmaImport ? `Figma node ${nodeId}` : `Local fallback preview for ${nodeId}`
            ).catch(() => undefined)
      const resolvedPreviewUrl = visualPreviewUrl ?? fallbackPreviewUrl

      return {
        id: createId('figma'),
        fileKey,
        nodeId,
        name,
        type: node.type ?? 'COMPONENT',
        componentType,
        previewUrl: resolvedPreviewUrl,
        previewEmbedUrl: buildFigmaEmbedUrl(fileKey, nodeId),
        previewSource: previewUrl
          ? 'figma-image-api'
          : capturedPreviewUrl && resolvedPreviewUrl === capturedPreviewUrl
              ? 'figma-visual-capture'
            : publicThumbnailUrl && resolvedPreviewUrl === publicThumbnailUrl
              ? 'figma-public-thumbnail'
              : fallbackPreviewUrl
                ? 'fallback'
                : 'figma-embed',
        tokens,
        rawNode: node,
        updatedAt: new Date().toISOString(),
      } satisfies FigmaComponent
    })
  )

  return components
}
