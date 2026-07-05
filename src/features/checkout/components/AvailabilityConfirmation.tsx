import { motion } from 'framer-motion'
import { CalendarCheck, Clock3, PackageCheck } from 'lucide-react'

type AvailabilityConfirmationProps = {
  onConfirm: () => void | Promise<void>
  onDecline: () => void
}

export function AvailabilityConfirmation({ onConfirm, onDecline }: AvailabilityConfirmationProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className="flex max-h-[calc(100svh-1.5rem)] flex-col rounded-[32px] border border-white/12 bg-ink-950/88 text-white shadow-[0_30px_100px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
      exit={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-5 overflow-y-auto p-5 pb-3">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-mint-400/20 bg-mint-400/10 text-mint-400">
            <PackageCheck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Payment on delivery</p>
            <h2 className="mt-2 font-serif text-3xl font-normal leading-none tracking-normal text-white">
              Before We Confirm Your Order
            </h2>
          </div>
        </div>

        <p className="text-base font-medium leading-7 text-stone-300">
          We offer FREE Delivery and Payment on Delivery. To help us avoid failed deliveries, please confirm that you
          will be available to receive your order within the next 1-3 business days.
        </p>

        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-ink-950/58 p-3">
            <CalendarCheck className="size-5 text-mint-400" aria-hidden="true" />
            <span className="text-sm font-bold text-stone-200">1-3 business days</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-ink-950/58 p-3">
            <Clock3 className="size-5 text-gold-500" aria-hidden="true" />
            <span className="text-sm font-bold text-stone-200">Quick confirmation</span>
          </div>
        </div>

      </div>

      <div className="sticky bottom-0 grid gap-3 border-t border-white/8 bg-ink-950/92 p-5 pt-3 backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => void onConfirm()}
            className="min-h-14 rounded-full bg-linear-to-br from-[#facc15] via-gold-500 to-gold-600 px-5 text-sm font-black uppercase tracking-[0.12em] text-ink-950 shadow-[0_18px_44px_rgba(245,158,11,0.34),inset_0_1px_0_rgba(255,255,255,0.46)]"
          >
            YES, I WILL BE AVAILABLE
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="min-h-12 rounded-full border border-white/12 bg-white/[0.055] px-5 text-sm font-black uppercase tracking-[0.12em] text-stone-300"
          >
            NO, NOT YET
          </button>
      </div>
    </motion.div>
  )
}
