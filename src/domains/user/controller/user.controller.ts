import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { UserService, UserServiceImpl } from '../service'
import { UserRepositoryImpl } from '../repository'
import { FollowerRepoImpl } from '@domains/follower/repository'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db), new FollowerRepoImpl(db))

/**
 * @swagger
 * /api/user:
 *  get:
 *    security:
 *      - bearer: []
 *    summary: Get user recommendations
 *    tags: [User]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: false
 *        description: The number of users to return
 *      - in: query
 *        name: skip
 *        schema:
 *          type: integer
 *        required: false
 *        description: The numbers of users to skip
 *    responses:
 *      200:
 *        description: OK. Returns an array with all the users
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 * 
 */

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @swagger
 * /api/user/me:
 *  get:
 *    security:
 *      - bearer: []
 *    summary: Get my user
 *    tags: [User]
 *    responses:
 *      200:
 *        description: OK. Returns the logged user's info.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: User ID not found.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/NotFoundException'
 *      500:
 *        description: Some server error.
 *        example: Server error.
 */

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @swagger
 * /api/delete/me:
 *  delete:
 *    summary: Deletes the logged user.
 *    tags: [User]
 *    security:
 *      - bearer: []
 *    responses:
 *      200:
 *        description: OK. The user has been deleted.
 *        content:
 *           application/json:
 *             example:
 *                message: Deleted user {userId}
 */

userRouter.delete('/me', async(req: Request, res: Response) => {
  const {userId} = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK).json({message: 'User deleted'})
})

/**
 * @swagger
 * /api/user/:userId:
 *  get:
 *    summary: Returns info about an user by id
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        schema:
 *          type: string
 *        description: The user ID
 *    security:
 *      - bearer:[]
 *    responses:
 *      200:
 *        description: OK. Returns user's view
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserDTO'
 *      404:
 *        description: UserID not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/NotFoundException'
 */

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const {userId} = req.params
  const { userId: otherLoggedUserId } = res.locals.context

  const user = await service.getUserView(userId, otherLoggedUserId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @swagger
 * /api/user:
 *  delete:
 *    summary: Delete user.
 *    tags: [User]
 *    security:
 *      - bearer: []
 *    responses:
 *      200:
 *        description: OK. The user has been deleted.
 *        content:
 *           application/json:
 *             example:
 *                message: User deleted
 */

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK).json({message: 'User deleted'})
})

userRouter.get('/by_username/:username', async(req:Request, res: Response)=>{
  const {username} = req.params
  const {limit, skip} = req.query as Record<string, string>

  const users = await service.getUserByUsername(username, {limit: Number(limit), skip: Number(skip)})

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @swagger
 * /api/user/private/:is_private:
 *  post:
 *    security:
 *      - bearer: []
 *    summary: Set user private
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: is_Private
 *        schema:
 *          type: boolean
 *        required: true
 *        description: Set user profile to private
 *    responses:
 *      200:
 *        description: OK.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                private:
 *                  type: boolean
 *                  description: Privacy status
 */

userRouter.post('/private/:isPrivate', async(req:Request, res:Response) => {
  const {userId} = res.locals.context
  const {isPrivate} = req.params

  const setted = await service.setPrivate(userId, isPrivate)
  return res.status(HttpStatus.OK).send({private:setted})
})

/**
 * @swagger
 * /api/user/profilePicture:
 *  post:
 *    security:
 *      - bearer: []
 *    summary: Get S3 presigned url to set user profile picture
 *    tags: [User]
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                - presignedUrl:
 *                    type: string
 *                    description: s3 presigned url to set user profile picture
 *                - profilePictureUrl:
 *                    type: string
 *                    description: User's profile picture url
 *       404:
 *        description: UserID not found.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/NotFoundException'
 */

userRouter.get('/profilePicture/presignedUrl', async(req:Request, res:Response) => {
  const {userId} = res.locals.context
  const {filetype} = req.query as Record<string, string>
  const data = await service.setProfilePicture(userId, filetype)
  if(data !== null) return res.status(HttpStatus.OK).send(data)
})

/**
 * @swagger
 * /api/user/profilePicture:
 *    post:
 *      security:
 *        - bearer: []
 *      summary: Set user profile picture
 *      tags: [User]
 *      responses:
 *        200:
 *          description: OK. Return Profile's picture URL.
 */

userRouter.get('/profilePicture', async(req:Request, res: Response)=> {
  const {userId} = res.locals.context
  const profilePictureUrl = await service.getProfilePicture(userId)
  if(profilePictureUrl !== null) return res.status(HttpStatus.OK).send({profilePictureUrl})
})
