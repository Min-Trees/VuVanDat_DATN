import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable, Column } from './DataTable';

interface TestItem {
  id: string;
  name: string;
  amount: number;
}

const testData: TestItem[] = [
  { id: '1', name: 'Đơn hàng 01', amount: 1500000 },
  { id: '2', name: 'Đơn hàng 02', amount: 3200000 },
];

const testColumns: Column<TestItem>[] = [
  { key: 'name', header: 'Tên đơn', sortable: true },
  { key: 'amount', header: 'Số tiền', isNumeric: true },
];

describe('DataTable Component', () => {
  it('renders table headers and rows accurately', () => {
    render(<DataTable data={testData} columns={testColumns} rowKey={(r) => r.id} />);
    expect(screen.getByText('Tên đơn')).toBeDefined();
    expect(screen.getByText('Số tiền')).toBeDefined();
    expect(screen.getByText('Đơn hàng 01')).toBeDefined();
    expect(screen.getByText('Đơn hàng 02')).toBeDefined();
  });

  it('triggers onSort when clicking sortable column header', () => {
    const handleSort = vi.fn();
    render(<DataTable data={testData} columns={testColumns} rowKey={(r) => r.id} onSort={handleSort} />);
    fireEvent.click(screen.getByText('Tên đơn'));
    expect(handleSort).toHaveBeenCalledWith('name');
  });

  it('renders empty message when data is empty', () => {
    render(<DataTable data={[]} columns={testColumns} rowKey={(r) => r.id} emptyText="Không có dữ liệu đơn" />);
    expect(screen.getByText('Không có dữ liệu đơn')).toBeDefined();
  });
});
