import { BrowserRouter } from 'react-router-dom'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AppRoutes } from '@/routes/AppRoutes'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
