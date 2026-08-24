import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}))

vi.mock('../utils/auth/getUser', () => ({
  getUserServer: vi.fn(),
}))

import { createClient, createAdminClient } from '../lib/supabase/server'
import { getUserServer } from '../utils/auth/getUser'
import {
  getMyNotifications,
  markNotificationsReadAction,
  deleteNotificationsAction,
} from '../actions/applicant/notifications'
import {
  getAdminNotifications,
  deleteAdminNotificationsAction,
} from '../actions/admin/notifications'

function createChainMock(data: unknown[] = []) {
  const chain: Record<string, any> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    range: vi.fn(() => chain),
  }
  // Thenable: awaiting any terminal point of the chain resolves the
  // query result, mirroring how supabase-js awaits a built query.
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data, error: null }).then(resolve)
  return chain
}

describe('applicant notifications actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserServer).mockResolvedValue({
      id: 'user-123',
      email: 'a@b.com',
    } as any)
  })

  it('returns an empty result when the user is unauthenticated', async () => {
    vi.mocked(getUserServer).mockResolvedValue(null as any)
    const result = await getMyNotifications()
    expect(result).toEqual({ unread: 0, items: [], hasMore: false })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('pages the query with the correct range offsets', async () => {
    const chain = createChainMock([{ id: 1 }])
    const from = vi.fn(() => chain)
    vi.mocked(createClient).mockResolvedValue({ from } as any)

    const result = await getMyNotifications(2, 20)

    expect(from).toHaveBeenCalledWith('notifications')
    expect(result.items).toHaveLength(1)
    expect(result.hasMore).toBe(false)
    // page 2 of 20 → offset 20..39
    expect(chain.range).toHaveBeenCalledWith(20, 39)
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('reports hasMore when a full page is returned', async () => {
    const full = Array.from({ length: 20 }, (_, i) => ({ id: i }))
    const chain = createChainMock(full)
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => chain) } as any)

    const result = await getMyNotifications(1, 20)
    expect(result.hasMore).toBe(true)
  })

  it('marks all unread notifications as read for the user', async () => {
    const chain = createChainMock()
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => chain) } as any)

    const result = await markNotificationsReadAction()

    expect(result).toEqual({ success: true })
    expect(chain.update).toHaveBeenCalledWith({ is_read: true })
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-123')
    expect(chain.eq).toHaveBeenCalledWith('is_read', false)
  })

  it('deletes all notifications for the user', async () => {
    const chain = createChainMock()
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => chain) } as any)

    const result = await deleteNotificationsAction()

    expect(result).toEqual({ success: true })
    expect(chain.delete).toHaveBeenCalledTimes(1)
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-123')
  })
})

describe('admin notifications actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserServer).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@b.com',
    } as any)
  })

  it('queries admin_notifications scoped to the admin user', async () => {
    const chain = createChainMock([{ id: 7 }])
    const from = vi.fn(() => chain)
    vi.mocked(createAdminClient).mockReturnValue({ from } as any)

    const result = await getAdminNotifications(1, 20)

    expect(result.items).toHaveLength(1)
    expect(from).toHaveBeenCalledWith('admin_notifications')
    expect(chain.eq).toHaveBeenCalledWith('admin_user_id', 'admin-1')
    expect(chain.range).toHaveBeenCalledWith(0, 19)
  })

  it('deletes all admin notifications for the admin user', async () => {
    const chain = createChainMock()
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn(() => chain),
    } as any)

    const result = await deleteAdminNotificationsAction()

    expect(result).toEqual({ success: true })
    expect(chain.delete).toHaveBeenCalledTimes(1)
    expect(chain.eq).toHaveBeenCalledWith('admin_user_id', 'admin-1')
  })
})