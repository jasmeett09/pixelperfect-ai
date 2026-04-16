import { AppShell } from '@/components/sections/AppShell'
import { ReviewWorkspace } from '@/components/sections/ReviewWorkspace'

export default function DiffPage() {
  return (
    <AppShell
      active="diff"
      eyebrow="Live Comparison"
      title="Figma design on the left. Deployed website on the right."
      description="This is the dedicated diff page for real-time design QA. Paste both URLs, import the frame, capture the live page, and review red drift markers with CSS corrections."
    >
      <ReviewWorkspace showIntro={false} />
    </AppShell>
  )
}
