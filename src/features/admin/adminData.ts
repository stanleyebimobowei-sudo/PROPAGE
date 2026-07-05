import { supabaseInsert, supabaseUpdate } from '@/features/admin/supabaseRest'
import type { CheckoutFormValues } from '@/features/checkout/hooks/CheckoutEngine'
import type { ProductPackage } from '@/features/landing/data/packages'

export type AdminOrderStatus =
  | 'New'
  | 'Contacted'
  | 'Confirmed'
  | 'Delivered'
  | 'Fulfilled'
  | 'Cancelled'
  | 'Failed Delivery'
  | 'Outstanding'

export type AdminOrder = {
  id: string
  customer: CheckoutFormValues
  package: ProductPackage
  status: AdminOrderStatus
  createdAt: string
  estimatedDelivery: string
  source: 'popup' | 'inline'
}

export type AdminExpense = {
  id: string
  amount: number
  purpose: string
  createdAt: string
  orderId?: string
}

export type CapitalTopUp = {
  id: string
  amount: number
  note: string
  createdAt: string
}

export type PackagePriceOverride = {
  promoPrice: string
  oldPrice: string
  savedAmount: string
}

export type AdminEventType =
  | 'visitor'
  | 'buy_click'
  | 'package_selected'
  | 'availability_confirmed'
  | 'form_submitted'
  | 'delivered'
  | 'fulfilled'
  | 'purchase'

export type AdminEvent = {
  id: string
  type: AdminEventType
  createdAt: string
  metadata?: Record<string, string>
}

export type AdminSettings = {
  formspreeEndpoint: string
  facebookPixelId: string
  thankYouPath: string
  startupCapital: number
  capitalTopUps: CapitalTopUp[]
  packagePrices: Record<string, PackagePriceOverride>
}

const ordersKey = 'kog-admin-orders'
const expensesKey = 'kog-admin-expenses'
const eventsKey = 'kog-admin-events'
const settingsKey = 'kog-admin-settings'

const defaultSettings: AdminSettings = {
  formspreeEndpoint: '',
  facebookPixelId: '',
  thankYouPath: '/thank-you',
  startupCapital: 300000,
  capitalTopUps: [],
  packagePrices: {},
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    if (!value) {
      return fallback
    }

    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) ? parsed : fallback) as T
    }

    if (fallback && typeof fallback === 'object' && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...fallback, ...parsed } as T
    }

    return parsed as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emitDataChanged() {
  window.dispatchEvent(new CustomEvent('admin:data-changed'))
}

function syncInsert(table: string, payload: unknown) {
  supabaseInsert(table, payload).catch(() => undefined)
}

function syncUpdate(table: string, id: string, payload: unknown) {
  supabaseUpdate(table, id, payload).catch(() => undefined)
}

export function getAdminOrders() {
  return readJson<AdminOrder[]>(ordersKey, [])
}

export function saveAdminOrder(order: AdminOrder) {
  const orders = [order, ...getAdminOrders()]
  writeJson(ordersKey, orders)
  syncInsert('orders', {
    id: order.id,
    customer: order.customer,
    package: order.package,
    status: order.status,
    created_at: order.createdAt,
    estimated_delivery: order.estimatedDelivery,
    source: order.source,
  })
  emitDataChanged()
}

export function updateAdminOrderStatus(orderId: string, status: AdminOrderStatus) {
  const orders = getAdminOrders().map((order) => (order.id === orderId ? { ...order, status } : order))
  writeJson(ordersKey, orders)
  syncUpdate('orders', orderId, { status })
  if (status === 'Delivered') {
    trackAdminEvent('delivered')
  }
  if (status === 'Fulfilled') {
    trackAdminEvent('fulfilled')
  }
  emitDataChanged()
}

export function deleteAdminOrder(orderId: string) {
  writeJson(
    ordersKey,
    getAdminOrders().filter((order) => order.id !== orderId),
  )
  emitDataChanged()
}

export function getAdminExpenses() {
  return readJson<AdminExpense[]>(expensesKey, [])
}

export function addAdminExpense(amount: number, purpose: string, orderId?: string) {
  const expense: AdminExpense = {
    id: createId('expense'),
    amount,
    purpose,
    orderId,
    createdAt: new Date().toISOString(),
  }
  writeJson(expensesKey, [expense, ...getAdminExpenses()])
  syncInsert('expenses', {
    id: expense.id,
    amount: expense.amount,
    purpose: expense.purpose,
    order_id: expense.orderId,
    created_at: expense.createdAt,
  })
  emitDataChanged()
}

export function getAdminEvents() {
  return readJson<AdminEvent[]>(eventsKey, [])
}

export function trackAdminEvent(type: AdminEventType, metadata?: Record<string, string>) {
  const event: AdminEvent = {
    id: createId('event'),
    type,
    createdAt: new Date().toISOString(),
    metadata,
  }
  writeJson(eventsKey, [event, ...getAdminEvents()].slice(0, 2000))
  syncInsert('analytics_events', {
    id: event.id,
    type: event.type,
    metadata: event.metadata,
    created_at: event.createdAt,
  })
  emitDataChanged()
}

export function getAdminSettings(): AdminSettings {
  return readJson<AdminSettings>(settingsKey, defaultSettings)
}

export function saveAdminSettings(settings: AdminSettings) {
  writeJson(settingsKey, { ...defaultSettings, ...settings })
  syncInsert('admin_settings_snapshots', { settings: { ...defaultSettings, ...settings }, created_at: new Date().toISOString() })
  emitDataChanged()
}

export function addCapitalTopUp(amount: number, note: string) {
  const settings = getAdminSettings()
  const topUp: CapitalTopUp = {
    id: createId('capital'),
    amount,
    note,
    createdAt: new Date().toISOString(),
  }
  saveAdminSettings({ ...settings, capitalTopUps: [topUp, ...settings.capitalTopUps] })
}

export function getTotalStartupCapital() {
  const settings = getAdminSettings()
  return settings.startupCapital + settings.capitalTopUps.reduce((sum, topUp) => sum + topUp.amount, 0)
}

export function applyPackagePriceOverrides(packages: ProductPackage[]) {
  const overrides = getAdminSettings().packagePrices
  return packages.map((productPackage) => {
    const override = overrides[productPackage.id]
    if (!override) {
      return productPackage
    }
    return {
      ...productPackage,
      promoPrice: override.promoPrice || productPackage.promoPrice,
      oldPrice: override.oldPrice || productPackage.oldPrice,
      savedAmount: override.savedAmount || productPackage.savedAmount,
    }
  })
}

export function getThankYouUrl() {
  const path = getAdminSettings().thankYouPath || '/thank-you'
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function filterByPeriod<T extends { createdAt: string }>(items: T[], period: 'day' | 'month' | 'year', date = new Date()) {
  return items.filter((item) => {
    const itemDate = new Date(item.createdAt)
    if (period === 'day') {
      return itemDate.toDateString() === date.toDateString()
    }
    if (period === 'month') {
      return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth()
    }
    return itemDate.getFullYear() === date.getFullYear()
  })
}

export function parseMoney(value: string) {
  return Number(value.replace(/[^\d]/g, '')) || 0
}

export function formatNairaInput(value: string) {
  const amount = parseMoney(value)
  return amount ? `₦${amount.toLocaleString('en-NG')}` : ''
}

export function isSameDay(dateValue: string, compareDate = new Date()) {
  const date = new Date(dateValue)
  return date.toDateString() === compareDate.toDateString()
}

export function isSameMonth(dateValue: string, compareDate = new Date()) {
  const date = new Date(dateValue)
  return date.getFullYear() === compareDate.getFullYear() && date.getMonth() === compareDate.getMonth()
}
