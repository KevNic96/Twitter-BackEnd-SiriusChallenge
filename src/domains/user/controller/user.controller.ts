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

// swagger/

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

// swaggerMe

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.delete('/me', async(req: Request, res: Response) => {
  const {userId} = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK).json({message: 'User deleted'})
})

// swaggerUserId

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const {userId} = req.params
  const { userId: otherLoggedUserId } = res.locals.context

  const user = await service.getUserView(userId, otherLoggedUserId)

  return res.status(HttpStatus.OK).json(user)
})

// swaggerDelete

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

userRouter.post('/private/:isPrivate', async(req:Request, res:Response) => {
  const {userId} = res.locals.context
  const {isPrivate} = req.params

  const setted = await service.setPrivate(userId, isPrivate)
  return res.status(HttpStatus.OK).send({private:setted})
})

// Swagger Profile Picture presignedUrl

userRouter.get('/profilePicture/presignedUrl', async(req:Request, res:Response) => {
  const {userId} = res.locals.context
  const {filetype} = req.query as Record<string, string>
  const data = await service.setProfilePicture(userId, filetype)
  if(data !== null) return res.status(HttpStatus.OK).send(data)
})

// Swagger Profile Picture

userRouter.get('/profilePicture', async(req:Request, res: Response)=> {
  const {userId} = res.locals.context
  const profilePictureUrl = await service.getProfilePicture(userId)
  if(profilePictureUrl !== null) return res.status(HttpStatus.OK).send({profilePictureUrl})
})
