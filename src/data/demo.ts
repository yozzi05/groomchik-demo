// ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ КАБИНЕТА
// Вымышленный владелец, питомцы, визиты и бонусы. Не связаны с реальными клиентами
// и с животными на фотографиях сайта. Даты строятся относительно текущего дня (Europe/Moscow).

import type { DemoState } from '../lib/model'
import { addDays, mskISO, todayMsk, weekdayOf } from '../lib/time'

export const STORAGE_KEY = 'groomchik-demo'
export const SCHEMA_VERSION = 1

export const demoProfile = {
  name: 'Анна',
  phone: '+7 900 000-00-00',
  email: 'anna.demo@example.com',
}

export function seedState(now = new Date()): DemoState {
  const today = todayMsk(now)
  let upcomingDay = addDays(today, 6)
  if (weekdayOf(upcomingDay) === 1) upcomingDay = addDays(upcomingDay, 1) // Monday is not in the published hours
  const past = (days: number, h: number, m = 0) => mskISO(addDays(today, -days), h, m)

  return {
    entered: false,
    profile: {
      ...demoProfile,
      reminders: { dayBefore: true, sameDay: false, nextVisit: true, channel: 'telegram' },
    },
    pets: [
      {
        id: 'p1',
        name: 'Тедди',
        species: 'dog',
        breed: 'Мальтипу',
        birthDate: '2022-03-14',
        weight: '4,5',
        wishes: 'Мордочку покороче, ушки оставить длинными. Волнуется, когда фен близко к морде.',
      },
      {
        id: 'p2',
        name: 'Мия',
        species: 'cat',
        breed: 'Британская длинношёрстная',
        birthDate: '2020-07-02',
        weight: '4',
        wishes: 'Если будет сильно нервничать — лучше без купания.',
      },
    ],
    appointments: [
      {
        id: 'a1', petId: 'p1', pet: { name: 'Тедди', species: 'dog' }, serviceId: 'dog-hygiene', salonId: 'gorizont', masterId: 'alena',
        start: past(70, 11), status: 'completed', estimate: 2000, payment: { kind: 'none' }, earned: 100,
        createdAt: past(75, 12), completedAt: past(70, 13),
      },
      {
        id: 'a2', petId: 'p2', pet: { name: 'Мия', species: 'cat' }, serviceId: 'cat-express', salonId: 'zapadny', masterId: 'any',
        start: past(38, 13), status: 'completed', estimate: 2600, payment: { kind: 'none' }, earned: 130,
        createdAt: past(41, 10), completedAt: past(38, 15),
      },
      {
        id: 'a3', petId: 'p1', pet: { name: 'Тедди', species: 'dog' }, serviceId: 'dog-haircut', salonId: 'gorizont', masterId: 'inna',
        start: past(16, 10, 30), status: 'completed', estimate: 2400, payment: { kind: 'bonus', amount: 100 }, earned: 115,
        createdAt: past(20, 18), completedAt: past(16, 13),
      },
      {
        id: 'a4', petId: 'p1', pet: { name: 'Тедди', species: 'dog' }, serviceId: 'dog-haircut', salonId: 'gorizont', masterId: 'any',
        start: mskISO(upcomingDay, 11), status: 'upcoming', estimate: 2400, payment: { kind: 'none' }, earned: 0,
        comment: 'Как в прошлый раз', createdAt: past(2, 19),
      },
    ],
    ledger: [
      { id: 'l1', at: past(70, 13), kind: 'earn', amount: 100, apptId: 'a1', note: 'Начислено за визит' },
      { id: 'l2', at: past(38, 15), kind: 'earn', amount: 130, apptId: 'a2', note: 'Начислено за визит' },
      { id: 'l3', at: past(20, 18), kind: 'spend', amount: -100, apptId: 'a3', note: 'Списано за визит' },
      { id: 'l4', at: past(16, 13), kind: 'earn', amount: 115, apptId: 'a3', note: 'Начислено за визит' },
    ],
    coupons: [],
    stamps: 3,
    seq: 100,
  }
}

/** Empty cabinet: shows every empty state (no pets, no visits, zero balance). */
export function emptyState(): DemoState {
  return {
    entered: true,
    profile: { ...demoProfile, reminders: { dayBefore: true, sameDay: false, nextVisit: false, channel: 'sms' } },
    pets: [],
    appointments: [],
    ledger: [],
    coupons: [],
    stamps: 0,
    seq: 100,
  }
}
