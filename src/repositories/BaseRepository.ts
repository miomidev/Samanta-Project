import { BaseEntity, PaginatedResponse, QueryParams } from '../lib/types'

interface QueryBuilder {
  skip(value: number): this
  limit(value: number): this
  sort(sort: Record<string, 1 | -1>): this
}

export interface IBaseRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>
  findAll(params?: QueryParams): Promise<PaginatedResponse<T>>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
  count(filter?: Record<string, unknown>): Promise<number>
}

export abstract class BaseRepository<
  T extends BaseEntity,
  Q extends QueryBuilder
> implements IBaseRepository<T> {

  abstract findById(id: string): Promise<T | null>
  abstract findAll(params?: QueryParams): Promise<PaginatedResponse<T>>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T | null>
  abstract delete(id: string): Promise<boolean>
  abstract count(filter?: Record<string, unknown>): Promise<number>

  protected applyPagination(query: Q, params?: QueryParams): Q {
    if (params?.page && params?.limit) {
      const skip = (params.page - 1) * params.limit
      return query.skip(skip).limit(params.limit)
    }
    return query
  }

  protected applySorting(query: Q, params?: QueryParams): Q {
    if (params?.sort) {
      const order: 1 | -1 = params.order === 'desc' ? -1 : 1
      return query.sort({ [params.sort]: order })
    }
    return query.sort({ createdAt: -1 })
  }
}