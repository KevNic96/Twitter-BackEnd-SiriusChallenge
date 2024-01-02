import { OffsetPagination } from '@types'
import { UserDTO, UserViewDTO } from '../dto'

export interface UserService {
  getUser: (userId: any) => Promise<UserDTO>
  deleteUser: (userId: any) => Promise<void>
  getUserByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  getOwnUserView: (userId: string) => Promise<UserViewDTO>
  getUserView: (userId: string, loggedUser: string) => Promise<{ user: UserViewDTO, followsYou: boolean, following: boolean }>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  setPrivate:(userId: string, isPrivate: string) => Promise <boolean> // Punto B
  setProfilePicture: (userId: string, filetype: string) => Promise <{presignedUrl: string, profilePictureUrl: string}>
  getProfilePicture: (userId: string) => Promise<string|null>
}
