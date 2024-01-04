/**
 * @swagger
 * components:
 *
 *  responses:
 *
 *    OK (200)
 *    Created (201)
 *    ValidationException (400):
 *      description: Validation Error.
 *      example: If the value doesn't match the expected data type
 *    UnauthorizedException (401):
 *      description: Unathorized. You are not allowed to perform this action.
 *      example: An incorrect password.
 *    ForbiddenException (403):
 *      description: Forbidden. You are not allowed to perform this action.
 *      example: Forbidden access.
 *    NotFoundException (404):
 *      description: Not found. Couldn't find any user.
 *      example: User not found or not existing.
 *    ConflictException (409):
 *      description: The user already exists.
 *      example: A user who has already signed up.
 *
 *  schemas:
 *
 *    TokenDTO:
 *      type: object
 *      required:
 *        - token
 *      properties:
 *        token:
 *          type: string
 *          description: Json Web Token with 24 hr expiration.
 *      example:
 *        token: "randomToken123abc"
 *
 *    SignupInputDTO:
 *      type: object
 *      required:
 *        - email
 *        - username
 *        - name
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          description: User's email
 *        username:
 *          type: string
 *          description: User's username
 *        name:
 *          type: string
 *          description: User's name
 *        password:
 *          type: string
 *          description: User's password
 *      example:
 *        email: user@fakemail.com
 *        username: FakeUsername
 *        name: FakeName
 *        password: Password123!
 *
 *    LoginInputDTO:
 *      type: object
 *      required:
 *        - email
 *        - username
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          description: User's email
 *        username:
 *          type: string
 *          description: User's username
 *        password:
 *          type: string
 *          description: User's password
 *      example:
 *        email: user@fakemail.com
 *        username: FakeUsername
 *        password: Password123!
 */

//Importa las dependencias necesarias de Express y otros modulos
import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers

import 'express-async-errors' // Importar el modulo que maneja errores asincronos en Express

// Importa utilidades y repositorio
import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

//Importa servicios y DTO
import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

//Crea una instancia del enrutador de Express
export const authRouter = Router()

// Use dependency injection ---- Utiliza inyeccion de dependencias para instanciar el servicio de autenticacion
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/auth/signup
 *  post:
 *  summary: Signup - Create a new user.
 *  tags:[Auth]
 *  RequestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/schemas/SignupInputDTO'
 *  responses:
 *    201:
 *      description: CREATED. (Creates a user and then, returns a token)
 *      content:
 *      application/json:
 *      schema:
 *        $ref: '#/components/schemas/TokenDTO
 *          type: object
 *          properties:
 *            token:
 *              type: string
 *                description: JWT Token
 *
 *    409:
 *      description: The user already exists.
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/responses/ConflictException'
 *    500:
 *      description: Some server error.
 *      example: Server error.
 *
 */

//Define la ruta y el controlador para la creacion de un nuevo usuario (signup)
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body //Obtiene los datos del cuerpo de la solicitud

  const token = await service.signup(data) // Llama al servicio para realizar la operacion de registro

  return res.status(HttpStatus.CREATED).json(token) //Envia una respuesta con el token y el codigo de estado 201 (CREATED)
})

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *  summary: Login - Login to Twitter account - The user only needs username or email, and password.
 *  tags:[Auth]
 *  RequestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/schemas/LoginInputDTO'
 *  responses:
 *    200:
 *      description: OK. (Login the user and then, returns the session token)
 *      content:
 *      application/json:
 *      schema:
 *        $ref: '#/components/schemas/TokenDTO
 *          type: object
 *          properties:
 *            token:
 *              type: string
 *                description: JWT Token
 *    404:
 *      description: Could not find any user.
 *      example: User not found or not existing
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/responses/NotFoundException
 *    401:
 *      description: Unathorized. Incorrect password.
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/responses/UnauthorizedException'
 *    500:
 *      description: Some server error.
 *      example: Server error.
 */

// Define la ruta y el controlador para la autenticacion de un usuario existente (login)
authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body // Obtiene los datos del cuerpo de la solicitud

  const token = await service.login(data) // Llama al servicio para realizar la operacion de inicio de sesion

  return res.status(HttpStatus.OK).json(token) // Envia una respuesta con el token y el codigo de estado 200(OK)
})

//TODO VerifyTOKEN

authRouter.post('/verifyToken', async(req:Request, res:Response)=>{
  const {token} = req.body;

  const isValid = service.verifyToken(token)

  return res.status(HttpStatus.OK).json(isValid)
})


