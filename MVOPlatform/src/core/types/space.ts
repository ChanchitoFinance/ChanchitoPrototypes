import { Team } from "./team"

export interface EnterpriseSpace {
  id: string
  team_id: string
  name: string
  visibility: 'public' | 'private'
  settings?: any
  created_at: string
  updated_at: string
}


export interface SpaceMembership {
  id: string
  space_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member' | 'validator'
  status: 'active' | 'invited' | 'blocked'
  created_at: string
}

export interface SpaceWithTeam extends EnterpriseSpace {
  team?: Team
  member_count?: number
  idea_count?: number
}
