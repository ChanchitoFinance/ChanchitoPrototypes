import { EnterpriseSpace, SpaceMembership, SpaceWithTeam } from "../types/space"
import { Team, TeamMembership } from "../types/team"

export interface ITeamService {
  createTeam(
    team: Omit<Team, 'id' | 'created_at' | 'updated_at'>,
    creatorUserId?: string
  ): Promise<Team>
  getTeams(): Promise<Team[]>
  getTeamById(id: string): Promise<Team | null>
  getUserTeams(userId: string): Promise<Team[]>
  updateTeam(id: string, updates: Partial<Team>): Promise<Team>

  createSpace(
    space: Omit<EnterpriseSpace, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EnterpriseSpace>
  getSpaces(teamId?: string): Promise<EnterpriseSpace[]>
  getVisibleSpaces(userId?: string): Promise<SpaceWithTeam[]>
  getSpaceById(id: string): Promise<SpaceWithTeam | null>
  updateSpace(
    id: string,
    updates: Partial<EnterpriseSpace>
  ): Promise<EnterpriseSpace>
  deleteSpace(id: string): Promise<void>

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
  generateTeamInviteLink(teamId: string): string

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
  getUserSpaceRole(spaceId: string, userId: string): Promise<SpaceMembership['role'] | null>
  isSpaceAdmin(spaceId: string, userId: string): Promise<boolean>
  isSpaceMember(spaceId: string, userId: string): Promise<boolean>
}
