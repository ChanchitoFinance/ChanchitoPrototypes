import { ITeamService } from '@/core/abstractions/ITeamService'
import { supabase } from '@/core/lib/supabase'
import { EnterpriseSpace, SpaceMembership, SpaceWithTeam } from '@/core/types/space'
import { Team, TeamMembership } from '@/core/types/team'

class SupabaseTeamService implements ITeamService {
  async createTeam(
    team: Omit<Team, 'id' | 'created_at' | 'updated_at'>,
    creatorUserId?: string
  ): Promise<Team> {
    const { data: teamData, error: insertError } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()

    if (insertError) throw insertError

    if (creatorUserId) {
      try {
        await this.addTeamMember(teamData.id, creatorUserId, 'admin')
      } catch (membershipError: any) {
        if (membershipError?.code === '42501') {
          throw new Error(
            'RLS policy missing: Please run the SQL in sql/add_team_membership_rls.sql in your Supabase SQL editor to allow users to add themselves to teams.'
          )
        }
        throw membershipError
      }
    }

    return teamData
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

  async getUserTeams(userId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('team_memberships')
      .select(
        `
        teams!team_memberships_team_id_fkey (
          id,
          name,
          description,
          avatar_media_id,
          created_at,
          updated_at
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error
    return data?.map((item: any) => item.teams).filter(Boolean) || []
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

  async getVisibleSpaces(userId?: string): Promise<SpaceWithTeam[]> {
    // Get public spaces
    const { data: publicSpaces, error: publicError } = await supabase
      .from('enterprise_spaces')
      .select(
        `
        *,
        teams!enterprise_spaces_team_id_fkey (
          id,
          name,
          description,
          avatar_media_id
        )
      `
      )
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (publicError) throw publicError

    // Get spaces user is member of (if userId provided)
    let userSpaces: SpaceWithTeam[] = []
    if (userId) {
      const { data: memberships, error: membershipError } = await supabase
        .from('space_memberships')
        .select(
          `
          enterprise_spaces!space_memberships_space_id_fkey (
            *,
            teams!enterprise_spaces_team_id_fkey (
              id,
              name,
              description,
              avatar_media_id
            )
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'active')

      if (!membershipError && memberships) {
        userSpaces =
          memberships
            ?.map((m: any) => m.enterprise_spaces)
            .filter(Boolean)
            .map((space: any) => ({
              ...space,
              team: space.teams,
            })) || []
      }
    }

    // Combine and deduplicate
    const allSpaces = [...(publicSpaces || []), ...userSpaces]
    const uniqueSpaces = Array.from(
      new Map(allSpaces.map(space => [space.id, space])).values()
    )

    // Get member and idea counts for each space
    const spacesWithCounts = await Promise.all(
      uniqueSpaces.map(async space => {
        const [memberCount, ideaCount] = await Promise.all([
          supabase
            .from('space_memberships')
            .select('id', { count: 'exact', head: true })
            .eq('space_id', space.id)
            .eq('status', 'active')
            .then(({ count }) => count || 0),
          supabase
            .from('ideas')
            .select('id', { count: 'exact', head: true })
            .eq('space_id', space.id)
            .then(({ count }) => count || 0),
        ])

        return {
          ...space,
          team: space.teams || space.team,
          member_count: memberCount,
          idea_count: ideaCount,
        }
      })
    )

    return spacesWithCounts
  }

  async getSpaceById(id: string): Promise<SpaceWithTeam | null> {
    const { data, error } = await supabase
      .from('enterprise_spaces')
      .select(
        `
        *,
        teams!enterprise_spaces_team_id_fkey (
          id,
          name,
          description,
          avatar_media_id
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) return null

    // Get counts
    const [memberCount, ideaCount] = await Promise.all([
      supabase
        .from('space_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('space_id', id)
        .eq('status', 'active')
        .then(({ count }) => count || 0),
      supabase
        .from('ideas')
        .select('id', { count: 'exact', head: true })
        .eq('space_id', id)
        .then(({ count }) => count || 0),
    ])

    return {
      ...data,
      team: data.teams,
      member_count: memberCount,
      idea_count: ideaCount,
    }
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

  async getUserSpaceRole(
    spaceId: string,
    userId: string
  ): Promise<SpaceMembership['role'] | null> {
    const { data, error } = await supabase
      .from('space_memberships')
      .select('role')
      .eq('space_id', spaceId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (error || !data) return null
    return data.role
  }

  async isSpaceAdmin(spaceId: string, userId: string): Promise<boolean> {
    const role = await this.getUserSpaceRole(spaceId, userId)
    return role === 'admin' || role === 'moderator'
  }

  generateTeamInviteLink(teamId: string): string {
    if (typeof window === 'undefined') return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/teams/${teamId}/join`
  }
}

export const teamService = new SupabaseTeamService()
