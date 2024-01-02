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

// Swagger

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

// Swagger

postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context //Obtenemos userId del contexto
  const { postId } = req.params // Obtenemos postId de los parametros de solicitud

  const post = await service.getPost(userId, postId) // Llama a la funcion del servicio para obtener detalles sobre una publicacion especifica

  return res.status(HttpStatus.OK).json(post) // Devuelve la publicacion en formato JSON
})

// Swagger

postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context //Obtenemos userId del contexto
  const { userId: authorId } = req.params //Obtenemos el authorId de los parametros de solicitud

  const posts = await service.getAuthorPosts(userId, authorId) // Llama a la funcion del servicio para obtener las publicaciones de un autor especifico

  return res.status(HttpStatus.OK).json(posts) // Devuele las publicaciones en formato JSON
})

// Swagger

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context //Obtenemos las variables del contexto y de los parametros de solicitud
  const data = req.body

  const post = await service.createPost(userId, data) // Llama a la funcion del servicio para crear una nueva publicacion

  return res.status(HttpStatus.CREATED).json(post) // Devuelve la publicacion creada en formato JSON
})

// Swagger

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
