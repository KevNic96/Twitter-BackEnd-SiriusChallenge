import {describe, test} from '@jest/globals'
import { ExtendedPostDTO,PostDTO } from '@domains/post/dto'
import { CommentRepository, CommentRepoImpl } from '@domains/comment/repository'
import { db } from '@utils'
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
  const commentRepositoryMock: CommentRepository = new CommentRepoImpl(db)
  const followerRepositoryMock: FollowerRepo = new FollowerRepoImpl(db)
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const postRepositoryMock: PostRepository = new PostRepositoryImpl(db)

  const commentService: CommentService = new CommentServiceImpl(
    commentRepositoryMock,
    followerRepositoryMock,
    userRepositoryMock,
    postRepositoryMock
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

  test('createComment() should return a CommentDTO object', async () => {
    jest.spyOn(postRepositoryMock, 'addQtyComments').mockImplementation(async () => {
      await Promise.resolve()
    })
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(commentRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(comment))
    const commentCreated: PostDTO = await commentService.createComment(comment.authorId, commentInput)

    expect(commentCreated.id).toBeDefined()
    expect(commentCreated.authorId).toEqual(comment.authorId)
    expect(commentCreated.parentId).toEqual(comment.parentId)
    expect(commentCreated.content).toEqual(comment.content)
    expect(commentCreated.createdAt).toEqual(comment.createdAt)
  })

  test('createComment() should throw a ValidationException when data is invalid', async () => {
    jest.fn(validate).mockImplementation(async () => await Promise.reject(new Error()))
    try {
      await commentService.createComment(comment.authorId, commentInput)
    } catch (error: any) {
      expect(error).toBeInstanceOf(ForbiddenException)
    }
  })

  test('deleteComment() should work', async () => {
    jest.spyOn(commentRepositoryMock, 'getByCommentId').mockImplementation(async () => await Promise.resolve(comment))
    jest.spyOn(commentRepositoryMock, 'delete').mockImplementation(async () => {
      await Promise.resolve()
    })
    jest.spyOn(postRepositoryMock, 'removeQtyComments').mockImplementation(async () => {
      await Promise.resolve()
    })
    await commentService.deleteComment(comment.authorId, comment.id)

    expect(commentRepositoryMock.delete).toBeCalledWith(comment.id)
  })

  test('deleteComment() should throw a NotFoundException when comment does not exist', async () => {
    jest.spyOn(commentRepositoryMock, 'getByCommentId').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.deleteComment(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getComment() should return a PostDTO object', async () => {
    jest.spyOn(commentRepositoryMock, 'getByCommentId').mockImplementation(async () => await Promise.resolve(comment))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    const commentFound: PostDTO = await commentService.getComment(comment.authorId, comment.id)

    expect(commentFound.id).toBeDefined()
    expect(commentFound.authorId).toEqual(comment.authorId)
    expect(commentFound.parentId).toEqual(comment.parentId)
    expect(commentFound.content).toEqual(comment.content)
    expect(commentFound.createdAt).toEqual(comment.createdAt)
  })

  test('getComment() should throw a NotFoundException when comment does not exist', async () => {
    jest.spyOn(commentRepositoryMock, 'getByCommentId').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.getComment(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getComment() should throw a NotFoundException when author is private and user does not follow', async () => {
    jest.spyOn(commentRepositoryMock, 'getByCommentId').mockImplementation(async () => await Promise.resolve(comment))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.getComment(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getCommentsByAuthor() should return a PostDTO[] object', async () => {
    jest.spyOn(commentRepositoryMock, 'getByAuthorId').mockImplementation(async () => await Promise.resolve([comment]))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    const commentsFound: PostDTO[] = await commentService.getAuthorComments(comment.authorId, comment.id)

    expect(commentsFound[0].id).toBeDefined()
    expect(commentsFound[0].authorId).toEqual(comment.authorId)
    expect(commentsFound[0].parentId).toEqual(comment.parentId)
    expect(commentsFound[0].content).toEqual(comment.content)
    expect(commentsFound[0].createdAt).toEqual(comment.createdAt)
  })

  test('getCommentsByAuthor() should throw a NotFoundException when author is private and user does not follow', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    jest.spyOn(commentRepositoryMock, 'getByAuthorId').mockImplementation(async () => await Promise.resolve([comment]))
    try {
      await commentService.getAuthorComments(comment.authorId, comment.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getCommentsByPost() should return a ExtendedPostDTO[] object', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follower))
    jest
      .spyOn(commentRepositoryMock, 'getAllByPostId')
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

  test('getCommentsByPost() should throw a NotFoundException when post does not exist', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await commentService.getPostComments(comment.authorId, comment.parentId as string, { limit: 10 })
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getCommentsByPost() should throw a NotFoundException when author is private and user does not follow', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedComment))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(extendedUser))
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    jest
      .spyOn(commentRepositoryMock, 'getAllByPostId')
      .mockImplementation(async () => await Promise.resolve([extendedComment]))
    try {
      await commentService.getPostComments(comment.authorId, comment.id, { limit: 10 })
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })
})