import { IdeaEdit } from '@/features/ideas/components/IdeaEdit'

interface EditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  return <IdeaEdit ideaId={id} />
}
