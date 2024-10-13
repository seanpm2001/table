import { isDev, tableMemo } from '../../utils'
import { expandRows } from '../row-expanding/createExpandedRowModel'
import { table_getState } from '../../core/table/Tables.utils'
import {
  getDefaultPaginationState,
  table_getPrePaginationRowModel,
} from './RowPagination.utils'
import type { RowData } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { RowModel } from '../../types/RowModel'
import type { Table_Internal } from '../../types/Table'
import type { Row } from '../../types/Row'

export function createPaginatedRowModel<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): (
  table: Table_Internal<TFeatures, TData>,
) => () => RowModel<TFeatures, TData> {
  return (table) =>
    tableMemo({
      debug: isDev && (table.options.debugAll ?? table.options.debugTable),
      fnName: 'createPaginatedRowModel',
      memoDeps: () => [
        table_getPrePaginationRowModel(table),
        table_getState(table).pagination,
        table.options.paginateExpandedRows
          ? table_getState(table).expanded
          : undefined,
      ],
      fn: () => _createPaginatedRowModel(table),
    })
}

function _createPaginatedRowModel<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table_Internal<TFeatures, TData>): RowModel<TFeatures, TData> {
  const prePaginatedRowModel = table_getPrePaginationRowModel(table)
  const pagination = table_getState(table).pagination

  if (!prePaginatedRowModel.rows.length) {
    return prePaginatedRowModel
  }

  const { pageSize, pageIndex } = pagination ?? getDefaultPaginationState()
  const { rows, flatRows, rowsById } = prePaginatedRowModel
  const pageStart = pageSize * pageIndex
  const pageEnd = pageStart + pageSize

  const paginatedRows = rows.slice(pageStart, pageEnd)

  let paginatedRowModel: RowModel<TFeatures, TData>

  if (!table.options.paginateExpandedRows) {
    paginatedRowModel = expandRows(
      {
        rows: paginatedRows,
        flatRows,
        rowsById,
      },
      table,
    )
  } else {
    paginatedRowModel = {
      rows: paginatedRows,
      flatRows,
      rowsById,
    }
  }

  paginatedRowModel.flatRows = []

  const handleRow = (row: Row<TFeatures, TData>) => {
    paginatedRowModel.flatRows.push(row)
    if (row.subRows.length) {
      row.subRows.forEach(handleRow)
    }
  }

  paginatedRowModel.rows.forEach(handleRow)

  return paginatedRowModel
}