import { Outlet } from 'react-router'
import { CommandPalette } from '@/components/common/command-palette'

/** Root layout for every route — hosts the global command palette so it
 * resolves inside the router context (useNavigate requires it). */
export function BlankLayout() {
  return (
    <>
      <Outlet />
      <CommandPalette />
    </>
  )
}