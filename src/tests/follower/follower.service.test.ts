
import {describe, test} from '@jest/globals'
import { FollowerDTO } from '@domains/follower/dto'
import { FollowerRepo, FollowerRepoImpl } from '@domains/follower/repository'
import { db } from '@utils'
import { FollowerService } from '@domains/follower/service'
import { NotFoundException, ForbiddenException } from '@utils'
import { UserRepository, UserRepositoryImpl } from '@domains/user/repository'
import { FollowerServiceImpl } from '@domains/follower/service/follower.serviceImpl'

describe('FollowerService', () => {
  const followerRepositoryMock: FollowerRepo = new FollowerRepoImpl(db)
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)

  const followerService: FollowerService = new FollowerServiceImpl(followerRepositoryMock, userRepositoryMock)
  const follower: FollowerDTO = { id: '1', followerId: '1', followedId: '2', createdAt: new Date() }

  test('createFollow() should return a FollowerDTO object', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(followerRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(follower))
    jest
      .spyOn(userRepositoryMock, 'getById')
      .mockImplementation(
        async () =>
          await Promise.resolve({
            id: follower.followerId,
            name: 'name',
            username: 'username',
            email: 'email',
            password: 'password',
            isPrivate: false,
            profilePicture: null,
            createdAt: new Date()
          })
      )
    const followerCreated: FollowerDTO = await followerService.FollowUp(follower.followerId, follower.followedId)

    expect(followerCreated.id).toBeDefined()
    expect(followerCreated.followerId).toEqual(follower.followerId)
    expect(followerCreated.followedId).toEqual(follower.followedId)
    expect(followerCreated.createdAt).toEqual(follower.createdAt)
  })

  test('createFollow() should throw a NotFoundException when users do not exist', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await followerService.FollowUp(follower.followerId, follower.followedId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('createFollow() should throw a ForbiddenException when followerId and followedId are the same', async () => {
    try {
      await followerService.FollowUp(follower.followerId, follower.followerId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ForbiddenException)
    }
  })

  test('createFollow() should throw a ForbiddenException when follow already exists', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    try {
      await followerService.FollowUp(follower.followerId, follower.followedId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ForbiddenException)
    }
  })

  test('deleteFollow() should work', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    jest.spyOn(followerRepositoryMock, 'delete').mockImplementation(async () => {
      await Promise.resolve()
    })
    await followerService.Unfollow(follower.followerId, follower.followedId)
    expect(followerRepositoryMock.delete).toBeCalledWith(follower.id)
  })

  test('deleteFollow() should throw a NotFoundException when follow does not exist', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await followerService.Unfollow(follower.followerId, follower.followedId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('doesFollowExist() should return true', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    const followExists: boolean = await followerService.DoesFollows(follower.followerId, follower.followedId)

    expect(followExists).toEqual(true)
  })

  test('doesFollowExist() should return false', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    const followExists: boolean = await followerService.DoesFollows(follower.followerId, follower.followedId)

    expect(followExists).toEqual(false)
  })

  test('getFollowers() should return a FollowerDTO[] object', async () => {
    jest
      .spyOn(userRepositoryMock, 'getById')
      .mockImplementation(
        async () =>
          await Promise.resolve({
            id: follower.followerId,
            name: 'name',
            username: 'username',
            email: 'email',
            password: 'password',
            isPrivate: false,
            profilePicture: null,
            createdAt: new Date()
          })
      )
    jest.spyOn(followerRepositoryMock, 'getFollowers').mockImplementation(async () => await Promise.resolve([follower]))
    const followersFound: FollowerDTO[] = await followerService.getFollowers(follower.followedId)

    expect(followersFound[0].id).toBeDefined()
    expect(followersFound[0].followerId).toEqual(follower.followerId)
    expect(followersFound[0].followedId).toEqual(follower.followedId)
    expect(followersFound[0].createdAt).toEqual(follower.createdAt)
  })

  test('getFollowers() should throw a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await followerService.getFollowers(follower.followedId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getFollows() should return a FollowerDTO[] object', async () => {
    jest
      .spyOn(userRepositoryMock, 'getById')
      .mockImplementation(
        async () =>
          await Promise.resolve({
            id: follower.followedId,
            name: 'name',
            username: 'username',
            email: 'email',
            password: 'password',
            isPrivate: false,
            profilePicture: null,
            createdAt: new Date()
          })
      )
    jest.spyOn(followerRepositoryMock, 'getFollows').mockImplementation(async () => await Promise.resolve([follower]))
    const followsFound: FollowerDTO[] = await followerService.getFollows(follower.followerId)

    expect(followsFound[0].id).toBeDefined()
    expect(followsFound[0].followerId).toEqual(follower.followerId)
    expect(followsFound[0].followedId).toEqual(follower.followedId)
    expect(followsFound[0].createdAt).toEqual(follower.createdAt)
  })

  test('getFollows() should throw a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await followerService.getFollows(follower.followerId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })
})