import { assignAPIs, getMemoOptions, memo } from '../../utils'
import { table_getState } from '../table/Tables.utils'
import { constructColumn } from './constructColumn'
import {
  column_getFlatColumns,
  column_getLeafColumns,
  table_getAllColumns,
  table_getAllFlatColumns,
  table_getAllFlatColumnsById,
  table_getAllLeafColumns,
  table_getColumn,
  tablegetDefaultColumnDef,
} from './Columns.utils'
import type { CellData, RowData } from '../../types/type-utils'
import type { TableFeature, TableFeatures } from '../../types/TableFeatures'
import type { Table } from '../../types/Table'
import type { Column } from '../../types/Column'

export const Columns: TableFeature = {
  constructColumn: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    column: Column<TFeatures, TData, TValue>,
    table: Table<TFeatures, TData>,
  ) => {
    assignAPIs(column, table, [
      {
        fn: () => column_getFlatColumns(column),
        memoDeps: () => [table.options.columns],
      },
      {
        fn: () => column_getLeafColumns(column, table),
        memoDeps: () => [
          table_getState(table).columnOrder,
          table_getState(table).grouping,
          table.options.columns,
          table.options.groupedColumnMode,
        ],
      },
    ])
  },

  constructTable: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData>,
  ) => {
    assignAPIs(table, table, [
      {
        fn: () => tablegetDefaultColumnDef(table),
        memoDeps: () => [table.options.defaultColumn],
      },
      {
        fn: () => table_getAllColumns(table),
        memoDeps: () => [table.options.columns],
      },
      {
        fn: () => table_getAllFlatColumns(table),
        memoDeps: () => [table.options.columns],
      },
      {
        fn: () => table_getAllFlatColumnsById(table),
        memoDeps: () => [table.options.columns],
      },
      {
        fn: () => table_getAllLeafColumns(table),
        memoDeps: () => [
          table_getState(table).columnOrder,
          table_getState(table).grouping,
          table.options.columns,
          table.options.groupedColumnMode,
        ],
      },
      {
        fn: (columnId) => table_getColumn(table, columnId),
      },
    ])
  },
}
