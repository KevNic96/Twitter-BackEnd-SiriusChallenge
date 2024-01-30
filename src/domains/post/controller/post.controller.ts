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
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get latest posts
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of posts to return
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         required: false
 *         description: The cursor to the previous page
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         required: false
 *         description: The cursor to the next page
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get post by id
 *     tags: [Post]
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
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get posts by author
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The author id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Create post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
 *   delete:
 *     security:
 *       - bearer: []
 *     summary: Delete post
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The post was successfully deleted
 *         content:
 *           application/json:
 *             example:
 *               message: Deleted post {post_id}
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
