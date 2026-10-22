// Demo cabinet domain: pure state transitions (no React, no storage), covered by model.test.ts.
// Every function returns a new state object or throws DemoError with a message fit for the UI.

import { LOYALTY } from '../data/loyalty'
import type { MasterId } from '../data/masters'
import type { SalonId } from '../data/salon'
import type { Species } from '../data/services'

export class DemoError extends Error {}

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string
  birthDate?: string
  weight?: string
  wishes?: string
}

export type ApptStatus = 'upcoming' | 'completed' | 'cancelled'

export type Payment =
  | { kind: 'none' }
  | { kind: 'bonus'; amount: number }
  | { kind: 'coupon'; couponId: string; amount: number }

export interface Appointment {
  id: string
  petId: string
  pet: { name: string; species: Species } // snapshot: history stays readable if the pet is deleted
  serviceId: string
  salonId: SalonId
  masterId: MasterId | 'any'
  start: string
  status: ApptStatus
  estimate: number // demo-only approximate sum, never shown as the salon's price
  payment: Payment
  earned: number
  comment?: string
  exampleId?: string
  createdAt: string
  completedAt?: string
  cancelledAt?: string
  rescheduled?: number
}

export type LedgerKind = 'earn' | 'reserve' | 'spend' | 'release'

export interface LedgerEntry {
  id: string
  at: string
  kind: LedgerKind
  amount: number // signed
  apptId?: string
  note: string
}

export interface Coupon {
  id: string
  value: number
  issuedAt: string
  status: 'active' | 'reserved' | 'used'
  apptId?: string
}

export interface Profile {
  name: string
  phone: string
  email: string
  reminders: { dayBefore: boolean; sameDay: boolean; nextVisit: boolean; channel: 'sms' | 'telegram' | 'email' }
}

export interface DemoState {
  entered: boolean
  profile: Profile
  pets: Pet[]
  appointments: Appointment[]
  ledger: LedgerEntry[]
  coupons: Coupon[]
  stamps: number
  seq: number
}

// ---------- Loyalty math ----------

export const bonusBalance = (s: Pick<DemoState, 'ledger'>) => Math.max(0, s.ledger.reduce((sum, e) => sum + e.amount, 0))

/** Bonuses that may be spent on a visit: capped by 20% of the price and by the balance. Never negative. */
export function maxBonusSpend(price: number, balance: number): number {
  if (!(price > 0) || !(balance > 0)) return 0
  return Math.max(0, Math.min(Math.floor(balance), Math.floor(price * LOYALTY.maxSpendShare)))
}

export function nonCashPart(payment: Payment): number {
  return payment.kind === 'none' ? 0 : payment.amount
}

/** 5% of the part paid with money. Bonus- or coupon-paid parts earn nothing. */
export function bonusesToEarn(price: number, payment: Payment): number {
  const cash = Math.max(0, price - nonCashPart(payment))
  return Math.floor(cash * LOYALTY.earnRate)
}

export const activeCoupon = (s: Pick<DemoState, 'coupons'>) => s.coupons.find((c) => c.status === 'active')

// ---------- helpers ----------

function nextId(s: DemoState, prefix: string): [string, DemoState] {
  const seq = s.seq + 1
  return [`${prefix}${seq}`, { ...s, seq }]
}

function findUpcoming(s: DemoState, id: string): Appointment {
  const a = s.appointments.find((x) => x.id === id)
  if (!a) throw new DemoError('Запись не найдена.')
  if (a.status !== 'upcoming') throw new DemoError(a.status === 'completed' ? 'Визит уже завершён.' : 'Запись уже отменена.')
  return a
}

const replaceAppt = (s: DemoState, a: Appointment): DemoState => ({
  ...s,
  appointments: s.appointments.map((x) => (x.id === a.id ? a : x)),
})

// ---------- appointments ----------

export interface NewAppointment {
  petId: string
  serviceId: string
  salonId: SalonId
  masterId: MasterId | 'any'
  start: string
  estimate: number
  payment: Payment
  comment?: string
  exampleId?: string
}

export function createAppointment(state: DemoState, input: NewAppointment, now = new Date()): { state: DemoState; appt: Appointment } {
  const pet = state.pets.find((p) => p.id === input.petId)
  if (!pet) throw new DemoError('Выберите питомца.')
  if (new Date(input.start).getTime() <= now.getTime()) throw new DemoError('Выберите время в будущем.')
  if (state.appointments.some((a) => a.status === 'upcoming' && a.start === input.start && a.petId === input.petId))
    throw new DemoError('На это время у питомца уже есть запись.')

  let s = state
  let payment = input.payment
  if (payment.kind === 'bonus') {
    const max = maxBonusSpend(input.estimate, bonusBalance(s))
    if (!Number.isInteger(payment.amount) || payment.amount < 0) throw new DemoError('Количество бонусов должно быть целым положительным числом.')
    if (payment.amount > max) throw new DemoError(`Максимум к списанию — ${max}.`)
    if (payment.amount === 0) payment = { kind: 'none' }
  }
  if (payment.kind === 'coupon') {
    const c = s.coupons.find((x) => x.id === (payment as { couponId: string }).couponId)
    if (!c || c.status !== 'active') throw new DemoError('Купон недоступен.')
    payment = { kind: 'coupon', couponId: c.id, amount: Math.min(c.value, input.estimate) }
  }

  let id: string
  ;[id, s] = nextId(s, 'a')
  const at = now.toISOString()
  const appt: Appointment = {
    id,
    petId: pet.id,
    pet: { name: pet.name, species: pet.species },
    serviceId: input.serviceId,
    salonId: input.salonId,
    masterId: input.masterId,
    start: input.start,
    status: 'upcoming',
    estimate: input.estimate,
    payment,
    earned: 0,
    comment: input.comment?.trim() || undefined,
    exampleId: input.exampleId,
    createdAt: at,
  }
  s = { ...s, appointments: [...s.appointments, appt] }

  if (payment.kind === 'bonus') {
    let lid: string
    ;[lid, s] = nextId(s, 'l')
    s = { ...s, ledger: [...s.ledger, { id: lid, at, kind: 'reserve', amount: -payment.amount, apptId: id, note: 'Резерв для записи' }] }
  }
  if (payment.kind === 'coupon') {
    const cid = payment.couponId
    s = { ...s, coupons: s.coupons.map((c) => (c.id === cid ? { ...c, status: 'reserved', apptId: id } : c)) }
  }
  return { state: s, appt }
}

export function cancelAppointment(state: DemoState, id: string, now = new Date()): DemoState {
  const a = findUpcoming(state, id)
  let s = replaceAppt(state, { ...a, status: 'cancelled', cancelledAt: now.toISOString() })
  if (a.payment.kind === 'bonus' && a.payment.amount > 0) {
    let lid: string
    ;[lid, s] = nextId(s, 'l')
    s = { ...s, ledger: [...s.ledger, { id: lid, at: now.toISOString(), kind: 'release', amount: a.payment.amount, apptId: id, note: 'Возврат резерва при отмене' }] }
  }
  if (a.payment.kind === 'coupon') {
    const cid = a.payment.couponId
    s = { ...s, coupons: s.coupons.map((c) => (c.id === cid ? { ...c, status: 'active', apptId: undefined } : c)) }
  }
  return s
}

export function rescheduleAppointment(state: DemoState, id: string, start: string, now = new Date()): DemoState {
  const a = findUpcoming(state, id)
  if (new Date(start).getTime() <= now.getTime()) throw new DemoError('Выберите время в будущем.')
  if (start === a.start) throw new DemoError('Выберите другое время.')
  return replaceAppt(state, { ...a, start, rescheduled: (a.rescheduled ?? 0) + 1 })
}

/** Demo-mode action: pretend the visit took place. Earns bonuses exactly once per visit. */
export function completeAppointment(state: DemoState, id: string, now = new Date()): { state: DemoState; earned: number; coupon?: Coupon } {
  const a = findUpcoming(state, id)
  const at = now.toISOString()
  const earned = bonusesToEarn(a.estimate, a.payment)
  let s = replaceAppt(state, { ...a, status: 'completed', completedAt: at, earned })

  if (a.payment.kind === 'bonus') {
    s = { ...s, ledger: s.ledger.map((e) => (e.apptId === id && e.kind === 'reserve' ? { ...e, kind: 'spend', note: 'Списано за визит' } : e)) }
  }
  if (a.payment.kind === 'coupon') {
    const cid = a.payment.couponId
    s = { ...s, coupons: s.coupons.map((c) => (c.id === cid ? { ...c, status: 'used' } : c)) }
  }
  if (earned > 0) {
    let lid: string
    ;[lid, s] = nextId(s, 'l')
    s = { ...s, ledger: [...s.ledger, { id: lid, at, kind: 'earn', amount: earned, apptId: id, note: 'Начислено за визит' }] }
  }

  let coupon: Coupon | undefined
  const stamps = s.stamps + 1
  if (stamps >= LOYALTY.stampsForCoupon) {
    let cid: string
    ;[cid, s] = nextId(s, 'c')
    coupon = { id: cid, value: LOYALTY.couponValue, issuedAt: at, status: 'active' }
    s = { ...s, stamps: 0, coupons: [...s.coupons, coupon] }
  } else {
    s = { ...s, stamps }
  }
  return { state: s, earned, coupon }
}

// ---------- pets ----------

export type PetInput = Omit<Pet, 'id'>

export function validatePet(p: PetInput): Partial<Record<keyof PetInput, string>> {
  const e: Partial<Record<keyof PetInput, string>> = {}
  if (!p.name.trim()) e.name = 'Укажите имя питомца.'
  else if (p.name.trim().length > 30) e.name = 'Имя — не длиннее 30 символов.'
  if (!p.breed.trim()) e.breed = 'Укажите породу или «метис».'
  if (p.birthDate) {
    const d = new Date(p.birthDate)
    if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) e.birthDate = 'Дата рождения не может быть в будущем.'
  }
  if (p.weight && !/^\d{1,3}([.,]\d{1,2})?$/.test(p.weight.trim())) e.weight = 'Вес — число в килограммах, например 4,5.'
  return e
}

export function addPet(state: DemoState, input: PetInput): { state: DemoState; pet: Pet } {
  const errors = validatePet(input)
  if (Object.keys(errors).length) throw new DemoError(Object.values(errors)[0]!)
  const [id, s] = nextId(state, 'p')
  const pet: Pet = { ...input, id, name: input.name.trim(), breed: input.breed.trim() }
  return { state: { ...s, pets: [...s.pets, pet] }, pet }
}

export function updatePet(state: DemoState, id: string, input: PetInput): DemoState {
  const errors = validatePet(input)
  if (Object.keys(errors).length) throw new DemoError(Object.values(errors)[0]!)
  if (!state.pets.some((p) => p.id === id)) throw new DemoError('Питомец не найден.')
  return { ...state, pets: state.pets.map((p) => (p.id === id ? { ...input, id, name: input.name.trim(), breed: input.breed.trim() } : p)) }
}

export function deletePet(state: DemoState, id: string): DemoState {
  if (state.appointments.some((a) => a.petId === id && a.status === 'upcoming'))
    throw new DemoError('У питомца есть предстоящая запись. Сначала отмените её.')
  return { ...state, pets: state.pets.filter((p) => p.id !== id) }
}
