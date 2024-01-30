import { Socket as IOSocket, Server } from 'socket.io'
import { db, Constants, Logger, ForbiddenException } from '@utils'
import { MessageRepoImpl } from '@domains/message/repository'
import { MessageServiceImpl } from '@domains/message/service'
import jwt from 'jsonwebtoken'
import { FollowerRepoImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
import {server} from './server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { MessageDTO } from '@domains/message/dto'


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
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token; //Extra token de la consulta handshake

    if(typeof token!=='string'){

        next(new Error('INVALID_TOKEN')) 
        socket.disconnect()
        return   // Si la verificacion falla, se emite un error y se desconecta el socket
        
    //    return next(new Error('INVALID_TOKEN'));
    }

    jwt.verify(token, Constants.TOKEN_SECRET,(err, context)=>{
        // if(err!=null || context === undefined || typeof context ==='string'){
            if(err != null || context === undefined || typeof context === 'string') {
            next(new Error('INVALID_TOKEN'))
            socket.disconnect()
        } else{
            socket.userId = context.userId
            next()
        }
    })

})

io.on('connection', async(socket:Socket)=>{ //El manejador de eventos se dispara cuando un cliente se conecta al servidor Socket.io
    console.log(`user: ${socket.userId} is connected`);

    socket.on('join room', (data)=>{
        const {userId, to} = data;
        const room: string = [userId, to].sort().join('&&&&');

        try{
            console.log('joining room');
            socket.join(room);
        }catch(error){
            console.error();
        }
    });

    socket.on('load chat', async(data)=>{
        const {userId,to} = data;
        const room: string = [userId, to].sort().join('&&&&');
        try{
            console.log('loading chat');
            /*
            const clientsInRoom = io.sockets.adapter.rooms.get(room);
            console.log(clientsInRoom);
            
            if(!clientsInRoom || (clientsInRoom.size !== undefined && !clientsInRoom.has(socket.id))){
                socket.join(room);
            }
            */
            const messages:MessageDTO[] = await messageServ.getSingleChat(userId, to);
            io.to(room).emit('allMessages', messages);
        } catch(error){
            if(error instanceof ForbiddenException || error instanceof PrismaClientKnownRequestError){
                console.error(error.message)
            }
            console.log(error);
            io.to(room).emit('allMessages', []);
        }
    });

   socket.on('message', async(data) =>{
    const {to, content} = data;
    const userId = socket.userId
    if(!userId) return
    const room: string = [userId, to].sort().join('&&&&');
    try{
        const message: MessageDTO | undefined = await messageServ.newMessage(userId, to, content);
        io.to(room).emit('message', message);
    } catch(error){
        if(error instanceof ForbiddenException || error instanceof PrismaClientKnownRequestError){
            console.error(error.message)
        }
        console.log(error);
        io.to(room).emit('message', null);
    }
   })

//    socket.on("connect_error", (err)=>{
//     console.log(err.message);
//    })

   socket.on('disconnect', () =>{
    console.log(`user: ${socket.userId} has left all rooms and has been disconnected`);
   })
})