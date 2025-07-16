import { SEARCH_META_KEY, Operator } from './search.decorator';
import { SelectQueryBuilder, ObjectLiteral, Repository } from 'typeorm';
import { toDto } from '../../common/transform.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';

// NOTE(swan): 검색 연산자별 쿼리 적용 함수.
function applyOperator(
  op: Operator,
  qb: SelectQueryBuilder<any>,
  alias: string,
  dbField: string,
  value: unknown,
) {
  let param = `${alias}_${dbField}`;
  if (op === Operator.GTE) param += '_gte';
  if (op === Operator.LTE) param += '_lte';
  let whereStr = '';
  switch (op) {
    case Operator.EQ:
      whereStr = `${alias}.${dbField} = :${param}`;
      break;
    case Operator.NE:
      whereStr = `${alias}.${dbField} != :${param}`;
      break;
    case Operator.LIKE:
      whereStr = `${alias}.${dbField} LIKE :${param}`;
      value = `%${value as string}%`;
      break;
    case Operator.GT:
      whereStr = `${alias}.${dbField} > :${param}`;
      break;
    case Operator.LT:
      whereStr = `${alias}.${dbField} < :${param}`;
      break;
    case Operator.GTE:
      whereStr = `${alias}.${dbField} >= :${param}`;
      break;
    case Operator.LTE:
      whereStr = `${alias}.${dbField} <= :${param}`;
      break;
    case Operator.IN:
      whereStr = `${alias}.${dbField} IN (:...${param})`;
      break;
    case Operator.NIN:
      whereStr = `${alias}.${dbField} NOT IN (:...${param})`;
      break;
  }
  if (whereStr) {
    qb.andWhere(whereStr, { [param]: value });
  }
}

// NOTE(swan): DTO의 @Searchable 메타데이터에서 SearchOption 배열 추출.
function getSearchOptionsFromDto<T>(
  query: T,
): Array<{ field: string; op: Operator; dbField: string }> {
  const proto = Object.getPrototypeOf(query) as object;
  const metaUnknown: unknown =
    Reflect.getMetadata(SEARCH_META_KEY, proto) ?? [];
  const meta: Array<{ propertyKey: string; op: Operator; field?: string }> =
    Array.isArray(metaUnknown)
      ? (metaUnknown as Array<{
          propertyKey: string;
          op: Operator;
          field?: string;
        }>)
      : [];
  if (!Array.isArray(meta)) return [];
  return meta.map((m) => ({
    field: m.propertyKey,
    op: m.op,
    dbField: m.field || m.propertyKey,
  }));
}

// NOTE(swan): 검색/페이징/정렬 통합 자동화 함수.
export async function searchPaginated<
  Entity extends ObjectLiteral,
  T extends PaginationDto & { orderBy?: string; sortDir?: 'asc' | 'desc' },
  Dto,
>(
  repository: Repository<Entity>,
  query: T,
  entityClass: { getName(): string },
  dtoClass: new (...args: any[]) => Dto,
  relations?: string[],
  afterQueryBuilder?: (
    qb: SelectQueryBuilder<Entity>,
  ) => SelectQueryBuilder<Entity>,
): Promise<PaginatedResponse<Dto>> {
  const {
    page = 1,
    limit = 10,
    orderBy = 'createdAt',
    sortDir = 'desc',
  } = query;
  const skip = (page - 1) * limit;
  const alias = entityClass.getName();

  let qb: SelectQueryBuilder<Entity> = repository.createQueryBuilder(alias);

  // NOTE(swan): relations 로드.
  if (relations && relations.length > 0) {
    for (const relation of relations) {
      qb = qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
    }
  }

  // NOTE(swan): soft delete 제외 (중복 방지).
  if (!qb.getQuery().includes(`${alias}.deletedAt IS NULL`)) {
    qb = qb.andWhere(`${alias}.deletedAt IS NULL`);
  }

  // NOTE(swan): DTO의 @Searchable 메타데이터 기반 자동 검색 조건 적용.
  const searchOptions = getSearchOptionsFromDto(query);
  for (const { field, op, dbField } of searchOptions) {
    const value = query[field as keyof T];
    if (value !== null && value !== undefined) {
      applyOperator(op, qb, alias, dbField, value);
    }
  }

  // NOTE(swan): afterQueryBuilder 콜백으로 추가 조작 허용.
  if (afterQueryBuilder) {
    qb = afterQueryBuilder(qb);
  }

  qb = qb.orderBy(
    `${alias}.${orderBy}`,
    sortDir.toUpperCase() as 'ASC' | 'DESC',
  );

  const [entities, total] = await qb.skip(skip).take(limit).getManyAndCount();

  const data = entities.map((entity) => {
    const transformed = toDto(dtoClass, entity);
    if (relations && relations.length > 0) {
      for (const relation of relations) {
        if (entity[relation] && Array.isArray(entity[relation])) {
          transformed[relation] = entity[relation].map((item) =>
            toDto(dtoClass, item),
          );
        }
      }
    }
    return transformed;
  });

  return { data, total, page, limit };
}
