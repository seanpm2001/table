import { getMemoOptions, memo } from '../../utils'
import { table_getColumn } from '../../core/columns/Columns.utils'
import {
  column_getCanGlobalFilter,
  table_getGlobalFilterFn,
} from '../global-filtering/GlobalFiltering.utils'
import { table_getState } from '../../core/table/Tables.utils'
import { table_autoResetPageIndex } from '../row-pagination/RowPagination.utils'
import { filterRows } from './filterRowsUtils'
import {
  column_getFilterFn,
  table_getPreFilteredRowModel,
} from './ColumnFiltering.utils'
import type { RowData } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { RowModel } from '../../types/RowModel'
import type { Table } from '../../types/Table'
import type { Row } from '../../types/Row'
import type {
  ResolvedColumnFilter,
  Row_ColumnFiltering,
} from './ColumnFiltering.types'

export function createFilteredRowModel<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): (table: Table<TFeatures, TData>) => () => RowModel<TFeatures, TData> {
  return (table) =>
    memo(
      () => [
        table_getPreFilteredRowModel(table),
        table_getState(table).columnFilters,
        table_getState(table).globalFilter,
      ],
      (rowModel, columnFilters, globalFilter) => {
        if (!rowModel.rows.length || (!columnFilters.length && !globalFilter)) {
          for (const row of rowModel.flatRows) {
            row.columnFilters = {}
            row.columnFiltersMeta = {}
          }
          return rowModel
        }

        const resolvedColumnFilters: Array<
          ResolvedColumnFilter<TFeatures, TData>
        > = []
        const resolvedGlobalFilters: Array<
          ResolvedColumnFilter<TFeatures, TData>
        > = []

        columnFilters?.forEach((d) => {
          const column = table_getColumn(table, d.id)

          if (!column) {
            return
          }

          const filterFn = column_getFilterFn(column, table)

          if (!filterFn) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(
                `Could not find a valid 'column.filterFn' for column with the ID: ${column.id}.`,
              )
            }
            return
          }

          resolvedColumnFilters.push({
            id: d.id,
            filterFn,
            resolvedValue: filterFn.resolveFilterValue?.(d.value) ?? d.value,
          })
        })

        const filterableIds = columnFilters?.map((d) => d.id) ?? []

        const globalFilterFn = table_getGlobalFilterFn(table)

        const globallyFilterableColumns = table
          .getAllLeafColumns()
          .filter((column) => column_getCanGlobalFilter(column, table))

        if (
          globalFilter &&
          globalFilterFn &&
          globallyFilterableColumns.length
        ) {
          filterableIds.push('__global__')

          globallyFilterableColumns.forEach((column) => {
            resolvedGlobalFilters.push({
              id: column.id,
              filterFn: globalFilterFn,
              resolvedValue:
                globalFilterFn.resolveFilterValue?.(globalFilter) ??
                globalFilter,
            })
          })
        }

        // Flag the prefiltered row model with each filter state
        for (const row of rowModel.flatRows) {
          row.columnFilters = {}

          if (resolvedColumnFilters.length) {
            for (const currentColumnFilter of resolvedColumnFilters) {
              const id = currentColumnFilter.id

              // Tag the row with the column filter state
              row.columnFilters[id] = currentColumnFilter.filterFn(
                row,
                id,
                currentColumnFilter.resolvedValue,
                (filterMeta) => {
                  row.columnFiltersMeta[id] = filterMeta
                },
              )
            }
          }

          if (resolvedGlobalFilters.length) {
            for (const currentGlobalFilter of resolvedGlobalFilters) {
              const id = currentGlobalFilter.id
              // Tag the row with the first truthy global filter state
              if (
                currentGlobalFilter.filterFn(
                  row,
                  id,
                  currentGlobalFilter.resolvedValue,
                  (filterMeta) => {
                    row.columnFiltersMeta[id] = filterMeta
                  },
                )
              ) {
                row.columnFilters.__global__ = true
                break
              }
            }

            if (row.columnFilters.__global__ !== true) {
              row.columnFilters.__global__ = false
            }
          }
        }

        const filterRowsImpl = (
          row: Row<TFeatures, TData> & Row_ColumnFiltering<TFeatures, TData>,
        ) => {
          // Horizontally filter rows through each column
          for (const columnId of filterableIds) {
            if (row.columnFilters[columnId] === false) {
              return false
            }
          }
          return true
        }

        // Filter final rows using all of the active filters
        return filterRows(rowModel.rows as any, filterRowsImpl as any, table)
      },
      getMemoOptions(table.options, 'debugTable', 'getFilteredRowModel', () =>
        table_autoResetPageIndex(table),
      ),
    )
}