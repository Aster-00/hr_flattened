import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UploadDocumentDto {
@IsMongoId()
@IsNotEmpty()
ownerId: string;

@IsString()
@IsNotEmpty()
filePath: string;

@IsEnum(DocumentType)
@IsNotEmpty()
type: DocumentType;

}