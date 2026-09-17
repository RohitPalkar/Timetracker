import { RouterProvider } from 'react-router'
import { router } from '@/app/router/router'
import { AppProviders } from '@/app/providers/app-providers'
import { AuthBootstrap } from '@/app/router/guards'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
      <Toaster />
    </AppProviders>
  )
}