import { Link } from 'react-router-dom'
import { LOYALTY, LOYALTY_DISCLAIMER, loyaltyRules } from '../../data/loyalty'
import { bonusesText, plural, serviceById } from '../../data/services'
import { activeCoupon, bonusBalance } from '../../lib/model'
import { formatDateYear } from '../../lib/time'
import { useDemo } from '../../store/demoStore'
import { StampCard } from '../../components/StampCard'
import { DemoBadge, Icon } from '../../components/ui'

const kindLabel = { earn: 'Начисление', spend: 'Списание', reserve: 'Резерв', release: 'Возврат резерва' }

export default function Bonuses() {
  const { state } = useDemo()
  const balance = bonusBalance(state)
  const reserved = state.appointments.reduce((s, a) => s + (a.status === 'upcoming' && a.payment.kind === 'bonus' ? a.payment.amount : 0), 0)
  const coupon = activeCoupon(state)
  const reservedCoupon = state.coupons.find((c) => c.status === 'reserved')
  const ledger = [...state.ledger].sort((a, b) => b.at.localeCompare(a.at))
  const left = LOYALTY.stampsForCoupon - state.stamps

  return (
    <div className="space-y-8">
      <div>
        <DemoBadge>{LOYALTY_DISCLAIMER}</DemoBadge>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Бонусы</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <section aria-label="Баланс" className="rounded-[1.5rem] bg-ink p-6 text-white">
          <p className="text-white/75">Доступно</p>
          <p className="font-display text-6xl">{balance}</p>
          <p className="text-white/75">{plural(balance, 'бонус', 'бонуса', 'бонусов')} · 1 бонус = 1 ₽</p>
          {reserved > 0 && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[0.9375rem]">Ещё {bonusesText(reserved)} в резерве для предстоящих записей</p>}
          {balance === 0 && <p className="mt-3 text-[0.9375rem] text-butter">Баланс пуст: бонусы начисляются после завершённого визита — 5% от суммы, оплаченной деньгами.</p>}
        </section>

        <section aria-labelledby="card-title" className="rounded-[1.5rem] border border-line bg-paper p-6">
          <h2 id="card-title" className="text-lg font-extrabold">
            Карточка визитов
          </h2>
          <div className="mt-4">
            <StampCard stamps={state.stamps} />
          </div>
          <p className="mt-3 text-ink-2">
            {left === LOYALTY.stampsForCoupon && !coupon ? 'Отметка ставится после каждого завершённого визита.' : `До купона ${LOYALTY.couponValue} ₽ осталось визитов: ${left}.`}
          </p>
          {coupon && (
            <p className="mt-3 flex items-center gap-2 rounded-2xl bg-butter-soft px-4 py-3 font-bold">
              <Icon name="gift" /> Купон {coupon.value} ₽ на следующий визит. При записи выберите купон или бонусы.
            </p>
          )}
          {reservedCoupon && <p className="mt-3 text-[0.9375rem] text-ink-2">Купон {reservedCoupon.value} ₽ зарезервирован для предстоящей записи.</p>}
        </section>
      </div>

      <section aria-labelledby="rules-title" className="rounded-[1.5rem] bg-butter-soft p-6">
        <h2 id="rules-title" className="text-lg font-extrabold">
          Правила программы
        </h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {loyaltyRules.map((r) => (
            <li key={r} className="flex gap-2 text-[0.9375rem]">
              <Icon name="check" size={18} className="mt-0.5 text-brand-deep" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.875rem] text-[#5e4500]">Предлагаемые условия для демонстрации. Действующую программу и акции салона уточняйте у администратора.</p>
      </section>

      <section aria-labelledby="hist-title">
        <h2 id="hist-title" className="text-xl font-extrabold">
          История начислений и списаний
        </h2>
        {ledger.length === 0 ? (
          <div className="mt-4 rounded-[1.5rem] border-2 border-dashed border-line p-6 text-center">
            <p className="font-bold">Операций пока нет</p>
            <Link to="/zapis" className="btn btn-primary btn-sm mt-4">
              Записать питомца
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-[1.5rem] border border-line bg-paper">
            {ledger.map((e) => {
              const a = state.appointments.find((x) => x.id === e.apptId)
              return (
                <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-bold">{kindLabel[e.kind]}</p>
                    <p className="text-[0.9375rem] text-ink-2">
                      {formatDateYear(e.at)}
                      {a && ` · ${a.pet.name}, ${serviceById(a.serviceId)?.title.toLowerCase()}`}
                    </p>
                  </div>
                  <span className={`shrink-0 text-lg font-extrabold tabular-nums ${e.amount > 0 ? 'text-ok' : 'text-ink'}`}>
                    {e.amount > 0 ? '+' : '−'}
                    {Math.abs(e.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
