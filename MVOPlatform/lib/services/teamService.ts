import { supabase } from '@/lib/supabase'

export interface Team {
  id: string
  name: string
  description?: string
  avatar_media_id?: string
  created_at: string
  updated_at: string
}

export interface EnterpriseSpace {
  id: string
  team_id: string
  name: string
  visibility: 'public' | 'invite_only' | 'private'
  settings?: any
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

export interface SpaceMembership {
  id: string
  space_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member' | 'validator'
  status: 'active' | 'invited' | 'blocked'
  created_at: string
}

export interface ITeamService {
  createTeam(
    team: Omit<Team, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Team>
  getTeams(): Promise<Team[]>
  getTeamById(id: string): Promise<Team | null>
  updateTeam(id: string, updates: Partial<Team>): Promise<Team>

  createSpace(
    space: Omit<EnterpriseSpace, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EnterpriseSpace>
  getSpaces(teamId?: string): Promise<EnterpriseSpace[]>
  getSpaceById(id: string): Promise<EnterpriseSpace | null>
  updateSpace(
    id: string,
    updates: Partial<EnterpriseSpace>
  ): Promise<EnterpriseSpace>

  addTeamMember(
    teamId: string,
    userId: string,
    role?: TeamMembership['role']
  ): Promise<TeamMembership>
  getTeamMembers(teamId: string): Promise<TeamMembership[]>
  updateTeamMember(
    teamId: string,
    userId: string,
    updates: Partial<TeamMembership>
  ): Promise<TeamMembership>

  addSpaceMember(
    spaceId: string,
    userId: string,
    role?: SpaceMembership['role']
  ): Promise<SpaceMembership>
  getSpaceMembers(spaceId: string): Promise<SpaceMembership[]>
  updateSpaceMember(
    spaceId: string,
    userId: string,
    updates: Partial<SpaceMembership>
  ): Promise<SpaceMembership>
}

class SupabaseTeamService implements ITeamService {
  async createTeam(
    team: Omit<Team, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getTeamById(id: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createSpace(
    space: Omit<EnterpriseSpace, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EnterpriseSpace> {
    const { data, error } = await supabase
      .from('enterprise_spaces')
      .insert(space)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSpaces(teamId?: string): Promise<EnterpriseSpace[]> {
    let query = supabase
      .from('enterprise_spaces')
      .select('*')
      .order('created_at', { ascending: false })

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async getSpaceById(id: string): Promise<EnterpriseSpace | null> {
    const { data, error } = await supabase
      .from('enterprise_spaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async updateSpace(
    id: string,
    updates: Partial<EnterpriseSpace>
  ): Promise<EnterpriseSpace> {
    const { data, error } = await supabase
      .from('enterprise_spaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addTeamMember(
    teamId: string,
    userId: string,
    role: TeamMembership['role'] = 'member'
  ): Promise<TeamMembership> {
    const { data, error } = await supabase
      .from('team_memberships')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTeamMembers(teamId: string): Promise<TeamMembership[]> {
    const { data, error } = await supabase
      .from('team_memberships')
      .select(
        `
        *,
        users!team_memberships_user_id_fkey (
          username,
          full_name
        )
      `
      )
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateTeamMember(
    teamId: string,
    userId: string,
    updates: Partial<TeamMembership>
  ): Promise<TeamMembership> {
    const { data, error } = await supabase
      .from('team_memberships')
      .update(updates)
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addSpaceMember(
    spaceId: string,
    userId: string,
    role: SpaceMembership['role'] = 'member'
  ): Promise<SpaceMembership> {
    const { data, error } = await supabase
      .from('space_memberships')
      .insert({
        space_id: spaceId,
        user_id: userId,
        role,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSpaceMembers(spaceId: string): Promise<SpaceMembership[]> {
    const { data, error } = await supabase
      .from('space_memberships')
      .select(
        `
        *,
        users!space_memberships_user_id_fkey (
          username,
          full_name
        )
      `
      )
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateSpaceMember(
    spaceId: string,
    userId: string,
    updates: Partial<SpaceMembership>
  ): Promise<SpaceMembership> {
    const { data, error } = await supabase
      .from('space_memberships')
      .update(updates)
      .eq('space_id', spaceId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const teamService = new SupabaseTeamService()
