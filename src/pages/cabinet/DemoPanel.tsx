import { useState } from 'react'
import { bonusesText, serviceById } from '../../data/services'
import { completeAppointment } from '../../lib/model'
import { formatDateTime } from '../../lib/time'
import { useDemo } from '../../store/demoStore'
import { Icon, Modal, useToast } from '../../components/ui'

/** Presenter tools. Deliberately styled apart from the client UI (dashed, butter) and labelled as such. */
export default function DemoPanel({ onClose }: { onClose: () => void }) {
  const { state, run, reset, makeEmpty } = useDemo()
  const toast = useToast()
  const upcoming = state.appointments.filter((a) => a.status === 'upcoming').sort((a, b) => a.start.localeCompare(b.start))
  const [selected, setSelected] = useState<string>('')
  const [last, setLast] = useState<string>()
  const [confirm, setConfirm] = useState<'reset' | 'empty'>()
  const target = upcoming.find((a) => a.id === selected) ?? upcoming[0]

  const complete = () => {
    if (!target) return
    const r = run((s) => {
      const c = completeAppointment(s, target.id)
      return { state: c.state, value: c }
    })
    if (!r.ok) return toast(r.error, 'error')
    const msg = `Визит завершён: +${bonusesText(r.value.earned)} (5% от ${target.estimate - (target.payment.kind === 'none' ? 0 : target.payment.amount)} ₽, оплаченных деньгами).${r.value.coupon ? ' Карточка заполнена — выдан купон 300 ₽.' : ''}`
    setLast(msg)
    toast(msg)
    setSelected('')
  }

  return (
    <section aria-label="Режим демонстрации" className="mb-6 rounded-[1.5rem] border-2 border-dashed border-[#b8901a] bg-butter-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-[#5e4500]">Режим демонстрации</h2>
          <p className="text-[0.875rem] text-[#5e4500]">Инструменты для показа концепции. Клиенту салона они недоступны.</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/60" aria-label="Скрыть режим демонстрации">
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="demo-appt" className="field-label">
            Завершить тестовый визит
          </label>
          {upcoming.length ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <select id="demo-appt" className="input sm:max-w-md" value={target?.id} onChange={(e) => setSelected(e.target.value)}>
                {upcoming.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.pet.name} · {serviceById(a.serviceId)?.title} · {formatDateTime(a.start)}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-sm bg-[#5e4500] text-white hover:bg-[#3f2e00]" onClick={complete}>
                Завершить и начислить
              </button>
            </div>
          ) : (
            <p className="text-[0.9375rem]">Нет предстоящих записей — сначала создайте демо-запись.</p>
          )}
          <p className="field-hint">Имитирует состоявшийся визит. Повторно завершить тот же визит нельзя.</p>
          {last && (
            <p role="status" className="mt-3 rounded-xl bg-white px-3 py-2 text-[0.9375rem] font-semibold">
              {last}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-2 lg:flex-col lg:items-stretch">
          <button type="button" className="btn btn-sm border border-[#b8901a] bg-white" onClick={() => setConfirm('empty')}>
            Показать пустой кабинет
          </button>
          <button type="button" className="btn btn-sm border border-[#b8901a] bg-white" onClick={() => setConfirm('reset')}>
            Сбросить данные
          </button>
        </div>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(undefined)}
        size="sm"
        title={confirm === 'reset' ? 'Сбросить демо-данные?' : 'Показать пустой кабинет?'}
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(undefined)}>
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (confirm === 'reset') {
                  reset()
                  toast('Демо-данные возвращены к исходному состоянию')
                } else {
                  makeEmpty()
                  toast('Кабинет очищен: нет питомцев, записей и бонусов', 'info')
                }
                setConfirm(undefined)
                setLast(undefined)
              }}
            >
              {confirm === 'reset' ? 'Сбросить' : 'Очистить'}
            </button>
          </>
        }
      >
        <p>{confirm === 'reset' ? 'Питомцы, записи и бонусы вернутся к исходному демонстрационному набору. Ваши изменения в демо удалятся.' : 'Удалятся все демо-питомцы, записи и бонусы — так видно пустые состояния кабинета. Вернуть исходные данные можно кнопкой «Сбросить данные».'}</p>
      </Modal>
    </section>
  )
}
