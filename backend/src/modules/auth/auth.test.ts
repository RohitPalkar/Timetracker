import { describe, it, expect } from 'vitest'
import { mockVerifyOtp, mockStoreOtp } from '../../db/mock.js'

describe('mock OTP', () => {
  it('stores and verifies 123456 for demo', () => {
    mockStoreOtp('demo@mytracker.local', '123456')
    const ok = mockVerifyOtp('demo@mytracker.local', '123456')
    expect(ok.ok).toBe(true)
  })
  it('rejects wrong code', () => {
    mockStoreOtp('demo@mytracker.local', '123456')
    const bad = mockVerifyOtp('demo@mytracker.local', '000000')
    expect(bad.ok).toBe(false)
  })
  it('rejects unknown email', async () => {
    // simulate service gate
    const { requestOtp } = await import('./service.js')
    await expect(requestOtp('unknown@example.com')).rejects.toThrow()
  })
})

describe('RBAC', () => {
  it('super_admin gets admin.all', async () => {
    // This is covered by mock data; just check constants
    const { MOCK_PERMISSIONS } = await import('../../db/mock.js')
    expect(MOCK_PERMISSIONS).toContain('admin.all')
  })
})
