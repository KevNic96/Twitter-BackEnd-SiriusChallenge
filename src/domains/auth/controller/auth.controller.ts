import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers

import 'express-async-errors' // Importar el modulo que maneja errores asincronos en Express

import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

//Crea una instancia del enrutador de Express
export const authRouter = Router()

// Use dependency injection ---- Utiliza inyeccion de dependencias para instanciar el servicio de autenticacion
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Signup - Create a new user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInputDTO'
 *     responses:
 *       201:
 *         description: CREATED. (Creates a user and then, returns a token).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       409:
 *         description: The user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ConflictException'
 *       500:
 *         description: Some server error.
 *         example: Server error.
 */

//Define la ruta y el controlador para la creacion de un nuevo usuario (signup)
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body //Obtiene los datos del cuerpo de la solicitud

  const token = await service.signup(data)

  return res.status(HttpStatus.CREATED).json(token) //Envia una respuesta con el token y el codigo de estado 201 (CREATED)
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login - Login to Twitter Account - The user only needs username or email, and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInputDTO'
 *     responses:
 *       200:
 *         description: OK. (Login the user and then, returns the session token).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       404:
 *         description: Could not find any user.
 *         example: User not found or not existing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFoundException'
 *       401:
 *         description: Unathorized. Incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnathorizedException'
 *       500:
 *         description: Some server error.
 *         example: Server error.
 */

// Define la ruta y el controlador para la autenticacion de un usuario existente (login)
authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.login(data)

  return res.status(HttpStatus.OK).json(token) // Envia una respuesta con el token y el codigo de estado 200(OK)
})

//VerifyTOKEN

authRouter.post('/verifyToken', async(req:Request, res:Response)=>{
  const {token} = req.body;

  const isValid = service.verifyToken(token)

  return res.status(HttpStatus.OK).json(isValid)
})


