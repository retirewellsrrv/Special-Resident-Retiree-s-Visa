// components/ui/date-picker.tsx
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

interface DatePickerProps {
    value?: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    maxDate?: Date
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Dec 25, 2000",
    maxDate = new Date(),
}: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const [viewYear, setViewYear] = useState(value?.getFullYear() ?? new Date().getFullYear() - 25)
    const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? new Date().getMonth())
    const containerRef = useRef<HTMLDivElement>(null)

    const years = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

    const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                  "flex items-center gap-2 w-full h-8 px-2.5 text-sm rounded-lg border bg-white text-left transition-all outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  open
                    ? "border-ring ring-3 ring-ring/50"
                    : "border-input hover:border-ring/50",
                  value ? "text-foreground" : "text-muted-foreground"
                )}
            >
                <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                {value ? fmt(value) : placeholder}
            </button>

            {/* Popover */}
            {open && (
                <div className="absolute z-50 mt-1 bg-white border border-border rounded-xl overflow-hidden w-full min-w-[270px] shadow-sm">

                    {/* Header */}
                    <div className="flex items-center gap-2 p-2.5 border-b border-border">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                        >
                            ‹
                        </button>
                        <div className="flex gap-1.5 flex-1">
                            <select
                                value={viewMonth}
                                onChange={e => setViewMonth(+e.target.value)}
                                className="flex-1 h-7 text-xs border border-input rounded-md px-1.5 bg-background text-foreground cursor-pointer"
                            >
                                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                            <select
                                value={viewYear}
                                onChange={e => setViewYear(+e.target.value)}
                                className="w-[68px] h-7 text-xs border border-input rounded-md px-1.5 bg-background text-foreground cursor-pointer"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                        >
                            ›
                        </button>
                    </div>

                    {/* Day grid */}
                    <div className="p-2">
                        <div className="grid grid-cols-7 mb-1">
                            {WEEKDAYS.map(d => (
                                <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                            {Array.from({ length: totalCells }, (_, i) => {
                                const day = i - firstDay + 1
                                const isCurrentMonth = day >= 1 && day <= daysInMonth
                                const date = new Date(viewYear, viewMonth, day)
                                const isSelected = value && isCurrentMonth &&
                                    value.getFullYear() === viewYear &&
                                    value.getMonth() === viewMonth &&
                                    value.getDate() === day
                                const isToday = isCurrentMonth && date.toDateString() === new Date().toDateString()
                                const isFuture = isCurrentMonth && maxDate && date > maxDate
                                const displayDay = isCurrentMonth
                                    ? day
                                    : i < firstDay
                                        ? daysInPrev - firstDay + i + 1
                                        : day - daysInMonth

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={!isCurrentMonth || isFuture}
                                        onClick={() => isCurrentMonth && !isFuture && onChange(date)}
                                        className={`
                      w-full aspect-square flex items-center justify-center text-[13px] rounded-[6px] border-none
                      ${!isCurrentMonth ? "text-muted-foreground/30 cursor-default" : ""}
                      ${isCurrentMonth && !isFuture && !isSelected ? "hover:bg-accent cursor-pointer" : ""}
                      ${isSelected ? "bg-[#534AB7] text-white font-medium" : ""}
                      ${isToday && !isSelected ? "text-[#534AB7] font-medium" : ""}
                      ${isFuture ? "opacity-25 cursor-not-allowed" : ""}
                    `}
                                    >
                                        {displayDay}
                                    </button>
                                )
                            })}
                        </div>
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