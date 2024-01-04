import { Request, Response, Router } from "express";
import HttpStatus  from "http-status";

import 'express-async-errors'
import { db, ReactionTypeValidation } from "@utils";
import { ReactionRepoImpl } from "../repository";
import { ReactionService, ReactionServiceImpl } from "../service";
import { PostRepositoryImpl } from "@domains/post/repository";

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(new ReactionRepoImpl(db), new PostRepositoryImpl(db))

/**
 * @swagger
 * /api/reaction/:post_id:
 *  post:
 *      security:
 *          - bearer: []
 *      summary: Creates a reaction.
 *      tags: [Reaction]
 *      parameters:
 *          - in: path
 *            name: post_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The post ID
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/ReactionDTO'
 *      responses:
 *          200:
 *              description: OK. React to a post and returns info about the reaction.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Reaction'
 */

reactionRouter.post('/:postId',ReactionTypeValidation, async(req:Request, res: Response) => {
    const {userId} = res.locals.context
    const {postId} = req.params
    const type: any = req.query.type

    const reaction = await service.createReaction(userId, postId, type)
    return res.status(HttpStatus.OK).json(reaction)
})

/**
 * @swagger
 * /api/reaction/:post_id:
 *  delete:
 *      security:
 *          - bearer: []
 *      summary: Delete reaction
 *      tags: [Reaction]
 *      parameters:
 *          - in: path
 *            name: post_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The post ID
 *      responses:
 *          200:
 *              description: OK. Reaction deLeted succesfully.
 *              content:
 *                  application/json:
 *                      example:
 *                          message: Deleted reaction {type} in post {postId}
 *          404:
 *              description: Reaction not found.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/responses/NotFoundException'
 *          500:
 *              description: Some server errors.
 *              example: Server error.
 *          
 */

reactionRouter.delete('/:postId', ReactionTypeValidation, async(req:Request, res: Response) => {
    const {userId} = res.locals.context
    const {postId} = req.params
    const type: any = req.query.type
    await service.deleteReaction(userId, postId, type)
    return res.status(HttpStatus.OK).send({message: `Deleted reaction ${type as string} in post ${postId}`})
})

/**
 * @swagger
 * /api/reaction/:user_id:
 *  get:
 *      security:
 *          - bearer: []
 *      summary: Get reactions by user and type
 *      tags: [Reaction]
 *      parameters:
 *          - in: path
 *            name: user_id
 *            schema:
 *              type: string
 *            required: true
 *            description: The post ID
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *            required: true
 *            description: LIKE or RETWEET
 *      responses:
 *          200:
 *              description: OK. Return a list with the reactions
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ReactionDTO'
 *          404:
 *              description: Reaction not found.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/responses/NotFoundException
 *          500:
 *              description: Some server error.
 *              example: Server error.
 */

reactionRouter.get('/:userId', ReactionTypeValidation, async(req: Request, res: Response)=>{
    const {userId} = req.params
    const type: any = req.query.type

    const reactions = await service.getReactionsByUserAndType(userId, type)

    return res.status(HttpStatus.OK).json(reactions)
})