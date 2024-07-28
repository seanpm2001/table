import type { RowData } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { Table } from '../../types/Table'
import type { Row } from '../../types/Row'
import type { Row_CoreProperties } from './Rows.types'

export const _createRow = <
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData>,
  id: string,
  original: TData,
  rowIndex: number,
  depth: number,
  subRows?: Array<Row<TFeatures, TData>>,
  parentId?: string,
): Row<TFeatures, TData> => {
  const row: Row_CoreProperties<TFeatures, TData> = {
    _uniqueValuesCache: {},
    _valuesCache: {},
    depth,
    id,
    index: rowIndex,
    original,
    parentId,
    subRows: subRows ?? [],
  }

  for (const feature of Object.values(table._features)) {
    feature?._createRow?.(row as Row<TFeatures, TData>, table)
  }

  return row as Row<TFeatures, TData>
}