import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'

export interface UserService {
  getUser: (userId: string) => Promise<ExtendedUserDTO>
  deleteUser: (userId: any) => Promise<void>
  getUserByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  getOwnUserView: (userId: string) => Promise<UserViewDTO> //Punto 9
  getUserView: (userId: string, loggedUser: string) => Promise<{ user: UserViewDTO, followsYou: boolean, following: boolean }>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  setPrivate:(userId: string, isPrivate: string) => Promise <boolean> // Punto 2
  setProfilePicture: (userId: string, filetype: string) => Promise <{presignedUrl: string, profilePictureUrl: string}> //Punto 8)
  getProfilePicture: (userId: string) => Promise<string|null> //Punto 8)
}
