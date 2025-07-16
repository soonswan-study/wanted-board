// NOTE(swan): 검색 연산자 정의.
export enum Operator {
  EQ = 'eq',
  NE = 'ne',
  LIKE = 'like',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  IN = 'in',
  NIN = 'notIn',
}

export const SEARCH_META_KEY = 'search:options';

// NOTE(swan): @Searchable Decorator.
export function Searchable(option: { op: Operator; field?: string }) {
  return function (target: any, propertyKey: string) {
    const existingUnknown: unknown =
      Reflect.getMetadata(SEARCH_META_KEY, target as object) || [];
    const existing: Array<{
      propertyKey: string;
      op: Operator;
      field?: string;
    }> = Array.isArray(existingUnknown)
      ? (existingUnknown as Array<{
          propertyKey: string;
          op: Operator;
          field?: string;
        }>)
      : [];
    Reflect.defineMetadata(
      SEARCH_META_KEY,
      [...existing, { propertyKey, op: option.op, field: option.field }],
      target as object,
    );
  };
}
