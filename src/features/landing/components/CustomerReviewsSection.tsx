import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import reviewSectionBg from '@/assets/review-leaves-bg.jpeg'

import reviewImageK1 from '../../../../CUSTOMERS/K1.jpeg'
import reviewImageK2 from '../../../../CUSTOMERS/K2.jpeg'
import reviewImageK3 from '../../../../CUSTOMERS/K3.jpeg'
import reviewImageK4 from '../../../../CUSTOMERS/K4.jpeg'
import reviewImageK5 from '../../../../CUSTOMERS/K5.jpeg'
import reviewImage01 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.48 PM (1).jpeg'
import reviewImage02 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.51 PM (1).jpeg'
import reviewImage03 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.51 PM (2).jpeg'
import reviewImage04 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.51 PM (3).jpeg'
import reviewImage05 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.51 PM (4).jpeg'
import reviewImage06 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.51 PM.jpeg'
import reviewImage07 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.52 PM (1).jpeg'
import reviewImage08 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.13.52 PM.jpeg'
import reviewImage09 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.14.42 PM (1).jpeg'
import reviewImage11 from '../../../../CUSTOMERS/WhatsApp Image 2026-07-02 at 3.14.43 PM.jpeg'
import reviewVideo01 from '../../../../CUSTOMERS/WhatsApp Video 2026-07-02 at 4.12.45 PM.mp4'
import reviewVideo02 from '../../../../CUSTOMERS/WhatsApp Video 2026-07-02 at 4.12.46 PM.mp4'

type CustomerReview = {
  src: string
  type: 'image' | 'video'
  rating: number
  label: string
  aspectRatio: string
  widthRatio: number
}

type FloatingTestimonial = {
  name: string
  location: string
  text: string
  badge?: string
}

type StackStyle = CSSProperties & {
  '--card-count'?: number
  '--stack-index'?: number
  '--media-aspect'?: string
  '--media-width-ratio'?: number
  '--review-bg-image'?: string
}

const customerReviews: CustomerReview[] = [
  { src: reviewImage01, type: 'image', rating: 5, label: 'Customer review 01', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage02, type: 'image', rating: 4.9, label: 'Customer review 02', aspectRatio: '1280 / 1017', widthRatio: 1.26 },
  { src: reviewImage03, type: 'image', rating: 4.8, label: 'Customer review 03', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage04, type: 'image', rating: 5, label: 'Customer review 04', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage05, type: 'image', rating: 4.9, label: 'Customer review 05', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage06, type: 'image', rating: 4.8, label: 'Customer review 06', aspectRatio: '1280 / 1133', widthRatio: 1.13 },
  { src: reviewImage07, type: 'image', rating: 5, label: 'Customer review 07', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage08, type: 'image', rating: 4.9, label: 'Customer review 08', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage09, type: 'image', rating: 4.8, label: 'Customer review 09', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImage11, type: 'image', rating: 4.9, label: 'Customer review 11', aspectRatio: '736 / 920', widthRatio: 0.8 },
  { src: reviewImageK1, type: 'image', rating: 5, label: 'Customer review K1', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImageK2, type: 'image', rating: 4.9, label: 'Customer review K2', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImageK3, type: 'image', rating: 5, label: 'Customer review K3', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImageK4, type: 'image', rating: 4.9, label: 'Customer review K4', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewImageK5, type: 'image', rating: 5, label: 'Customer review K5', aspectRatio: '1 / 1', widthRatio: 1 },
  { src: reviewVideo01, type: 'video', rating: 5, label: 'Customer review video 12', aspectRatio: '9 / 16', widthRatio: 0.68 },
  { src: reviewVideo02, type: 'video', rating: 4.9, label: 'Customer review video 13', aspectRatio: '9 / 16', widthRatio: 0.68 },
]

const floatingTestimonials: FloatingTestimonial[] = [
  { name: 'Grace', location: 'Lagos', text: 'My edges look fuller and the oil no dey heavy at all. I love the shine ❤️', badge: 'Verified Customer' },
  { name: 'Amaka', location: 'Enugu', text: 'Delivery was fast, packaging fine die. I use am for my natural hair and my scalp feels nourished 😊' },
  { name: 'Ngozi', location: 'Abuja', text: 'I like that I can pay when it arrives. The smell is warm and premium, not harsh.', badge: 'Delivered Successfully' },
  { name: 'Victor', location: 'Benin', text: 'Started using it on my beard too. Easy to apply and gives a clean healthy look 🔥' },
  { name: 'Samuel', location: 'Kaduna', text: 'This one no be watery oil. It feels rich, and my hair routine is more consistent now 💯', badge: 'Repeat Customer' },
  { name: 'Tega', location: 'Warri', text: 'As e land, I begin use am. My hair looks softer and neater. Nice one 👏🏽' },
  { name: 'Jennifer', location: 'Bayelsa', text: 'The bottle is cute and the oil absorbs well. I have ordered again for my sister 😍', badge: 'Top Review' },
  { name: 'Peace', location: 'Jos', text: 'Customer support called before delivery. That alone gave me confidence 🥹' },
  { name: 'Favour', location: 'Delta', text: 'I use it after shower for my scalp and front hair. Very easy daily routine.' },
  { name: 'Abdul', location: 'Kano', text: 'The payment on delivery made it simple. Product reached me in good condition.' },
  { name: 'Mariam', location: 'Calabar', text: 'My hair looks healthier and has this nice glow. No drama, just steady use ❤️' },
  { name: 'Esther', location: 'Makurdi', text: 'I bought for my mum and she likes the ginger feel. Packaging was clean too.' },
]

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="review-stack-stars" aria-label={rating.toFixed(1) + ' out of 5 stars'}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span>{rating.toFixed(1)}</span>
    </div>
  )
}

function FloatingReviewCard({ testimonial, side }: { testimonial: FloatingTestimonial; side: 'left' | 'right' }) {
  return (
    <motion.article
      key={`${side}-${testimonial.name}-${testimonial.location}`}
      animate={{ opacity: 0.92, x: 0, y: 0, scale: 1 }}
      className={`review-floating-card review-floating-card--${side}`}
      exit={{ opacity: 0, x: side === 'left' ? -18 : 18, y: 8, scale: 0.98 }}
      initial={{ opacity: 0, x: side === 'left' ? -18 : 18, y: 10, scale: 0.98 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="review-floating-avatar" aria-hidden="true">
        {testimonial.name.slice(0, 1)}
      </div>
      <div className="min-w-0">
        <div className="review-floating-meta">
          <strong>{testimonial.name}</strong>
          <span>{testimonial.location}</span>
        </div>
        <p>{testimonial.text}</p>
        {testimonial.badge ? <span className="review-floating-badge">{testimonial.badge}</span> : null}
      </div>
    </motion.article>
  )
}

function FloatingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % floatingTestimonials.length)
    }, 3600)

    return () => window.clearInterval(interval)
  }, [])

  const leftTestimonial = floatingTestimonials[activeIndex]
  const rightTestimonial = floatingTestimonials[(activeIndex + 5) % floatingTestimonials.length]

  return (
    <div className="review-floating-shell" aria-hidden="true">
      <AnimatePresence mode="wait">
        <FloatingReviewCard testimonial={leftTestimonial} side="left" />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <FloatingReviewCard testimonial={rightTestimonial} side="right" />
      </AnimatePresence>
    </div>
  )
}

function ReviewMedia({ review }: { review: CustomerReview }) {
  if (review.type === 'video') {
    return <ReviewVideo review={review} />
  }

  return <img className="review-stack-media" src={review.src} alt={review.label} loading="lazy" />
}

function ReviewVideo({ review }: { review: CustomerReview }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => undefined)
          return
        }

        video.pause()
      },
      { threshold: 0.6 },
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return (
    <video ref={videoRef} className="review-stack-media" loop muted playsInline preload="metadata" aria-label={review.label}>
      <source src={review.src} type="video/mp4" />
    </video>
  )
}

export function CustomerReviewsSection() {
  return (
    <section
      className="review-stack-section"
      style={{ '--review-bg-image': `url(${reviewSectionBg})` } as StackStyle}
      aria-labelledby="customer-reviews-heading"
      id="reviews"
    >
      <FloatingTestimonials />

      <div className="review-stack-header">
        <p>CUSTOMER REVIEWS</p>
        <h2 id="customer-reviews-heading">CUSTOMER REVIEWS</h2>
      </div>

      <div className="review-stack" style={{ '--card-count': customerReviews.length } as StackStyle}>
        {customerReviews.map((review, index) => (
          <article
            className={`review-stack-card review-stack-card--media review-stack-card--${review.type}`}
            key={review.src}
            style={
              {
                '--stack-index': index,
                '--media-aspect': review.aspectRatio,
                '--media-width-ratio': review.widthRatio,
              } as StackStyle
            }
          >
            <ReviewMedia review={review} />
            <div className="review-stack-rating-panel">
              <RatingStars rating={review.rating} />
              <button
                className="review-stack-buy-button"
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('checkout:open'))}
                aria-label="Buy now from customer review"
              >
                Buy now
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
