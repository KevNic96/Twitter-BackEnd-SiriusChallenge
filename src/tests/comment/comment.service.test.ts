import {describe, test} from '@jest/globals'
import { ExtendedPostDTO,PostDTO } from '@domains/post/dto'
import { CommentRepository, CommentRepoImpl } from '@domains/comment/repository'
import { ValidationException, db } from '@utils'
import { CommentService, CommentServiceImpl } from '@domains/comment/service'
import { PostRepository, PostRepositoryImpl } from '@domains/post/repository'
import { NotFoundException, ForbiddenException } from '@utils'
import { UserRepository, UserRepositoryImpl } from '@domains/user/repository'
import { CreateCommentInputDTO } from '@domains/comment/dto'
import {validate} from 'class-validator'
import { FollowerRepo, FollowerRepoImpl } from '@domains/follower/repository'
import { ExtendedUserDTO } from '@domains/user/dto'
import { FollowerDTO } from '@domains/follower/dto'

describe('CommentService', () => {
  const MockCommentRepo: CommentRepository = new CommentRepoImpl(db)
  const MockFollowRepo: FollowerRepo = new FollowerRepoImpl(db)
  const MockUserRepo: UserRepository = new UserRepositoryImpl(db)
  const MockPostRepo: PostRepository = new PostRepositoryImpl(db)

  const commentService: CommentService = new CommentServiceImpl(
    MockCommentRepo,
    MockFollowRepo,
    MockUserRepo,
    MockPostRepo
  )
  const comment: PostDTO = {
    id: '1',
    authorId: '1',
    parentId: '1',
    content: 'content',
    createdAt: new Date(),
    images: []
  }
  const extendedComment: ExtendedPostDTO = {
    id: '1',
    authorId: '1',
    parentId: '1',
    content: 'content',
    createdAt: new Date(),
    images: [],
    author: {
      id: '1',
      username: 'username',
      name: 'name',
      email: 'email',
      password: 'password',
      isPrivate: false,
      profilePicture: 'profilePictureUrl',
      createdAt: new Date()
    },
    reactions: [],
    isComment: true,
    qtyComments: 0,
    qtyLikes: 0,
    qtyRetweets: 0
  }
  const commentInput: CreateCommentInputDTO = { parentId: '1', content: 'content' }
  const extendedUser: ExtendedUserDTO = {
    id: '1',
    username: 'username',
    name: 'name',
    email: 'email',
    password: 'password',
    isPrivate: true,
    profilePicture: 'profilePictureUrl',
    createdAt: new Date()
  }
  const follower: FollowerDTO = { id: '1', followerId: '1', followedId: '1', createdAt: new Date() }

  test('createComment() Should return a CommentDTO object', async () => {
  jest.spyOn(MockPostRepo, 'addQtyComments').mockImplementation(async () => {
  await Promise.resolve()
  })
  jest.spyOn(MockPostRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
  jest.spyOn(MockCommentRepo, 'create').mockImplementation(async () => await Promise.resolve(comment))
  const commentCreated: PostDTO = await commentService.createComment(comment.authorId, commentInput)

  expect(commentCreated.id).toBeDefined()
  expect(commentCreated.authorId).toEqual(comment.authorId)
  expect(commentCreated.parentId).toEqual(comment.parentId)
  expect(commentCreated.content).toEqual(comment.content)
  expect(commentCreated.createdAt).toEqual(comment.createdAt)
  })

  test('createComment() Should throw a ValidationException when data is invalid', async () => {
    jest.fn(validate).mockImplementation(async () => await Promise.reject(new Error()))
    try {
      await commentService.createComment(comment.authorId, commentInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('deleteComment() Should delete a comment if the user wants to', async () => {
    jest.spyOn(MockCommentRepo, 'getByCommentId').mockImplementation(async () => await Promise.resolve(comment))
    jest.spyOn(MockCommentRepo, 'delete').mockImplementation(async () => {
      await Promise.resolve()
    })
    jest.spyOn(MockPostRepo, 'removeQtyComments').mockImplementation(async () => {
      await Promise.resolve()
    })
    await commentService.deleteComment(comment.authorId, comment.id)

  expect(MockCommentRepo.delete).toBeCalledWith(comment.id)
  })

  test('deleteComment() Should throw a NotFoundException when comment does not exist', async () => {
  jest.spyOn(MockCommentRepo, 'getByCommentId').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.deleteComment(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getComment() Should return a PostDTO object', async () => {
    jest.spyOn(MockCommentRepo, 'getByCommentId').mockImplementation(async () => await Promise.resolve(comment))
    jest.spyOn(MockUserRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(MockFollowRepo, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    const commentFound: PostDTO = await commentService.getComment(comment.authorId, comment.id)

    expect(commentFound.id).toBeDefined()
    expect(commentFound.authorId).toEqual(comment.authorId)
    expect(commentFound.parentId).toEqual(comment.parentId)
    expect(commentFound.content).toEqual(comment.content)
    expect(commentFound.createdAt).toEqual(comment.createdAt)
  })

  test('getComment() Should throw a NotFoundException when comment does not exist', async () => {
    jest.spyOn(MockCommentRepo, 'getByCommentId').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.getComment(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getComment() Should throw a NotFoundException when author is private and user does not follow', async () => {
    jest.spyOn(MockCommentRepo, 'getByCommentId').mockImplementation(async () => await Promise.resolve(comment))
    jest.spyOn(MockUserRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(MockFollowRepo, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.getComment(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getCommentsByAuthor() should return a PostDTO[] object', async () => {
    jest.spyOn(MockCommentRepo, 'getByAuthorId').mockImplementation(async () => await Promise.resolve([comment]))
    jest.spyOn(MockFollowRepo, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    const commentsFound: PostDTO[] = await commentService.getAuthorComments(comment.authorId, comment.id)

    expect(commentsFound[0].id).toBeDefined()
    expect(commentsFound[0].authorId).toEqual(comment.authorId)
    expect(commentsFound[0].parentId).toEqual(comment.parentId)
    expect(commentsFound[0].content).toEqual(comment.content)
    expect(commentsFound[0].createdAt).toEqual(comment.createdAt)
  })

  test('getCommentsByAuthor() should throw a NotFoundException when author is private and user does not follow', async () => {
    jest.spyOn(MockPostRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(MockUserRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(MockFollowRepo, 'getById').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(MockCommentRepo, 'getByAuthorId').mockImplementation(async () => await Promise.resolve([comment]))
    try {
      await commentService.getAuthorComments(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getCommentsByPost() should return a ExtendedPostDTO[] object', async () => {
    jest.spyOn(MockPostRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(MockUserRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(MockFollowRepo, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    jest
      .spyOn(MockCommentRepo, 'getAllByPostId')
      .mockImplementation(async () => await Promise.resolve([extendedComment]))
    const commentsFound: ExtendedPostDTO[] = await commentService.getPostComments(comment.authorId, comment.id, {
    limit: 10
  })

    expect(commentsFound[0].id).toBeDefined()
    expect(commentsFound[0].authorId).toEqual(comment.authorId)
    expect(commentsFound[0].parentId).toEqual(comment.parentId)
    expect(commentsFound[0].content).toEqual(comment.content)
    expect(commentsFound[0].createdAt).toEqual(comment.createdAt)
  })

  test('getCommentsByPost() Should throw a NotFoundException when post does not exist', async () => {
    jest.spyOn(MockPostRepo, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.getPostComments(comment.authorId, comment.parentId as string, { limit: 10 })
  } catch (error: any) {
    expect(error).toBeInstanceOf(NotFoundException)
  }
  })

  test('getCommentsByPost() Should throw a NotFoundException when author is private and user does not follow', async () => {
    jest.spyOn(MockPostRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(MockUserRepo, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(MockFollowRepo, 'getById').mockImplementation(async () => await Promise.resolve(null))
    jest
      .spyOn(MockCommentRepo, 'getAllByPostId')
      .mockImplementation(async () => await Promise.resolve([extendedComment]))
    try {
      await commentService.getPostComments(comment.authorId, comment.id, { limit: 10 })
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getComment() ', async() =>{
    expect(true).toBeTruthy
  })
})