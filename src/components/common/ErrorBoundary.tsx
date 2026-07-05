import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Application error boundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center text-stone-100">
          <section className="max-w-md">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold-500">Something went wrong</p>
            <h1 className="font-serif text-4xl">We could not load this page.</h1>
            <p className="mt-4 text-sm leading-7 text-stone-copy">
              Please refresh the page. If the issue continues, contact support with the page you were trying to open.
            </p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
