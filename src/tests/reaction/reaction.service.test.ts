import {describe, test} from '@jest/globals'
import { ReactionDTO } from '@domains/reaction/dto'
import { ReactionRepository, ReactionRepoImpl } from '@domains/reaction/repository'
import { db } from '@utils'
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service'
import { PostRepository, PostRepositoryImpl } from '@domains/post/repository'
import { ReactionType } from '@prisma/client'
import { NotFoundException, ValidationException } from '@utils'

describe('ReactionService', () => {
  const reactionRepositoryMock: ReactionRepository = new ReactionRepoImpl(db)
  const postRepositoryMock: PostRepository = new PostRepositoryImpl(db)

  const reactionService: ReactionService = new ReactionServiceImpl(reactionRepositoryMock, postRepositoryMock)
  const reaction: ReactionDTO = { id: '1', userId: '1', postId: '1', type: ReactionType.LIKE }

  test('createReaction() should return a ReactionDTO object', async () => {
    jest.spyOn(reactionRepositoryMock, 'getByIdAndType').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(reactionRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(reaction))
    jest.spyOn(postRepositoryMock, 'addQtyLikes').mockImplementation(async () => {
      await Promise.resolve()
    })
    const reactionCreated: ReactionDTO = await reactionService.createReaction(
      reaction.userId,
      reaction.postId,
      reaction.type as ReactionType
    )

    expect(reactionCreated.id).toBeDefined()
    expect(reactionCreated.userId).toEqual(reaction.userId)
    expect(reactionCreated.postId).toEqual(reaction.postId)
    expect(reactionCreated.type).toEqual(reaction.type)
  })

  test('createReaction() should throw a ValidationException when reaction already exists', async () => {
    jest
      .spyOn(reactionRepositoryMock, 'getByIdAndType')
      .mockImplementation(async () => await Promise.resolve(reaction))
    try {
      await reactionService.createReaction(reaction.userId, reaction.postId, reaction.type as ReactionType)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('deleteReaction() should work', async () => {
    jest
      .spyOn(reactionRepositoryMock, 'getByIdAndType')
      .mockImplementation(async () => await Promise.resolve(reaction))
    jest.spyOn(reactionRepositoryMock, 'delete').mockImplementation(async () => {
      await Promise.resolve()
    })
    jest.spyOn(postRepositoryMock, 'removeQtyLikes').mockImplementation(async () => {
      await Promise.resolve()
    })
    await reactionService.deleteReaction(reaction.userId, reaction.postId, reaction.type as ReactionType)
    expect(reactionRepositoryMock.delete).toBeCalledWith(reaction.id)
  })

  test('getReactionById() should return a ReactionDTO object', async () => {
    jest.spyOn(reactionRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(reaction))
    const reactionFound: ReactionDTO = await reactionService.getReactionById(reaction.id)

    expect(reactionFound.id).toBeDefined()
    expect(reactionFound.userId).toEqual(reaction.userId)
    expect(reactionFound.postId).toEqual(reaction.postId)
    expect(reactionFound.type).toEqual(reaction.type)
  })

  test('getReactionById() should throw a NotFoundException when reaction does not exist', async () => {
    jest.spyOn(reactionRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await reactionService.getReactionById(reaction.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getReactionsByUserAndType() should return a ReactionDTO object', async () => {
    jest
      .spyOn(reactionRepositoryMock, 'getByUserAndType')
      .mockImplementation(async () => await Promise.resolve([reaction]))
    const reactionsFound: ReactionDTO[] = await reactionService.getReactionsByUserAndType(
      reaction.userId,
      reaction.type as ReactionType
    )

    expect(reactionsFound[0].id).toBeDefined()
    expect(reactionsFound[0].userId).toEqual(reaction.userId)
    expect(reactionsFound[0].postId).toEqual(reaction.postId)
    expect(reactionsFound[0].type).toEqual(reaction.type)
  })

  test('getReactionsByUserAndType() should throw a NotFoundException when reaction does not exist', async () => {
    jest.spyOn(reactionRepositoryMock, 'getByUserAndType').mockImplementation(async () => await Promise.resolve(null))
    try {
      await reactionService.getReactionsByUserAndType(reaction.userId, reaction.type as ReactionType)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('doesReactionExist() should return true', async () => {
    jest
      .spyOn(reactionRepositoryMock, 'getByIdAndType')
      .mockImplementation(async () => await Promise.resolve(reaction))
    const reactionExists: boolean = await reactionService.doesReactionExist(
      reaction.userId,
      reaction.postId,
      reaction.type as ReactionType
    )

    expect(reactionExists).toEqual(true)
  })

  test('doesReactionExist() should return false', async () => {
    jest.spyOn(reactionRepositoryMock, 'getByIdAndType').mockImplementation(async () => await Promise.resolve(null))
    const reactionExists: boolean = await reactionService.doesReactionExist(
      reaction.userId,
      reaction.postId,
      reaction.type as ReactionType
    )

    expect(reactionExists).toEqual(false)
  })
})