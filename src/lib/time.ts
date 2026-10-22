// All dates are stored as UTC ISO strings and always shown in Europe/Moscow,
// so the booking form, the cabinet and the history agree regardless of the viewer's clock.
// Moscow has no DST (UTC+3 all year), which keeps slot construction exact.

import type { SalonId } from '../data/salon'

export const TZ = 'Europe/Moscow'
const MSK_OFFSET_H = 3

export interface DayKey {
  y: number
  m: number // 1-12
  d: number
}

export function mskParts(date: Date) {
  const shifted = new Date(date.getTime() + MSK_OFFSET_H * 3600_000)
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
    h: shifted.getUTCHours(),
    min: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(), // 0 = Sunday
  }
}

export function mskISO(day: DayKey, hour: number, minute = 0): string {
  return new Date(Date.UTC(day.y, day.m - 1, day.d, hour - MSK_OFFSET_H, minute)).toISOString()
}

export function addDays(day: DayKey, n: number): DayKey {
  const t = new Date(Date.UTC(day.y, day.m - 1, day.d + n))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

export const dayId = (d: DayKey) => `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`

export function parseDayId(id: string): DayKey {
  const [y, m, d] = id.split('-').map(Number)
  return { y, m, d }
}

export const todayMsk = (now = new Date()): DayKey => {
  const p = mskParts(now)
  return { y: p.y, m: p.m, d: p.d }
}

export const weekdayOf = (d: DayKey) => new Date(Date.UTC(d.y, d.m - 1, d.d)).getUTCDay()

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ru-RU', { timeZone: TZ, ...opts })
const fDateLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' })
const fDateShort = fmt({ day: 'numeric', month: 'long' })
const fDateYear = fmt({ day: 'numeric', month: 'long', year: 'numeric' })
const fTime = fmt({ hour: '2-digit', minute: '2-digit' })
const fWeekdayShort = fmt({ weekday: 'short' })

export const formatDateLong = (iso: string) => fDateLong.format(new Date(iso))
export const formatDateShort = (iso: string) => fDateShort.format(new Date(iso))
export const formatDateYear = (iso: string) => fDateYear.format(new Date(iso))
export const formatTime = (iso: string) => fTime.format(new Date(iso))
export const formatDateTime = (iso: string) => `${formatDateLong(iso)}, ${formatTime(iso)}`
export const formatWeekdayShort = (iso: string) => fWeekdayShort.format(new Date(iso))

// ---- Demo schedule ----
// Opening hours as published (Tue–Fri 10–20, Sat–Sun 9–20). Monday is not in the
// published schedule, so the demo offers no Monday slots. Last start leaves time for the procedure.
export function openingHours(weekday: number): { from: number; lastStart: number } | null {
  if (weekday === 1) return null
  if (weekday === 0 || weekday === 6) return { from: 9, lastStart: 17 }
  return { from: 10, lastStart: 17 }
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

export interface Slot {
  iso: string
  label: string
  available: boolean
}

/** Deterministic fake occupancy so the demo schedule looks plausible and stays stable between reloads. */
export function demoSlots(day: DayKey, salonId: SalonId, masterId: string, taken: string[] = [], now = new Date()): Slot[] {
  const hours = openingHours(weekdayOf(day))
  if (!hours) return []
  const out: Slot[] = []
  for (let h = hours.from; h <= hours.lastStart; h++) {
    for (const min of [0, 30]) {
      if (h === hours.lastStart && min === 30) continue
      const iso = mskISO(day, h, min)
      const busy = hash(`${dayId(day)}|${salonId}|${masterId}|${h}:${min}`) < 0.38
      const past = new Date(iso).getTime() < now.getTime() + 2 * 3600_000
      out.push({ iso, label: `${String(h).padStart(2, '0')}:${min === 0 ? '00' : '30'}`, available: !busy && !past && !taken.includes(iso) })
    }
  }
  return out
}

export function bookingDays(now = new Date(), count = 14): DayKey[] {
  const start = todayMsk(now)
  return Array.from({ length: count }, (_, i) => addDays(start, i + 1))
}
