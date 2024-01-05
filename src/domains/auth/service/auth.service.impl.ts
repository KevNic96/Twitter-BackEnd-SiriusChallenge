import { UserRepository } from '@domains/user/repository'
import {checkPassword, ConflictException, encryptPassword, generateAccessToken, NotFoundException, UnauthorizedException} from '@utils'
import jwt from 'jsonwebtoken'
import { Constants } from '@utils'
import { LoginInputDTO, SignupInputDTO, TokenDTO } from '../dto'
import { AuthService } from './auth.service'

export class AuthServiceImpl implements AuthService {
  constructor (private readonly userRepo: UserRepository) {}

  async signup (data: SignupInputDTO): Promise<TokenDTO> {
    const existingUser = await this.userRepo.getByEmailOrUsername(data.email, data.username) //Verifica mail y usuario
    if(existingUser) throw new ConflictException('USER_ALREADY_EXISTS')

    const encryptedPassword = await encryptPassword(data.password) //Encripta la contraseña proporcionada utilizando la funcion

    const user = await this.userRepo.create({ ...data, password: encryptedPassword }) //Crea un nuevo usuario en la base de datos utilizando el repositorio y la contraseña encriptada.
    const token = generateAccessToken({ userId: user.id }) //Genera un token

    return { userId: user.id, token }
  }

  async login (data: LoginInputDTO): Promise<{userId: string, token: string}> {

    const user = await this.userRepo.getByEmailOrUsername(data.email, data.username) // Verifica mail o username
    if (!user) throw new NotFoundException('user')

    const isCorrectPassword = await checkPassword(data.password, user.password) // Comprueba contraseñas
    if (!isCorrectPassword) throw new UnauthorizedException('INCORRECT_PASSWORD')

    const token = generateAccessToken({ userId: user.id }) //Genera token

    return { userId: user.id,token }
  }


  // Verificacion del token
  verifyToken (token: string): {isValid:boolean} {
    try{
      jwt.verify(token, Constants.TOKEN_SECRET)
      return {isValid: true}
    } catch (err) {
      return {isValid: false}
    }
  }
}
