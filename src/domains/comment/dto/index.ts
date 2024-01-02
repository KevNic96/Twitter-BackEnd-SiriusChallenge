import { IsNotEmpty, IsOptional, IsString, MaxLength, ArrayMaxSize} from "class-validator";

export class CreateCommentInputDTO{
    @IsString()
    @IsNotEmpty()
    @MaxLength(240)
        content!: string

    @IsOptional()
    @ArrayMaxSize(4)
        images?: string[]

    @IsNotEmpty()
    @IsString()
        parentId!: string
}