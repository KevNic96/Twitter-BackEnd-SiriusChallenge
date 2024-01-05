import { describe, test } from '@jest/globals'
import { db } from '@utils'
import { AuthService, AuthServiceImpl } from '@domains/auth/service'
import { SignupInputDTO, LoginInputDTO } from '@domains/auth/dto'
import { ExtendedUserDTO } from '@domains/user/dto'
import { UserRepository, UserRepositoryImpl } from '@domains/user/repository'
import {
  ConflictException,
  ValidationException,
  NotFoundException,
  checkPassword,
  UnauthorizedException
} from '../../utils'

describe('AuthService', () => {
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const authService: AuthService = new AuthServiceImpl(userRepositoryMock)

  const signupInput: SignupInputDTO = { email: 'example@gmail.com', username: 'Testusername', password: 'password', name: '' }
  const loginInput: LoginInputDTO = { email: 'example@gmail.com', password: 'password' }
  const extendedUser: ExtendedUserDTO = {
    id: '1',
    username: 'TestUsername',
    name: 'TestName',
    email: 'example@gmail.com',
    password: 'password',
    isPrivate: false,
    profilePicture: 'profilePictureUrl',
    createdAt: new Date()
  }

  test('signup() should return UserId and auth token', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(userRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(authService, 'signup').mockImplementation(async () => await Promise.resolve({ userId: '1', token: 'token' }))
    const data = await authService.signup(signupInput)
    expect(data.token).toBeDefined()
    expect(data.userId).toBeDefined()
  })

  test('signup() should throw a ConflictException when user already exists', async () => {
    jest
      .spyOn(userRepositoryMock, 'getByEmailOrUsername')
      .mockImplementation(async () => await Promise.resolve(extendedUser))
    try {
      await authService.signup(signupInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ConflictException)
    }
  })

  test('signup() should throw a ValidationException when data is invalid', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))

    try {
      await authService.signup({ email: '', username: '', password: '', name: '' })
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('login() should return UserId and auth token', async () => {
    jest
      .spyOn(userRepositoryMock, 'getByEmailOrUsername')
      .mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(authService, 'login').mockImplementation(async () => await Promise.resolve({ userId: '1', token: 'token' }))
    const data = await authService.login(loginInput)
    expect(data.token).toBeDefined()
    expect(data.userId).toBeDefined()
  })

  test('login() should throw a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))

    try {
      await authService.login(loginInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('login() should throw a ValidationException when data is invalid', async () => {
    jest.spyOn(userRepositoryMock, 'getByEmailOrUsername').mockImplementation(async () => await Promise.resolve(null))

    try {
      await authService.login({ email: '', password: '' })
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('login() should throw a ValidationException when password is incorrect', async () => {
    jest
      .spyOn(userRepositoryMock, 'getByEmailOrUsername')
      .mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.fn(checkPassword).mockImplementation(async () => await Promise.resolve(false))

    try {
      await authService.login(loginInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException)
    }
  })
})