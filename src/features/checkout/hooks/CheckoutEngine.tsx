import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { applyPackagePriceOverrides, getAdminSettings, saveAdminOrder, trackAdminEvent } from '@/features/admin/adminData'
import { trackFacebookPurchase } from '@/features/admin/facebookPixel'
import { productPackages, type ProductPackage } from '@/features/landing/data/packages'

export const checkoutFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  phoneNumber: z.string().trim().min(7, 'Enter a valid phone number').max(18, 'Phone number is too long'),
  whatsappNumber: z.string().trim().max(18, 'WhatsApp number is too long').optional(),
  state: z.string().trim().min(1, 'Select your state'),
  address: z.string().trim().min(8, 'Enter a detailed delivery address'),
  deliveryNote: z.string().trim().max(180, 'Keep delivery note under 180 characters').optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export type OrderConfirmation = {
  id: string
  package: ProductPackage
  customer: CheckoutFormValues
  orderDate: string
  estimatedDelivery: string
  status: 'Awaiting Confirmation'
}

type PopupStep = 'packages' | 'availability' | 'form' | 'success' | 'unavailable'
type AvailabilityTarget = 'popup' | 'inline' | null
type InlineView = 'form' | 'success'
type SubmissionSurface = 'popup' | 'inline'

type CheckoutEngineValue = {
  availabilityTarget: AvailabilityTarget
  closePopup: () => void
  confirmAvailability: () => Promise<void>
  declineAvailability: () => void
  form: UseFormReturn<CheckoutFormValues>
  inlineView: InlineView
  lastOrder: OrderConfirmation | null
  openPopup: (packageId?: string) => void
  packageOptions: ProductPackage[]
  popupOpen: boolean
  popupStep: PopupStep
  requestInlineAvailability: () => Promise<void>
  resetOrder: () => void
  selectedPackage: ProductPackage
  selectedPackageId: string
  selectPackage: (packageId: string, options?: { advancePopup?: boolean }) => void
  setPopupStep: (step: PopupStep) => void
  submitPopupOrder: () => Promise<void>
}

const packageOptionsSource = applyPackagePriceOverrides(productPackages)
const defaultPackageId = packageOptionsSource[1]?.id ?? packageOptionsSource[0]?.id ?? ''

const defaultValues: CheckoutFormValues = {
  fullName: '',
  phoneNumber: '',
  whatsappNumber: '',
  state: '',
  address: '',
  deliveryNote: '',
}

const CheckoutEngineContext = createContext<CheckoutEngineValue | null>(null)

function createOrderId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase()

  return `KOG-${datePart}-${randomPart}`
}

function getOrderDate() {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
}

export function CheckoutEngineProvider({ children }: { children: ReactNode }) {
  const [selectedPackageId, setSelectedPackageId] = useState(defaultPackageId)
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupStep, setPopupStep] = useState<PopupStep>('packages')
  const [availabilityTarget, setAvailabilityTarget] = useState<AvailabilityTarget>(null)
  const [inlineView, setInlineView] = useState<InlineView>('form')
  const [lastOrder, setLastOrder] = useState<OrderConfirmation | null>(null)

  const form = useForm<CheckoutFormValues>({
    defaultValues,
    mode: 'onTouched',
    resolver: zodResolver(checkoutFormSchema),
  })

  const selectedPackage = useMemo(
    () => applyPackagePriceOverrides(productPackages).find((productPackage) => productPackage.id === selectedPackageId) ?? applyPackagePriceOverrides(productPackages)[0],
    [selectedPackageId],
  )

  useEffect(() => {
    trackAdminEvent('visitor')
  }, [])

  useEffect(() => {
    const handleOpenCheckout = (event: Event) => {
      const packageId = event instanceof CustomEvent ? (event.detail?.packageId as string | undefined) : undefined
      if (packageId && productPackages.some((productPackage) => productPackage.id === packageId)) {
        setSelectedPackageId(packageId)
      }
      trackAdminEvent('buy_click', packageId ? { packageId } : undefined)
      setPopupStep('packages')
      setPopupOpen(true)
    }

    window.addEventListener('checkout:open', handleOpenCheckout)

    return () => window.removeEventListener('checkout:open', handleOpenCheckout)
  }, [])

  useEffect(() => {
    if (!popupOpen && !availabilityTarget) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [availabilityTarget, popupOpen])

  const openPopup = useCallback((packageId?: string) => {
    if (packageId && productPackages.some((productPackage) => productPackage.id === packageId)) {
      setSelectedPackageId(packageId)
    }
    trackAdminEvent('buy_click', packageId ? { packageId } : undefined)
    setPopupStep('packages')
    setPopupOpen(true)
  }, [])

  const closePopup = useCallback(() => {
    setPopupOpen(false)
    setAvailabilityTarget((currentTarget) => (currentTarget === 'popup' ? null : currentTarget))
  }, [])

  const selectPackage = useCallback((packageId: string, options?: { advancePopup?: boolean }) => {
    setSelectedPackageId(packageId)
    trackAdminEvent('package_selected', { packageId })
    if (options?.advancePopup) {
      setPopupStep('availability')
      setAvailabilityTarget('popup')
    }
  }, [])

  const submitOrder = useCallback(
    async (values: CheckoutFormValues, surface: SubmissionSurface) => {
      const order: OrderConfirmation = {
        id: createOrderId(),
        package: selectedPackage,
        customer: values,
        orderDate: getOrderDate(),
        estimatedDelivery: '1-3 Business Days',
        status: 'Awaiting Confirmation',
      }

      saveAdminOrder({
        id: order.id,
        package: order.package,
        customer: order.customer,
        createdAt: new Date().toISOString(),
        estimatedDelivery: order.estimatedDelivery,
        status: 'New',
        source: surface,
      })
      trackAdminEvent('form_submitted', { packageId: selectedPackage.id, surface })
      trackAdminEvent('purchase', { packageId: selectedPackage.id, value: String(parseInt(selectedPackage.promoPrice.replace(/[^\\d]/g, ''), 10) || 0) })

      const endpoint = getAdminSettings().formspreeEndpoint.trim()
      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ orderId: order.id, package: order.package.title, ...order.customer }),
        }).catch(() => undefined)
      }

      trackFacebookPurchase(order)
      setLastOrder(order)
      if (surface === 'inline') {
        setInlineView('success')
      }
      if (surface === 'popup') {
        setPopupStep('success')
        setPopupOpen(true)
      }
    },
    [selectedPackage],
  )

  const requestInlineAvailability = form.handleSubmit(async () => {
    setAvailabilityTarget('inline')
  })

  const submitPopupOrder = form.handleSubmit(async (values) => {
    await submitOrder(values, 'popup')
  })

  const confirmAvailability = useCallback(async () => {
    if (availabilityTarget === 'popup') {
      trackAdminEvent('availability_confirmed', { surface: 'popup' })
      setAvailabilityTarget(null)
      setPopupStep('form')
      return
    }

    if (availabilityTarget === 'inline') {
      const isValid = await form.trigger()
      if (!isValid) {
        setAvailabilityTarget(null)
        return
      }
      trackAdminEvent('availability_confirmed', { surface: 'inline' })
      setAvailabilityTarget(null)
      await submitOrder(form.getValues(), 'inline')
    }
  }, [availabilityTarget, form, submitOrder])

  const declineAvailability = useCallback(() => {
    if (availabilityTarget === 'popup') {
      setAvailabilityTarget(null)
      setPopupStep('unavailable')
      window.setTimeout(() => {
        setPopupOpen(false)
        setPopupStep('packages')
      }, 1500)
      return
    }

    setAvailabilityTarget(null)
  }, [availabilityTarget])

  const resetOrder = useCallback(() => {
    form.reset(defaultValues)
    setSelectedPackageId(defaultPackageId)
    setLastOrder(null)
    setInlineView('form')
    setPopupStep('packages')
  }, [form])

  const value = useMemo<CheckoutEngineValue>(
    () => ({
      availabilityTarget,
      closePopup,
      confirmAvailability,
      declineAvailability,
      form,
      inlineView,
      lastOrder,
      openPopup,
      packageOptions: applyPackagePriceOverrides(productPackages),
      popupOpen,
      popupStep,
      requestInlineAvailability,
      resetOrder,
      selectedPackage,
      selectedPackageId,
      selectPackage,
      setPopupStep,
      submitPopupOrder,
    }),
    [
      availabilityTarget,
      closePopup,
      confirmAvailability,
      declineAvailability,
      form,
      inlineView,
      lastOrder,
      openPopup,
      popupOpen,
      popupStep,
      requestInlineAvailability,
      resetOrder,
      selectedPackage,
      selectedPackageId,
      selectPackage,
      submitPopupOrder,
    ],
  )

  return <CheckoutEngineContext.Provider value={value}>{children}</CheckoutEngineContext.Provider>
}

export function useCheckoutEngine() {
  const context = useContext(CheckoutEngineContext)

  if (!context) {
    throw new Error('useCheckoutEngine must be used within CheckoutEngineProvider')
  }

  return context
}


