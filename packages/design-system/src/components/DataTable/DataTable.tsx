import React from 'react';
import { IconChevronsUpDown, IconChevronUp, IconChevronDown, IconChevronLeft, IconChevronRight, IconRefresh } from '../../icons';
import { Button } from '../Button/Button';
import './DataTable.css';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  isNumeric?: boolean;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  density?: 'compact' | 'comfortable';
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  selectedRowKeys?: string[];
  onSelectRow?: (key: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange?: (newPageSize: number) => void;
  };
  emptyText?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  isError = false,
  errorMessage = 'Đã xảy ra lỗi khi tải dữ liệu bảng.',
  onRetry,
  density = 'compact',
  sortColumn,
  sortDirection,
  onSort,
  selectedRowKeys,
  onSelectRow,
  onSelectAll,
  pagination,
  emptyText = 'Không tìm thấy bản ghi nào',
  className = '',
}: DataTableProps<T>) {
  const isAllSelected =
    data.length > 0 && selectedRowKeys && data.every((item) => selectedRowKeys.includes(rowKey(item)));
  const isIndeterminate =
    selectedRowKeys && selectedRowKeys.length > 0 && !isAllSelected;

  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : 1;

  return (
    <div className={['vdbus-datatable-wrapper', `vdbus-datatable--${density}`, className].filter(Boolean).join(' ')}>
      <div className="vdbus-datatable-scroll">
        <table className="vdbus-datatable">
          <thead>
            <tr>
              {onSelectRow && (
                <th className="vdbus-datatable__th vdbus-datatable__th--checkbox">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = Boolean(isIndeterminate);
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    aria-label="Chọn tất cả các dòng"
                  />
                </th>
              )}
              {columns.map((col) => {
                const alignClass = col.align ? `vdbus-datatable--align-${col.align}` : (col.isNumeric ? 'vdbus-datatable--align-right' : 'vdbus-datatable--align-left');
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    className={['vdbus-datatable__th', alignClass, col.sortable ? 'vdbus-datatable__th--sortable' : ''].filter(Boolean).join(' ')}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && onSort?.(col.key)}
                  >
                    <div className="vdbus-datatable__th-content">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="vdbus-datatable__sort-icon" aria-hidden="true">
                          {isSorted ? (
                            sortDirection === 'asc' ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />
                          ) : (
                            <IconChevronsUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} className="vdbus-datatable__tr-skeleton">
                  {onSelectRow && <td className="vdbus-datatable__td"><div className="vdbus-skeleton vdbus-skeleton--checkbox" /></td>}
                  {columns.map((c) => (
                    <td key={`skel-c-${c.key}`} className="vdbus-datatable__td">
                      <div className="vdbus-skeleton vdbus-skeleton--cell" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="vdbus-datatable__state-cell">
                  <div className="vdbus-datatable__error">
                    <p>{errorMessage}</p>
                    {onRetry && (
                      <Button variant="secondary" size="sm" onClick={onRetry}>
                        <IconRefresh size={14} /> Thử lại
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="vdbus-datatable__state-cell">
                  <div className="vdbus-datatable__empty">{emptyText}</div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = rowKey(item);
                const isSelected = selectedRowKeys?.includes(key);
                return (
                  <tr key={key} className={isSelected ? 'vdbus-datatable__tr--selected' : ''}>
                    {onSelectRow && (
                      <td className="vdbus-datatable__td vdbus-datatable__td--checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow(key, e.target.checked)}
                          aria-label={`Chọn dòng ${key}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const val = (item as any)[col.key];
                      const alignClass = col.align ? `vdbus-datatable--align-${col.align}` : (col.isNumeric ? 'vdbus-datatable--align-right' : 'vdbus-datatable--align-left');
                      return (
                        <td
                          key={col.key}
                          className={[
                            'vdbus-datatable__td',
                            alignClass,
                            col.isNumeric ? 'tabular-nums' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          {col.render ? col.render(val, item, index) : val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="vdbus-datatable__pagination">
          <div className="vdbus-datatable__pagination-info">
            Hiển thị {(pagination.pageIndex - 1) * pagination.pageSize + (data.length > 0 ? 1 : 0)} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalItems)} trong tổng số <strong className="tabular-nums">{pagination.totalItems}</strong> bản ghi
          </div>
          <div className="vdbus-datatable__pagination-actions">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.pageIndex <= 1}
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            >
              <IconChevronLeft size={14} /> Trước
            </Button>
            <span className="vdbus-datatable__page-number tabular-nums">
              Trang {pagination.pageIndex} / {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.pageIndex >= totalPages}
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            >
              Sau <IconChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
