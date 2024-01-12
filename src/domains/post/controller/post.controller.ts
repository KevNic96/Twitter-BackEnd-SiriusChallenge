import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'

import { CreatePostInputDTO } from '../dto'
import { PostService, PostServiceImpl } from '../service'
import { PostRepositoryImpl } from '../repository'
import { FollowerRepoImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl( new PostRepositoryImpl(db), new FollowerRepoImpl(db), new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/post:
 *  get:
 *    security:
 *      - bearer: []
 *    summary: Get the latest posts
 *    tags: [Post]
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        required: false
 *        description: Return the number of posts.
 *      - in: query
 *        name: before
 *        schema:
 *          type: string
 *        required: false
 *        description: Cursor Previous Page
 *      - in: query
 *        name: after
 *        schema:
 *          type: string
 *        required: false
 *        description: Cursor Next Page
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
*/

// Punto 12)
postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string> // Obtenemos parámetros de consulta del objeto de solicitud

  const posts = await service.getLastPosts(userId, { limit: Number(limit), before, after }) // Llama a la funcion del servicio para obtener las publicaciones mas recientes del usuario

  return res.status(HttpStatus.OK).json(posts) //Devuelve las publicaciones en formato JSON
})

postRouter.get('/following', async(req:Request, res:Response) => {
  const {userId} = res.locals.context
  const {limit,before,after} = req.query as Record<string,string>

  const posts = await service.getLastPostsFollowing(userId, {limit: Number(limit), before, after})

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /api/post/:post_id:
 *  get:
 *    security:
 *      - bearer: []
 *    summary: Get post by id
 *    tags: [Post]
 *    parameters:
 *      - in: path
 *        name: post_id
 *        schema:
 *          type: string
 *        required: true
 *        description: The post id
 *    responses:
 *      200:
 *        description: OK. Returns the post requested.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      404:
 *        description: Post not found.
 *        example: Post not existing or if user doesn't follow post author.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/NotFoundException'
 *      500:
 *        description: Some server error.
 *        example: Server error.
 */

// Punto 2 y 3)
postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context //Obtenemos userId del contexto
  const { postId } = req.params // Obtenemos postId de los parametros de solicitud

  const post = await service.getPost(userId, postId) // Llama a la funcion del servicio para obtener detalles sobre una publicacion especifica

  return res.status(HttpStatus.OK).json(post) // Devuelve la publicacion en formato JSON
})

/**
 * @swagger
 * /api/post/by_user/:user_id:
 *  get:
 *    security:
 *     - bearer: []
 *    summary: Get Posts by Author
 *    tags: [Post]
 *    parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        requried: true
 *        description: The author id
 *    respnoses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *     404:
 *        description: Post not found.
 *        example: The author has a private profile and the user doesn't follow them
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/NotFoundException'
 *     500:
 *        description: Some server error
 *        example: Server error.
 */

// Punto 2 y 3)
postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context //Obtenemos userId del contexto
  const { userId: authorId } = req.params //Obtenemos el authorId de los parametros de solicitud

  const posts = await service.getAuthorPosts(userId, authorId) // Llama a la funcion del servicio para obtener las publicaciones de un autor especifico

  return res.status(HttpStatus.OK).json(posts) // Devuele las publicaciones en formato JSON
})

/**
 * @swagger
 * /api/post:
 *  post:
 *    security:
 *      - bearer: []
 *    summary: Create a post
 *    tags: [Post]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreatePostInput'
 *    responses:
 *      201:
 *        description: The post was succesfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      400:
 *        description: Invalid request body.
 *      401:
 *        description: User must be logged to execute that action.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/UnauthorizedException'
 *      500:
 *        description: Some server error.
 *        example: Server error.
 */

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context //Obtenemos las variables del contexto y de los parametros de solicitud
  const data = req.body

  const post = await service.createPost(userId, data) // Llama a la funcion del servicio para crear una nueva publicacion

  return res.status(HttpStatus.CREATED).json(post) // Devuelve la publicacion creada en formato JSON
})

/**
 * @swagger
 * /api/post/:post_id:
 *  delete:
 *    security:
 *      - bearer: []
 *    summary: Delete a post by id
 *    tags: [Post]
 *    parameters:
 *      - in: path
 *        name: post_id
 *        schema:
 *          type: string
 *        required: true
 *        description: The post ID
 *    responses:
 *      200:
 *        description: The post was succesfully deleted.
 *        content:
 *          application/json:
 *            example:
 *              message: Deleted post {post_id}
 *      404:
 *        description: Post ID not found.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/NotFoundException'
 *      403:
 *        description: You can only delete your posts
 *        content:
 *          application/json:
 *            schema:
 *            $ref: '#/components/responses/ForbiddenException'
 *      500:
 *        description: Some server error.
 *        example: Server error.
 */

postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId) // Llama a la funcion del servicio para eliminar una publicacion

  return res.status(HttpStatus.OK).send({message: `Deleted post ${postId}`}) //Devuelve un mensaje indicando que la publicacion ha sido eliminada
})

postRouter.get('/image/presignedUrl', async(req:Request,res:Response) => {
  const {filetype} = req.query as Record <string,string>

  const data = await service.setPostImage(filetype)
  if(data!==null) return res.status(HttpStatus.OK).send(data)
})
