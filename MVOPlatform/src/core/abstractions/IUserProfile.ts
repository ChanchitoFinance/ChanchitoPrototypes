import { UserProfile } from "../types/auth"

export interface IUserService {
  getCurrentUser(): Promise<UserProfile | null>
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>
  getUserById(id: string): Promise<UserProfile | null>
  getUsers(limit?: number, offset?: number): Promise<UserProfile[]>
}
