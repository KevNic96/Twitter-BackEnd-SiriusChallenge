import { Socket as IOSocket, Server } from 'socket.io'
import { db, Constants, Logger } from '@utils'
import { MessageRepoImpl } from '@domains/message/repository'
import { MessageServiceImpl } from '@domains/message/service'
import jwt from 'jsonwebtoken'
import { FollowerRepoImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
import {server} from './server'

interface Socket extends IOSocket {
    userId?: string
}

const messageServ = new MessageServiceImpl(new MessageRepoImpl(db), new FollowerRepoImpl(db), new UserRepositoryImpl(db))

export const io = new Server(server, { // Creación de instancia del Servidor Socket.io
    cors: {
        origin: Constants.CORS_WHITELIST, //Configuracion del servidor para permitir el acceso desde determinados origenes y metodos HTTP
        methods: ['GET', 'POST']
    }
})

io.use((socket: Socket, next)=>{  //io.use para verificar el token proporcionado en la conexion del socket
    const token = socket.handshake.query.token //Extra token de la consulta handshake

    if(typeof token!=='string'){
        next(new Error('INVALID_TOKEN')) 
        socket.disconnect()
        return   // Si la verificacion falla, se emite un error y se desconecta el socket
    }

    jwt.verify(token, Constants.TOKEN_SECRET,(err, context)=>{
        if(err!=null || context === undefined || typeof context ==='string'){
            next(new Error('INVALID_TOKEN'))
            socket.disconnect()
        } else{
            socket.userId = context.userId
            next()
        }
    })
})

io.on('connection', async(socket:Socket)=>{ //El manejador de eventos se dispara cuando un cliente se conecta al servidor Socket.io
    if(!socket.userId) return socket.disconnect() //Se verifica si userId esta definido en el token, sino, se desconecta el socket
    Logger.info(`user connected ${socket.userId}`) //Se registra un mensaje de que un usuario se conecto

    socket.on('message', async(data): Promise<void> => { //El manejador de eventos que se dispara cuando un cliente envia un mensaje al servidor
        if(!socket.userId) return //Verifica si socket.userId esta definido, sino no se procesa el mensaje
        try{
            const message = await messageServ.newMessage(socket.userId, data.to, data.content) //Se crea un nuevo mensaje
            io.emit('message', message) //Se emite el mensaje a todos los clientes conectados utilizando io.emit
        } catch(err){
            Logger.error(err) //Se registra el error utilziando Logger.
        }
    })
})

// frot getMessages, back: envia messages para el front con messages
// front sendMessage, back : envia message para el front con newMessage