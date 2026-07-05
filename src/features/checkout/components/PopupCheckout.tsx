import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

import brandSticker from '@/assets/brand-sticker-transparent.png'
import { AvailabilityConfirmation } from '@/features/checkout/components/AvailabilityConfirmation'
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm'
import { PackageSelector } from '@/features/checkout/components/PackageSelector'
import { SuccessScreen } from '@/features/checkout/components/SuccessScreen'
import { useCheckoutEngine } from '@/features/checkout/hooks/CheckoutEngine'

export function PopupCheckout() {
  const {
    availabilityTarget,
    closePopup,
    confirmAvailability,
    declineAvailability,
    packageOptions,
    popupOpen,
    popupStep,
    selectedPackageId,
    selectPackage,
    submitPopupOrder,
  } = useCheckoutEngine()

  return (
    <>
      <AnimatePresence>
        {popupOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 grid place-items-end bg-black/68 p-3 text-white backdrop-blur-xl sm:place-items-center sm:p-6 lg:p-8"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <motion.div
              animate={{ y: 0, scale: 1, opacity: 1 }}
              className="relative flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-[34px] border border-white/12 bg-ink-950/88 shadow-[0_34px_120px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl lg:max-w-6xl lg:rounded-[42px]"
              exit={{ y: 28, scale: 0.98, opacity: 0 }}
              initial={{ y: 44, scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <img
                src={brandSticker}
                alt="King of Ginger brand sticker"
                className="brand-sticker-shake pointer-events-none absolute right-16 top-4 z-10 hidden w-20 drop-shadow-[0_16px_30px_rgba(0,0,0,0.48)] lg:block"
                loading="lazy"
              />
              <div className="flex items-start justify-between gap-4 border-b border-white/8 p-5 lg:p-7">
                <div className="max-w-2xl">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-gold-500">Premium checkout</p>
                  <h2 className="mt-2 font-serif text-3xl font-normal leading-none tracking-normal text-white lg:text-5xl">
                    {popupStep === 'packages' ? 'Choose Your Package' : 'Confirm Your Order'}
                  </h2>
                  <p className="mt-3 hidden max-w-xl text-base font-medium leading-7 text-stone-400 lg:block">
                    Complete your order with free delivery, payment on delivery, and a confirmation call before dispatch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePopup}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-stone-300"
                  aria-label="Close checkout"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 lg:p-7">
                <AnimatePresence mode="wait">
                  {popupStep === 'packages' ? (
                    <motion.div
                      key="packages"
                      animate={{ opacity: 1, y: 0 }}
                      className="grid gap-5"
                      exit={{ opacity: 0, y: -16 }}
                      initial={{ opacity: 0, y: 18 }}
                      transition={{ duration: 0.28 }}
                    >
                      <p className="text-base font-medium leading-7 text-stone-300">
                        Select one bundle to continue with free delivery and payment on delivery.
                      </p>
                      <PackageSelector
                        compact
                        className="lg:grid-cols-3"
                        packages={packageOptions}
                        selectedPackageId={selectedPackageId}
                        onSelect={(packageId) => selectPackage(packageId, { advancePopup: true })}
                      />
                    </motion.div>
                  ) : null}

                  {popupStep === 'availability' ? (
                    <div key="availability">
                      <AvailabilityConfirmation onConfirm={confirmAvailability} onDecline={declineAvailability} />
                    </div>
                  ) : null}

                  {popupStep === 'form' ? (
                    <motion.div key="form" animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
                      <CheckoutForm variant="popup" onSubmit={submitPopupOrder} />
                    </motion.div>
                  ) : null}

                  {popupStep === 'success' ? (
                    <motion.div key="success" animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
                      <SuccessScreen context="popup" />
                    </motion.div>
                  ) : null}

                  {popupStep === 'unavailable' ? (
                    <motion.div
                      key="unavailable"
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[32px] border border-white/10 bg-white/[0.055] p-6 text-center"
                      exit={{ opacity: 0, y: -12 }}
                      initial={{ opacity: 0, y: 16 }}
                    >
                      <div className="mx-auto grid size-14 place-items-center rounded-full border border-mint-400/25 bg-mint-400/10 text-mint-400">
                        <CheckCircle2 className="size-7" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 font-serif text-3xl font-normal text-white">Thank you</h3>
                      <p className="mt-3 text-base font-medium leading-7 text-stone-300">
                        No problem. You can return when you are ready to receive your order.
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {availabilityTarget === 'inline' ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 grid place-items-end bg-black/68 p-3 backdrop-blur-xl sm:place-items-center sm:p-6"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <div className="w-full max-w-xl">
              <AvailabilityConfirmation onConfirm={confirmAvailability} onDecline={declineAvailability} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
