import type { CellData, RowData } from './type-utils'
import type { ColumnDef } from './ColumnDef'
import type { Cell } from './Cell'
import type { Column } from './Column'
import type { Header } from './Header'
import type { Row } from './Row'
import type { Table } from './Table'
import type { TableOptions } from './TableOptions'
import type { TableState } from './TableState'

export interface TableFeature {
  constructCell?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    cell: Cell<TFeatures, TData, TValue>,
    table: Table<TFeatures, TData>,
  ) => void
  constructColumn?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    column: Column<TFeatures, TData, TValue>,
    table: Table<TFeatures, TData>,
  ) => void
  constructHeader?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    header: Header<TFeatures, TData, TValue>,
    table: Table<TFeatures, TData>,
  ) => void
  constructRow?: <TFeatures extends TableFeatures, TData extends RowData>(
    row: Row<TFeatures, TData>,
    table: Table<TFeatures, TData>,
  ) => void
  constructTable?: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData>,
  ) => void
  getDefaultColumnDef?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >() => Partial<ColumnDef<TFeatures, TData, TValue>>
  getDefaultOptions?: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData>,
  ) => Partial<TableOptions<TFeatures, TData>>
  getInitialState?: <TFeatures extends TableFeatures>(
    initialState: TableState<TFeatures>,
  ) => Partial<TableState<TFeatures>>
}

export interface CoreTableFeatures {
  Tables?: TableFeature
  Rows?: TableFeature
  Headers?: TableFeature
  Columns?: TableFeature
  Cells?: TableFeature
}

export interface TableFeatures extends CoreTableFeatures {
  ColumnFaceting?: TableFeature
  ColumnFiltering?: TableFeature
  ColumnGrouping?: TableFeature
  ColumnOrdering?: TableFeature
  ColumnPinning?: TableFeature
  ColumnResizing?: TableFeature
  ColumnSizing?: TableFeature
  ColumnVisibility?: TableFeature
  GlobalFaceting?: TableFeature
  GlobalFiltering?: TableFeature
  RowExpanding?: TableFeature
  RowPagination?: TableFeature
  RowPinning?: TableFeature
  RowSelection?: TableFeature
  RowSorting?: TableFeature
}
