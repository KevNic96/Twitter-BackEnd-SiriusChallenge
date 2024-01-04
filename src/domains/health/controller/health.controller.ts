import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

export const healthRouter = Router()

/**
 * @swagger
 * /api/health:
 *  get:
 *    summary: Server health
 *    tags: [Health]
 *    responses:
 *      200:
 *        description: The server is on.
 *        example: Server running.
 *      500:
 *        description: Some server error.
 *        example: Server error.
 */

healthRouter.get('/', (req: Request, res: Response) => {
  return res.status(HttpStatus.OK).send()
})
