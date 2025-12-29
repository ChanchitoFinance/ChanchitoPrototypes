export interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'link'
  url: string
  metadata?: any
  created_at: string
}
