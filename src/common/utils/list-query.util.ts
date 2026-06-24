import { BadRequestException } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { ListQueryDto } from '../dto/list-query.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

export type FilterType = 'string' | 'number' | 'exact';

export interface ListQueryOptions {
  defaultSortBy: string;
  filterFields?: Record<string, { column: string; type: FilterType }>;
  searchFields?: string[];
  sortFields: Record<string, string>;
}

export function applyListQuery<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  query: ListQueryDto,
  options: ListQueryOptions,
): SelectQueryBuilder<T> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const sortBy = query.sortBy ?? options.defaultSortBy;
  const sortColumn = options.sortFields[sortBy];

  if (!sortColumn) {
    throw new BadRequestException(`Unsupported sortBy field: ${sortBy}`);
  }

  queryBuilder.orderBy(sortColumn, query.sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
  queryBuilder.skip((page - 1) * limit).take(limit);

  applyFilters(queryBuilder, query.filter, options.filterFields ?? {});
  applySearch(queryBuilder, query.search, options.searchFields ?? []);

  return queryBuilder;
}

export async function toPaginatedResponse<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  query: ListQueryDto,
): Promise<PaginatedResponse<T>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const [data, totalItems] = await queryBuilder.getManyAndCount();
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

function applyFilters<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  rawFilters: string | string[] | undefined,
  filterFields: Record<string, { column: string; type: FilterType }>,
): void {
  const filters = normalizeFilters(rawFilters);

  filters.forEach((rawFilter, index) => {
    const separatorIndex = rawFilter.indexOf(':');

    if (separatorIndex <= 0) {
      throw new BadRequestException(`Invalid filter format: ${rawFilter}`);
    }

    const field = rawFilter.slice(0, separatorIndex);
    const value = rawFilter.slice(separatorIndex + 1);
    const filterField = filterFields[field];

    if (!filterField) {
      throw new BadRequestException(`Unsupported filter field: ${field}`);
    }

    if (value.length === 0) {
      throw new BadRequestException(`Filter value is required for field: ${field}`);
    }

    const parameterName = `filter_${field}_${index}`.replace(/[^A-Za-z0-9_]/g, '_');

    if (filterField.type === 'string') {
      queryBuilder.andWhere(`LOWER(${filterField.column}) LIKE LOWER(:${parameterName})`, {
        [parameterName]: `%${value}%`,
      });
      return;
    }

    if (filterField.type === 'number') {
      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        throw new BadRequestException(`Filter value for ${field} must be a number`);
      }

      queryBuilder.andWhere(`${filterField.column} = :${parameterName}`, {
        [parameterName]: numericValue,
      });
      return;
    }

    queryBuilder.andWhere(`${filterField.column} = :${parameterName}`, {
      [parameterName]: value,
    });
  });
}

function applySearch<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  search: string | undefined,
  searchFields: string[],
): void {
  if (!search) {
    return;
  }

  if (searchFields.length === 0) {
    throw new BadRequestException('Search is not supported for this endpoint');
  }

  const searchConditions = searchFields.map((field, index) => `LOWER(${field}) LIKE LOWER(:search_${index})`);
  const parameters = Object.fromEntries(searchFields.map((_, index) => [`search_${index}`, `%${search}%`]));

  queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, parameters);
}

function normalizeFilters(rawFilters: string | string[] | undefined): string[] {
  if (!rawFilters) {
    return [];
  }

  const filters = Array.isArray(rawFilters) ? rawFilters : [rawFilters];

  return filters.flatMap((filter) =>
    filter
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
}
