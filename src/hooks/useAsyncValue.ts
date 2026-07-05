import { useEffect, useState, type DependencyList } from 'react'

export type AsyncState<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export function useAsyncValue<T>(load: () => Promise<T>, dependencies: DependencyList = []): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    let isActive = true

    Promise.resolve()
      .then(() => {
        if (isActive) {
          setState((current) => ({ ...current, isLoading: true, error: null }))
        }
      })
      .then(load)
      .then((data) => {
        if (isActive) {
          setState({ data, error: null, isLoading: false })
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error('Unknown async error'),
            isLoading: false,
          })
        }
      })

    return () => {
      isActive = false
    }
  }, dependencies)

  return state
}
