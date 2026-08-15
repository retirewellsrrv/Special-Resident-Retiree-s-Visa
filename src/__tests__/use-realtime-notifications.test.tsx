import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRealtimeNotifications } from '../hooks/use-realtime-notifications'

function createChannelMock() {
  return {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }
}

vi.mock('../lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '../lib/supabase/client'

describe('useRealtimeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not subscribe when userId is missing', () => {
    renderHook(() =>
      useRealtimeNotifications({
        userId: null,
        table: 'notifications',
        filterColumn: 'user_id',
        onEvent: () => {},
      }),
    )

    expect(createClient).not.toHaveBeenCalled()
  })

  it('subscribes to postgres_changes INSERT with the correct filter', () => {
    const channel = createChannelMock()
    const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() }
    vi.mocked(createClient).mockReturnValue(client as any)

    renderHook(() =>
      useRealtimeNotifications({
        userId: 'user-123',
        table: 'notifications',
        filterColumn: 'user_id',
        onEvent: () => {},
      }),
    )

    expect(client.channel).toHaveBeenCalledWith('notifications:notifications:user-123')
    expect(channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: 'user_id=eq.user-123',
      }),
      expect.any(Function),
    )
    expect(channel.subscribe).toHaveBeenCalledTimes(1)
  })

  it('uses admin_user_id filter for the admin table', () => {
    const channel = createChannelMock()
    const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() }
    vi.mocked(createClient).mockReturnValue(client as any)

    renderHook(() =>
      useRealtimeNotifications({
        userId: 'admin-1',
        table: 'admin_notifications',
        filterColumn: 'admin_user_id',
        onEvent: () => {},
      }),
    )

    expect(channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'admin_notifications',
        filter: 'admin_user_id=eq.admin-1',
      }),
      expect.any(Function),
    )
  })

  it('invokes onEvent when an INSERT event arrives', () => {
    const channel = createChannelMock()
    const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() }
    vi.mocked(createClient).mockReturnValue(client as any)

    const onEvent = vi.fn()
    renderHook(() =>
      useRealtimeNotifications({
        userId: 'user-123',
        table: 'notifications',
        filterColumn: 'user_id',
        onEvent,
      }),
    )

    const insertCallback = channel.on.mock.calls[0][2]
    act(() => {
      insertCallback({})
    })

    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('removes the channel on unmount', () => {
    const channel = createChannelMock()
    const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() }
    vi.mocked(createClient).mockReturnValue(client as any)

    const { unmount } = renderHook(() =>
      useRealtimeNotifications({
        userId: 'user-123',
        table: 'notifications',
        filterColumn: 'user_id',
        onEvent: () => {},
      }),
    )

    unmount()
    expect(client.removeChannel).toHaveBeenCalledWith(channel)
  })
})