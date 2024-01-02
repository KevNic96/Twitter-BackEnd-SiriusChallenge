//Importa las dependencias necesarias de Express y otros modulos
import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers

import 'express-async-errors' // Importar el modulo que maneja errores asincronos en Express

// Importa utilidades y repositorio
import { db, BodyValidation } from '@utils'


//Importa servicios y DTO
import { FollowerRepoImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
import { PostRepositoryImpl } from '@domains/post/repository'
import { CommentRepoImpl } from '../repository'
import { CommentService, CommentServiceImpl } from '../service'
import { CreatePostInputDTO } from '@domains/post/dto'

//Crea una instancia del enrutador de Express
export const commentRouter = Router()

// Use dependency injection

const service: CommentService = new CommentServiceImpl(new CommentRepoImpl(db), new FollowerRepoImpl(db), new UserRepositoryImpl(db), new PostRepositoryImpl(db))

//Swagger

commentRouter.get('/:postId', async(req:Request,res:Response) => {
    const {userId} = res.locals.context
    const {postId} = req.params
    const {limit,before,after} = req.query as Record<string,string>

    const comments = await service.getPostComments(userId, postId, {limit:Number(limit), before, after})

    return res.status(HttpStatus.OK).json(comments)
})

// Swagger

commentRouter.get('/by_user/:userId', async(req:Request, res:Response)=>{
    const {userId} = res.locals.context
    const {userId: authorId} = req.params

    const comments = await service.getAuthorComments(userId, authorId)

    return res.status(HttpStatus.OK).json(comments)
})

// Swagger

commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async(req: Request, res: Response)=>{
    const {userId} = res.locals.context
    const {postId} = req.params
    const data = { ...req.body, parentId: postId}
    const comment = await service.createComment(userId, data)

    return res.status(HttpStatus.CREATED).json(comment)
})

// Swagger

commentRouter.delete('/:commentId', async(req:Request, res:Response)=>{
    const {userId} = res.locals.context
    const {commentId} = req.params

    await service.deleteComment(userId, commentId)

    return res.status(HttpStatus.OK).send({message: `Deleted comment ${commentId}`})
})