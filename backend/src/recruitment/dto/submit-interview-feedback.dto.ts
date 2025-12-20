import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Types } from 'mongoose';

export class SubmitInterviewFeedbackDto {
    @IsMongoId()
    @IsNotEmpty()
    interviewId: Types.ObjectId;

    @IsMongoId()
    @IsNotEmpty()
    interviewerId: Types.ObjectId;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsNotEmpty()
    score: number;

    @IsString()
    @IsOptional()
    comments?: string;
}
