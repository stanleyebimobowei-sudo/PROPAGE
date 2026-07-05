import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'How long does delivery take?',
    answer: 'Delivery is typically 1-3 business days after your order is confirmed by our representative.',
  },
  {
    question: 'How does payment on delivery work?',
    answer: 'You place your order online, our team confirms by phone, then you pay when the product is delivered to you.',
  },
  {
    question: 'Can I use it on my beard?',
    answer: 'Yes. Apply a light amount to beard areas as part of your grooming routine for a neater, conditioned appearance.',
  },
  {
    question: 'How often should I apply it?',
    answer: 'Use a small amount daily or as directed on the product instructions. Consistency is more important than overuse.',
  },
  {
    question: 'What if I receive a damaged product?',
    answer: 'Contact customer support immediately with your order details. We will help review the issue and arrange support.',
  },
] as const

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="bg-[#050505] px-4 py-18 text-white sm:px-6 lg:px-8 lg:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold-500">Questions</p>
          <h2 id="faq-heading" className="mt-4 font-serif text-5xl font-normal leading-[0.95] tracking-normal lg:text-6xl">
            Before you order
          </h2>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.055]" key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-black text-white lg:text-lg">{faq.question}</span>
                  <ChevronDown className={`size-5 shrink-0 text-gold-500 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isOpen ? <p className="px-5 pb-5 text-sm font-medium leading-7 text-stone-300 lg:text-base">{faq.answer}</p> : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
