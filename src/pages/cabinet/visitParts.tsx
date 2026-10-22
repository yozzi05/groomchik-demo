import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { masterById } from '../../data/masters'
import { salons } from '../../data/salon'
import { bonusesText, rub, serviceById } from '../../data/services'
import { cancelAppointment, rescheduleAppointment, type Appointment } from '../../lib/model'
import { dayId, formatDateLong, formatDateTime, formatTime, mskParts } from '../../lib/time'
import { useDemo } from '../../store/demoStore'
import { SlotPicker } from '../../components/SlotPicker'
import { DemoBadge, Icon, Modal, useToast } from '../../components/ui'

export const masterName = (a: Appointment) => (a.masterId === 'any' ? 'Любой подходящий мастер' : (masterById(a.masterId)?.name ?? '—'))
export const salonOf = (a: Appointment) => salons.find((s) => s.id === a.salonId)

const statusLabel = { upcoming: 'Предстоит', completed: 'Завершён', cancelled: 'Отменена' }
const statusClass = { upcoming: 'bg-brand-soft text-brand-deep', completed: 'bg-ok-soft text-ok', cancelled: 'bg-cream text-ink-2' }

export function useRepeat() {
  const { setDraft } = useDemo()
  const navigate = useNavigate()
  return (a: Appointment) => {
    setDraft({ petId: a.petId, species: a.pet.species, serviceId: a.serviceId, salonId: a.salonId, masterId: a.masterId, repeatOf: a.id, step: 2 }, true)
    navigate('/zapis')
  }
}

function paymentText(a: Appointment) {
  if (a.payment.kind === 'bonus') return `${a.status === 'completed' ? 'Списано' : a.status === 'cancelled' ? 'Было зарезервировано (возвращено)' : 'Зарезервировано'}: ${bonusesText(a.payment.amount)}`
  if (a.payment.kind === 'coupon') return `Купон ${rub(a.payment.amount)}${a.status === 'cancelled' ? ' (возвращён)' : ''}`
  return 'Без списания бонусов'
}

export function DetailsModal({ a, open, onClose }: { a: Appointment; open: boolean; onClose: () => void }) {
  const service = serviceById(a.serviceId)
  const s = salonOf(a)
  const cash = a.estimate - (a.payment.kind === 'none' ? 0 : a.payment.amount)
  return (
    <Modal open={open} onClose={onClose} title={service?.title ?? 'Запись'}>
      <dl className="grid gap-3 sm:grid-cols-2">
        {[
          ['Питомец', a.pet.name],
          ['Статус', statusLabel[a.status]],
          ['Дата и время', formatDateTime(a.start)],
          ['Салон', s ? `${s.name}, ${s.address}` : '—'],
          ['Мастер', masterName(a)],
          ['Стоимость', 'Согласуется с администратором'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-cream px-4 py-3">
            <dt className="text-[0.875rem] text-ink-2">{k}</dt>
            <dd className="font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      {a.comment && (
        <div className="mt-4">
          <h3 className="font-bold">Пожелания</h3>
          <p className="mt-1 whitespace-pre-line text-ink-2">{a.comment}</p>
        </div>
      )}
      {service && (
        <div className="mt-5">
          <h3 className="font-bold">Что входит в услугу</h3>
          <ul className="mt-2 space-y-1.5">
            {service.includes.map((i) => (
              <li key={i} className="flex gap-2 text-[0.9375rem]">
                <Icon name="check" size={18} className="mt-0.5 text-brand" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 rounded-2xl bg-butter-soft p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">Бонусы по визиту</h3>
          <DemoBadge>Примерные суммы</DemoBadge>
        </div>
        <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1.5 text-[0.9375rem]">
          <dt>Примерная сумма визита</dt>
          <dd className="text-right tabular-nums">{rub(a.estimate)}</dd>
          <dt>Скидка</dt>
          <dd className="text-right">{paymentText(a)}</dd>
          <dt>Деньгами (условно)</dt>
          <dd className="text-right tabular-nums">{rub(cash)}</dd>
          <dt className="font-bold">Начислено бонусов</dt>
          <dd className="text-right font-bold tabular-nums">
            {a.status === 'completed' ? `+${a.earned}` : a.status === 'cancelled' ? 'не начисляются' : 'после визита'}
          </dd>
        </dl>
      </div>
    </Modal>
  )
}

export function AppointmentCard({ a, compact }: { a: Appointment; compact?: boolean }) {
  const { run, state } = useDemo()
  const toast = useToast()
  const repeat = useRepeat()
  const [modal, setModal] = useState<'details' | 'cancel' | 'move'>()
  const [move, setMove] = useState<{ day?: string; start?: string; error?: string }>({})
  const service = serviceById(a.serviceId)
  const s = salonOf(a)
  const p = mskParts(new Date(a.start))

  const doCancel = () => {
    const r = run((st) => ({ state: cancelAppointment(st, a.id), value: null }))
    setModal(undefined)
    toast(r.ok ? `Запись отменена${a.payment.kind === 'bonus' ? `, ${bonusesText(a.payment.amount)} — снова на балансе` : a.payment.kind === 'coupon' ? ', купон снова доступен' : ''}` : r.error, r.ok ? 'ok' : 'error')
  }

  const doMove = () => {
    if (!move.start) return setMove((m) => ({ ...m, error: 'Выберите дату и время.' }))
    const r = run((st) => ({ state: rescheduleAppointment(st, a.id, move.start!), value: null }))
    if (!r.ok) return setMove((m) => ({ ...m, error: r.error }))
    setModal(undefined)
    toast(`Запись перенесена на ${formatDateTime(move.start)}`)
  }

  const taken = state.appointments.filter((x) => x.status === 'upcoming' && x.petId === a.petId && x.id !== a.id).map((x) => x.start)

  return (
    <article className={`flex flex-col gap-4 rounded-[1.5rem] border border-line bg-paper p-5 sm:flex-row sm:p-6 ${a.status === 'cancelled' ? 'opacity-80' : ''}`}>
      <div className={`flex shrink-0 flex-row items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-0 ${a.status === 'upcoming' ? 'text-brand-deep' : 'text-ink-2'}`}>
        <span className="font-display text-4xl leading-none">{p.d}</span>
        <span className="text-[0.9375rem] font-bold">{formatDateLong(a.start).split(', ')[1]?.split(' ')[1] ?? ''}</span>
        <span className="text-[0.9375rem] font-bold sm:mt-1">{formatTime(a.start)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[0.8125rem] font-bold ${statusClass[a.status]}`}>{statusLabel[a.status]}</span>
          {a.rescheduled ? <span className="text-[0.8125rem] font-semibold text-ink-2">перенесена</span> : null}
        </div>
        <h3 className="mt-2 text-lg font-extrabold">
          {a.pet.name} · {service?.title}
        </h3>
        <p className="mt-1 text-[0.9375rem] text-ink-2">
          {formatDateLong(a.start)}, {formatTime(a.start)} · {s?.address} · {masterName(a)}
        </p>
        {a.status === 'completed' && <p className="mt-1 text-[0.9375rem] font-semibold text-ok">+{bonusesText(a.earned)} за визит</p>}
        {a.status === 'upcoming' && a.payment.kind !== 'none' && <p className="mt-1 text-[0.9375rem] font-semibold text-brand-deep">{paymentText(a)}</p>}

        {!compact && (
          <div className="mt-4 flex flex-wrap gap-2">
            {a.status === 'upcoming' && (
              <>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => { setMove({ day: dayId(p), start: undefined }); setModal('move') }}>
                  Перенести
                </button>
                <button type="button" className="btn btn-sm border border-line hover:bg-danger-soft hover:text-danger" onClick={() => setModal('cancel')}>
                  Отменить
                </button>
              </>
            )}
            {a.status !== 'upcoming' && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => repeat(a)}>
                <Icon name="repeat" size={17} /> Повторить запись
              </button>
            )}
            <button type="button" className="btn btn-sm border border-line hover:bg-cream" onClick={() => setModal('details')}>
              {a.status === 'completed' ? 'Услуга и бонусы' : 'Детали'}
            </button>
          </div>
        )}
      </div>

      <DetailsModal a={a} open={modal === 'details'} onClose={() => setModal(undefined)} />

      <Modal
        open={modal === 'cancel'}
        onClose={() => setModal(undefined)}
        size="sm"
        title="Отменить запись?"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(undefined)}>
              Не отменять
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={doCancel}>
              Отменить запись
            </button>
          </>
        }
      >
        <p>
          {a.pet.name}, {service?.title?.toLowerCase()} — {formatDateTime(a.start)}.
        </p>
        {a.payment.kind !== 'none' && <p className="mt-2 font-semibold">{a.payment.kind === 'bonus' ? `Зарезервированные бонусы (${a.payment.amount}) вернутся на баланс.` : 'Купон снова станет доступен.'}</p>}
        <p className="mt-3 text-[0.9375rem] text-ink-2">Это демо: в салон ничего не отправится. Условия отмены и предоплаты в реальном салоне уточняйте у администратора.</p>
      </Modal>

      <Modal
        open={modal === 'move'}
        onClose={() => setModal(undefined)}
        size="lg"
        title="Перенести запись"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(undefined)}>
              Отмена
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={doMove}>
              Перенести
            </button>
          </>
        }
      >
        <p className="mb-4">
          Сейчас: <b>{formatDateTime(a.start)}</b>, {s?.address}, {masterName(a)}.
        </p>
        {modal === 'move' && (
          <SlotPicker
            salonId={a.salonId}
            masterId={a.masterId}
            day={move.day}
            start={move.start}
            taken={[...taken, a.start]}
            onDay={(d) => setMove({ day: d })}
            onStart={(iso) => setMove((m) => ({ ...m, start: iso, error: undefined }))}
            error={move.error}
          />
        )}
      </Modal>
    </article>
  )
}
