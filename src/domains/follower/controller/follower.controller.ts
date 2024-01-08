/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearer:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  responses:
 *      ForbiddenException:
 *          description: Forbidden. You are not allowed to perform this action.
 *          example: Forbidden. You are not allowed to perform this action.
 *      NotFoundException:
 *          description: Not found. Could not find any user.
 *          example: Not found. Could not find any user.
 * schemas:
 *      FollowerDTO:
 *          type: object
 *          properties:
 *              id:
 *                  type: string
 *                  description: The id of the follow.
 *              followerId:
 *                  type: string
 *                  description: The id of the user who follows.
 *              followedId:
 *                  type: stirng
 *                  description: The id of the user who is followed.
 *              createdAt:
 *                  type: string
 *                  format: date-time
 *                  description: Datetime when the follow is saved in db.
 *              example:
 *                  id: a-to-z-1
 *                  followerId: a-to-z-2
 *                  followedId: a-to-z-3
 *                  createdAt: 2024-4-1T01:27:35.534Z
 */

import {Request, Response, Router } from 'express'
import HttpStatus from 'http-status'

import 'express-async-errors'

import { db } from '@utils'

// import { FollowerRepoImpl } from '../repository'
import { FollowerService} from '../service'
import { FollowerServiceImpl } from '../service/follower.serviceImpl'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowerRepoImpl } from '../repository'

export const followerRouter = Router () // Crea una instancia del enrutador de Express

const service: FollowerService = new FollowerServiceImpl(new FollowerRepoImpl(db), new UserRepositoryImpl(db))
//Utiliza la implementacion concreta 'FollowerServiceImpl' del servicio de seguidores.
//Pasa instancias de 'FollowerRepoImpl' y 'UserRepositoryImpl' como dependencias al servicio.


/**
 * @swagger
 *  /api/follower/follow/:user_id:
 *      post:
 *          security:
 *              - bearer: []
 *          summary: Follow another user.
 *          tags: [Follow]
 *          parameters:
 *              - in: path
 *                name: user_id
 *                schema:
 *                  type: string
 *                required: true
 *                description: UserID.
 *                example: a-to-z-2
 *          responses:
 *              200:
 *                  description: The follow was succesfully create
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Follow'
 *              403:
 *                  description: Forbidden. User is not allowed to perform this action
 *                  example: If the followerId and the followedId are the same, or if there is already a follow up between users.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/responses/ForbiddenException'
 *              404:
 *                  description: Not found. Couldn't find any user.
 *                  example: If followed user or the follower does not exist.
 *                  content:
 *                      application/json:
 *                              $ref: '#/components/responses/NotFoundException'
 *              500:
 *                  description: Some server error.
 *                  example: Server error.
 */

//Punto A)))
//Define dos rutas:
followerRouter.post('/follow/:user_id',async(req: Request,res:Response)=>{ //La primera para seguir a un usuario
    const {userId} = res.locals.context;
    const {user_id} = req.params

    const followed = await service.FollowUp(userId, user_id) //Utiliza el metodo 'createFollow' para realizar la operacion de seguimiento

    return res.status(HttpStatus.CREATED).json(followed) //Retorna el resultado como JSON
})

/**
 * @swagger
 * /api/follower/unfollow/:user_id:
 *  post:
 *      security:
 *          - bearer: []
 *      summary: Delete follow
 *      tags: [Follow]
 *      parameters:
 *          - in: path
 *            name: user_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The user id to unfollow
 *      responses:
 *          200:
 *              description: The unfollow was succesfully done
 *              content:
 *                  application/json:
 *                      example:
 *                          message: Unfollowed
 *          404:
 *              description: Not found. Couldn't find any follow.
 *              example: If there is no follow up between the follower and the followed.
 *              content:
 *                 application/json:
 *                     $ref: '#/components/responses/NotFoundException'
 *          500:
 *              description: Some server error.
 *                  example: Server error.
 */

followerRouter.post('/unfollow/:user_id',async(req:Request, res:Response)=>{ //La segunda para dejar de seguir a un usuario
    const {userId} = res.locals.context
    const {user_id} = req.params

    await service.Unfollow(userId, user_id) // Utiliza el metodo 'deleteFollow' para realizar la operacion de dejar de seguir

    return res.status(HttpStatus.OK).json({message: 'Unfollowed'}) // Retorna unu mensaje JSON con StatusCode HTTP
})

followerRouter.get('/doesFollow/:user_id', async(req:Request, res:Response)=>{
    const {userID} = res.locals.context
    const {user_id} = req.params

    const doesFollow= await service.DoesFollows(userID,user_id)

    return res.status(HttpStatus.OK).json({doesFollow})
})

followerRouter.get('/followers/:user_id', async (req:Request, res:Response) => {
    const {user_id} = req.params

    const followers = await service.getFollowers(user_id)

    return res.status(HttpStatus.OK).json(followers)
})

followerRouter.get('/followings/:user_id', async (req:Request, res:Response) => {
    const {user_id} = req.params

    const followings = await service.getFollows(user_id)

    return res.status(HttpStatus.OK).json(followings)
})

followerRouter.get('/mutual', async(req:Request, res:Response)=>{
    const {userID} = res.locals.context

    const mutuals = await service.getMutualsFollows(userID)
    return res.status(HttpStatus.OK).json(mutuals)
})
