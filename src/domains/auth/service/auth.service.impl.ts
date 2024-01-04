import { UserRepository } from '@domains/user/repository'
import {checkPassword, ConflictException, encryptPassword, generateAccessToken, NotFoundException, UnauthorizedException} from '@utils'
import jwt from 'jsonwebtoken'
import { Constants } from '@utils'
import { LoginInputDTO, SignupInputDTO, TokenDTO } from '../dto'
import { AuthService } from './auth.service'

export class AuthServiceImpl implements AuthService {
  constructor (private readonly userRepo: UserRepository) {}

  async signup (data: SignupInputDTO): Promise<TokenDTO> {
    const existingUser = await this.userRepo.getByEmailOrUsername(data.email, data.username)
    if(existingUser) throw new ConflictException('USER_ALREADY_EXISTS') //Verifica si ya existe un usuario con el mismo correo o nombre de usuario. Si existe, lanza una excepción de conflicto.

    const encryptedPassword = await encryptPassword(data.password) //Encripta la contraseña proporcionada utilizando la funcion

    const user = await this.userRepo.create({ ...data, password: encryptedPassword }) //Crea un nuevo usuario en la base de datos utilizando el repositorio y la contraseña encriptada.
    const token = generateAccessToken({ userId: user.id }) //Genera un token de acceso utilizando la funcion

    return { token } //Retorna un objeto 'TokenDTO' con el token generado
  }

  async login (data: LoginInputDTO): Promise<{userId: string, token: string}> {

    const user = await this.userRepo.getByEmailOrUsername(data.email, data.username)
    if (!user) throw new NotFoundException('user') // Busca un usuario por correo o nombre de usuario. Si no encuentra al usuario, lanza una excepcion de "No encontrado"

    const isCorrectPassword = await checkPassword(data.password, user.password) // Verifica si la contraseña proporcionada coincide con la contraseña almacenada en la base de datos utilizando la funcion
    if (!isCorrectPassword) throw new UnauthorizedException('INCORRECT_PASSWORD') 

    const token = generateAccessToken({ userId: user.id }) //Genera un token de acceso utilizando la funcion

    return { userId: user.id,token } //Retorna el objeto 'TokenDTO' con el token generado
  }


  // AGREGAR VERIFICACION DEL TOKEN
  
  verifyToken (token: string): {isValid:boolean} {
    try{
      jwt.verify(token, Constants.TOKEN_SECRET)
      return {isValid: true}
    } catch (err) {
      return {isValid: false}
    }
  }
}
