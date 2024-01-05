import { NotFoundException, ValidationException } from '@utils/errors'
import { CursorPagination, OffsetPagination } from 'types'
import { UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { UserViewDTO, ExtendedUserDTO } from '../dto'
import { generateS3Url } from '@utils/s3'
import { Constants } from '@utils'
import { FollowerRepo } from '@domains/follower/repository'

export class UserServiceImpl implements UserService {
  constructor (private readonly userRepo: UserRepository, private readonly followRepo: FollowerRepo) {}

  async getUser (userId: string): Promise<ExtendedUserDTO> {
    const user = await this.userRepo.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    const recommendedUsers = await this.userRepo.getRecommendedUsersPaginated(userId, options)
    const filterPromises = recommendedUsers.map(async(user) => {
      const following = await this.followRepo.getById(userId, user.id)
      return following ? false : true
    });
    const filterResults = await Promise.all(filterPromises)
    const filteredUsers = recommendedUsers.filter((_, index)=> filterResults[index]);
    return filteredUsers.map((user)=> new UserViewDTO(user))
  }

  async deleteUser (userId: any): Promise<void> {
    await this.userRepo.delete(userId)
  }

  async setPrivate (userId: string, isPrivate: string): Promise <boolean>{
    if(isPrivate !== 'true' && isPrivate !=='false') throw new ValidationException([{message: 'The parameter must be true or false'}]) // Valida que 'isPrivate' sea true o false. Si no es asi, lanza una excepcion ValidationException
    let set: boolean // Determina el valor booleano 'set' basado en el valor de 'isPrivate'
    isPrivate === 'true' ? (set = true):(set=false) // Si isPrivate es igual a la cadena 'true', entonces set se establecerá en true, caso contrario en false.
    return await this.userRepo.setPrivate(userId,set) // Utiliza el metodo setPrivate del repositorio para establecer la configuracion de privacidad y devuelve el resultado
  }

  async getUserByUsername(username: string, options: CursorPagination): Promise<UserViewDTO[]>{
    const users = await this.userRepo.getByUsernamePaginated(username, options)
    return users.map((user)=> new UserViewDTO(user))
  }

  async getUserView(userId: string, loggedUser: string): Promise <{user: UserViewDTO, followsYou: boolean, following: boolean}>{
    const user = await this.userRepo.getById(userId)
    if(!user) throw new NotFoundException('user')
    const followsYou = await this.followRepo.getById(userId, loggedUser)
    const following = await this.followRepo.getById(loggedUser, userId)
    const userView = new UserViewDTO(user)
    return {user:userView, followsYou: followsYou != null, following: following != null}
  }

  async getOwnUserView (userId: string): Promise <UserViewDTO>{
    const user = await this.userRepo.getById(userId)
    if(!user) throw new NotFoundException('user')
    const userView = new UserViewDTO(user)
    return userView
  }

  async setProfilePicture(userId: string, filetype: string): Promise <{presignedUrl: string, profilePictureUrl: string}>{
    const user = await this.userRepo.getById(userId)
    if(!user) throw new NotFoundException('user')
    const data = await generateS3Url(filetype)
  const url = `https://${Constants.BUCKET_NAME}.s3.amazonaws.com/${data.filename}.jpeg`
  await this.userRepo.setProfilePicture(userId, url)
  return {presignedUrl: data.presignedUrl,profilePictureUrl:url}
  }

  async getProfilePicture(userId: string): Promise<string|null>{
    const url = await this.userRepo.getProfilePicture(userId)
    return url
  }

}
