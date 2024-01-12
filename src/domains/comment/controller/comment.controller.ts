/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  responses:
 *    OK (200)
 *    Created (201)
 *    UnauthorizedException (401):
 *      description: Unathorized. You are not allowed to perform this action.
 *      example: An incorrect password.
 *    ForbiddenException (403):
 *      description: Forbidden. You are not allowed to perform this action.
 *      example: Forbidden access.
 *    NotFoundException (404):
 *      description: Not found. Couldn't find any user.
 *      example: User not found or not existing.
 *  schemas:
 *      CreateCommentInputDTO:
 *          type: object
 *          required:
 *              - content
 *              - images
 *              - parentId
 *          properties:
 *              content:
 *                  type:
 *                  description: The comment's content
 *              images:
 *                  type: string[]
 *                  description: The comment's image (optional)
 *              parentId:
 *                  type: string
 *                  description: The comment's parentId.
 *          example:
 *              content: User's comment.
 *              images: randomImage.jpg
 *              parentId: "1" (This comment is an answer to the comment with commentId "1")
 *      CreatePostInputDTO:
 *          type: object
 *          required:
 *              - content
 *              - images
 *          properties:
 *              content:
 *                  type: string
 *                  description: The comment's content that the user wants to post.
 *              images:
 *                  type: string[]
 *                  description: An image that the comment can content (optional)
 *          example:
 *              content: User's comment.
 *              images: Image that the user wnats to attch to the own comment.
 *
 */

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
 *  get:
 *      security:
 *          - bearer: []
 *      summary: Get comments by user
 *      tags: [Comment]
 *      parameters:
 *          - in: path
 *            name: user_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The user id
 *      responses:
 *      200:
 *          description: OK
 *          content:
 *              application/json:
 *              schema:
 *              $ref: '#/components/schemas/Post'
 *      404:
 *          description: Could not find any user or comment.
 *          content:
 *               application/json:
 *               schema:
 *               $ref: '#/components/responses/NotFoundException'
 *      500:
 *          description: Some server error.
 *          example: Server error.
 *
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
 *  post:
 *      security:
 *          - bearer: []
 *      summary: Create a new comment
 *      tags: [Comment]
 *      parameters:
 *          - in: path
 *            name: post_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The post id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/CreatePostInput'
 *      responses:
 *          201:
 *              description: The comment was succesfully created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Post'
 *          404:
 *              description: Could not find any post.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/responses/NotFoundException'
 *          500:
 *              description: Some server error.
 *              example: Server error.
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
 * /api/comment/:comment_id:
 *  delete:
 *      security:
 *          - bearer: []
 *      summary: Delete a comment
 *      tags: [Comment]
 *      parameters:
 *          - in: path
 *            name: comment_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The comment id
 *      responses:
 *          200:
 *              description: The comment was succesfully deleted.
 *              content:
 *                  application/json:
 *                      example:
 *                          message: Deleted comment {comment_id}
 *          404:
 *              description: Could not find any comment.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/responses/NotFoundException
 *          403:
 *              description: The user doesn't have any permission to delete the comment.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/responses/ForbiddenException
 *          500:
 *              description: Some server error.
 *              example: Server error.
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
 * tags:
 *  name: Comment
 *  description: These endpoints let you comment posts.
 * /api/comment/{postId}:
 *  get:
 *      summary: Get comments by post ID.
 *      tags: [Comment]
 *      parameters:
 *          - in: path
 *            name: post_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The post id.
 *            example: abcdefghij12345678
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/comments/schemas/Post'
 *          404:
 *              description: Post not found.
 *               content:
 *                   application/json:
 *                       schema:
 *                           $ref: '#/components/responses/NotFoundException'
 *          500:
 *              description: Some server error.
 * }            example: Server error.
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