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
    const recommendedUsers = await this.userRepo.getRecommendedUsersPaginated(userId, options) // Devuelve usuarios recomendados
    const filterPromises = recommendedUsers.map(async(user) => { //  Filtrado
      const following = await this.followRepo.getById(userId, user.id)
      return following ? false : true // Si el usuario actual sigue a otro usuario devuelve false, sino, devuelve true
    });
    const filterResults = await Promise.all(filterPromises) //Array que indican si un usuario es seguido por el otro
    const filteredUsers = recommendedUsers.filter((_, index)=> filterResults[index]); // Filtra y contiene solo a los usuarios que no son seguidos por el actual
    return filteredUsers.map((user)=> new UserViewDTO(user)) //Se mapea a cada usuario y se devuelve el array
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
    // const BUCKET_NAME = 'twitter-bucket-challenge-sirius'
    const user = await this.userRepo.getById(userId)
    if(!user) throw new NotFoundException('user')
    const data = await generateS3Url(filetype) //devuelve un objeto que contiene la presignedURL y el nombre del archivo
    const url = `https://${Constants.BUCKET_NAME}.s3.amazonaws.com/${data.filename}.jpeg`
    // const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${data.filename}.jpeg`
    await this.userRepo.setProfilePicture(userId, url) //Actualiza la imagen de perfil con la nueva url
    return {presignedUrl: data.presignedUrl,profilePictureUrl:url}
  }

  async getProfilePicture(userId: string): Promise<string|null>{
    const url = await this.userRepo.getProfilePicture(userId) //Se utiliza el repositorio de usuario para obtener la URL del usuario correspondiente
    return url
  }

}
