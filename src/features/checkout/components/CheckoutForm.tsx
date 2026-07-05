import { ArrowLeftRight, CheckCircle2, MapPin, PackageCheck, Phone, ShieldCheck, Truck, UserRound } from 'lucide-react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

import { PackageSelector } from '@/features/checkout/components/PackageSelector'
import { StateSelector } from '@/features/checkout/components/StateSelector'
import { useCheckoutEngine } from '@/features/checkout/hooks/CheckoutEngine'
import type { ProductPackage } from '@/features/landing/data/packages'

type CheckoutFormProps = {
  variant: 'popup' | 'inline'
  onSubmit: () => Promise<void>
}

type FieldProps = {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  placeholder: string
  icon?: 'user' | 'phone' | 'map'
  multiline?: boolean
  optional?: boolean
}

const icons = {
  user: UserRound,
  phone: Phone,
  map: MapPin,
}

function CheckoutField({ label, registration, error, placeholder, icon, multiline = false, optional = false }: FieldProps) {
  const Icon = icon ? icons[icon] : null
  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-lg font-semibold text-white outline-none transition placeholder:text-stone-600 focus:border-gold-500/60 focus:bg-white/[0.075] lg:text-base'

  return (
    <div className="grid gap-2">
      <label className="flex items-center justify-between gap-3 text-base font-black text-white lg:text-sm">
        <span>{label}</span>
        {optional ? <span className="text-xs font-bold text-stone-500">Optional</span> : null}
      </label>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-4 top-4 size-4 text-stone-500" aria-hidden="true" /> : null}
        {multiline ? (
          <textarea
            {...registration}
            rows={4}
            placeholder={placeholder}
            className={`${inputClass} min-h-32 resize-none ${Icon ? 'pl-11' : ''}`}
          />
        ) : (
          <input {...registration} placeholder={placeholder} className={`${inputClass} h-16 ${Icon ? 'pl-11' : ''}`} />
        )}
      </div>
      {error?.message ? <p className="text-sm font-semibold text-red-300">{error.message}</p> : null}
    </div>
  )
}

function TrustStrip() {
  return (
    <div className="grid gap-3">
      {[
        { label: 'Free Delivery', icon: Truck },
        { label: 'Payment on Delivery', icon: PackageCheck },
        { label: 'Order Confirmation', icon: ShieldCheck },
      ].map(({ label, icon: Icon }) => (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3" key={label}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-mint-400/20 bg-mint-400/10 text-mint-400">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-black leading-5 text-stone-100">{label}</span>
        </div>
      ))}
    </div>
  )
}

function SelectedPackagePanel({
  selectedPackage,
  onChange,
  variant,
  className = '',
}: {
  selectedPackage: ProductPackage
  onChange: () => void
  variant: 'popup' | 'inline'
  className?: string
}) {
  return (
    <aside
      className={`rounded-[30px] border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] lg:sticky lg:top-24 ${
        variant === 'popup' ? 'lg:top-0' : ''
      } ${className}`}
    >
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-ink-950/72">
        <img src={selectedPackage.image} alt={selectedPackage.imageAlt} className="h-48 w-full object-cover lg:h-56" loading="lazy" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-ink-950/10 to-ink-950/86" aria-hidden="true" />
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-mint-400">Selected Package</p>
          <h3 className="mt-1 text-2xl font-black text-white">{selectedPackage.title}</h3>
          <p className="mt-1 text-sm font-bold text-stone-300">
            {selectedPackage.offer.join(' • ')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-ink-950/58 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-stone-500">Promo Price</p>
            <p className="mt-1 text-3xl font-black tracking-normal text-white">{selectedPackage.promoPrice}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-stone-500 line-through">{selectedPackage.oldPrice}</p>
            <p className="mt-1 rounded-full border border-mint-400/20 bg-mint-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-mint-400">
              {selectedPackage.savedAmount}
            </p>
          </div>
        </div>
        <TrustStrip />
        <button
          type="button"
          onClick={onChange}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-[0.12em] text-gold-500"
        >
          <ArrowLeftRight className="size-3.5" aria-hidden="true" />
          Change Package
        </button>
      </div>
    </aside>
  )
}

function InlinePackagePanel({
  packageOptions,
  selectedPackageId,
  selectPackage,
}: {
  packageOptions: ProductPackage[]
  selectedPackageId: string
  selectPackage: (packageId: string) => void
}) {
  return (
    <aside className="grid gap-4 lg:sticky lg:top-24">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Package Selection</p>
            <h3 className="mt-2 font-serif text-3xl font-normal leading-none tracking-normal text-white lg:text-4xl">
              Choose Your Bundle
            </h3>
          </div>
          <CheckCircle2 className="mt-1 size-6 shrink-0 text-mint-400" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-medium leading-6 text-stone-400">
          Select one offer. Your order summary updates instantly before confirmation.
        </p>
      </div>
      <PackageSelector
        compact
        packages={packageOptions}
        selectedPackageId={selectedPackageId}
        onSelect={(packageId) => selectPackage(packageId)}
      />
    </aside>
  )
}

export function CheckoutForm({ variant, onSubmit }: CheckoutFormProps) {
  const { form, packageOptions, selectedPackage, selectedPackageId, selectPackage, setPopupStep } = useCheckoutEngine()
  const errors = form.formState.errors
  const isInline = variant === 'inline'

  return (
    <form
      className={
        isInline
          ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_470px] lg:items-start'
          : 'grid gap-6 lg:grid-cols-[370px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)] lg:items-start'
      }
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <div className={`grid gap-5 rounded-[30px] border border-white/10 bg-white/[0.035] p-4 sm:p-5 lg:p-6 ${!isInline ? 'lg:col-start-2 lg:row-start-1' : ''}`}>
        <div className="grid gap-2">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-mint-400">Delivery Details</p>
          <h3 className="font-serif text-3xl font-normal leading-none tracking-normal text-white lg:text-4xl">
            {isInline ? 'Complete Your Order' : 'Where should we deliver?'}
          </h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <CheckoutField
            label="Full Name"
            registration={form.register('fullName')}
            error={errors.fullName}
            placeholder="Enter your full name"
            icon="user"
          />
          <CheckoutField
            label="Phone Number"
            registration={form.register('phoneNumber')}
            error={errors.phoneNumber}
            placeholder="0800 000 0000"
            icon="phone"
          />
          <CheckoutField
            label="WhatsApp Number"
            registration={form.register('whatsappNumber')}
            error={errors.whatsappNumber}
            placeholder="Optional WhatsApp number"
            icon="phone"
            optional
          />
          <StateSelector form={form} />
          <div className="md:col-span-2">
            <CheckoutField
              label="Detailed Address"
              registration={form.register('address')}
              error={errors.address}
              placeholder="House number, street, area, nearest landmark"
              icon="map"
              multiline
            />
          </div>
          <div className="md:col-span-2">
            <CheckoutField
              label="Delivery Note"
              registration={form.register('deliveryNote')}
              error={errors.deliveryNote}
              placeholder="Best time to call, delivery preference, or extra directions"
              multiline
              optional
            />
          </div>
        </div>
      </div>

      {!isInline ? (
        <SelectedPackagePanel selectedPackage={selectedPackage} onChange={() => setPopupStep('packages')} variant="popup" className="lg:col-start-1 lg:row-start-1" />
      ) : null}

      {isInline ? (
        <InlinePackagePanel packageOptions={packageOptions} selectedPackageId={selectedPackageId} selectPackage={selectPackage} />
      ) : null}

      <div className={`${isInline ? 'lg:col-start-1' : 'lg:col-start-2'} sticky bottom-3 z-10 pt-1 lg:static lg:pt-0`}>
        <button
          type="submit"
          className="min-h-15 w-full rounded-full bg-linear-to-br from-[#facc15] via-gold-500 to-gold-600 px-5 text-sm font-black uppercase tracking-[0.14em] text-ink-950 shadow-[0_20px_54px_rgba(245,158,11,0.42),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(245,158,11,0.5),inset_0_1px_0_rgba(255,255,255,0.5)]"
        >
          Place Order Now
        </button>
      </div>
    </form>
  )
}
