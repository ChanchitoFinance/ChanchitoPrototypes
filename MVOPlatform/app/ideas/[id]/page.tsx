import { IdeaReport } from '@/components/pages/IdeaReport'

export default function IdeaReportPage({
  params,
}: {
  params: { id: string }
}) {
  return <IdeaReport ideaId={params.id} />
}

