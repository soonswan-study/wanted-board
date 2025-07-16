import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ description: '게시글 제목' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '작성자 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  authorName: string;

  @ApiProperty({ description: '게시글 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class UpdatePostDto {
  @ApiProperty({ description: '게시글 제목' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: '게시글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '게시글 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class DeletePostDto {
  @ApiProperty({ description: '게시글 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class PostDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  authorName: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @Exclude()
  password?: string;
}
