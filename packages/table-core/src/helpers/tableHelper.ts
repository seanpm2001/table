import { createColumnHelper } from './columnHelper'
import type { ProcessingFns_All } from '../types/ProcessingFns'
import type { ColumnHelper } from './columnHelper'
import type { RowData } from '../types/type-utils'
import type { TableFeatures } from '../types/TableFeatures'
import type { Table } from '../types/Table'
import type { TableOptions } from '../types/TableOptions'

/**
 * Options for creating a table helper to share common options across multiple tables
 * Columns, data, and state are excluded from this type and reserved for only the `useTable`/`createTable` functions
 */
export type TableHelperOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = Omit<TableOptions<TFeatures, TData>, 'columns' | 'data' | 'state'> & {
  _features: TFeatures
  TData: TData // provide a cast for the TData type
}

/**
 * Internal type that each adapter package will build off of to create a table helper
 */
export type TableHelper_Core<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = {
  columnHelper: ColumnHelper<TFeatures, TData>
  features: TFeatures
  processingFns: ProcessingFns_All<TFeatures, TData>
  options: Omit<TableOptions<TFeatures, TData>, 'columns' | 'data' | 'state'>
  tableCreator: (
    tableOptions: Omit<
      TableOptions<TFeatures, TData>,
      '_features' | '_rowModels'
    >,
  ) => Table<TFeatures, TData>
}

/**
 * Internal function to create a table helper that each adapter package will use to create their own table helper
 */
export function constructTableHelper<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  tableCreator: (
    tableOptions: TableOptions<TFeatures, TData>,
  ) => Table<TFeatures, TData>,
  tableHelperOptions: TableHelperOptions<TFeatures, TData>,
): TableHelper_Core<TFeatures, TData> {
  const { TData: _TData, ..._tableHelperOptions } = tableHelperOptions
  return {
    columnHelper: createColumnHelper<TFeatures, TData>(),
    features: tableHelperOptions._features,
    processingFns: tableHelperOptions._processingFns ?? {},
    options: _tableHelperOptions as any,
    tableCreator: (tableOptions) =>
      tableCreator({ ...(_tableHelperOptions as any), ...tableOptions }),
  }
}

// test

// // eslint-disable-next-line import/first, import/order
// import { constructTable } from '../core/table/constructTable'
// // eslint-disable-next-line import/first, import/order
// import { type ColumnDef } from '../types/ColumnDef'

// type Person = {
//   firstName: string
//   lastName: string
//   age: number
// }

// const tableHelper = constructTableHelper(constructTable, {
//   _features: { RowSelection: {} },
//   _rowModels: {},
//   TData: {} as Person,
// })

// const columns = [
//   tableHelper.columnHelper.accessor('firstName', {
//     header: 'First Name',
//     cell: (info) => info.getValue(),
//   }),
//   tableHelper.columnHelper.accessor('lastName', { header: 'Last Name' }),
//   tableHelper.columnHelper.accessor('age', { header: 'Age' }),
//   tableHelper.columnHelper.display({ header: 'Actions', id: 'actions' }),
// ] as Array<ColumnDef<typeof tableHelper.features, Person, unknown>>

// const data: Array<Person> = []

// tableHelper.tableCreator({
//   columns,
//   data,
// })