import { RouterProvider } from 'react-router'
import { router } from '@/app/router/router'
import { AppProviders } from '@/app/providers/app-providers'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster />
    </AppProviders>
  )
}