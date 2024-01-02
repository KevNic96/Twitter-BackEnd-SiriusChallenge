import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO } from '../dto'
import { UserViewDTO } from '../dto'

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (userId: string,options: OffsetPagination) => Promise<UserViewDTO[]>
  getById: (userId: string) => Promise<UserDTO | null>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  setPrivate: (userId: string, isPrivate: boolean) => Promise <boolean> // Punto B
  getByUsername: (username: string)=> Promise <ExtendedUserDTO|null>
  getByEmail: (email: string) => Promise<ExtendedUserDTO|null>
  setProfilePicture: (userId: string, pictureUrl: string) => Promise<void>
  getProfilePicture: (userId: string) => Promise <string|null>
  getByUsernamePaginated: (username: string, options: OffsetPagination) => Promise <ExtendedUserDTO[]>
}
