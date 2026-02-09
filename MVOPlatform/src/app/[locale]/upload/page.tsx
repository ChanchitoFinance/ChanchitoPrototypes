import { IdeaUpload } from '@/features/ideas/components/IdeaUpload'

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const params = await searchParams
  return <IdeaUpload mode={params?.mode} />
}

