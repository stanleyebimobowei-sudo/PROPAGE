import { isSupabaseConfigured, supabaseDelete, supabaseInsert, supabaseSelect, supabaseUpdate, supabaseUpsert } from '@/features/admin/supabaseRest'
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

export const defaultSettings: AdminSettings = {
  formspreeEndpoint: '',
  facebookPixelId: '',
  thankYouPath: '/thank-you',
  startupCapital: 300000,
  capitalTopUps: [],
  packagePrices: {},
}

let cachedSettings = defaultSettings

const storageKeys = {
  orders: 'kog-admin-orders',
  expenses: 'kog-admin-expenses',
  events: 'kog-admin-events',
  settings: 'kog-admin-settings',
}
type AdminOrderRow = {
  id: string
  customer: CheckoutFormValues
  package: ProductPackage
  status: AdminOrderStatus
  created_at: string
  estimated_delivery: string | null
  source: 'popup' | 'inline' | null
}

type AdminExpenseRow = {
  id: string
  amount: number | string
  purpose: string
  order_id: string | null
  created_at: string
}

type AdminEventRow = {
  id: string
  type: AdminEventType
  metadata: Record<string, string> | null
  created_at: string
}

type AdminSettingsRow = {
  settings: Partial<AdminSettings>
  created_at: string
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emitDataChanged() {
  window.dispatchEvent(new CustomEvent('admin:data-changed'))
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function sortByNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
}

function normalizeSettings(settings?: Partial<AdminSettings>): AdminSettings {
  return {
    ...defaultSettings,
    ...settings,
    capitalTopUps: Array.isArray(settings?.capitalTopUps) ? settings.capitalTopUps : defaultSettings.capitalTopUps,
    packagePrices: settings?.packagePrices ?? defaultSettings.packagePrices,
  }
}

function mapOrder(row: AdminOrderRow): AdminOrder {
  return {
    id: row.id,
    customer: row.customer,
    package: row.package,
    status: row.status,
    createdAt: row.created_at,
    estimatedDelivery: row.estimated_delivery ?? '1-3 Business Days',
    source: row.source ?? 'inline',
  }
}

function mapExpense(row: AdminExpenseRow): AdminExpense {
  return {
    id: row.id,
    amount: Number(row.amount) || 0,
    purpose: row.purpose,
    orderId: row.order_id ?? undefined,
    createdAt: row.created_at,
  }
}

function mapEvent(row: AdminEventRow): AdminEvent {
  return {
    id: row.id,
    type: row.type,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
  }
}

export async function getAdminOrders() {
  if (!isSupabaseConfigured()) {
    return sortByNewest(readStorage<AdminOrder[]>(storageKeys.orders, []))
  }

  const rows = await supabaseSelect<AdminOrderRow>('orders', 'select=*&order=created_at.desc')
  return rows.map(mapOrder)
}

export async function saveAdminOrder(order: AdminOrder) {
  if (!isSupabaseConfigured()) {
    const orders = readStorage<AdminOrder[]>(storageKeys.orders, [])
    writeStorage(storageKeys.orders, sortByNewest([order, ...orders.filter((item) => item.id !== order.id)]))
    emitDataChanged()
    return
  }

  await supabaseUpsert('orders', {
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

export async function updateAdminOrderStatus(orderId: string, status: AdminOrderStatus) {
  if (isSupabaseConfigured()) {
    await supabaseUpdate('orders', orderId, { status })
  } else {
    const orders = readStorage<AdminOrder[]>(storageKeys.orders, [])
    writeStorage(
      storageKeys.orders,
      orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    )
  }
  if (status === 'Delivered') {
    trackAdminEvent('delivered').catch(() => undefined)
  }
  if (status === 'Fulfilled') {
    trackAdminEvent('fulfilled').catch(() => undefined)
  }
  emitDataChanged()
}

export async function deleteAdminOrder(orderId: string) {
  if (isSupabaseConfigured()) {
    await supabaseDelete('orders', orderId)
  } else {
    writeStorage(
      storageKeys.orders,
      readStorage<AdminOrder[]>(storageKeys.orders, []).filter((order) => order.id !== orderId),
    )
  }

  emitDataChanged()
}

export async function getAdminExpenses() {
  if (!isSupabaseConfigured()) {
    return sortByNewest(readStorage<AdminExpense[]>(storageKeys.expenses, []))
  }

  const rows = await supabaseSelect<AdminExpenseRow>('expenses', 'select=*&order=created_at.desc')
  return rows.map(mapExpense)
}

export async function addAdminExpense(amount: number, purpose: string, orderId?: string) {
  const expense: AdminExpense = {
    id: createId('expense'),
    amount,
    purpose,
    orderId,
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) {
    writeStorage(storageKeys.expenses, sortByNewest([expense, ...readStorage<AdminExpense[]>(storageKeys.expenses, [])]))
    emitDataChanged()
    return
  }

  await supabaseInsert('expenses', {
    id: expense.id,
    amount: expense.amount,
    purpose: expense.purpose,
    order_id: expense.orderId,
    created_at: expense.createdAt,
  })
  emitDataChanged()
}

export async function getAdminEvents() {
  if (!isSupabaseConfigured()) {
    return sortByNewest(readStorage<AdminEvent[]>(storageKeys.events, [])).slice(0, 2000)
  }

  const rows = await supabaseSelect<AdminEventRow>('analytics_events', 'select=*&order=created_at.desc&limit=2000')
  return rows.map(mapEvent)
}

export async function trackAdminEvent(type: AdminEventType, metadata?: Record<string, string>) {
  const event: AdminEvent = {
    id: createId('event'),
    type,
    createdAt: new Date().toISOString(),
    metadata,
  }

  if (!isSupabaseConfigured()) {
    writeStorage(storageKeys.events, sortByNewest([event, ...readStorage<AdminEvent[]>(storageKeys.events, [])]).slice(0, 2000))
    emitDataChanged()
    return
  }

  await supabaseInsert('analytics_events', {
    id: event.id,
    type: event.type,
    metadata: event.metadata,
    created_at: event.createdAt,
  })
  emitDataChanged()
}

export function getAdminSettings(): AdminSettings {
  return cachedSettings
}

export async function loadAdminSettings() {
  if (!isSupabaseConfigured()) {
    cachedSettings = normalizeSettings(readStorage<Partial<AdminSettings>>(storageKeys.settings, defaultSettings))
    return cachedSettings
  }

  const rows = await supabaseSelect<AdminSettingsRow>('admin_settings_snapshots', 'select=settings,created_at&order=created_at.desc&limit=1')
  cachedSettings = normalizeSettings(rows[0]?.settings)
  return cachedSettings
}

export async function saveAdminSettings(settings: AdminSettings) {
  cachedSettings = normalizeSettings(settings)
  if (!isSupabaseConfigured()) {
    writeStorage(storageKeys.settings, cachedSettings)
    emitDataChanged()
    return
  }

  await supabaseInsert('admin_settings_snapshots', { settings: cachedSettings, created_at: new Date().toISOString() })
  emitDataChanged()
}

export async function addCapitalTopUp(amount: number, note: string, settings = getAdminSettings()) {
  const topUp: CapitalTopUp = {
    id: createId('capital'),
    amount,
    note,
    createdAt: new Date().toISOString(),
  }
  await saveAdminSettings({ ...settings, capitalTopUps: [topUp, ...settings.capitalTopUps] })
}

export function getTotalStartupCapital(settings = getAdminSettings()) {
  return settings.startupCapital + settings.capitalTopUps.reduce((sum, topUp) => sum + topUp.amount, 0)
}

export function applyPackagePriceOverrides(packages: ProductPackage[], settings = getAdminSettings()) {
  const overrides = settings.packagePrices
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
