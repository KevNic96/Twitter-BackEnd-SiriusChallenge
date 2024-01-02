import { UserViewDTO } from "@domains/user/dto";
import { FollowerDTO } from "../dto";

export interface FollowerService{
    FollowUp: (followerId:string,followedId:string) => Promise<FollowerDTO>
    Unfollow: (followerId: string, followedId: string) => Promise <void>
    DoesFollows: (followerId: string, followedId: string) => Promise <boolean>
    getFollowers: (userId: string) => Promise <FollowerDTO[]>
    getFollows: (userId: string) => Promise <FollowerDTO[]>
    getMutualsFollows: (userId: string) => Promise <UserViewDTO[]>
}