import type { OrderStatus } from './types';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  returned:   'Returned',
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    '#B4791B',
  confirmed:  '#1B6FB4',
  processing: '#7A4FB4',
  shipped:    '#1B6FB4',
  delivered:  '#1B8A4B',
  cancelled:  '#888888',
  returned:   '#B43B3B',
};

export const STATUS_BG: Record<OrderStatus, string> = {
  pending:    '#fef3c7',
  confirmed:  '#dbeafe',
  processing: '#ede9fe',
  shipped:    '#dbeafe',
  delivered:  '#d1fae5',
  cancelled:  '#f0f0ee',
  returned:   '#fee2e2',
};

export const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned',
];
