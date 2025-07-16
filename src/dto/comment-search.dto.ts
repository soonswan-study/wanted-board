import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { Operator, Searchable } from 'src/common/search/search.decorator';

export class CommentSearchDto extends PaginationDto {
  @ApiPropertyOptional({ description: '댓글 내용 검색' })
  @IsOptional()
  @IsString()
  @Searchable({ op: Operator.LIKE })
  content?: string;

  @ApiPropertyOptional({ description: '작성자 이름 검색' })
  @IsOptional()
  @IsString()
  @Searchable({ op: Operator.LIKE })
  authorName?: string;

  @ApiPropertyOptional({
    description: '정렬 필드',
    enum: ['createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  orderBy?: 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({ description: '정렬 방향', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: '생성일(이상) yyyy-MM-ddTHH:mm:ssZ' })
  @IsOptional()
  @Searchable({ op: Operator.GTE, field: 'createdAt' })
  createdAtFrom?: string;

  @ApiPropertyOptional({ description: '생성일(미만) yyyy-MM-ddTHH:mm:ssZ' })
  @IsOptional()
  @Searchable({ op: Operator.LT, field: 'createdAt' })
  createdAtTo?: string;
}
