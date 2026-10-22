import { Link } from 'react-router-dom'
import { LOYALTY } from '../../data/loyalty'
import { serviceById, speciesLabel } from '../../data/services'
import { activeCoupon, bonusBalance } from '../../lib/model'
import { mskParts } from '../../lib/time'
import { useDemo } from '../../store/demoStore'
import { StampCard } from '../../components/StampCard'
import { Icon } from '../../components/ui'
import { AppointmentCard, useRepeat } from './visitParts'

function greeting() {
  const h = mskParts(new Date()).h
  return h < 6 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'
}

export default function Overview() {
  const { state } = useDemo()
  const repeat = useRepeat()
  const upcoming = state.appointments.filter((a) => a.status === 'upcoming').sort((a, b) => a.start.localeCompare(b.start))
  const lastDone = state.appointments.filter((a) => a.status === 'completed').sort((a, b) => b.start.localeCompare(a.start))[0]
  const balance = bonusBalance(state)
  const coupon = activeCoupon(state)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-4xl sm:text-5xl">
          {greeting()}, {state.profile.name}
        </h1>
        <p className="mt-2 text-ink-2">{upcoming.length ? `Предстоящих записей: ${upcoming.length}.` : 'Предстоящих записей нет.'}</p>
      </div>

      <section aria-labelledby="next-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="next-title" className="text-xl font-extrabold">
            Ближайшая запись
          </h2>
          {upcoming.length > 1 && (
            <Link to="/kabinet/zapisi" className="link text-[0.9375rem] font-semibold">
              Все записи
            </Link>
          )}
        </div>
        {upcoming[0] ? (
          <AppointmentCard a={upcoming[0]} />
        ) : (
          <div className="rounded-[1.5rem] border-2 border-dashed border-line p-6 text-center sm:p-8">
            <p className="font-bold">Нет предстоящих записей</p>
            <p className="mt-1 text-ink-2">{lastDone ? `Последний визит — ${lastDone.pet.name}, ${serviceById(lastDone.serviceId)?.title.toLowerCase()}.` : 'Запишите питомца — запись появится здесь.'}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {lastDone && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => repeat(lastDone)}>
                  <Icon name="repeat" size={17} /> Повторить последний визит
                </button>
              )}
              <Link to="/zapis" className={`btn btn-sm ${lastDone ? 'btn-ghost' : 'btn-primary'}`}>
                Записать питомца
              </Link>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section aria-labelledby="pets-title" className="rounded-[1.5rem] border border-line bg-paper p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="pets-title" className="text-xl font-extrabold">
              Питомцы
            </h2>
            <Link to="/kabinet/pitomcy" className="link text-[0.9375rem] font-semibold">
              {state.pets.length ? 'Управлять' : 'Добавить'}
            </Link>
          </div>
          {state.pets.length ? (
            <ul className="mt-4 space-y-2">
              {state.pets.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2.5">
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${p.species === 'dog' ? 'bg-brand-soft text-brand-deep' : 'bg-butter-soft text-[#6b4e00]'}`}>
                    <Icon name="paw" size={18} />
                  </span>
                  <span>
                    <b className="block">{p.name}</b>
                    <span className="text-[0.875rem] text-ink-2">
                      {speciesLabel[p.species]} · {p.breed}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-2">Пока нет питомцев. Добавьте профиль, чтобы записываться быстрее.</p>
          )}
        </section>

        <section aria-labelledby="bonus-title" className="rounded-[1.5rem] bg-ink p-5 text-white sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="bonus-title" className="text-xl font-extrabold">
              Бонусы
            </h2>
            <Link to="/kabinet/bonusy" className="text-[0.9375rem] font-semibold text-butter underline underline-offset-2">
              Подробнее
            </Link>
          </div>
          <p className="mt-3 font-display text-5xl">{balance}</p>
          <p className="text-white/75">{balance === 0 ? 'Бонусы начисляются после завершённого визита' : '1 бонус = 1 ₽ скидки'}</p>
          <div className="mt-5 rounded-2xl bg-white p-4 text-ink">
            <p className="mb-2 text-[0.875rem] font-bold text-ink-2">
              Визиты: {state.stamps} из {LOYALTY.stampsForCoupon}
            </p>
            <StampCard stamps={state.stamps} compact />
          </div>
          {coupon && <p className="mt-3 font-semibold text-butter">Доступен купон {coupon.value} ₽ на следующий визит</p>}
        </section>
      </div>
    </div>
  )
}
