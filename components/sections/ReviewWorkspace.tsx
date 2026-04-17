'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { AlertOctagon, AlertTriangle, ArrowLeftRight, CheckCircle2, ChevronDown, Link2, RefreshCcw, UploadCloud, WandSparkles } from 'lucide-react'

import { GlassCard } from './GlassCard'
import { AiDesignCopilot } from './AiDesignCopilot'
import type { FigmaComponent, ImplementationSnapshot, SupportedComponentType, SyncResult } from '@/lib/pixelperfect/types'

type ConnectResponse = {
  success: boolean
  fileKey: string
  nodeId?: string
  fileName?: string
  source?: string
  authMode?: string
  figmaConfigured?: boolean
  error?: string
}

type StatusResponse = {
  fileKey: string | null
  lastSyncedAt: string | null
  latestResult: SyncResult | null
  components: Array<{
    name: string
    nodeId: string
    status: string
    issueCount: number
    componentType: SupportedComponentType
    figmaPreviewUrl?: string
  }>
}

const componentOptions: SupportedComponentType[] = ['Button', 'Input', 'Card']

function buildNodeScopedFigmaUrl(figmaUrl: string, nodeId?: string | null, cacheKey?: string | number) {
  try {
    const parsed = new URL(figmaUrl)

    if (!parsed.hostname.includes('figma.com')) {
      return undefined
    }

    if (nodeId) {
      parsed.searchParams.set('node-id', nodeId.replace(/:/g, '-'))
    }

    if (cacheKey !== undefined) {
      parsed.searchParams.set('pixelperfect-sync', String(cacheKey))
    }

    return parsed.toString()
  } catch {
    return undefined
  }
}

function buildFigmaEmbedUrl(figmaUrl: string, nodeId?: string | null, cacheKey?: string | number) {
  const scopedUrl = buildNodeScopedFigmaUrl(figmaUrl, nodeId, cacheKey)

  return scopedUrl
    ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(scopedUrl)}`
    : undefined
}

function normalizeUrlInput(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(trimmed)) {
    return `http://${trimmed}`
  }

  return `https://${trimmed}`
}

function normalizeNodeId(value?: string | null) {
  if (!value) {
    return undefined
  }

  return value.replace(/-/g, ':')
}

function parseFigmaUrl(figmaUrl: string) {
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

export function ReviewWorkspace({ showIntro = true }: { showIntro?: boolean }) {
  const initialFigmaUrl =
    'https://www.figma.com/design/v8gbM3LyxsEWLPXE5pI5rp/CRM-Dashboard-Customers-List--Community-?node-id=501-2&t=c7bxIBb4cPZxtLBL-0'
  const initialNodeId = parseFigmaUrl(initialFigmaUrl)?.nodeId ?? '12:44'
  const [figmaUrl, setFigmaUrl] = useState(initialFigmaUrl)
  const [websiteUrl, setWebsiteUrl] = useState('http://127.0.0.1:3000')
  const [componentType, setComponentType] = useState<SupportedComponentType>('Button')
  const [connected, setConnected] = useState<ConnectResponse | null>(null)
  const [components, setComponents] = useState<FigmaComponent[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId)
  const [mappingName, setMappingName] = useState('Button')
  const [mappingPath, setMappingPath] = useState('src/components/Button.tsx')
  const [implementation, setImplementation] = useState<ImplementationSnapshot | null>(null)
  const [figmaEmbedUrl, setFigmaEmbedUrl] = useState(() => buildFigmaEmbedUrl(figmaUrl, initialNodeId))
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [alert, setAlert] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const figmaUrlNodeId = parseFigmaUrl(figmaUrl)?.nodeId

  useEffect(() => {
    if (!connected?.fileKey) {
      return
    }

    let cancelled = false

    const loadStatus = async () => {
      const params = new URLSearchParams({ fileKey: connected.fileKey })

      if (selectedNodeId) {
        params.set('nodeId', selectedNodeId)
      }

      const response = await fetch(`/api/sync/status?${params.toString()}`, {
        cache: 'no-store',
      }).catch(() => null)

      if (!response?.ok) {
        return
      }

      const payload = (await response.json()) as StatusResponse

      if (!cancelled) {
        setStatus(payload)

        if (payload.latestResult) {
          setSyncResult((current) => {
            if (
              current &&
              current.figmaNodeId === payload.latestResult?.figmaNodeId &&
              current.comparedAt >= payload.latestResult.comparedAt
            ) {
              return current
            }

            return payload.latestResult
          })
        }
      }
    }

    void loadStatus()
    const timer = window.setInterval(() => {
      void loadStatus()
    }, 6000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [connected?.fileKey, selectedNodeId])

  useEffect(() => {
    setFigmaEmbedUrl(buildFigmaEmbedUrl(figmaUrl, selectedNodeId))
  }, [figmaUrl, selectedNodeId])

  useEffect(() => {
    setSyncResult((current) =>
      current && current.figmaNodeId === selectedNodeId ? current : null
    )
  }, [selectedNodeId])

  async function connectFigma() {
    const normalizedFigmaUrl = normalizeUrlInput(figmaUrl)

    if (!normalizedFigmaUrl.includes('figma.com')) {
      setAlert('Paste a valid Figma URL to import a frame.')
      return
    }

    setBusy('connect')
    setAlert(null)
    setSyncResult(null)
    setComponents([])

    const response = await fetch('/api/figma/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ figmaUrl: normalizedFigmaUrl }),
    })

    const payload = (await response.json()) as ConnectResponse
    if (!response.ok || !payload.success) {
      setBusy(null)
      setAlert(payload.error ?? 'Could not read that Figma URL.')
      return
    }

    const requestedNodeId = normalizeNodeId(selectedNodeId) ?? selectedNodeId
    const nodeId = requestedNodeId || payload.nodeId || initialNodeId
    setFigmaUrl(normalizedFigmaUrl)
    setConnected({
      ...payload,
      nodeId: payload.nodeId,
    })
    setSelectedNodeId(nodeId)
    setFigmaEmbedUrl(buildFigmaEmbedUrl(normalizedFigmaUrl, nodeId, Date.now()))
    setAlert('Figma URL connected. Loading the selected design preview now.')
    await importNodes(payload.fileKey, nodeId)
  }

  async function importNodes(fileKey = connected?.fileKey, nodeId = selectedNodeId) {
    if (!fileKey) {
      setAlert('Connect a Figma file first.')
      return
    }

    setBusy('import')
    setSyncResult(null)
    const response = await fetch('/api/figma/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey,
        nodeIds: [nodeId],
      }),
    })

    const payload = await response.json()
    setBusy(null)

    if (!response.ok || !payload.success) {
      setFigmaEmbedUrl(buildFigmaEmbedUrl(figmaUrl, nodeId, Date.now()))
      setAlert('Figma preview is loaded from the pasted URL. Structured drift detection will run when secure Figma backend access is available for this file.')
      return
    }

    const importedComponents = payload.components as FigmaComponent[]
    setComponents((current) => {
      const replacedNodeIds = new Set(importedComponents.map((item) => item.nodeId))
      return [
        ...current.filter((item) => !replacedNodeIds.has(item.nodeId)),
        ...importedComponents,
      ]
    })

    if (importedComponents[0]) {
      const resolvedNodeId = importedComponents.find((item) => item.nodeId === nodeId)?.nodeId ?? nodeId
      const resolvedComponent =
        importedComponents.find((item) => item.nodeId === resolvedNodeId) ?? importedComponents[0]

      setSelectedNodeId(resolvedNodeId)
      setComponentType(resolvedComponent.componentType)
      setMappingName(resolvedComponent.componentType)
      setFigmaEmbedUrl(
        buildFigmaEmbedUrl(figmaUrl, resolvedNodeId, Date.now()) ?? resolvedComponent.previewEmbedUrl
      )
    }

    setAlert(`Imported ${payload.imported} live Figma frame preview${payload.imported === 1 ? '' : 's'}.`)
  }

  async function saveMapping() {
    const component = components.find((item) => item.nodeId === selectedNodeId)

    if (!component) {
      setAlert('Import a Figma component before saving a mapping.')
      return
    }

    setBusy('map')
    const response = await fetch('/api/figma/map-component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        figmaNodeId: component.nodeId,
        figmaName: component.name,
        codeComponentName: mappingName,
        codePath: mappingPath,
        variant: component.componentType.toLowerCase(),
      }),
    })

    const payload = await response.json()
    setBusy(null)

    if (!response.ok || !payload.success) {
      setAlert(payload.error ?? 'Could not save the component mapping.')
      return
    }

    setAlert(`Mapped ${component.name} to ${mappingName}.`)
  }

  async function captureImplementation() {
    const normalizedWebsiteUrl = normalizeUrlInput(websiteUrl)

    if (!normalizedWebsiteUrl) {
      setAlert('Paste a valid website URL to capture the live page.')
      return
    }

    setBusy('capture')
    setSyncResult(null)
    setImplementation(null)

    const response = await fetch('/api/implementation/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: normalizedWebsiteUrl,
        componentType,
      }),
    })

    const payload = await response.json()
    setBusy(null)

    if (!response.ok || !payload.success) {
      setAlert(payload.error ?? 'Could not capture the implementation.')
      return
    }

    setWebsiteUrl(normalizedWebsiteUrl)
    setImplementation(payload.snapshot as ImplementationSnapshot)
    setAlert('Implementation snapshot captured and tokenized.')
  }

  async function uploadImplementation(file: File) {
    setBusy('upload')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('componentType', componentType)

    const response = await fetch('/api/implementation/upload', {
      method: 'POST',
      body: formData,
    })

    const payload = await response.json()
    setBusy(null)

    if (!response.ok || !payload.success) {
      setAlert(payload.error ?? 'Could not upload the implementation screenshot.')
      return
    }

    setImplementation(payload.snapshot as ImplementationSnapshot)
    setAlert('Screenshot uploaded as the implementation baseline.')
  }

  async function runSync() {
    if (!connected?.fileKey) {
      setAlert('Connect and import Figma before comparing.')
      return
    }

    const focusNode = Boolean(figmaUrlNodeId && selectedNodeId && figmaUrlNodeId !== selectedNodeId)

    setBusy('sync')
    const response = await fetch('/api/sync/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey: connected.fileKey,
        figmaNodeId: selectedNodeId,
        codeComponentName: mappingName,
        componentType,
        implementationSnapshotId: implementation?.id,
        focusNode,
      }),
    })

    const payload = await response.json()
    setBusy(null)

    if (!response.ok || !payload.success) {
      setAlert(payload.error ?? 'Comparison failed.')
      return
    }

    setSyncResult(payload.result as SyncResult)
    setAlert(
      payload.status === 'drifted'
        ? 'Drift detected. Review the mismatches and suggested fixes below.'
        : 'Design and implementation are in sync.'
    )
  }

  async function triggerWebhook() {
    if (!connected?.fileKey) {
      setAlert('Connect a Figma file before triggering re-sync.')
      return
    }

    setBusy('webhook')
    const response = await fetch('/api/figma/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'FILE_UPDATE',
        file_key: connected.fileKey,
        passcode: 'pixelperfect-secret',
      }),
    })

    const payload = await response.json()
    setBusy(null)

    if (!response.ok || !payload.verified) {
      setAlert('Webhook verification failed.')
      return
    }

    setAlert('Figma file updated. Drift was re-imported and compared again automatically.')

    startTransition(() => {
      void runSync()
    })
  }

  async function runLiveComparison() {
    const normalizedFigmaUrl = normalizeUrlInput(figmaUrl)
    const normalizedWebsiteUrl = normalizeUrlInput(websiteUrl)

    if (!normalizedFigmaUrl.includes('figma.com')) {
      setAlert('Paste a valid Figma URL before running a live comparison.')
      return
    }

    if (!normalizedWebsiteUrl) {
      setAlert('Paste a valid website URL before running a live comparison.')
      return
    }

    setBusy('full')
    setAlert('Importing Figma and capturing the deployed website.')
    setSyncResult(null)

    try {
      const connectResponse = await fetch('/api/figma/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figmaUrl: normalizedFigmaUrl }),
      })
      const connectPayload = (await connectResponse.json()) as ConnectResponse

      if (!connectResponse.ok || !connectPayload.success) {
        throw new Error(connectPayload.error ?? 'Could not read that Figma URL.')
      }

      const requestedNodeId = normalizeNodeId(selectedNodeId) ?? selectedNodeId
      const nodeId = requestedNodeId || connectPayload.nodeId || initialNodeId
      setFigmaUrl(normalizedFigmaUrl)
      setWebsiteUrl(normalizedWebsiteUrl)
      setConnected({
        ...connectPayload,
        nodeId: connectPayload.nodeId,
      })
      setSelectedNodeId(nodeId)
      setFigmaEmbedUrl(buildFigmaEmbedUrl(normalizedFigmaUrl, nodeId, Date.now()))

      const importResponse = await fetch('/api/figma/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: connectPayload.fileKey,
          nodeIds: [nodeId],
        }),
      })
      const importPayload = await importResponse.json()

      if (!importResponse.ok || !importPayload.success) {
        const captureResponse = await fetch('/api/implementation/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: normalizedWebsiteUrl,
            componentType,
          }),
        })
        const capturePayload = await captureResponse.json()

        if (!captureResponse.ok || !capturePayload.success) {
          throw new Error(capturePayload.error ?? 'Could not capture the deployed website.')
        }

      setImplementation(capturePayload.snapshot as ImplementationSnapshot)
      setAlert('Figma design preview and deployed website capture are shown side by side. Structured mismatch detection will run when secure Figma backend access is available for this file.')
        return
      }

      const importedComponents = importPayload.components as FigmaComponent[]
      const importedComponent = importedComponents[0]

      if (!importedComponent) {
        throw new Error('No Figma frame was imported from that URL.')
      }

      setComponents((current) => {
        const replacedNodeIds = new Set(importedComponents.map((item) => item.nodeId))
        return [
          ...current.filter((item) => !replacedNodeIds.has(item.nodeId)),
          ...importedComponents,
        ]
      })
      setSelectedNodeId(nodeId)
      setComponentType(importedComponent.componentType)
      setMappingName(importedComponent.componentType)
      setFigmaEmbedUrl(
        buildFigmaEmbedUrl(normalizedFigmaUrl, nodeId, Date.now()) ?? importedComponent.previewEmbedUrl
      )

      const captureResponse = await fetch('/api/implementation/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedWebsiteUrl,
          componentType: importedComponent.componentType,
        }),
      })
      const capturePayload = await captureResponse.json()

      if (!captureResponse.ok || !capturePayload.success) {
        throw new Error(capturePayload.error ?? 'Could not capture the deployed website.')
      }

      setImplementation(capturePayload.snapshot as ImplementationSnapshot)
      const capturedSnapshot = capturePayload.snapshot as ImplementationSnapshot
      const sourceNodeId = parseFigmaUrl(normalizedFigmaUrl)?.nodeId
      const focusNode = Boolean(sourceNodeId && nodeId !== sourceNodeId)

      const syncResponse = await fetch('/api/sync/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: connectPayload.fileKey,
          figmaNodeId: nodeId,
          codeComponentName: importedComponent.componentType,
          componentType: importedComponent.componentType,
          implementationSnapshotId: capturedSnapshot.id,
          focusNode,
        }),
      })
      const syncPayload = await syncResponse.json()

      if (!syncResponse.ok || !syncPayload.success) {
        throw new Error(syncPayload.error ?? 'Could not compare the imported design and website capture.')
      }

      setSyncResult(syncPayload.result as SyncResult)
      setAlert(
        importedComponent.previewSource === 'figma-public-thumbnail'
          ? 'Figma design imported from its public preview image and compared with the live website capture.'
          : importedComponent.previewSource === 'figma-visual-capture'
          ? 'Design drift checked with visual image analysis because verified Figma API tokens were not available.'
          : importedComponent.previewSource !== 'figma-image-api'
          ? 'Figma design is visible as an embed, but the backend could not import a comparable Figma image/token source. Configure server-side Figma access to run accurate comparison.'
          : syncPayload.status === 'drifted'
          ? 'Design drift detected. Review red markers and CSS fixes.'
          : 'Figma design and deployed website are in sync.'
      )
    } catch (error) {
      setAlert(error instanceof Error ? error.message : 'Live comparison failed.')
    } finally {
      setBusy(null)
    }
  }

  const selectedComponent = components.find((item) => item.nodeId === selectedNodeId) ?? null
  const figmaPanelImageUrl =
    syncResult?.figmaPreviewUrl ?? selectedComponent?.previewUrl
  const figmaPanelSubtitle = connected?.fileName
    ? `${connected.fileName}${selectedNodeId ? ` • ${selectedNodeId}` : ''}`
    : figmaUrl
      ? 'Live frame from the pasted Figma URL'
      : 'Import a component to view the design'
  const normalizedWebsiteUrlForPreview = normalizeUrlInput(websiteUrl)
  const implementationMatchesCurrentUrl =
    implementation?.source === 'upload' ||
    !implementation?.url ||
    implementation.url === normalizedWebsiteUrlForPreview
  const implementationPreviewUrl = implementationMatchesCurrentUrl ? implementation?.imageUrl : undefined
  const syncImplementationPreviewUrl =
    implementationMatchesCurrentUrl ? syncResult?.implementationPreviewUrl : undefined
  const implementationSubtitle = implementationMatchesCurrentUrl
    ? implementation?.pageTitle ?? implementation?.url ?? implementation?.source ?? 'Capture a URL or upload a screenshot'
    : normalizedWebsiteUrlForPreview || 'Capture a URL or upload a screenshot'
  const implementationEmptyState = busy === 'capture'
    ? 'Capturing the deployed website...'
    : normalizedWebsiteUrlForPreview
      ? `Ready to capture ${normalizedWebsiteUrlForPreview}`
      : 'Capture a URL or upload a screenshot'

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {showIntro ? (
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Live Figma-to-Code Review
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Design QA cockpit for live Figma frames and deployed screens.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Paste a Figma frame URL and a deployed website URL. PixelPerfect imports the real Figma preview, captures the live page, then marks every drift in red with CSS fixes ready for implementation.
            </p>
          </div>
        ) : null}

        {syncResult?.status === 'drifted' ? (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50 shadow-[0_0_28px_rgba(239,68,68,0.14)] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-red-400" />
              <span className="font-semibold">Design drift detected. Review mismatches.</span>
            </div>
            {syncResult.mismatches.some((issue) => issue.severity === 'critical') ? (
              <span className="rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
                Critical layout issue
              </span>
            ) : null}
          </div>
        ) : null}

        {alert ? (
          <div className="mb-8 flex items-start gap-3 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
            <WandSparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{alert}</p>
          </div>
        ) : null}

        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Product flow</p>
              <p className="mt-1 text-sm text-slate-400">
                Paste a Figma URL and deployed website URL, then run one backend-powered comparison. No setup fields are required here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void runLiveComparison()}
              className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy !== null}
            >
              {busy === 'full' ? 'Running live comparison...' : 'Run Live Comparison'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-6">
            <GlassCard className="p-6" glow="blue">
              <div className="mb-5 flex items-center gap-3">
                <Link2 className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">1. Connect Figma</h3>
              </div>
              <label className="mb-2 block text-sm text-slate-300">Figma URL</label>
              <input
                value={figmaUrl}
                onChange={(event) => {
                  const nextValue = event.target.value
                  const normalizedValue = normalizeUrlInput(nextValue)
                  const parsed = parseFigmaUrl(normalizedValue)
                  const shouldFollowUrlNode =
                    !selectedNodeId || !figmaUrlNodeId || selectedNodeId === figmaUrlNodeId

                  setFigmaUrl(nextValue)
                  setFigmaEmbedUrl(buildFigmaEmbedUrl(nextValue, shouldFollowUrlNode ? parsed?.nodeId : selectedNodeId))

                  if (parsed?.nodeId && shouldFollowUrlNode) {
                    setSelectedNodeId(normalizeNodeId(parsed.nodeId) ?? parsed.nodeId)
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => void connectFigma()}
                  className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {busy === 'connect' || busy === 'import' ? 'Connecting...' : 'Connect & Import'}
                </button>
                {connected ? (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
                    {connected.fileName ?? connected.fileKey}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Node ID</label>
                  <input
                    value={selectedNodeId}
                    onChange={(event) => setSelectedNodeId(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Component</label>
                  <select
                    value={componentType}
                    onChange={(event) => setComponentType(event.target.value as SupportedComponentType)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  >
                    {componentOptions.map((option) => (
                      <option key={option} value={option} className="bg-slate-950">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => void importNodes()}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {busy === 'import' ? 'Importing...' : 'Re-sync Figma Frame'}
              </button>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <ArrowLeftRight className="h-5 w-5 text-violet-300" />
                <h3 className="text-lg font-semibold text-white">2. Map & Capture</h3>
              </div>

              <label className="mb-2 block text-sm text-slate-300">Code Component Name</label>
              <input
                value={mappingName}
                onChange={(event) => setMappingName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/40"
              />

              <label className="mb-2 mt-4 block text-sm text-slate-300">Code Path</label>
              <input
                value={mappingPath}
                onChange={(event) => setMappingPath(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/40"
              />

              <button
                onClick={() => void saveMapping()}
                className="mt-4 w-full rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-50 transition hover:bg-violet-400/20"
              >
                {busy === 'map' ? 'Saving mapping...' : 'Save Mapping'}
              </button>

                <label className="mb-2 mt-6 block text-sm text-slate-300">Implementation URL</label>
                <input
                  value={websiteUrl}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    const normalizedNextValue = normalizeUrlInput(nextValue)

                    setWebsiteUrl(nextValue)

                    if (implementation?.url && implementation.url !== normalizedNextValue) {
                      setImplementation(null)
                      setSyncResult(null)
                    }
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/40"
                />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => void captureImplementation()}
                  className="rounded-xl bg-violet-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-300"
                >
                  {busy === 'capture' ? 'Capturing...' : 'Capture Live URL'}
                </button>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                  <UploadCloud className="h-4 w-4" />
                  Upload Screenshot
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadImplementation(file)
                      }
                    }}
                  />
                </label>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <RefreshCcw className="h-5 w-5 text-emerald-300" />
                <h3 className="text-lg font-semibold text-white">3. Sync Engine</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => void runSync()}
                  className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  {busy === 'sync' ? 'Comparing...' : 'Run Comparison'}
                </button>
                <button
                  onClick={() => void triggerWebhook()}
                  className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-50 transition hover:bg-emerald-400/20"
                >
                  {busy === 'webhook' ? 'Re-syncing...' : 'Trigger Webhook'}
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Realtime behavior</p>
                <p className="mt-2">
                  The stored Figma file key stays linked to the imported node. When the webhook fires, the app re-imports tokens and updates drift automatically.
                </p>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Review Dashboard</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Live comparison surface</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <StatusPill
                      label={busy === 'import' ? 'Importing' : busy === 'sync' ? 'Comparing' : syncResult?.status === 'synced' ? 'Synced' : syncResult?.status === 'drifted' ? 'Drifted' : 'Awaiting comparison'}
                      tone={syncResult?.status === 'synced' ? 'green' : syncResult?.status === 'drifted' ? 'red' : busy ? 'amber' : 'slate'}
                    />
                    <StatusPill
                      label={
                        status?.lastSyncedAt
                          ? `Last sync ${new Date(status.lastSyncedAt).toLocaleTimeString()}`
                          : 'No sync yet'
                      }
                      tone="slate"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-2">
                <PreviewPanel
                  title="Figma Design"
                  subtitle={figmaPanelSubtitle}
                  imageUrl={figmaEmbedUrl ? undefined : figmaPanelImageUrl}
                  embedUrl={figmaEmbedUrl ?? selectedComponent?.previewEmbedUrl}
                  sourceBounds={
                    selectedComponent?.previewSource === 'figma-image-api' &&
                    selectedComponent?.tokens.width &&
                    selectedComponent?.tokens.height
                      ? { width: selectedComponent.tokens.width, height: selectedComponent.tokens.height }
                      : undefined
                  }
                  mismatches={figmaEmbedUrl ? undefined : syncResult?.mismatches}
                />
                <PreviewPanel
                  title="Deployed Website"
                  subtitle={implementationSubtitle}
                  imageUrl={syncImplementationPreviewUrl ?? implementationPreviewUrl}
                  sourceBounds={implementation?.captureBounds}
                  mismatches={syncResult?.mismatches}
                  emptyState={implementationEmptyState}
                />
              </div>
            </GlassCard>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Issues & fixes</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Active node {selectedNodeId}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {syncResult?.mismatchCount ?? 0} issue{syncResult?.mismatchCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-3">
                  {syncResult?.mismatches?.length ? (
                    <>
                      <SeverityIssueGroups issues={syncResult.mismatches} />
                      {syncResult.reviewSummary ? <SelfCorrectionSummary summary={syncResult.reviewSummary} /> : null}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                      No mismatches yet. Run a comparison to generate token drift findings.
                    </div>
                  )}
                </div>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white">Connected components</h3>
                  <div className="mt-4 space-y-3">
                    {status?.components?.length ? (
                      status.components.map((item) => (
                        <button
                          key={item.nodeId}
                          onClick={() => {
                            setSelectedNodeId(item.nodeId)
                            setComponentType(item.componentType)
                          }}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            item.nodeId === selectedNodeId
                              ? 'border-cyan-300/40 bg-cyan-300/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/8'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{item.name}</p>
                              <p className="mt-1 text-xs text-slate-400">{item.nodeId}</p>
                            </div>
                            <StatusPill
                              label={`${item.issueCount} issues`}
                              tone={item.issueCount > 0 ? 'red' : 'green'}
                            />
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">Imported components will appear here.</p>
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-3">
                    {syncResult?.status === 'drifted' ? (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    )}
                    <h3 className="text-lg font-semibold text-white">Drift alert</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {syncResult?.status === 'drifted'
                      ? 'Design drift detected. Red markers show where the implementation departs from the imported Figma frame.'
                      : 'No active drift alert. The latest imported design and implementation snapshot are aligned or awaiting comparison.'}
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AiDesignCopilot result={syncResult} />
    </section>
  )
}

function PreviewPanel({
  title,
  subtitle,
  imageUrl,
  embedUrl,
  sourceBounds,
  mismatches,
  emptyState,
}: {
  title: string
  subtitle: string
  imageUrl?: string
  embedUrl?: string
  sourceBounds?: { width: number; height: number }
  mismatches?: SyncResult['mismatches']
  emptyState?: string
}) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [mediaRect, setMediaRect] = useState({ left: 0, top: 0, width: 0, height: 440 })

  useEffect(() => {
    const updateMediaRect = () => {
      const frame = frameRef.current

      if (!frame) {
        return
      }

      const frameWidth = frame.clientWidth
      const frameHeight = frame.clientHeight

      if (!imageUrl || !naturalSize?.width || !naturalSize.height) {
        setMediaRect({ left: 0, top: 0, width: frameWidth, height: frameHeight })
        return
      }

      const imageRatio = naturalSize.width / naturalSize.height
      const frameRatio = frameWidth / frameHeight
      const width = imageRatio > frameRatio ? frameWidth : frameHeight * imageRatio
      const height = imageRatio > frameRatio ? frameWidth / imageRatio : frameHeight

      setMediaRect({
        left: (frameWidth - width) / 2,
        top: (frameHeight - height) / 2,
        width,
        height,
      })
    }

    updateMediaRect()
    window.addEventListener('resize', updateMediaRect)

    return () => {
      window.removeEventListener('resize', updateMediaRect)
    }
  }, [imageUrl, naturalSize])

  const sourceWidth = sourceBounds?.width ?? 1440
  const sourceHeight = sourceBounds?.height ?? 1024

  return (
    <div className="border-white/10 p-6 first:border-b lg:first:border-b-0 lg:first:border-r">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{title}</p>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
      </div>
      <div ref={frameRef} className="relative h-[440px] overflow-hidden rounded-lg border border-white/10 bg-slate-950/80">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-contain"
            onLoad={(event) => {
              setNaturalSize({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }}
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full border-0 bg-white"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {emptyState ?? 'Preview will render here'}
          </div>
        )}

        <div
          className="pointer-events-none absolute"
          style={{
            left: mediaRect.left,
            top: mediaRect.top,
            width: mediaRect.width,
            height: mediaRect.height,
          }}
        >
        {mismatches?.slice(0, 18).map((issue, index) => {
          const coordinates = issue.coordinates
          const hasRealBounds = coordinates && (coordinates.width > 180 || coordinates.height > 80 || issue.field.includes('"'))
          const fallbackPositions = [
            { left: 8, top: 8, width: 20, height: 10 },
            { left: 34, top: 12, width: 22, height: 9 },
            { left: 62, top: 12, width: 22, height: 9 },
            { left: 12, top: 34, width: 26, height: 12 },
            { left: 44, top: 34, width: 28, height: 12 },
            { left: 18, top: 56, width: 24, height: 12 },
            { left: 52, top: 56, width: 26, height: 12 },
            { left: 28, top: 76, width: 34, height: 10 },
          ]
          const fallback = fallbackPositions[index % fallbackPositions.length]
          const rowOffset = Math.floor(index / fallbackPositions.length) * 4
          const left = hasRealBounds ? Math.min(88, Math.max(3, (coordinates.x / sourceWidth) * 100)) : fallback.left
          const top = hasRealBounds ? Math.min(86, Math.max(4, (coordinates.y / sourceHeight) * 100)) : Math.min(86, fallback.top + rowOffset)
          const width = hasRealBounds ? Math.min(76, Math.max(10, (coordinates.width / sourceWidth) * 100)) : fallback.width
          const height = hasRealBounds ? Math.min(40, Math.max(6, (coordinates.height / sourceHeight) * 100)) : fallback.height

          return (
          <div
            key={`${issue.field}-${index}`}
            className="group pointer-events-auto absolute cursor-help rounded-[6px] border border-red-500/90 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.32)] ring-1 ring-red-500/50 transition hover:bg-red-500/25"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M0 5 Q 2.5 0, 5 5 T 10 5' stroke='%23f43f5e' fill='transparent' stroke-width='2'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'bottom',
              backgroundSize: '12px 6px',
            }}
          >
            <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-72 rounded-lg border border-red-400/30 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-2xl group-hover:block">
              <p className="font-semibold text-red-300">{issue.field} mismatch</p>
              <p className="mt-1">Expected {String(issue.figma)}, found {String(issue.code)}.</p>
              <p className="mt-1 text-red-200">Severity: {issue.severity}</p>
            </div>
          </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === 'critical'
      ? 'bg-red-500/25 text-red-50 border-red-400/50 shadow-[0_0_14px_rgba(239,68,68,0.25)]'
      : severity === 'high'
        ? 'bg-red-500/15 text-red-100 border-orange-400/40'
        : severity === 'medium'
          ? 'bg-amber-500/20 text-amber-50 border-amber-400/20'
          : 'bg-slate-500/20 text-slate-100 border-slate-300/20'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${tone}`}>
      {severity}
    </span>
  )
}

function SeverityIssueGroups({ issues }: { issues: SyncResult['mismatches'] }) {
  const groups = [
    { label: 'HIGH', severities: ['critical', 'high'], className: 'border-red-500/30 bg-red-500/8 text-red-100' },
    { label: 'MEDIUM', severities: ['medium'], className: 'border-amber-500/30 bg-amber-500/8 text-amber-100' },
    { label: 'LOW', severities: ['low'], className: 'border-slate-500/30 bg-slate-500/8 text-slate-100' },
  ]

  return (
    <>
      {groups.map((group) => {
        const groupIssues = issues.filter((issue) => group.severities.includes(issue.severity))

        if (groupIssues.length === 0) {
          return null
        }

        return (
          <details key={group.label} open={group.label === 'HIGH'} className={`group rounded-lg border ${group.className}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                <p className="text-xs font-semibold uppercase tracking-[0.22em]">{group.label} severity</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-xs">
                {groupIssues.length}
              </span>
            </summary>
            <div
              className={`space-y-3 border-t border-white/10 p-3 ${
                groupIssues.length > 3
                  ? 'max-h-[340px] overflow-y-auto pr-4 [scrollbar-color:rgba(248,113,113,0.45)_rgba(15,23,42,0.35)] [scrollbar-width:thin]'
                  : ''
              }`}
            >
              {groupIssues.map((issue) => (
                <details
                  key={`${issue.field}-${issue.reason}`}
                  className="group/issue rounded-lg border border-red-500/25 bg-black/20 shadow-[0_0_18px_rgba(239,68,68,0.08)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <SeverityBadge severity={issue.severity} />
                      <p className="text-sm font-semibold text-white">{issue.field}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open/issue:rotate-180" />
                  </summary>
                  <div className="border-t border-white/10 p-4 pt-3">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-white">What is wrong: </span>
                    {issue.reason}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    <span className="font-medium text-white">Expected from Figma: </span>
                    <span className="text-emerald-300">{String(issue.figma)}</span>
                  </p>
                  {issue.colorAudit ? (
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                      <p className="font-medium text-white">
                        {issue.colorAudit.implementationHexSource === 'pixel-sample'
                          ? 'Visual sampling'
                          : 'Color verification'}
                      </p>
                      <p className="mt-2 text-slate-300">
                        {issue.colorAudit.implementationHexSource === 'pixel-sample'
                          ? 'Figma sampled color: '
                          : 'Expected Figma hex: '}
                        <span className="text-emerald-300">
                          {issue.colorAudit.expectedFigmaHex ?? 'NOT VERIFIED'}
                        </span>
                      </p>
                      <p className="mt-1 text-slate-300">
                        Observed visual appearance:{' '}
                        <span className="text-slate-100">{issue.colorAudit.observedAppearance}</span>
                      </p>
                      <p className="mt-1 text-slate-300">
                        {issue.colorAudit.implementationHexSource === 'pixel-sample'
                          ? 'Website sampled color: '
                          : 'Actual implementation hex: '}
                        <span className="text-red-300">{issue.colorAudit.implementationHex}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          source: {issue.colorAudit.implementationHexSource.replace('_', ' ')}
                        </span>
                      </p>
                      <p className="mt-1 text-slate-300">
                        {issue.colorAudit.implementationHexSource === 'pixel-sample'
                          ? 'Closest Figma sample: '
                          : 'Suggested fix hex: '}
                        <span className="text-emerald-300">
                          {issue.colorAudit.suggestedFixHex ?? 'NOT VERIFIED'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-300">
                      <span className="font-medium text-white">Measured implementation: </span>
                      <span className="text-red-300">{String(issue.code)}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-400">
                    <span className="font-medium text-white">Likely root cause: </span>
                    {issue.rootCause}
                  </p>
                  <p className="mt-3 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 font-mono text-sm text-emerald-100">
                    {issue.suggestedCssFix ?? issue.suggestedFix}
                  </p>
                  {issue.suggestedTailwindFix ? (
                    <p className="mt-2 text-sm text-emerald-200">{issue.suggestedTailwindFix}</p>
                  ) : null}
                  </div>
                </details>
              ))}
            </div>
          </details>
        )
      })}
    </>
  )
}

function SelfCorrectionSummary({ summary }: { summary: NonNullable<SyncResult['reviewSummary']> }) {
  return (
    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/8 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-white">Self-correction summary</h4>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
          Corrected report accuracy {summary.accuracyScore}%
        </span>
      </div>
      <SummaryBlock title="What AI did correctly" items={summary.correct} tone="text-emerald-200" />
      <SummaryBlock title="What AI did wrong" items={summary.incorrect} tone="text-red-200" />
      <SummaryBlock title="What was corrected" items={summary.corrected} tone="text-cyan-100" />
    </div>
  )
}

function SummaryBlock({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="mt-3">
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'amber' | 'red' | 'slate'
}) {
  const classes =
    tone === 'green'
      ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-50'
      : tone === 'red'
        ? 'border-red-400/40 bg-red-500/15 text-red-100'
      : tone === 'amber'
        ? 'border-amber-300/20 bg-amber-400/10 text-amber-50'
        : 'border-white/10 bg-white/5 text-slate-300'

  return <span className={`rounded-full border px-3 py-1.5 text-xs ${classes}`}>{label}</span>
}
