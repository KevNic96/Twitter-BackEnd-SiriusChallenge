import { Router } from 'express'
import { withAuth } from '@utils'

import { userRouter } from '@domains/user'
import { postRouter } from '@domains/post'
import { authRouter } from '@domains/auth'
import { healthRouter } from '@domains/health'
//
import { followerRouter } from '@domains/follower'
import { reactionRouter } from '@domains/reaction'
import { commentRouter } from '@domains/comment'
import { messageRouter } from '@domains/message'

export const router = Router()

router.use('/health', healthRouter)
router.use('/auth', authRouter)
router.use('/user', withAuth, userRouter)
router.use('/post', withAuth, postRouter)
//
router.use('/follower',withAuth,followerRouter)
router.use('/reaction',withAuth,reactionRouter)
router.use('/comment', withAuth, commentRouter)
router.use('/message', withAuth, messageRouter)

// Swagger components
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearer:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         username:
 *           type: string
 *           description: Unique username
 *         name:
 *           type: string
 *           description: Optional user's name
 *         email:
 *           type: string
 *           description: Unique email
 *         profilePicture:
 *           type: string
 *           description: User's profile picture identifier
 *         password:
 *           type: string
 *           description: Hashed password
 *         isPrivate:
 *           type: boolean
 *           description: True if the user is private
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the user was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the user was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the user was deleted
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *           description: User's posts
 *         followers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Follow'
 *           description: User's followers
 *         follows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Follow'
 *           description: User's follows
 *     Post:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         content:
 *           type: string
 *           description: Post content
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Image url
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the post was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the post was deleted
 *         author:
 *           $ref: '#/components/schemas/User'
 *     Follow:
 *       type: object
 *       required:
 *         - followerId
 *         - followedId
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         followerId:
 *           type: string
 *           description: Follower id
 *         followedId:
 *           type: string
 *           description: Followed id
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the follow was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the follow was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the follow was deleted
 *         follower:
 *           $ref: '#/components/schemas/User'
 *         followed:
 *           $ref: '#/components/schemas/User'
 *     Reaction:
 *       type: object
 *       required:
 *         - userId
 *         - postId
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         userId:
 *             type: string
 *             description: User id
 *         postId:
 *           type: string
 *           description: Post id
 *         type:
 *           type: string
 *           enum:
 *             - LIKE
 *             - RETWEET
 *           description: Reaction type
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the reaction was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the reaction was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the reaction was deleted
 *         user:
 *           $ref: '#/components/schemas/User'
 *         post:
 *           $ref: '#/components/schemas/Post'
 *     ReactionInput:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum:
 *             - LIKE
 *             - RETWEET
 *       description: Reaction type
 *       example:
 *         type: LIKE
 *     LoginInput:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         email: 'Userexample@mail.com'
 *         username: 'test'
 *         password: 'Example123!'
 *     SignupInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         username: 'test'
 *         email: 'ex@ample.com'
 *         password: 'Example123'
 *     CreatePostInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Post content
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             description: Image url
 *       example:
 *         content: 'Hello world!'
 *         images: ['https://imageExample.com/image.png']
 *     Message:
 *       type: object
 *       required:
 *         - from
 *         - to
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *         from:
 *           type: string
 *           description: Sender id
 *         to:
 *           type: string
 *           description: Receiver id
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the message was created
 *       example:
 *         content: 'Hello world!'
 *         from: '123'
 *         to: '321'
 *         createdAt: '2024-11-01T00:43:23.000Z'
 */