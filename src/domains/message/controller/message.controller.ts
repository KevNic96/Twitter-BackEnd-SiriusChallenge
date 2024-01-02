import { Request,Response,Router } from "express";
import HttpStatus from "http-status";
import 'express-async-errors'

import { db } from "@utils";

import { FollowerRepoImpl } from "@domains/follower/repository";
import { UserRepositoryImpl } from "@domains/user/repository";
import { MessageRepoImpl } from "../repository";
import { MessageService,MessageServiceImpl } from "../service";

export const messageRouter = Router()

//Use dependency injection

const service : MessageService = new MessageServiceImpl(new MessageRepoImpl(db), new FollowerRepoImpl(db), new UserRepositoryImpl(db))

// Swagger

messageRouter.post('/:to', async(req:Request, res:Response)=> {
    const {userId} = res.locals.context
    const {to} = req.params
    const {content} = req.body

    const message = await service.newMessage(userId, to, content)

    return res.status(HttpStatus.CREATED).json(message)
})

messageRouter.get('/chat:to', async(req:Request, res:Response)=>{
    const {userId} = res.locals.context
    const {to} = req.params

    const messages = await service.getSingleChat(userId, to)

    return res.status(HttpStatus.OK).json(messages)
})

messageRouter.get('/chat', async(req:Request, res:Response)=>{
    const {userId}=res.locals.context
    
    const messages = await service.getChats(userId)

    return res.status(HttpStatus.OK).json(messages)

})