import { useMemo } from 'react'
import type { SalonId } from '../data/salon'
import { bookingDays, dayId, demoSlots, mskISO, openingHours, parseDayId, weekdayOf, formatWeekdayShort } from '../lib/time'
import { DemoBadge } from './ui'

interface Props {
  salonId: SalonId
  masterId: string
  day?: string
  start?: string
  taken?: string[]
  onDay: (day: string) => void
  onStart: (iso: string) => void
  error?: string
}

const monthDay = new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC', day: 'numeric', month: 'short' })

export function SlotPicker({ salonId, masterId, day, start, taken = [], onDay, onStart, error }: Props) {
  const days = useMemo(() => bookingDays(), [])
  const selectedDay = day ? parseDayId(day) : undefined
  const slots = selectedDay ? demoSlots(selectedDay, salonId, masterId, taken) : []
  const freeCount = slots.filter((s) => s.available).length

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <DemoBadge>Демонстрационное расписание</DemoBadge>
        <span className="text-[0.875rem] text-ink-2">Время московское. Реальная занятость салона не проверяется.</span>
      </div>

      <fieldset className="mt-5">
        <legend className="field-label">Дата</legend>
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
          {days.map((d) => {
            const id = dayId(d)
            const closed = !openingHours(weekdayOf(d))
            const iso = mskISO(d, 12)
            return (
              <button
                key={id}
                type="button"
                disabled={closed}
                aria-pressed={day === id}
                onClick={() => onDay(id)}
                title={closed ? 'Понедельник не указан в графике работы' : undefined}
                className={`flex min-w-[4.5rem] snap-start flex-col items-center rounded-2xl border-2 px-2 py-2.5 text-center transition-colors ${
                  day === id ? 'border-ink bg-ink text-white' : closed ? 'cursor-not-allowed border-line bg-cream text-ink-2/60' : 'border-line bg-paper hover:border-ink-2'
                }`}
              >
                <span className="text-[0.8125rem] font-semibold uppercase">{formatWeekdayShort(iso)}</span>
                <span className="text-[1.0625rem] font-extrabold">{monthDay.format(new Date(Date.UTC(d.y, d.m - 1, d.d))).replace('.', '')}</span>
                {closed && <span className="text-[0.75rem]">нет приёма</span>}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="field-label">Время</legend>
        {!day ? (
          <p className="rounded-2xl bg-cream px-4 py-3 text-ink-2">Сначала выберите дату.</p>
        ) : freeCount === 0 ? (
          <p className="rounded-2xl bg-cream px-4 py-3 text-ink-2">На этот день свободного времени нет — выберите другую дату.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6" role="radiogroup" aria-label="Свободное время">
            {slots.map((s) => (
              <button
                key={s.iso}
                type="button"
                role="radio"
                aria-checked={start === s.iso}
                disabled={!s.available}
                onClick={() => onStart(s.iso)}
                className="chip justify-center tabular-nums"
                aria-label={s.available ? s.label : `${s.label}, занято`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </fieldset>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
