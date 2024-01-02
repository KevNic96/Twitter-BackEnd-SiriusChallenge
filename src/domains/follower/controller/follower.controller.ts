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


//Swagger

//Punto A)))
//Define dos rutas:
followerRouter.post('/follow/:user_id',async(req: Request,res:Response)=>{ //La primera para seguir a un usuario
    const {userID} = res.locals.context;
    const {user_id} = req.params

    const followed = await service.FollowUp(userID, user_id) //Utiliza el metodo 'createFollow' para realizar la operacion de seguimiento

    return res.status(HttpStatus.CREATED).json(followed) //Retorna el resultado como JSON
})

//Swagger

followerRouter.post('unfollow/:user_id',async(req:Request, res:Response)=>{ //La segunda para dejar de seguir a un usuario
    const {userID} = res.locals.context
    const {user_id} = req.params

    await service.Unfollow(userID, user_id) // Utiliza el metodo 'deleteFollow' para realizar la operacion de dejar de seguir

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

followerRouter.get('/followings/:user_id', async(req:Request, res:Response) => {
    const { user_id} = req.params

    const followings = await service.getFollows(user_id)

    return res.status(HttpStatus.OK).json(followings)
})

followerRouter.get('/mutual', async(req:Request, res:Response)=>{
    const {userID} = res.locals.context

    const mutuals = await service.getMutualsFollows(userID)
    return res.status(HttpStatus.OK).json(mutuals)
})
