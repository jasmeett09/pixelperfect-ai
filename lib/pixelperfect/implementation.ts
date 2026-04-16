import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { DesignTokens, ImplementationElement, ImplementationSnapshot, SupportedComponentType } from '@/lib/pixelperfect/types'
import { createId, getDefaultTokens } from '@/lib/pixelperfect/utils'

async function captureWithPlaywright(url: string, componentType: SupportedComponentType) {
  const importer = new Function('return import("playwright")')
  const playwright = await importer().catch(() => null)

  if (!playwright?.chromium) {
    throw new Error('Playwright is not installed. Run npm install playwright and install a Chromium browser for live captures.')
  }

  const browser = await playwright.chromium.launch({ headless: true })

  try {
    const page = await browser.newPage({
      deviceScaleFactor: 2,
      viewport: { width: 1440, height: 1024 },
    })
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addStyleTag({
      content: `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; caret-color: transparent !important; }`,
    }).catch(() => undefined)
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images)
          .filter((image) => !image.complete)
          .map(
            (image) =>
              new Promise<void>((resolve) => {
                image.addEventListener('load', () => resolve(), { once: true })
                image.addEventListener('error', () => resolve(), { once: true })
              })
          )
      )

      await document.fonts?.ready
    }).catch(() => undefined)

    const pageTitle = await page.title()
    const { tokens, elements, textContent, surfaceBounds } = await page.evaluate((targetType: SupportedComponentType) => {
      const selectorMap: Record<SupportedComponentType, string[]> = {
        Button: ['button', '[role="button"]', 'a[href]', '[data-component="button"]'],
        Input: ['input', 'textarea', '[contenteditable="true"]', '[data-component="input"]'],
        Card: ['[data-component="card"]', 'article', 'section', '.card', 'main'],
      }

      const parseCssColor = (value: string) => {
        if (!value || value === 'transparent') {
          return null
        }

        const numbers = value.match(/[\d.]+/g)?.map(Number)

        if (!numbers || numbers.length < 3) {
          return null
        }

        return {
          r: numbers[0],
          g: numbers[1],
          b: numbers[2],
          a: numbers[3] ?? 1,
        }
      }

      const colorToCss = (color: { r: number; g: number; b: number; a: number }) => {
        const r = Math.round(Math.max(0, Math.min(255, color.r)))
        const g = Math.round(Math.max(0, Math.min(255, color.g)))
        const b = Math.round(Math.max(0, Math.min(255, color.b)))
        const a = Math.max(0, Math.min(1, color.a))

        return a >= 0.995 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`
      }

      const blend = (
        foreground: { r: number; g: number; b: number; a: number },
        background: { r: number; g: number; b: number; a: number }
      ) => {
        const alpha = foreground.a + background.a * (1 - foreground.a)

        if (alpha <= 0) {
          return { r: 0, g: 0, b: 0, a: 0 }
        }

        return {
          r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
          g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
          b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
          a: alpha,
        }
      }

      const firstGradientColor = (backgroundImage: string) => {
        if (!backgroundImage || backgroundImage === 'none') {
          return null
        }

        const rgbMatch = backgroundImage.match(/rgba?\([^)]+\)/)

        if (rgbMatch) {
          return parseCssColor(rgbMatch[0])
        }

        const hexMatch = backgroundImage.match(/#[0-9a-fA-F]{3,8}/)

        if (!hexMatch) {
          return null
        }

        const hex = hexMatch[0].replace('#', '')
        const expanded =
          hex.length === 3
            ? hex
                .split('')
                .map((char) => `${char}${char}`)
                .join('')
            : hex

        return {
          r: parseInt(expanded.slice(0, 2), 16),
          g: parseInt(expanded.slice(2, 4), 16),
          b: parseInt(expanded.slice(4, 6), 16),
          a: expanded.length >= 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1,
        }
      }

      const effectiveBackgroundColor = (target: HTMLElement) => {
        let current: HTMLElement | null = target
        let color = { r: 255, g: 255, b: 255, a: 1 }
        const chain: HTMLElement[] = []

        while (current) {
          chain.unshift(current)
          current = current.parentElement
        }

        for (const element of chain) {
          const style = window.getComputedStyle(element)
          const imageColor = firstGradientColor(style.backgroundImage)
          const backgroundColor = imageColor ?? parseCssColor(style.backgroundColor)

          if (backgroundColor && backgroundColor.a > 0) {
            color = blend(backgroundColor, color)
          }
        }

        return colorToCss(color)
      }

      const collectColorSamples = (target: HTMLElement) => {
        const samples = new Set<string>()
        const nodes = [target, ...Array.from(target.querySelectorAll('*')).slice(0, 24)] as HTMLElement[]

        for (const node of nodes) {
          const style = window.getComputedStyle(node)
          const textColor = parseCssColor(style.color)
          const background = firstGradientColor(style.backgroundImage) ?? parseCssColor(style.backgroundColor)

          if (textColor && textColor.a > 0) {
            samples.add(colorToCss(textColor))
          }

          if (background && background.a > 0) {
            samples.add(colorToCss(background))
          }
        }

        return Array.from(samples).slice(0, 8)
      }

      const readTokens = (target: HTMLElement) => {
        const style = window.getComputedStyle(target)
        const rect = target.getBoundingClientRect()
        const paddingX = (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) / 2
        const paddingY = (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)) / 2
        const gap = parseFloat(style.gap || style.columnGap || style.rowGap)
        const fontSize = parseFloat(style.fontSize)
        const fontWeight = Number(style.fontWeight)
        const lineHeight = parseFloat(style.lineHeight)
        const borderRadius = parseFloat(style.borderRadius)

        return {
          tokens: {
            backgroundColor: effectiveBackgroundColor(target),
            directBackgroundColor: style.backgroundColor,
            textColor: style.color,
            borderColor: style.borderColor,
            fontSize: Number.isFinite(fontSize) ? fontSize : undefined,
            fontWeight: Number.isFinite(fontWeight) ? fontWeight : undefined,
            fontFamily: style.fontFamily,
            lineHeight: Number.isFinite(lineHeight) ? lineHeight : undefined,
            padding: style.padding,
            paddingX: Number.isFinite(paddingX) ? Math.round(paddingX) : undefined,
            paddingY: Number.isFinite(paddingY) ? Math.round(paddingY) : undefined,
            margin: style.margin,
            borderRadius: Number.isFinite(borderRadius) ? borderRadius : undefined,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            display: style.display,
            flexDirection: style.flexDirection,
            justifyContent: style.justifyContent,
            alignItems: style.alignItems,
            gridTemplateColumns: style.gridTemplateColumns,
            gap: Number.isFinite(gap) ? Math.round(gap) : undefined,
            boxShadow: style.boxShadow === 'none' ? undefined : style.boxShadow,
          } satisfies DesignTokens,
          coordinates: {
            x: Math.max(0, Math.round(rect.x + window.scrollX)),
            y: Math.max(0, Math.round(rect.y + window.scrollY)),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        }
      }

      const firstVisible = (selectors: string[]) => {
        for (const selector of selectors) {
          const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
          const visible = elements.find((element) => {
            const rect = element.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0
          })

          if (visible) {
            return visible
          }
        }

        return (document.querySelector('main') as HTMLElement | null) ?? document.body
      }

      const target = firstVisible(selectorMap[targetType])
      const primary = readTokens(target)
      const readSurfaceBounds = () => {
        const candidates = Array.from(
          document.querySelectorAll('[data-design-root], [data-app-root], main, #root > *, #__next > *, body > div, body')
        ) as HTMLElement[]
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const visible = candidates
          .map((element) => {
            const rect = element.getBoundingClientRect()
            const style = window.getComputedStyle(element)
            const area = rect.width * rect.height

            return {
              element,
              rect,
              area,
              background: style.backgroundColor,
            }
          })
          .filter(({ rect, area }) => rect.width >= 280 && rect.height >= 220 && area > 0)
          .sort((a, b) => {
            const aLooksLikePage = a.rect.width <= viewportWidth + 8 && a.rect.height >= viewportHeight * 0.5
            const bLooksLikePage = b.rect.width <= viewportWidth + 8 && b.rect.height >= viewportHeight * 0.5

            if (aLooksLikePage !== bLooksLikePage) {
              return Number(bLooksLikePage) - Number(aLooksLikePage)
            }

            return b.area - a.area
          })

        const chosen = visible[0]?.rect ?? document.body.getBoundingClientRect()
        const padding = 0
        const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
        const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
        const x = Math.max(0, Math.floor(chosen.x + window.scrollX - padding))
        const y = Math.max(0, Math.floor(chosen.y + window.scrollY - padding))
        const width = Math.min(documentWidth - x, Math.ceil(chosen.width + padding * 2))
        const height = Math.min(documentHeight - y, Math.ceil(chosen.height + padding * 2))

        return {
          x,
          y,
          width: Math.max(1, width),
          height: Math.max(1, height),
        }
      }
      const surfaceBounds = readSurfaceBounds()
      const candidates = Array.from(
        document.querySelectorAll(
          'nav, header, aside, main, section, article, table, thead, tbody, tr, th, td, h1, h2, h3, h4, h5, h6, p, span, img, button, [role="button"], a[href], input, textarea, [data-component], [class*="status" i], [class*="badge" i], [class*="pill" i], [class*="search" i], [class*="avatar" i]'
        )
      ) as HTMLElement[]
      const elements = candidates
        .map((element, index) => {
          const rect = element.getBoundingClientRect()

          if (rect.width < 8 || rect.height < 8) {
            return null
          }

          const tag = element.tagName.toLowerCase()
          const roleAttribute = element.getAttribute('role')
          const className = String(element.getAttribute('class') ?? '')
          const loweredClassName = className.toLowerCase()
          const role =
            tag === 'img'
              ? 'image'
              : tag === 'table' || tag === 'th' || tag === 'td' || tag === 'tr'
                ? 'table'
                : loweredClassName.includes('status') || loweredClassName.includes('badge') || loweredClassName.includes('pill')
                  ? 'badge'
                  : loweredClassName.includes('search')
                    ? 'search'
                    : tag === 'button' || roleAttribute === 'button'
                      ? 'button'
                      : tag === 'a'
                        ? 'link'
                        : tag === 'input' || tag === 'textarea'
                          ? 'input'
                          : tag === 'nav'
                            ? 'nav'
                            : tag === 'header' || tag === 'aside' || tag === 'main' || tag === 'section'
                              ? 'container'
                              : /^h[1-6]$/.test(tag) || tag === 'p' || tag === 'span'
                                ? 'text'
                                : 'card'
          const data = readTokens(element)
          const label =
            element.getAttribute('aria-label') ||
            element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 48) ||
            element.getAttribute('href') ||
            tag

          return {
            id: `${tag}-${index}`,
            selector: tag,
            label,
            role,
            tokens: data.tokens,
            colorSamples: collectColorSamples(element),
            coordinates: data.coordinates,
          }
        })
        .filter(Boolean)
        .slice(0, 90)

      return {
        tokens: primary.tokens,
        elements,
        textContent: document.body.innerText.replace(/\s+/g, ' ').trim(),
        surfaceBounds,
      }
    }, componentType)

    const safeClip = {
      x: Math.max(0, Math.floor(surfaceBounds.x)),
      y: Math.max(0, Math.floor(surfaceBounds.y)),
      width: Math.max(1, Math.ceil(surfaceBounds.width)),
      height: Math.max(1, Math.ceil(surfaceBounds.height)),
    }
    const screenshot = (await page.screenshot({ clip: safeClip, type: 'png' })) as Buffer
    const adjustedElements = (elements as ImplementationElement[]).map((element) => ({
      ...element,
      coordinates: {
        ...element.coordinates,
        x: Math.max(0, element.coordinates.x - safeClip.x),
        y: Math.max(0, element.coordinates.y - safeClip.y),
      },
    }))

    return {
      pageTitle,
      screenshot,
      tokens,
      elements: adjustedElements,
      textContent,
      surfaceBounds: safeClip,
    }
  } finally {
    await browser.close()
  }
}

export async function captureImplementationFromUrl(
  url: string,
  componentType: SupportedComponentType
) {
  const { pageTitle, screenshot, tokens, elements, textContent, surfaceBounds } = await captureWithPlaywright(url, componentType)
  const outputDir = path.join(process.cwd(), 'public', 'generated', 'captures')
  await mkdir(outputDir, { recursive: true })
  const filename = `capture-${Date.now()}.png`
  await writeFile(path.join(outputDir, filename), screenshot)

  const snapshot: ImplementationSnapshot = {
    id: createId('impl'),
    source: 'live-url',
    componentType,
    url,
    imageUrl: `/generated/captures/${filename}`,
    captureBounds: surfaceBounds,
    pageTitle,
    capturedAt: new Date().toISOString(),
    tokens,
    elements,
    textContent,
  }

  return snapshot
}

export async function storeUploadedImplementation(
  file: File,
  componentType: SupportedComponentType
) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'png'
  const directory = path.join(process.cwd(), 'public', 'generated', 'uploads')
  await mkdir(directory, { recursive: true })

  const filename = `upload-${Date.now()}.${extension}`
  const output = path.join(directory, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(output, buffer)

  const snapshot: ImplementationSnapshot = {
    id: createId('impl'),
    source: 'upload',
    componentType,
    imageUrl: `/generated/uploads/${filename}`,
    capturedAt: new Date().toISOString(),
    tokens: getDefaultTokens(componentType),
  }

  return snapshot
}
