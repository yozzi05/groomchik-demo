import { describe, expect, it } from 'vitest'
import { emptyState, seedState } from '../data/demo'
import {
  addPet,
  bonusBalance,
  bonusesToEarn,
  cancelAppointment,
  completeAppointment,
  createAppointment,
  deletePet,
  maxBonusSpend,
  rescheduleAppointment,
  type DemoState,
} from './model'

const NOW = new Date('2026-10-22T09:00:00Z')
const FUTURE = '2026-10-30T08:00:00.000Z'

function withBalance(balance: number): DemoState {
  const s = emptyState()
  const { state } = addPet(s, { name: 'Тедди', species: 'dog', breed: 'Мальтипу' })
  return { ...state, ledger: balance ? [{ id: 'x', at: NOW.toISOString(), kind: 'earn', amount: balance, note: 'test' }] : [] }
}

describe('расчёт бонусов', () => {
  it('пример из ТЗ: 2000 ₽ → списание до 400, деньгами 1600, начисление 80', () => {
    expect(maxBonusSpend(2000, 1000)).toBe(400)
    expect(bonusesToEarn(2000, { kind: 'bonus', amount: 400 })).toBe(80)
  })
  it('списание ограничено балансом', () => {
    expect(maxBonusSpend(2000, 150)).toBe(150)
  })
  it('нулевой баланс и некорректные суммы не дают отрицательных значений', () => {
    expect(maxBonusSpend(2000, 0)).toBe(0)
    expect(maxBonusSpend(0, 500)).toBe(0)
    expect(maxBonusSpend(-100, 500)).toBe(0)
    expect(bonusesToEarn(100, { kind: 'bonus', amount: 400 })).toBe(0)
  })
  it('без списания начисляется 5% от полной суммы', () => {
    expect(bonusesToEarn(2400, { kind: 'none' })).toBe(120)
  })
  it('на часть, оплаченную купоном, бонусы не начисляются', () => {
    expect(bonusesToEarn(2000, { kind: 'coupon', couponId: 'c', amount: 300 })).toBe(85)
  })
  it('демо-данные: баланс 245 бонусов', () => {
    expect(bonusBalance(seedState(NOW))).toBe(245)
  })
})

describe('переходы состояний записи', () => {
  const book = (s: DemoState, amount: number) =>
    createAppointment(
      s,
      { petId: s.pets[0].id, serviceId: 'dog-haircut', salonId: 'gorizont', masterId: 'any', start: FUTURE, estimate: 2000, payment: amount ? { kind: 'bonus', amount } : { kind: 'none' } },
      NOW,
    )

  it('запись резервирует бонусы, отмена возвращает их', () => {
    const s0 = withBalance(1000)
    const { state: s1, appt } = book(s0, 400)
    expect(bonusBalance(s1)).toBe(600)
    expect(appt.status).toBe('upcoming')
    const s2 = cancelAppointment(s1, appt.id, NOW)
    expect(bonusBalance(s2)).toBe(1000)
    expect(s2.appointments.find((a) => a.id === appt.id)!.status).toBe('cancelled')
    expect(() => cancelAppointment(s2, appt.id, NOW)).toThrow()
  })

  it('нельзя списать больше 20% или больше баланса', () => {
    expect(() => book(withBalance(1000), 401)).toThrow()
    expect(() => book(withBalance(100), 150)).toThrow()
  })

  it('завершение начисляет 80 бонусов ровно один раз', () => {
    const { state: s1, appt } = book(withBalance(1000), 400)
    const r = completeAppointment(s1, appt.id, NOW)
    expect(r.earned).toBe(80)
    expect(bonusBalance(r.state)).toBe(680)
    expect(() => completeAppointment(r.state, appt.id, NOW)).toThrow()
    expect(r.state.ledger.filter((e) => e.apptId === appt.id && e.kind === 'earn')).toHaveLength(1)
  })

  it('отменённая запись не завершается и не начисляет бонусы', () => {
    const { state: s1, appt } = book(withBalance(0), 0)
    const s2 = cancelAppointment(s1, appt.id, NOW)
    expect(() => completeAppointment(s2, appt.id, NOW)).toThrow()
    expect(bonusBalance(s2)).toBe(0)
  })

  it('перенос меняет время, но не бонусы', () => {
    const { state: s1, appt } = book(withBalance(1000), 200)
    const s2 = rescheduleAppointment(s1, appt.id, '2026-11-02T09:00:00.000Z', NOW)
    const moved = s2.appointments.find((a) => a.id === appt.id)!
    expect(moved.start).toBe('2026-11-02T09:00:00.000Z')
    expect(bonusBalance(s2)).toBe(800)
    expect(() => rescheduleAppointment(s2, appt.id, '2026-10-01T09:00:00.000Z', NOW)).toThrow()
  })

  it('после пятого визита выдаётся купон, который не суммируется с бонусами и возвращается при отмене', () => {
    let s = withBalance(0)
    let coupon
    for (let i = 0; i < 5; i++) {
      const start = new Date(Date.parse(FUTURE) + i * 86400_000).toISOString()
      const r = createAppointment(s, { petId: s.pets[0].id, serviceId: 'dog-haircut', salonId: 'gorizont', masterId: 'any', start, estimate: 2000, payment: { kind: 'none' } }, NOW)
      const c = completeAppointment(r.state, r.appt.id, NOW)
      s = c.state
      coupon = c.coupon
      if (i < 4) expect(coupon).toBeUndefined()
    }
    expect(coupon?.value).toBe(300)
    expect(s.stamps).toBe(0)
    const r = createAppointment(s, { petId: s.pets[0].id, serviceId: 'dog-haircut', salonId: 'gorizont', masterId: 'any', start: '2026-11-20T08:00:00.000Z', estimate: 2000, payment: { kind: 'coupon', couponId: coupon!.id, amount: 300 } }, NOW)
    expect(r.state.coupons[0].status).toBe('reserved')
    const back = cancelAppointment(r.state, r.appt.id, NOW)
    expect(back.coupons[0].status).toBe('active')
  })

  it('нельзя записаться на прошедшее время и удалить питомца с предстоящей записью', () => {
    const s = withBalance(0)
    expect(() => createAppointment(s, { petId: s.pets[0].id, serviceId: 'dog-haircut', salonId: 'gorizont', masterId: 'any', start: '2026-10-01T08:00:00.000Z', estimate: 2000, payment: { kind: 'none' } }, NOW)).toThrow()
    const { state } = book(s, 0)
    expect(() => deletePet(state, s.pets[0].id)).toThrow()
  })
})
