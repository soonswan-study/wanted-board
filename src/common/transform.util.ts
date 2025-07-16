import { plainToInstance, ClassConstructor } from 'class-transformer';

export function toDto<T, V>(cls: ClassConstructor<T>, plain: V): T {
  return plainToInstance(cls, plain, { excludeExtraneousValues: true });
}

export function toDtoArray<T, V>(cls: ClassConstructor<T>, plainArr: V[]): T[] {
  return plainToInstance(cls, plainArr, { excludeExtraneousValues: true });
}
