import { FollowerDTO } from "../dto";

import { FollowerRepo } from "../repository";
import { FollowerService } from ".";
import { NotFoundException, ForbiddenException } from "@utils";
import { UserRepository} from "@domains/user/repository";
import { UserViewDTO } from "@domains/user/dto";

export class FollowerServiceImpl implements FollowerService{
    constructor (private readonly followRepo: FollowerRepo, private readonly userRepo: UserRepository){}

    async FollowUp(followerId: string, followedId: string): Promise <FollowerDTO>{
        // console.log(followerId,followedId)
        if(followerId === followedId) throw new ForbiddenException() // verifica si son iguales
        if(await this.followRepo.getById(followerId,followedId)) throw new ForbiddenException() //verifica si ya existe un seguimimento
        const follower = await this.userRepo.getById(followerId)
        const followed = await this.userRepo.getById(followedId) // obtiene objetos a partir de los identificadores
        if(!followed||!follower) throw new NotFoundException('user') // verifica si alguno de ellos no existe
        return await this.followRepo.create(followerId,followedId) // llama al metodo 'create' para crear una relacion de seguimiento y retorna el resultado
    }

    async Unfollow(followerId: string, followedId: string): Promise <void>{
        const follow = await this.followRepo.getById(followerId,followedId) // Obtiene la relacion de seguimiento
        if(!follow) throw new NotFoundException('follow') //Si la relacion no existe, lanza una excepcion
        await this.followRepo.delete(follow.id) // Llama al metodo delete para eliminar la relacion
    }

    async DoesFollows(followerId: string, followedId: string): Promise <boolean>{
        const follow = await this.followRepo.getById(followerId,followedId) // Obtiene la relacion de seguimiento
        return follow!= null // Retorna true si existe, false si no existe.
    }

    async getFollowers(userID: string): Promise <FollowerDTO[]>{
        const user = await this.userRepo.getById(userID) // Obtiene el objeto de usuario
        if(!user) throw new NotFoundException('user') // Si el usuario no existe, lanza una excepcion NotFound
        return await this.followRepo.getFollowers(userID) // Retorn lista de seguidores
    }

    async getFollows(userID: string): Promise <FollowerDTO[]>{
        const user= await this.userRepo.getById(userID) // Obtiene el objeto de usuario
        if(!user) throw new NotFoundException('user') // Si el usuario no existe, lanza una excepcion NotFound
        return await this.followRepo.getFollows(userID) // Retorna lista de seguidos
    }

    async getMutualsFollows(userID: string): Promise <UserViewDTO[]>{
        const followers = await this.followRepo.getFollowers(userID) // Obtenemos lista de seguidores y seguidos
        const follows = await this.followRepo.getFollows(userID)
        const mutuals = followers.filter((follower)=>follows.find((follow) => follow.followedId === follower.followerId)) // Filtra las relaciones que son mutuas
        const users = await Promise.all(
            mutuals.map(async(mutual)=>{ // Para cada usuario mutuo realiza:
                const user = await this.userRepo.getById(mutual.followerId) // Obtenemos la informacion del usuario basado en el ID del seguidor en la relacion mutua
                if(user) return new UserViewDTO(user) // Si se obtiene la informacion del usuario, crea un objeto UserViewDTO con ese usaurio
            })
        )
        return users.filter((user) => user) as UserViewDTO[] //Filtra los usuarios que no son nulos para eliminar los elementos 'null' que se podrian haber agregado si no se encontro informacion del usuario para algun seguidor mutuo
    }
}