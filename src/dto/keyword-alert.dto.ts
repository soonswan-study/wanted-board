import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class KeywordAlertDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  authorName: string;

  @ApiProperty()
  @Expose()
  keyword: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
