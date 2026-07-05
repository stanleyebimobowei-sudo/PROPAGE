import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Copy,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Search,
  Settings,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  addAdminExpense,
  addCapitalTopUp,
  downloadTextFile,
  deleteAdminOrder,
  getAdminEvents,
  getAdminExpenses,
  getAdminOrders,
  getAdminSettings,
  getTotalStartupCapital,
  isSameDay,
  isSameMonth,
  loadAdminSettings,
  parseMoney,
  saveAdminSettings,
  updateAdminOrderStatus,
  type AdminSettings,
  type AdminExpense,
  type AdminEvent,
  type AdminOrder,
  type AdminOrderStatus,
} from '@/features/admin/adminData'
import { nigerianStates } from '@/features/checkout/data/nigerianStates'
import { productPackages } from '@/features/landing/data/packages'

type AdminPage = 'dashboard' | 'orders' | 'analytics' | 'finance' | 'expenses' | 'settings' | 'notifications' | 'profile'
type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
type ReportPeriod = 'day' | 'week' | 'month' | 'year'
type AdminToastTone = 'default' | 'success' | 'danger'
type AdminToast = {
  id: number
  message: string
  tone: AdminToastTone
}

type AdminDashboardProps = {
  onClose: () => void
}

const adminPin = import.meta.env.VITE_ADMIN_PIN ?? '937388'
const adminToastEvent = 'admin:toast'
const pageLabels: Array<[AdminPage, string, typeof LayoutDashboard]> = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['orders', 'Orders', PackageCheck],
  ['analytics', 'Analytics', BarChart3],
  ['finance', 'Finance', WalletCards],
  ['expenses', 'Expenses', DollarSign],
  ['settings', 'Form Settings', Settings],
  ['notifications', 'Notifications', Bell],
  ['profile', 'Profile', UserRound],
]

const statuses: AdminOrderStatus[] = ['New', 'Contacted', 'Confirmed', 'Delivered', 'Fulfilled', 'Cancelled', 'Failed Delivery', 'Outstanding']

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)
}

function notifyAdmin(message: string, tone: AdminToastTone = 'default') {
  window.dispatchEvent(new CustomEvent(adminToastEvent, { detail: { message, tone } }))
}

function copyToClipboard(value: string, label = 'Content') {
  if (!navigator.clipboard) {
    notifyAdmin('Copy is not available in this browser.', 'danger')
    return
  }

  navigator.clipboard
    .writeText(value)
    .then(() => notifyAdmin(`${label} copied.`, 'success'))
    .catch(() => notifyAdmin('Copy failed. Please try again.', 'danger'))
}

function notifyAdminError(error: unknown) {
  notifyAdmin(error instanceof Error ? error.message : 'Supabase action failed. Please try again.', 'danger')
}

function useAdminToasts() {
  const [toasts, setToasts] = useState<AdminToast[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = event instanceof CustomEvent ? (event.detail as Partial<AdminToast>) : {}
      const toast: AdminToast = {
        id: Date.now() + Math.random(),
        message: detail.message ?? 'Done.',
        tone: detail.tone ?? 'default',
      }

      setToasts((current) => [...current, toast].slice(-3))
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id))
      }, 2400)
    }

    window.addEventListener(adminToastEvent, handleToast)
    return () => window.removeEventListener(adminToastEvent, handleToast)
  }, [])

  return toasts
}

function useAdminData() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [expenses, setExpenses] = useState<AdminExpense[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const refresh = async () => {
      try {
        setError('')
        const [nextOrders, nextExpenses, nextEvents, nextSettings] = await Promise.all([getAdminOrders(), getAdminExpenses(), getAdminEvents(), loadAdminSettings()])
        if (!active) {
          return
        }
        setOrders(nextOrders)
        setExpenses(nextExpenses)
        setEvents(nextEvents)
        setSettings(nextSettings)
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load Supabase admin data.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void refresh()
    window.addEventListener('admin:data-changed', refresh)

    return () => {
      active = false
      window.removeEventListener('admin:data-changed', refresh)
    }
  }, [])

  return { orders, expenses, events, settings, loading, error }
}

function orderRevenue(order: AdminOrder) {
  return parseMoney(order.package.promoPrice)
}

function isDeliveredOrder(order: AdminOrder) {
  return order.status === 'Delivered' || order.status === 'Fulfilled'
}

function isExpectedOrder(order: AdminOrder) {
  return order.status !== 'Cancelled' && order.status !== 'Failed Delivery'
}

function sumOrderRevenue(orders: AdminOrder[], predicate: (order: AdminOrder) => boolean) {
  return orders.filter(predicate).reduce((sum, order) => sum + orderRevenue(order), 0)
}

function filterByReportPeriod<T extends { createdAt: string }>(items: T[], period: ReportPeriod, date = new Date()) {
  return items.filter((item) => {
    const itemDate = new Date(item.createdAt)
    if (period === 'day') {
      return itemDate.toDateString() === date.toDateString()
    }
    if (period === 'week') {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - start.getDay())
      const end = new Date(start)
      end.setDate(start.getDate() + 7)
      return itemDate >= start && itemDate < end
    }
    if (period === 'month') {
      return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth()
    }
    return itemDate.getFullYear() === date.getFullYear()
  })
}

function periodToReportPeriod(period: Period): ReportPeriod {
  const periodMap: Record<Period, ReportPeriod> = {
    Daily: 'day',
    Weekly: 'week',
    Monthly: 'month',
    Yearly: 'year',
  }

  return periodMap[period]
}

function makeReport(period: ReportPeriod, orders: AdminOrder[], expenses: AdminExpense[], events: AdminEvent[]) {
  const scopedOrders = filterByReportPeriod(orders, period)
  const scopedExpenses = filterByReportPeriod(expenses, period)
  const scopedEvents = filterByReportPeriod(events, period)
  const expectedRevenue = sumOrderRevenue(scopedOrders, isExpectedOrder)
  const deliveredRevenue = sumOrderRevenue(scopedOrders, isDeliveredOrder)
  const expenseTotal = scopedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const delivered = scopedOrders.filter(isDeliveredOrder).length
  const cancelled = scopedOrders.filter((order) => order.status === 'Cancelled').length
  const rows = [
    ['Metric', 'Value'],
    ['Period', period],
    ['Visitors', String(scopedEvents.filter((event) => event.type === 'visitor').length)],
    ['Buy Now Clicks', String(scopedEvents.filter((event) => event.type === 'buy_click').length)],
    ['Orders', String(scopedOrders.length)],
    ['Expected Order Revenue', String(expectedRevenue)],
    ['Delivered Revenue', String(deliveredRevenue)],
    ['Expenses', String(expenseTotal)],
    ['Profit', String(deliveredRevenue - expenseTotal)],
    ['Delivered/Fulfilled Orders', String(delivered)],
    ['Cancelled Orders', String(cancelled)],
    ['Outstanding Revenue', String(sumOrderRevenue(scopedOrders, (order) => order.status === 'Outstanding'))],
    [],
    ['Order ID', 'Customer', 'Phone', 'State', 'Package', 'Status', 'Amount', 'Date'],
    ...scopedOrders.map((order) => [
      order.id,
      order.customer.fullName,
      order.customer.phoneNumber,
      order.customer.state,
      order.package.title,
      order.status,
      String(orderRevenue(order)),
      order.createdAt,
    ]),
    [],
    ['Expense ID', 'Purpose', 'Amount', 'Order ID', 'Date'],
    ...scopedExpenses.map((expense) => [expense.id, expense.purpose, String(expense.amount), expense.orderId ?? '', expense.createdAt]),
  ]

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadReport(period: ReportPeriod, orders: AdminOrder[], expenses: AdminExpense[], events: AdminEvent[], type: 'financial' | 'orders' | 'expenses' | 'analysis') {
  notifyAdmin('Downloading...', 'default')
  downloadTextFile(`kog-${type}-${period}-report.csv`, makeReport(period, orders, expenses, events))
}

function AdminToasts({ toasts }: { toasts: AdminToast[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[140] grid w-[min(360px,calc(100vw-32px))] gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`rounded-2xl border px-4 py-3 text-sm font-black shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${
              toast.tone === 'success'
                ? 'border-mint-400/25 bg-mint-400/15 text-mint-200'
                : toast.tone === 'danger'
                  ? 'border-red-400/25 bg-red-500/15 text-red-200'
                  : 'border-white/12 bg-ink-950/88 text-white'
            }`}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'gold' | 'mint' | 'danger' }) {
  const toneClass =
    tone === 'gold'
      ? 'text-gold-500'
      : tone === 'mint'
        ? 'text-mint-400'
        : tone === 'danger'
          ? 'text-red-300'
          : 'text-white'

  return (
    <motion.article
      className="rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)]"
      whileHover={{ y: -3 }}
    >
      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className={`mt-3 text-2xl font-black tracking-normal ${toneClass}`}>{value}</p>
    </motion.article>
  )
}

function PinGate({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (pin === adminPin) {
      setError('')
      onSuccess()
      return
    }
    setError('Incorrect PIN')
    setPin('')
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/72 p-4 text-white backdrop-blur-2xl">
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[34px] border border-white/12 bg-ink-950/92 p-6 shadow-[0_30px_110px_rgba(0,0,0,0.72)]"
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-gold-500">Private access</p>
            <h2 className="mt-3 font-serif text-4xl font-normal leading-none">Admin PIN</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.055]">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <input
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit()
            }
          }}
          className="mt-6 h-16 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-5 text-center text-3xl font-black tracking-[0.38em] text-white outline-none focus:border-gold-500/70"
          inputMode="numeric"
          placeholder="------"
          type="password"
        />
        {error ? <p className="mt-3 text-sm font-bold text-red-300">{error}</p> : null}
        <button
          type="button"
          onClick={submit}
          className="mt-5 min-h-13 w-full rounded-full bg-linear-to-br from-[#facc15] via-gold-500 to-gold-600 text-sm font-black uppercase tracking-[0.14em] text-ink-950"
        >
          Unlock Dashboard
        </button>
      </motion.div>
    </div>
  )
}

function Sidebar({
  activePage,
  setActivePage,
  onClose,
  drawerOpen,
  setDrawerOpen,
}: {
  activePage: AdminPage
  setActivePage: (page: AdminPage) => void
  onClose: () => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}) {
  const nav = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/8 p-5">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-gold-500">King of Ginger</p>
        <h2 className="mt-2 font-serif text-3xl font-normal text-white">Admin CRM</h2>
      </div>
      <nav className="grid gap-2 p-3">
        {pageLabels.map(([page, label, Icon]) => (
          <button
            type="button"
            key={page}
            onClick={() => {
              setActivePage(page)
              setDrawerOpen(false)
            }}
            className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-sm font-black transition ${
              activePage === page ? 'bg-gold-500 text-ink-950' : 'text-stone-300 hover:bg-white/[0.06]'
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto grid gap-2 border-t border-white/8 p-3">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-sm font-black text-stone-300 hover:bg-white/[0.06]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Landing Page
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden h-screen w-[280px] shrink-0 border-r border-white/8 bg-white/[0.035] backdrop-blur-2xl lg:block">{nav}</aside>
      <AnimatePresence>
        {drawerOpen ? (
          <motion.div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside
              className="h-full w-[82vw] max-w-[330px] border-r border-white/10 bg-ink-950 text-white"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
            >
              {nav}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function DashboardPage({ orders, expenses, events, setActivePage }: { orders: AdminOrder[]; expenses: AdminExpense[]; events: AdminEvent[]; setActivePage: (page: AdminPage) => void }) {
  const todayOrders = orders.filter((order) => isSameDay(order.createdAt))
  const todayExpenses = expenses.filter((expense) => isSameDay(expense.createdAt)).reduce((sum, expense) => sum + expense.amount, 0)
  const todayExpectedRevenue = sumOrderRevenue(todayOrders, isExpectedOrder)
  const todayDeliveredRevenue = sumOrderRevenue(todayOrders, isDeliveredOrder)
  const totalDeliveredRevenue = sumOrderRevenue(orders, isDeliveredOrder)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const outstandingRevenue = sumOrderRevenue(orders, (order) => order.status === 'Outstanding')
  const cancelledRevenue = sumOrderRevenue(orders, (order) => order.status === 'Cancelled')
  const eventCount = (type: string) => events.filter((event) => event.type === type && isSameDay(event.createdAt)).length
  const funnel = [
    ['Visitors', eventCount('visitor')],
    ['Buy Now Click', eventCount('buy_click')],
    ['Package Selected', eventCount('package_selected')],
    ['Availability Confirmed', eventCount('availability_confirmed')],
    ['Form Submitted', eventCount('form_submitted')],
    ['Delivered/Fulfilled', eventCount('delivered') + eventCount('fulfilled')],
  ] as const
  const maxFunnel = Math.max(...funnel.map(([, value]) => value), 1)

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Today's Visitors" value={eventCount('visitor')} />
        <StatCard label="Buy Now Clicks" value={eventCount('buy_click')} tone="gold" />
        <StatCard label="Submitted Orders" value={todayOrders.length} tone="mint" />
        <StatCard label="Not Yet Ready" value={events.filter((event) => event.type === 'availability_confirmed' && isSameDay(event.createdAt)).length - todayOrders.length} />
        <StatCard label="New Orders" value={orders.filter((order) => order.status === 'New').length} />
        <StatCard label="Outstanding Orders" value={orders.filter((order) => order.status === 'Outstanding').length} />
        <StatCard label="Confirmed Orders" value={orders.filter((order) => order.status === 'Confirmed').length} />
        <StatCard label="Delivered/Fulfilled Orders" value={orders.filter(isDeliveredOrder).length} tone="mint" />
        <StatCard label="Cancelled Orders" value={orders.filter((order) => order.status === 'Cancelled').length} tone="danger" />
        <StatCard label="Today's Profit" value={formatMoney(todayDeliveredRevenue - todayExpenses)} tone={todayDeliveredRevenue - todayExpenses < 0 ? 'danger' : 'gold'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <StatCard label="Today's Expected Order Revenue" value={formatMoney(todayExpectedRevenue)} />
        <StatCard label="Today's Delivered Revenue" value={formatMoney(todayDeliveredRevenue)} tone="mint" />
        <StatCard label="Today's Expenses" value={formatMoney(todayExpenses)} tone="danger" />
        <StatCard label="Overall Profit" value={formatMoney(totalDeliveredRevenue - totalExpenses)} tone={totalDeliveredRevenue - totalExpenses < 0 ? 'danger' : 'gold'} />
        <StatCard label="Outstanding Revenue" value={formatMoney(outstandingRevenue)} />
        <StatCard label="Cancelled Revenue" value={formatMoney(cancelledRevenue)} tone="danger" />
      </div>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Conversion Funnel</p>
            <h3 className="mt-2 text-2xl font-black text-white">Today's customer journey</h3>
          </div>
          <button type="button" onClick={() => setActivePage('analytics')} className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-black text-stone-300 md:block">
            View Analytics
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {funnel.map(([label, value], index) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-sm font-bold text-stone-300">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full bg-linear-to-r from-gold-500 to-mint-400" style={{ width: `${Math.max(8, (value / maxFunnel) * 100 - index * 3)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function OrderDetail({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expensePurpose, setExpensePurpose] = useState('')
  const addOrderExpense = async () => {
    const parsed = Number(expenseAmount)
    if (!parsed || !expensePurpose.trim()) return false
    await addAdminExpense(parsed, expensePurpose.trim(), order.id)
    setExpenseAmount('')
    setExpensePurpose('')
    return true
  }

  const copyText = `Customer:\n${order.customer.fullName}\n\nPhone:\n${order.customer.phoneNumber}\n\nWhatsApp:\n${order.customer.whatsappNumber || 'N/A'}\n\nState:\n${order.customer.state}\n\nAddress:\n${order.customer.address}\n\nPackage:\n${order.package.title}\n\nPromo Price:\n${order.package.promoPrice}\n\nOriginal Price:\n${order.package.oldPrice}\n\nSavings:\n${order.package.savedAmount}\n\nDelivery Note:\n${order.customer.deliveryNote || 'N/A'}\n\nOrder Date:\n${new Date(order.createdAt).toLocaleString()}`

  return (
    <motion.aside
      className="fixed inset-0 z-[100] overflow-y-auto bg-ink-950 p-4 text-white md:inset-y-4 md:left-auto md:right-4 md:w-[430px] md:rounded-[32px] md:border md:border-white/10 md:bg-ink-950/95 md:shadow-[0_30px_110px_rgba(0,0,0,0.66)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Order Detail</p>
          <h3 className="mt-2 text-2xl font-black">{order.customer.fullName}</h3>
          <p className="mt-1 text-sm font-bold text-stone-400">{order.id}</p>
        </div>
        <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.055]">
          <X className="size-5" />
        </button>
      </div>
      <dl className="mt-6 grid gap-3">
        {[
          ['Phone Number', order.customer.phoneNumber],
          ['WhatsApp Number', order.customer.whatsappNumber || 'N/A'],
          ['State', order.customer.state],
          ['Detailed Address', order.customer.address],
          ['Delivery Note', order.customer.deliveryNote || 'N/A'],
          ['Package Selected', order.package.title],
          ['Promo Price', order.package.promoPrice],
          ['Original Price', order.package.oldPrice],
          ['Savings', order.package.savedAmount],
          ['Date / Time', new Date(order.createdAt).toLocaleString()],
          ['Status', order.status],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3" key={label}>
            <dt className="text-[0.66rem] font-black uppercase tracking-[0.15em] text-stone-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold leading-6 text-stone-100">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
        <p className="text-[0.66rem] font-black uppercase tracking-[0.15em] text-gold-500">Attach Expense To Order</p>
        <input value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value.replace(/[^\d]/g, ''))} className="admin-input mt-3" placeholder="Amount (NGN)" />
        <input value={expensePurpose} onChange={(event) => setExpensePurpose(event.target.value)} className="admin-input mt-2" placeholder="Purpose e.g. dispatch, calls, packaging" />
        <button
          type="button"
          onClick={() => {
            void addOrderExpense()
              .then((saved) => {
                if (!saved) {
                  return
                }
                notifyAdmin('Expense saved.', 'success')
              })
              .catch(notifyAdminError)
          }}
          className="mt-3 min-h-11 w-full rounded-full bg-gold-500 text-xs font-black uppercase tracking-[0.12em] text-ink-950"
        >
          Add Expense
        </button>
      </section>
      <div className="mt-5 grid gap-2">
        <button type="button" onClick={() => copyToClipboard(copyText, 'Order')} className="admin-action-button">
          <Copy className="size-4" /> Copy Order
        </button>
        {(['Contacted', 'Confirmed', 'Delivered', 'Fulfilled', 'Cancelled'] as AdminOrderStatus[]).map((status) => (
          <button
            type="button"
            className="admin-action-button"
            key={status}
            onClick={() => {
              void updateAdminOrderStatus(order.id, status)
                .then(() => notifyAdmin(`Order marked ${status}.`, 'success'))
                .catch(notifyAdminError)
            }}
          >
            Mark {status}
          </button>
        ))}
        <button
          type="button"
          className="admin-action-button"
          onClick={() => {
            void updateAdminOrderStatus(order.id, 'Failed Delivery')
              .then(() => notifyAdmin('Order marked failed delivery.', 'success'))
              .catch(notifyAdminError)
          }}
        >
          Failed Delivery
        </button>
        <button
          type="button"
          className="admin-action-button text-red-300"
          onClick={() => {
            void deleteAdminOrder(order.id)
              .then(() => {
                notifyAdmin('Order deleted.', 'danger')
                onClose()
              })
              .catch(notifyAdminError)
          }}
        >
          <Trash2 className="size-4" /> Delete Order
        </button>
      </div>
    </motion.aside>
  )
}

function OrdersPage({ orders, initialStatus }: { orders: AdminOrder[]; initialStatus?: AdminOrderStatus | 'all' }) {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [status, setStatus] = useState<AdminOrderStatus | 'all'>(initialStatus ?? 'all')
  const [packageId, setPackageId] = useState('all')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [page, setPage] = useState(1)

  useEffect(() => {
    setStatus(initialStatus ?? 'all')
  }, [initialStatus])

  const filtered = orders.filter((order) => {
    const matchesDate = !date || order.createdAt.slice(0, 10) === date
    const matchesSearch = `${order.customer.fullName} ${order.customer.phoneNumber}`.toLowerCase().includes(search.toLowerCase())
    const matchesState = !state || order.customer.state === state
    const matchesStatus = status === 'all' || order.status === status
    const matchesPackage = packageId === 'all' || order.package.id === packageId
    return matchesDate && matchesSearch && matchesState && matchesStatus && matchesPackage
  })
  const pageSize = 8
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleOrders = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 lg:grid-cols-6">
        <label className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input pl-11" placeholder="Search name or phone" />
        </label>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="admin-input" />
        <select value={state} onChange={(event) => setState(event.target.value)} className="admin-input">
          <option value="">All States</option>
          {nigerianStates.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as AdminOrderStatus | 'all')} className="admin-input">
          <option value="all">All Statuses</option>
          {statuses.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={packageId} onChange={(event) => setPackageId(event.target.value)} className="admin-input">
          <option value="all">All Packages</option>
          {productPackages.map((item) => (
            <option value={item.id} key={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3">
        {visibleOrders.map((order) => (
          <button
            type="button"
            onClick={() => setSelectedOrder(order)}
            className="grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-gold-500/30 hover:bg-white/[0.065] md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_auto] md:items-center"
            key={order.id}
          >
            <div>
              <p className="text-base font-black text-white">{order.customer.fullName}</p>
              <p className="text-sm font-bold text-stone-500">{order.customer.phoneNumber}</p>
            </div>
            <p className="text-sm font-bold text-stone-300">{order.customer.state}</p>
            <p className="text-sm font-bold text-stone-300">{order.package.title}</p>
            <span className="w-fit rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1.5 text-xs font-black text-gold-500">{order.status}</span>
            <p className="text-xs font-bold text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-stone-500">
          Page {page} of {pages}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage(Math.max(1, page - 1))} className="admin-small-button">
            Previous
          </button>
          <button type="button" onClick={() => setPage(Math.min(pages, page + 1))} className="admin-small-button">
            Next
          </button>
        </div>
      </div>
      <AnimatePresence>{selectedOrder ? <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} /> : null}</AnimatePresence>
    </div>
  )
}

function AnalyticsPage({ orders, events, expenses }: { orders: AdminOrder[]; events: AdminEvent[]; expenses: AdminExpense[] }) {
  const [period, setPeriod] = useState<Period>('Daily')
  const reportPeriod = periodToReportPeriod(period)
  const scopedOrders = filterByReportPeriod(orders, reportPeriod)
  const scopedEvents = filterByReportPeriod(events, reportPeriod)
  const scopedExpenses = filterByReportPeriod(expenses, reportPeriod)
  const expectedRevenue = sumOrderRevenue(scopedOrders, isExpectedOrder)
  const deliveredRevenue = sumOrderRevenue(scopedOrders, isDeliveredOrder)
  const expenseTotal = scopedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = deliveredRevenue - expenseTotal
  const buyClicks = scopedEvents.filter((event) => event.type === 'buy_click').length
  const conversionRate = buyClicks
    ? Math.round((scopedOrders.length / buyClicks) * 100)
    : 0
  const topPackage =
    productPackages
      .map((item) => [item.title, scopedOrders.filter((order) => order.package.id === item.id).length] as const)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No package yet'
  const topState =
    nigerianStates
      .map((item) => [item, scopedOrders.filter((order) => order.customer.state === item).length] as const)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No state yet'
  const delivered = scopedOrders.filter(isDeliveredOrder).length
  const cancelled = scopedOrders.filter((order) => order.status === 'Cancelled').length
  const peakHour =
    Array.from({ length: 24 })
      .map((_, hour) => [hour, scopedOrders.filter((order) => new Date(order.createdAt).getHours() === hour).length] as const)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0

  const analytics: Array<[string, string | number]> = [
    ['Visitors', scopedEvents.filter((event) => event.type === 'visitor').length],
    ['Orders', scopedOrders.length],
    ['Expected Order Revenue', formatMoney(expectedRevenue)],
    ['Delivered Revenue', formatMoney(deliveredRevenue)],
    ['Expenses', formatMoney(expenseTotal)],
    ['Profit', formatMoney(profit)],
    ['Cash Flow Status', profit < 0 ? 'Expenses are higher than delivered revenue' : 'Cash flow is healthy'],
    ['Conversion Rate', `${conversionRate}%`],
    ['Top Selling Package', topPackage],
    ['Top Performing State', topState],
    ['Delivered/Fulfilled Rate', `${scopedOrders.length ? Math.round((delivered / scopedOrders.length) * 100) : 0}%`],
    ['Cancellation Rate', `${scopedOrders.length ? Math.round((cancelled / scopedOrders.length) * 100) : 0}%`],
    ['Peak Ordering Hour', `${peakHour}:00`],
    ['Outstanding Revenue', formatMoney(sumOrderRevenue(scopedOrders, (order) => order.status === 'Outstanding'))],
  ]

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as Period[]).map((item) => (
          <button type="button" onClick={() => setPeriod(item)} className={`admin-small-button ${period === item ? 'bg-gold-500 text-ink-950' : ''}`} key={item}>
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.map(([label, value]) => (
          <StatCard label={label} value={value} key={label} />
        ))}
      </div>
      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <h3 className="text-xl font-black text-white">Package Distribution</h3>
        <div className="mt-5 grid gap-3">
          {productPackages.map((item) => {
            const count = scopedOrders.filter((order) => order.package.id === item.id).length
            const max = Math.max(1, scopedOrders.length)
            return (
              <div key={item.id}>
                <div className="mb-2 flex justify-between text-sm font-bold text-stone-300">
                  <span>{item.title}</span>
                  <span>{count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
                  <div className="h-full rounded-full bg-linear-to-r from-gold-500 to-mint-400" style={{ width: `${(count / max) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function FinancePage({ orders, expenses, settings }: { orders: AdminOrder[]; expenses: AdminExpense[]; settings: AdminSettings }) {
  const startupCapital = getTotalStartupCapital(settings)
  const expectedRevenue = sumOrderRevenue(orders, isExpectedOrder)
  const deliveredRevenue = sumOrderRevenue(orders, isDeliveredOrder)
  const outstandingRevenue = sumOrderRevenue(orders, (order) => order.status === 'Outstanding')
  const cancelledRevenue = sumOrderRevenue(orders, (order) => order.status === 'Cancelled')
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = deliveredRevenue - totalExpenses
  const cashFlow = deliveredRevenue - totalExpenses
  const roi = startupCapital ? Math.round((netProfit / startupCapital) * 100) : 0

  return (
    <div className="grid gap-5">
      {cashFlow < 0 ? (
        <section className="rounded-[26px] border border-red-400/25 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-100">
          Cash flow alert: expenses are higher than delivered revenue by {formatMoney(Math.abs(cashFlow))}.
        </section>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Startup Capital" value={formatMoney(startupCapital)} />
        <StatCard label="Expected Order Revenue" value={formatMoney(expectedRevenue)} />
        <StatCard label="Delivered Revenue" value={formatMoney(deliveredRevenue)} tone="mint" />
        <StatCard label="Outstanding Revenue" value={formatMoney(outstandingRevenue)} />
        <StatCard label="Cancelled Revenue" value={formatMoney(cancelledRevenue)} tone="danger" />
        <StatCard label="Total Expenses" value={formatMoney(totalExpenses)} tone="danger" />
        <StatCard label="Net Profit" value={formatMoney(netProfit)} tone={netProfit < 0 ? 'danger' : 'gold'} />
        <StatCard label="ROI" value={`${roi}%`} tone={roi < 0 ? 'danger' : 'gold'} />
        <StatCard label="Cash Flow" value={formatMoney(cashFlow)} tone={cashFlow < 0 ? 'danger' : 'mint'} />
      </div>
    </div>
  )
}

function ExpensesPage({ expenses }: { expenses: AdminExpense[] }) {
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const today = expenses.filter((expense) => isSameDay(expense.createdAt))
  const todayTotal = today.reduce((sum, expense) => sum + expense.amount, 0)
  const weeklyTotal = expenses.filter((expense) => Date.now() - new Date(expense.createdAt).getTime() < 7 * 86400000).reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyTotal = expenses.filter((expense) => isSameMonth(expense.createdAt)).reduce((sum, expense) => sum + expense.amount, 0)

  const save = async () => {
    const parsed = Number(amount)
    if (!parsed || !purpose.trim()) return
    await addAdminExpense(parsed, purpose.trim())
    setAmount('')
    setPurpose('')
    notifyAdmin('Expense saved.', 'success')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <h3 className="text-2xl font-black text-white">Add Expense</h3>
        <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))} className="admin-input mt-5" placeholder="Amount (NGN)" />
        <input value={purpose} onChange={(event) => setPurpose(event.target.value)} className="admin-input mt-3" placeholder="Purpose" />
        <button type="button" onClick={() => void save().catch(notifyAdminError)} className="mt-4 min-h-12 w-full rounded-full bg-gold-500 text-sm font-black uppercase tracking-[0.12em] text-ink-950">
          Save
        </button>
      </section>
      <section className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Today's Expenses" value={formatMoney(todayTotal)} />
          <StatCard label="Weekly Expenses" value={formatMoney(weeklyTotal)} />
          <StatCard label="Monthly Expenses" value={formatMoney(monthlyTotal)} />
        </div>
        <div className="grid gap-3">
          {today.map((expense) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4" key={expense.id}>
              <p className="text-lg font-black text-white">{formatMoney(expense.amount)}</p>
              <p className="mt-1 text-sm font-bold text-stone-300">{expense.purpose}</p>
              <p className="mt-1 text-xs font-bold text-stone-500">{new Date(expense.createdAt).toLocaleTimeString()}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function SettingsPage({ orders, expenses, events, settings }: { orders: AdminOrder[]; expenses: AdminExpense[]; events: AdminEvent[]; settings: AdminSettings }) {
  const [endpoint, setEndpoint] = useState(settings.formspreeEndpoint)
  const [pixelId, setPixelId] = useState(settings.facebookPixelId)
  const [thankYouPath, setThankYouPath] = useState(settings.thankYouPath)
  const [startupCapital, setStartupCapital] = useState(String(settings.startupCapital))
  const [packagePrices, setPackagePrices] = useState(settings.packagePrices)
  const normalizedThankYouPath = thankYouPath.trim() || '/thank-you'
  const thankYouUrl = `${window.location.origin}${normalizedThankYouPath.startsWith('/') ? normalizedThankYouPath : `/${normalizedThankYouPath}`}`

  useEffect(() => {
    setEndpoint(settings.formspreeEndpoint)
    setPixelId(settings.facebookPixelId)
    setThankYouPath(settings.thankYouPath)
    setStartupCapital(String(settings.startupCapital))
    setPackagePrices(settings.packagePrices)
  }, [settings])

  const save = async () => {
    await saveAdminSettings({
      ...settings,
      formspreeEndpoint: endpoint.trim(),
      facebookPixelId: pixelId.trim(),
      thankYouPath: thankYouPath.trim() || '/thank-you',
      startupCapital: Number(startupCapital) || 0,
      packagePrices,
    })
    notifyAdmin('Settings saved.', 'success')
  }

  const updatePackagePrice = (packageId: string, key: 'promoPrice' | 'oldPrice' | 'savedAmount', value: string) => {
    setPackagePrices((current) => ({
      ...current,
      [packageId]: {
        promoPrice: current[packageId]?.promoPrice ?? productPackages.find((item) => item.id === packageId)?.promoPrice ?? '',
        oldPrice: current[packageId]?.oldPrice ?? productPackages.find((item) => item.id === packageId)?.oldPrice ?? '',
        savedAmount: current[packageId]?.savedAmount ?? productPackages.find((item) => item.id === packageId)?.savedAmount ?? '',
        [key]: value,
      },
    }))
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Backend & Tracking</p>
        <h3 className="mt-2 text-2xl font-black text-white">Form, Supabase, Facebook Pixel</h3>
        <div className="mt-5 grid gap-3">
          <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} className="admin-input" placeholder="Formspree Endpoint" />
          <input value={pixelId} onChange={(event) => setPixelId(event.target.value)} className="admin-input" placeholder="Facebook Pixel ID" />
          <input value={thankYouPath} onChange={(event) => setThankYouPath(event.target.value)} className="admin-input" placeholder="Thank-you page path e.g. /thank-you" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[0.66rem] font-black uppercase tracking-[0.15em] text-stone-500">Thank-you link for Facebook tracking</p>
            <div className="mt-2 flex gap-2">
              <input value={thankYouUrl} readOnly className="admin-input" />
              <button type="button" onClick={() => copyToClipboard(thankYouUrl, 'Thank-you link')} className="admin-small-button shrink-0">Copy</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm font-semibold leading-6 text-stone-400">
            Supabase REST is ready. Add <span className="text-white">VITE_SUPABASE_URL</span> and <span className="text-white">VITE_SUPABASE_ANON_KEY</span> in Netlify environment variables, then create tables: orders, expenses, analytics_events, admin_settings_snapshots.
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Finance Settings</p>
        <h3 className="mt-2 text-2xl font-black text-white">Startup Capital</h3>
        <input value={startupCapital} onChange={(event) => setStartupCapital(event.target.value.replace(/[^\d]/g, ''))} className="admin-input mt-5" placeholder="Startup capital" />
        <p className="mt-3 text-sm font-bold text-stone-400">Current total with top-ups: {formatMoney(getTotalStartupCapital(settings))}</p>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 xl:col-span-2">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Package Pricing</p>
        <h3 className="mt-2 text-2xl font-black text-white">Edit Promo And Original Prices</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {productPackages.map((item) => {
            const values = packagePrices[item.id] ?? { promoPrice: item.promoPrice, oldPrice: item.oldPrice, savedAmount: item.savedAmount }
            return (
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item.id}>
                <h4 className="text-lg font-black text-white">{item.title}</h4>
                <input value={values.promoPrice} onChange={(event) => updatePackagePrice(item.id, 'promoPrice', event.target.value)} className="admin-input mt-3" placeholder="Promo price" />
                <input value={values.oldPrice} onChange={(event) => updatePackagePrice(item.id, 'oldPrice', event.target.value)} className="admin-input mt-2" placeholder="Original price" />
                <input value={values.savedAmount} onChange={(event) => updatePackagePrice(item.id, 'savedAmount', event.target.value)} className="admin-input mt-2" placeholder="Savings text" />
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 xl:col-span-2">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Reports</p>
        <h3 className="mt-2 text-2xl font-black text-white">Download Reports</h3>
        <div className="mt-5 flex flex-wrap gap-2">
          {(['day', 'week', 'month', 'year'] as const).flatMap((period) =>
            (['financial', 'orders', 'expenses', 'analysis'] as const).map((type) => (
              <button type="button" className="admin-small-button" key={`${period}-${type}`} onClick={() => downloadReport(period, orders, expenses, events, type)}>
                {type} {period}
              </button>
            )),
          )}
        </div>
      </section>

      <button type="button" onClick={() => void save().catch(notifyAdminError)} className="min-h-13 rounded-full bg-gold-500 px-6 text-sm font-black uppercase tracking-[0.12em] text-ink-950 xl:col-span-2">
        Save Settings
      </button>
    </div>
  )
}

function NotificationsPage({ orders, setActivePage, setInitialStatus }: { orders: AdminOrder[]; setActivePage: (page: AdminPage) => void; setInitialStatus: (status: AdminOrderStatus | 'all') => void }) {
  const notifications: Array<[string, AdminOrderStatus, number]> = [
    ['New Orders', 'New', orders.filter((order) => order.status === 'New').length],
    ['Outstanding Orders', 'Outstanding', orders.filter((order) => order.status === 'Outstanding').length],
    ['Pending Confirmation', 'Contacted', orders.filter((order) => order.status === 'Contacted').length],
    ['Cancelled Orders', 'Cancelled', orders.filter((order) => order.status === 'Cancelled').length],
    ['Failed Deliveries', 'Failed Delivery', orders.filter((order) => order.status === 'Failed Delivery').length],
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {notifications.map(([label, status, count]) => (
        <button
          type="button"
          className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:border-gold-500/30"
          key={label}
          onClick={() => {
            setInitialStatus(status)
            setActivePage('orders')
          }}
        >
          <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
          <p className="mt-3 text-4xl font-black text-gold-500">{count}</p>
        </button>
      ))}
    </div>
  )
}

function NewOrdersNotice({
  count,
  onClose,
  onViewOrders,
}: {
  count: number
  onClose: () => void
  onViewOrders: () => void
}) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[120] grid place-items-center bg-black/62 p-4 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[30px] border border-gold-500/25 bg-ink-950/92 p-5 text-white shadow-[0_30px_110px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.12)]"
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">New order alert</p>
            <h2 className="mt-2 font-serif text-4xl font-normal leading-none">
              {count === 1 ? '1 new order' : `${count} new orders`}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.055]" aria-label="Close new order alert">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-stone-300">
          Review and contact the customer as soon as possible. Delivered and fulfilled orders are counted together for revenue.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onViewOrders} className="min-h-12 rounded-full bg-gold-500 px-5 text-sm font-black uppercase tracking-[0.12em] text-ink-950">
            View Orders
          </button>
          <button type="button" onClick={onClose} className="min-h-12 rounded-full border border-white/10 bg-white/[0.055] px-5 text-sm font-black uppercase tracking-[0.12em] text-stone-200">
            Close
          </button>
        </div>
      </motion.section>
    </motion.div>
  )
}

function ProfilePage({ orders, expenses, events, settings }: { orders: AdminOrder[]; expenses: AdminExpense[]; events: AdminEvent[]; settings: AdminSettings }) {
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpNote, setTopUpNote] = useState('')
  const saveTopUp = async () => {
    const parsed = Number(topUpAmount)
    if (!parsed) return
    await addCapitalTopUp(parsed, topUpNote.trim() || 'Capital top-up', settings)
    setTopUpAmount('')
    setTopUpNote('')
    notifyAdmin('Capital top-up saved.', 'success')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Profile Settings</p>
        <h3 className="mt-2 text-2xl font-black text-white">King of Ginger Admin</h3>
        <p className="mt-3 text-sm font-medium leading-7 text-stone-400">
          Manage business capital, top-ups, and export daily, monthly, or yearly reports from this private CRM profile.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <StatCard label="Base Startup Capital" value={formatMoney(settings.startupCapital)} />
          <StatCard label="Capital With Top-ups" value={formatMoney(getTotalStartupCapital(settings))} tone="gold" />
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Top Up Capital</p>
        <input value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value.replace(/[^\d]/g, ''))} className="admin-input mt-5" placeholder="Top-up amount" />
        <input value={topUpNote} onChange={(event) => setTopUpNote(event.target.value)} className="admin-input mt-3" placeholder="Note" />
        <button type="button" onClick={() => void saveTopUp().catch(notifyAdminError)} className="mt-4 min-h-12 rounded-full bg-gold-500 px-6 text-sm font-black uppercase tracking-[0.12em] text-ink-950">
          Top Up
        </button>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 lg:col-span-2">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Capital History</p>
        <div className="mt-4 grid gap-3">
          {settings.capitalTopUps.map((topUp) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={topUp.id}>
              <p className="text-lg font-black text-white">{formatMoney(topUp.amount)}</p>
              <p className="mt-1 text-sm font-bold text-stone-300">{topUp.note}</p>
              <p className="mt-1 text-xs font-bold text-stone-500">{new Date(topUp.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 lg:col-span-2">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Download Analysis Reports</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(['day', 'week', 'month', 'year'] as const).flatMap((period) =>
            (['financial', 'orders', 'expenses', 'analysis'] as const).map((type) => (
              <button type="button" className="admin-small-button" key={`${period}-${type}`} onClick={() => downloadReport(period, orders, expenses, events, type)}>
                {type} {period}
              </button>
            )),
          )}
        </div>
      </section>
    </div>
  )
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [activePage, setActivePage] = useState<AdminPage>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [initialStatus, setInitialStatus] = useState<AdminOrderStatus | 'all'>('all')
  const [showNewOrdersNotice, setShowNewOrdersNotice] = useState(false)
  const [newOrdersNoticeShown, setNewOrdersNoticeShown] = useState(false)
  const { orders, expenses, events, settings, loading, error } = useAdminData()
  const toasts = useAdminToasts()
  const newOrdersCount = orders.filter((order) => order.status === 'New').length

  useEffect(() => {
    if (authenticated && !newOrdersNoticeShown && newOrdersCount > 0) {
      setShowNewOrdersNotice(true)
      setNewOrdersNoticeShown(true)
    }
  }, [authenticated, newOrdersCount, newOrdersNoticeShown])

  if (!authenticated) {
    return <PinGate onSuccess={() => setAuthenticated(true)} onClose={onClose} />
  }

  const pageTitle = pageLabels.find(([page]) => page === activePage)?.[1] ?? 'Dashboard'

  return (
    <div className="admin-dashboard fixed inset-0 z-[80] flex bg-[#050505] text-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onClose={onClose} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <div className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-[#050505]/82 px-4 backdrop-blur-2xl lg:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.055] lg:hidden">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-gold-500">Admin</p>
              <h1 className="text-xl font-black">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePage('notifications')}
              className="relative grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-stone-200"
              aria-label={`${newOrdersCount} new order notifications`}
            >
              <Bell className="size-5" aria-hidden="true" />
              {newOrdersCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[0.62rem] font-black leading-5 text-ink-950">
                  {newOrdersCount > 9 ? '9+' : newOrdersCount}
                </span>
              ) : null}
            </button>
            <button type="button" onClick={onClose} className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-stone-300 lg:inline-flex">
              <LogOut className="size-4" /> Landing Page
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 text-sm font-bold text-stone-300">Loading Supabase admin data...</div>
          ) : null}
          {error ? (
            <div className="rounded-[28px] border border-red-400/25 bg-red-500/10 p-6 text-sm font-bold leading-6 text-red-100">
              {error}
            </div>
          ) : null}
          {!loading && !error ? (
            <AnimatePresence mode="wait">
              <motion.div key={activePage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
                {activePage === 'dashboard' ? <DashboardPage orders={orders} expenses={expenses} events={events} setActivePage={setActivePage} /> : null}
                {activePage === 'orders' ? <OrdersPage orders={orders} initialStatus={initialStatus} /> : null}
                {activePage === 'analytics' ? <AnalyticsPage orders={orders} events={events} expenses={expenses} /> : null}
                {activePage === 'finance' ? <FinancePage orders={orders} expenses={expenses} settings={settings} /> : null}
                {activePage === 'expenses' ? <ExpensesPage expenses={expenses} /> : null}
                {activePage === 'settings' ? <SettingsPage orders={orders} expenses={expenses} events={events} settings={settings} /> : null}
                {activePage === 'notifications' ? <NotificationsPage orders={orders} setActivePage={setActivePage} setInitialStatus={setInitialStatus} /> : null}
                {activePage === 'profile' ? <ProfilePage orders={orders} expenses={expenses} events={events} settings={settings} /> : null}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-ink-950/90 p-2 backdrop-blur-2xl lg:hidden">
        {(['dashboard', 'orders', 'analytics', 'finance', 'settings'] as AdminPage[]).map((page) => {
          const item = pageLabels.find(([candidate]) => candidate === page)
          if (!item) return null
          const [, label, Icon] = item
          return (
            <button
              type="button"
              key={page}
              onClick={() => setActivePage(page)}
              className={`grid min-h-12 place-items-center rounded-2xl text-[0.62rem] font-black ${activePage === page ? 'bg-gold-500 text-ink-950' : 'text-stone-400'}`}
            >
              <Icon className="size-4" />
              {label.split(' ')[0]}
            </button>
          )
        })}
      </nav>
      <AdminToasts toasts={toasts} />
      <AnimatePresence>
        {showNewOrdersNotice && newOrdersCount > 0 ? (
          <NewOrdersNotice
            count={newOrdersCount}
            onClose={() => setShowNewOrdersNotice(false)}
            onViewOrders={() => {
              setInitialStatus('New')
              setActivePage('orders')
              setShowNewOrdersNotice(false)
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}








