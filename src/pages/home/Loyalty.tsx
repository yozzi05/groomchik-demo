import { Link } from 'react-router-dom'
import { LOYALTY, LOYALTY_DISCLAIMER } from '../../data/loyalty'
import { rub } from '../../data/services'
import { bonusesToEarn, maxBonusSpend } from '../../lib/model'
import { StampCard } from '../../components/StampCard'
import { DemoBadge, Icon, container } from '../../components/ui'

const EXAMPLE = 2000

export default function Loyalty() {
  const spend = maxBonusSpend(EXAMPLE, 10_000)
  const earn = bonusesToEarn(EXAMPLE, { kind: 'bonus', amount: spend })

  return (
    <div className="bg-butter-soft">
      <div className={`${container} grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-24`}>
        <div>
          <DemoBadge>{LOYALTY_DISCLAIMER}</DemoBadge>
          <h2 id="loyalty-title" className="display mt-4 text-4xl sm:text-5xl">
            Возвращаться <em>удобно и&nbsp;выгодно</em>
          </h2>
          <ul className="mt-7 space-y-5">
            <li className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-brand-deep">
                <Icon name="paw" />
              </span>
              <span>
                <b className="block text-lg">Отметка за каждый визит</b>
                <span className="text-ink-2">После пятого визита — купон {rub(LOYALTY.couponValue)} на следующий.</span>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-brand-deep">
                <Icon name="gift" />
              </span>
              <span>
                <b className="block text-lg">5% бонусами</b>
                <span className="text-ink-2">от суммы, оплаченной деньгами. 1 бонус = 1 ₽, можно оплатить до 20% стоимости.</span>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-brand-deep">
                <Icon name="repeat" />
              </span>
              <span>
                <b className="block text-lg">Повторная запись в два касания</b>
                <span className="text-ink-2">Питомец и услуга подставятся сами — остаётся выбрать дату.</span>
              </span>
            </li>
          </ul>
          <Link to="/kabinet" className="btn btn-primary mt-8">
            Посмотреть кабинет
            <Icon name="arrow" size={18} />
          </Link>
        </div>

        <div className="rounded-[1.75rem] bg-paper p-6 shadow-[0_24px_60px_-30px_rgba(31,35,40,0.35)] sm:p-8">
          <p className="text-[0.9375rem] font-bold text-ink-2">Карточка визитов</p>
          <div className="mt-3">
            <StampCard stamps={3} />
          </div>
          <p className="mt-3 text-[0.9375rem] text-ink-2">Пример: отмечено 3 визита из 5.</p>

          <div className="mt-7 border-t border-line pt-6">
            <p className="text-[0.9375rem] font-bold text-ink-2">Пример расчёта</p>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-2.5 text-[1rem]">
              <dt>Стоимость визита</dt>
              <dd className="text-right font-bold tabular-nums">{rub(EXAMPLE)}</dd>
              <dt>Можно списать бонусов (20%)</dt>
              <dd className="text-right font-bold tabular-nums">−{spend}</dd>
              <dt>Оплата деньгами</dt>
              <dd className="text-right font-bold tabular-nums">{rub(EXAMPLE - spend)}</dd>
              <dt className="border-t border-line pt-2.5 text-brand-deep">Начислится после визита (5%)</dt>
              <dd className="border-t border-line pt-2.5 text-right font-extrabold text-brand-deep tabular-nums">+{earn}</dd>
            </dl>
            <p className="mt-4 text-[0.875rem] text-ink-2">Сумма условная. Бонусы не начисляются за отменённые и будущие записи; купон и бонусы не суммируются.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
