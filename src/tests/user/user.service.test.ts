import {describe, test} from '@jest/globals'
import { ExtendedUserDTO, UserViewDTO } from '@domains/user/dto'
import { UserRepository, UserRepositoryImpl } from '@domains/user/repository'
import { db } from '@utils'
import { UserService, UserServiceImpl } from '@domains/user/service'
import { NotFoundException } from '@utils'
import { FollowerRepoImpl } from '@domains/follower/repository'
import { FollowerRepo } from '@domains/follower/repository'
import { MockS3UserRepo } from './MockUserRepo'

describe('UserService', () => {
  const s3Mock = new MockS3UserRepo()
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const followerRepositoryMock: FollowerRepo = new FollowerRepoImpl(db)

  const user: ExtendedUserDTO = {
    id: '1',
    username: 'username',
    email: 'email',
    password: 'password',
    name: 'name',
    isPrivate: false,
    createdAt: new Date(),
    profilePicture: null
  }
  const userLogged: ExtendedUserDTO = {
    id: '2',
    username: 'username2',
    email: 'email2',
    password: 'password2',
    name: 'name2',
    isPrivate: false,
    createdAt: new Date(),
    profilePicture: null
  }
  const users: ExtendedUserDTO[] = [
    {
      id: '1',
      username: 'username',
      email: 'email',
      password: 'password',
      name: 'name',
      isPrivate: false,
      createdAt: new Date(),
      profilePicture: null
    },
    {
      id: '2',
      username: 'username2',
      email: 'email2',
      password: 'password2',
      name: 'name2',
      isPrivate: false,
      createdAt: new Date(),
      profilePicture: null
    },
    {
      id: '3',
      username: 'username3',
      email: 'email3',
      password: 'password3',
      name: 'name3',
      isPrivate: false,
      createdAt: new Date(),
      profilePicture: null
    }
  ]

  const userService: UserService = new UserServiceImpl(userRepositoryMock, followerRepositoryMock)

  test('getUser() should return a ExtendedUserDTO object', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(user))
    const userFound: ExtendedUserDTO = await userService.getUser(user.id)

    expect(userFound.id).toEqual(user.id)
    expect(userFound.username).toEqual(user.username)
    expect(userFound.email).toEqual(user.email)
    expect(userFound.password).toEqual(user.password)
    expect(userFound.name).toEqual(user.name)
    expect(userFound.isPrivate).toEqual(user.isPrivate)
    expect(userFound.createdAt).toEqual(user.createdAt)
    expect(userFound.profilePicture).toEqual(user.profilePicture)
  })

  test('getUser() should return a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await userService.getUser(user.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getUsersByUsername() should return a UserViewDTO[] object', async () => {
    jest
      .spyOn(userRepositoryMock, 'getByUsernamePaginated')
      .mockImplementation(async () => await Promise.resolve(users))
    const usersFound: UserViewDTO[] = await userService.getUserByUsername(user.username, { limit: 10, skip: 0 })

    expect(usersFound[0].id).toEqual(user.id)
    expect(usersFound[0].username).toEqual(user.username)
    expect(usersFound[0].name).toEqual(user.name)
    expect(usersFound[0].profilePicture).toEqual(user.profilePicture)
    expect(usersFound).toHaveLength(3)
  })

  test('getUsersByUsername() should return an empty array when users do not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getByUsernamePaginated').mockImplementation(async () => await Promise.resolve([]))
    const usersFound: UserViewDTO[] = await userService.getUserByUsername(user.username, { limit: 10, skip: 0 })

    expect(usersFound).toHaveLength(0)
  })

  test('getUserView() should return a { user: UserViewDTO, followsYou: boolean } object', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(user))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    const userFound: { user: UserViewDTO, followsYou: boolean } = await userService.getUserView(user.id, userLogged.id)

    expect(userFound.user.id).toEqual(user.id)
    expect(userFound.user.username).toEqual(user.username)
    expect(userFound.user.name).toEqual(user.name)
    expect(userFound.user.profilePicture).toEqual(user.profilePicture)
    expect(userFound.user.isPrivate).toEqual(user.isPrivate)
    expect(userFound.followsYou).toEqual(false)
  })

  test('getSelfUserView() should return a UserViewDTO object', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(user))
    const userFound: UserViewDTO = await userService.getOwnUserView(user.id)

    expect(userFound.id).toEqual(user.id)
    expect(userFound.username).toEqual(user.username)
    expect(userFound.name).toEqual(user.name)
    expect(userFound.profilePicture).toEqual(user.profilePicture)
    expect(userFound.isPrivate).toEqual(user.isPrivate)
  })

  test('getUserView() should return a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await userService.getUserView(user.id, userLogged.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getUserRecommendations() should return a UserViewDTO[] object', async () => {
    const recommended: UserViewDTO[] = [
      { id: '2', username: 'username2', name: 'name2', profilePicture: null, isPrivate: false },
      { id: '3', username: 'username3', name: 'name3', profilePicture: null, isPrivate: false }
    ]
    jest
      .spyOn(userRepositoryMock, 'getRecommendedUsersPaginated')
      .mockImplementation(async () => await Promise.resolve(recommended))
    const usersFound: UserViewDTO[] = await userService.getUserRecommendations(user.id, { limit: 10, skip: 0 })

    expect(usersFound[0].id).toEqual(recommended[0].id)
    expect(usersFound[0].username).toEqual(recommended[0].username)
    expect(usersFound[0].name).toEqual(recommended[0].name)
    expect(usersFound[0].profilePicture).toEqual(recommended[0].profilePicture)
    expect(usersFound).toHaveLength(2)
  })

  test('getUserRecommendations() should return an empty array when users do not exist', async () => {
    jest
      .spyOn(userRepositoryMock, 'getRecommendedUsersPaginated')
      .mockImplementation(async () => await Promise.resolve([]))
    const usersFound: UserViewDTO[] = await userService.getUserRecommendations(user.id, { limit: 10, skip: 0 })

    expect(usersFound).toHaveLength(0)
  })

  test('deleteUser() should return void', async () => {
    jest.spyOn(userRepositoryMock, 'delete').mockImplementation(async () => {
      await Promise.resolve()
    })
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(user))
    await userService.deleteUser(user.id)
  })

  test('setPrivate() should return true', async () => {
    jest.spyOn(userRepositoryMock, 'setPrivate').mockImplementation(async () => await Promise.resolve(true))
    const isPrivate: boolean = await userService.setPrivate(user.id, 'true')

    expect(isPrivate).toEqual(true)
  })

  test('setPrivate() should return false', async () => {
    jest.spyOn(userRepositoryMock, 'setPrivate').mockImplementation(async () => await Promise.resolve(false))
    const isPrivate: boolean = await userService.setPrivate(user.id, 'false')

    expect(isPrivate).toEqual(false)
  })

  test('setPrivate() should return an error', async () => {
    try {
      await userService.setPrivate(user.id, 'error')
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  /////////////////
  test('setProfilePicture() should return a presignedUrl and a profilePictureUrl', async () => {
    const presigned = await s3Mock.createPresigned({Key: 'example.jpg'})
    expect(presigned.presignedUrl).toBeDefined()
    expect(presigned.profilePicture).toBeDefined()
  })

  test('setProfilePicture() should return a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await userService.setProfilePicture(user.id, "url")
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getProfilePicture() should return a profilePictureUrl', async () => {
    jest
      .spyOn(userRepositoryMock, 'getProfilePicture')
      .mockImplementation(async () => await Promise.resolve(user.profilePicture))
    const profilePictureUrl: string | null = await userService.getProfilePicture(user.id)

    expect(profilePictureUrl).toEqual(user.profilePicture)
  })

  test('getProfilePicture() should return null', async () => {
    jest.spyOn(userRepositoryMock, 'getProfilePicture').mockImplementation(async () => await Promise.resolve(null))
    const profilePictureUrl: string | null = await userService.getProfilePicture(user.id)

    expect(profilePictureUrl).toEqual(null)
  })

  test('getProfilePicture() should return a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await userService.getProfilePicture(user.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })
})