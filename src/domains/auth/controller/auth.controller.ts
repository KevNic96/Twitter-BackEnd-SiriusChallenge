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

//Swagger

//Define la ruta y el controlador para la creacion de un nuevo usuario (signup)
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body //Obtiene los datos del cuerpo de la solicitud

  const token = await service.signup(data) // Llama al servicio para realizar la operacion de registro

  return res.status(HttpStatus.CREATED).json(token) //Envia una respuesta con el token y el codigo de estado 201 (CREATED)
})

//Swagger

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


