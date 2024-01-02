import { Request, Response, Router } from "express";
import HttpStatus  from "http-status";

import 'express-async-errors'
import { db, ReactionTypeValidation } from "@utils";
import { ReactionRepoImpl } from "../repository";
import { ReactionService, ReactionServiceImpl } from "../service";
import { PostRepositoryImpl } from "@domains/post/repository";

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(new ReactionRepoImpl(db), new PostRepositoryImpl(db))

//Swagger

reactionRouter.post('/:postId',ReactionTypeValidation, async(req:Request, res: Response) => {
    const {userId} = res.locals.context
    const {postId} = req.params
    const type: any = req.query.type

    const reaction = await service.createReaction(userId, postId, type)
    return res.status(HttpStatus.OK).json(reaction)
})

// Swagger

reactionRouter.delete('/:postId', ReactionTypeValidation, async(req:Request, res: Response) => {
    const {userId} = res.locals.context
    const {postId} = req.params
    const type: any = req.query.type
    await service.deleteReaction(userId, postId, type)
    return res.status(HttpStatus.OK).send({message: `Deleted reaction ${type as string} in post ${postId}`})
})

// Swagger

reactionRouter.get('/:userId', ReactionTypeValidation, async(req: Request, res: Response)=>{
    const {userId} = req.params
    const type: any = req.query.type

    const reactions = await service.getReactionsByUserAndType(userId, type)

    return res.status(HttpStatus.OK).json(reactions)
})