import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers

import 'express-async-errors' // Importar el modulo que maneja errores asincronos en Express

import { db, BodyValidation } from '@utils'


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

/**
 * @swagger
 * /api/comment/by_user/:user_id:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get comments by user
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */

// Punto 7)
//ENDPOINT - Obtener comentarios por ID de usuario
commentRouter.get('/by_user/:userId', async(req:Request, res:Response)=>{
    const {userId} = res.locals.context
    const {userId: authorId} = req.params

    const comments = await service.getAuthorComments(userId, authorId)

    return res.status(HttpStatus.OK).json(comments)
})

/**
 * @swagger
 * /api/comment/:post_id:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Create a comment on a post
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: The comment was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */

// Punto 6)
// ENDPOINT - Crear un comentario en una publicacion
commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async(req: Request, res: Response)=>{
    const {userId} = res.locals.context
    const {postId} = req.params
    const data = { ...req.body, parentId: postId}
    const comment = await service.createComment(userId, data)

    return res.status(HttpStatus.CREATED).json(comment)
})

/**
 * @swagger
 * /api/comment/:comment_id:
 *   delete:
 *     security:
 *       - bearer: []
 *     summary: Delete the comment
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment id
 *     responses:
 *       200:
 *         description: The comment was successfully deleted
 *         content:
 *           application/json:
 *             example:
 *               message: Deleted comment {comment_id}
 */

// ENDPOINT - Eliminar un comentario por su ID
commentRouter.delete('/:commentId', async(req:Request, res:Response)=>{
    const {userId} = res.locals.context
    const {commentId} = req.params

    await service.deleteComment(userId, commentId)

    return res.status(HttpStatus.OK).send({message: `Deleted comment ${commentId}`})
})

/**
 * @swagger
 * /api/comment/:post_id:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get comments by post id
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */

// Punto 10)
// ENDPOINT - Obtener comentarios por ID de publicacion
commentRouter.get('/:postId', async(req:Request,res:Response) => {
    const {userId} = res.locals.context
    const {postId} = req.params
    const {limit,before,after} = req.query as Record<string,string>

    const comments = await service.getPostComments(userId, postId, {limit:Number(limit), before, after})

    return res.status(HttpStatus.OK).json(comments)
})