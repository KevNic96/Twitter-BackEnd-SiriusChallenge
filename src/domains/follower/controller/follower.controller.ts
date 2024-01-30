import {Request, Response, Router } from 'express'
import HttpStatus from 'http-status'

import 'express-async-errors'

import { db } from '@utils'

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
 * /api/follower/follow/:user_id:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: New follow
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id to follow
 *     responses:
 *       200:
 *         description: The follow was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Follow'
 */

//Punto 1)
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
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Delete follow
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id to unfollow
 *     responses:
 *       200:
 *         description: The unfollow was successfully done
 *         content:
 *           application/json:
 *             example:
 *               message: Unfollowed
 */

followerRouter.post('/unfollow/:user_id',async(req:Request, res:Response)=>{ //La segunda para dejar de seguir a un usuario
    const {userId} = res.locals.context
    const {user_id} = req.params

    await service.Unfollow(userId, user_id) // Utiliza el metodo 'deleteFollow' para realizar la operacion de dejar de seguir

    return res.status(HttpStatus.OK).json({message: 'Unfollowed'}) // Retorna unu mensaje JSON con StatusCode HTTP
})

followerRouter.get('/doesFollow/:user_id', async(req:Request, res:Response)=>{
    const {userId} = res.locals.context
    const {user_id} = req.params

    const doesFollow= await service.DoesFollows(userId,user_id)

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
    const {userId} = res.locals.context

    const mutuals = await service.getMutualsFollows(userId)
    return res.status(HttpStatus.OK).json(mutuals)
})
