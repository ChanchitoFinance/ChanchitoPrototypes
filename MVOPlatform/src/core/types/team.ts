export interface Team {
  id: string
  name: string
  description?: string
  avatar_media_id?: string
  created_at: string
  updated_at: string
}


export interface TeamMembership {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member' | 'validator'
  status: 'active' | 'invited' | 'blocked'
  created_at: string
}
