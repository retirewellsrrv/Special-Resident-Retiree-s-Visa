import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { UserMenu } from '../components/layout/user-menu'

const replaceMock = vi.fn()
const refreshMock = vi.fn()
const logoutActionMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}))

vi.mock('../actions/auth', () => ({
  logoutAction: (...args: unknown[]) => logoutActionMock(...args),
}))

// Radix menus rely on pointer-capture APIs that jsdom doesn't implement
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  window.HTMLElement.prototype.hasPointerCapture = vi.fn()
  window.HTMLElement.prototype.releasePointerCapture = vi.fn()
})

function renderMenu() {
  return render(
    <UserMenu user={{ name: 'Juan Dela Cruz', role: 'Applicant' }} />,
  )
}

/** Opens the menu via keyboard (Enter) — Radix ignores bare pointerDown
 *  events from fireEvent because they lack button/ctrlKey semantics. */
function openMenu() {
  fireEvent.keyDown(screen.getByLabelText('Open user menu'), { key: 'Enter' })
}

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    logoutActionMock.mockResolvedValue(undefined)
  })

  it('renders the closed trigger with the user name visible', () => {
    renderMenu()

    expect(screen.getByLabelText('Open user menu')).toBeInTheDocument()
    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument()
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('shows role and logout item when opened', () => {
    renderMenu()

    openMenu()

    expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument()
    expect(screen.getAllByText('Applicant').length).toBeGreaterThan(0)
  })

  it('calls logoutAction when the logout item is clicked', async () => {
    renderMenu()

    openMenu()
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }))
    })

    expect(logoutActionMock).toHaveBeenCalledTimes(1)
  })

  it('navigates to login and refreshes after logging out', async () => {
    renderMenu()

    openMenu()
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }))
    })

    expect(replaceMock).toHaveBeenCalledWith('/login')
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })
})
