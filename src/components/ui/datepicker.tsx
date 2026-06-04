// components/ui/date-picker.tsx
import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const daysInMonthOf = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
const addDays = (d: Date, n: number) => {
    const x = startOfDay(d)
    x.setDate(x.getDate() + n)
    return x
}
const isSameDay = (a?: Date | null, b?: Date | null) =>
    !!a && !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

interface DatePickerProps {
    value?: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    minDate?: Date
    maxDate?: Date
    disabled?: boolean
    id?: string
    className?: string
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Dec 25, 2000",
    minDate,
    maxDate = new Date(),
    disabled = false,
    id,
    className,
}: DatePickerProps) {
    const today = startOfDay(new Date())

    const initial = value ?? (maxDate && today > startOfDay(maxDate) ? startOfDay(maxDate) : today)

    const [open, setOpen] = useState(false)
    const [viewYear, setViewYear] = useState(initial.getFullYear())
    const [viewMonth, setViewMonth] = useState(initial.getMonth())
    const [focused, setFocused] = useState<Date>(startOfDay(initial))

    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const focusedRef = useRef<HTMLButtonElement>(null)

    // Wide range so older retirees can reach their birth year.
    const years = Array.from({ length: 121 }, (_, i) => new Date().getFullYear() - i)

    const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`

    const isDisabledDate = useCallback(
        (d: Date) => {
            const x = startOfDay(d)
            if (minDate && x < startOfDay(minDate)) return true
            if (maxDate && x > startOfDay(maxDate)) return true
            return false
        },
        [minDate, maxDate]
    )

    const clamp = useCallback(
        (d: Date) => {
            let x = startOfDay(d)
            if (minDate && x < startOfDay(minDate)) x = startOfDay(minDate)
            if (maxDate && x > startOfDay(maxDate)) x = startOfDay(maxDate)
            return x
        },
        [minDate, maxDate]
    )

    // Keep the visible month + keyboard focus in sync with an externally set value.
    useEffect(() => {
        if (value) {
            setViewYear(value.getFullYear())
            setViewMonth(value.getMonth())
            setFocused(startOfDay(value))
        }
    }, [value])

    // Close on outside click.
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Move DOM focus to the focused day whenever it (or the month) changes while open.
    useEffect(() => {
        if (open) focusedRef.current?.focus()
    }, [open, focused, viewMonth, viewYear])

    const goTo = (d: Date) => {
        const c = clamp(d)
        setFocused(c)
        setViewYear(c.getFullYear())
        setViewMonth(c.getMonth())
    }

    const select = (d: Date) => {
        if (isDisabledDate(d)) return
        onChange(startOfDay(d))
        setOpen(false)
        triggerRef.current?.focus()
    }

    const openPicker = () => {
        const base = value ? startOfDay(value) : clamp(today)
        setFocused(base)
        setViewYear(base.getFullYear())
        setViewMonth(base.getMonth())
        setOpen(true)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowLeft": e.preventDefault(); goTo(addDays(focused, -1)); break
            case "ArrowRight": e.preventDefault(); goTo(addDays(focused, 1)); break
            case "ArrowUp": e.preventDefault(); goTo(addDays(focused, -7)); break
            case "ArrowDown": e.preventDefault(); goTo(addDays(focused, 7)); break
            case "Home": e.preventDefault(); goTo(addDays(focused, -focused.getDay())); break
            case "End": e.preventDefault(); goTo(addDays(focused, 6 - focused.getDay())); break
            case "PageUp":
                e.preventDefault()
                goTo(new Date(focused.getFullYear(), focused.getMonth() - (e.shiftKey ? 12 : 1), focused.getDate()))
                break
            case "PageDown":
                e.preventDefault()
                goTo(new Date(focused.getFullYear(), focused.getMonth() + (e.shiftKey ? 12 : 1), focused.getDate()))
                break
            case "Enter":
            case " ":
                e.preventDefault()
                select(focused)
                break
            case "Escape":
                e.preventDefault()
                setOpen(false)
                triggerRef.current?.focus()
                break
        }
    }

    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = daysInMonthOf(viewYear, viewMonth)
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={value ? `Change date, selected ${fmt(value)}` : "Choose date"}
                onClick={() => (open ? setOpen(false) : openPicker())}
                className={cn(
                    "flex items-center gap-2 w-full h-9 px-3 text-sm rounded-lg border bg-white text-left transition-colors outline-none",
                    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    open ? "border-ring ring-[3px] ring-ring/50" : "border-input hover:border-ring/50",
                    value ? "text-foreground" : "text-muted-foreground",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                    className
                )}
            >
                <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{value ? fmt(value) : placeholder}</span>
            </button>

            {/* Popover */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Choose date"
                    onKeyDown={onKeyDown}
                    className="absolute z-50 mt-1 bg-white border border-border rounded-xl overflow-hidden w-full min-w-[270px] shadow-lg animate-in fade-in-0 zoom-in-95"
                >
                    {/* Header */}
                    <div className="flex items-center gap-2 p-2.5 border-b border-border">
                        <button
                            type="button"
                            aria-label="Previous month"
                            onClick={() => goTo(new Date(viewYear, viewMonth - 1, focused.getDate()))}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                            &lsaquo;
                        </button>
                        <div className="flex gap-1.5 flex-1">
                            <select
                                aria-label="Month"
                                value={viewMonth}
                                onChange={(e) => {
                                    const m = +e.target.value
                                    const day = Math.min(focused.getDate(), daysInMonthOf(viewYear, m))
                                    goTo(new Date(viewYear, m, day))
                                }}
                                className="flex-1 h-7 text-xs border border-input rounded-md px-1.5 bg-background text-foreground cursor-pointer"
                            >
                                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                            <select
                                aria-label="Year"
                                value={viewYear}
                                onChange={(e) => {
                                    const y = +e.target.value
                                    const day = Math.min(focused.getDate(), daysInMonthOf(y, viewMonth))
                                    goTo(new Date(y, viewMonth, day))
                                }}
                                className="w-[68px] h-7 text-xs border border-input rounded-md px-1.5 bg-background text-foreground cursor-pointer"
                            >
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button
                            type="button"
                            aria-label="Next month"
                            onClick={() => goTo(new Date(viewYear, viewMonth + 1, focused.getDate()))}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                            &rsaquo;
                        </button>
                    </div>

                    {/* Day grid */}
                    <div className="p-2" role="grid">
                        <div className="grid grid-cols-7 mb-1" role="row">
                            {WEEKDAYS.map((d) => (
                                <div key={d} role="columnheader" className="text-center text-[11px] font-medium text-muted-foreground py-1">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                            {Array.from({ length: totalCells }, (_, i) => {
                                const cellDate = new Date(viewYear, viewMonth, i - firstDay + 1)
                                const isCurrentMonth = cellDate.getMonth() === viewMonth
                                const isSelected = isSameDay(value, cellDate)
                                const isToday = isSameDay(today, cellDate)
                                const isFocused = isSameDay(focused, cellDate)
                                const isDisabled = isDisabledDate(cellDate)

                                return (
                                    <button
                                        key={i}
                                        ref={isFocused ? focusedRef : undefined}
                                        type="button"
                                        role="gridcell"
                                        tabIndex={isFocused ? 0 : -1}
                                        disabled={isDisabled}
                                        aria-selected={isSelected}
                                        aria-current={isToday ? "date" : undefined}
                                        aria-label={fmt(cellDate)}
                                        onClick={() => select(cellDate)}
                                        className={cn(
                                            "relative w-full aspect-square flex items-center justify-center text-[13px] rounded-md outline-none transition-colors",
                                            "focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-1",
                                            !isCurrentMonth && "text-muted-foreground/40",
                                            isDisabled && "opacity-30 cursor-not-allowed",
                                            !isDisabled && !isSelected && "hover:bg-brand-primary-500/10 cursor-pointer",
                                            isSelected && "bg-brand-primary-700 text-white font-semibold hover:bg-brand-primary-700",
                                            isToday && !isSelected && "text-brand-primary-700 font-semibold ring-1 ring-inset ring-brand-primary-500/40"
                                        )}
                                    >
                                        {cellDate.getDate()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-t border-border">
                        <button
                            type="button"
                            onClick={() => select(clamp(today))}
                            className="text-xs font-medium text-brand-primary-700 hover:underline"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(null)
                                setOpen(false)
                                triggerRef.current?.focus()
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
    )
}