import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '작성자 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  authorName: string;

  @ApiPropertyOptional({ description: '부모 댓글 ID (대댓글용)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number = 0;
}

export class CommentDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  postId: number;

  @ApiProperty({ nullable: true })
  @Expose()
  parentId: number | null;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  authorName: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: () => [CommentDto], isArray: true })
  @Expose()
  replies: CommentDto[];
}
