import type { CellData, RowData, UnionToIntersection } from './type-utils'
import type { TableFeatures } from './TableFeatures'
import type { Cell_Cell } from '../core/cells/Cells.types'
import type { Cell_ColumnGrouping } from '../features/column-grouping/ColumnGrouping.types'

export type _Cell<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
> = Cell_Cell<TFeatures, TData, TValue> &
  UnionToIntersection<
    'ColumnGrouping' extends keyof TFeatures ? Cell_ColumnGrouping : never
  >

export type Cell_All<
  TData extends RowData,
  TValue extends CellData = CellData,
> = _Cell<TableFeatures, TData, TValue>

// temp - enable all features for types internally
export type Cell<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
> = Cell_All<TData, TValue>