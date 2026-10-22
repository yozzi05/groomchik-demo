import { useRef, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../store/demoStore'
import { AppointmentCard } from './visitParts'

const tabs = [
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'history', label: 'История' },
] as const

export default function Visits() {
  const { state } = useDemo()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'history' ? 'history' : 'upcoming'
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const upcoming = state.appointments.filter((a) => a.status === 'upcoming').sort((a, b) => a.start.localeCompare(b.start))
  const history = state.appointments.filter((a) => a.status !== 'upcoming').sort((a, b) => b.start.localeCompare(a.start))
  const list = tab === 'upcoming' ? upcoming : history

  const select = (id: string) => {
    setParams(id === 'history' ? { tab: 'history' } : {}, { replace: true })
  }
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = (i + 1) % 2
    select(tabs[n].id)
    refs.current[n]?.focus()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl sm:text-5xl">Мои записи</h1>
        <Link to="/zapis" className="btn btn-primary btn-sm">
          Новая запись
        </Link>
      </div>

      <div role="tablist" aria-label="Записи" className="mt-6 inline-flex rounded-full border border-line bg-paper p-1.5">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            id={`vtab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="visits-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-11 rounded-full px-5 font-bold ${tab === t.id ? 'bg-ink text-white' : 'hover:bg-cream'}`}
          >
            {t.label}
            <span className={`ml-2 rounded-full px-2 text-[0.8125rem] ${tab === t.id ? 'bg-white/20' : 'bg-cream'}`}>{t.id === 'upcoming' ? upcoming.length : history.length}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id="visits-panel" aria-labelledby={`vtab-${tab}`} className="mt-6 space-y-4">
        {list.length === 0 ? (
          <div className="rounded-[1.5rem] border-2 border-dashed border-line p-8 text-center">
            <p className="text-lg font-bold">{tab === 'upcoming' ? 'Предстоящих записей нет' : 'История пока пуста'}</p>
            <p className="mt-1 text-ink-2">{tab === 'upcoming' ? 'Запишите питомца — запись появится здесь, её можно будет перенести или отменить.' : 'Здесь появятся завершённые и отменённые визиты.'}</p>
            {tab === 'upcoming' && (
              <Link to="/zapis" className="btn btn-primary btn-sm mt-5">
                Записать питомца
              </Link>
            )}
          </div>
        ) : (
          list.map((a) => <AppointmentCard key={a.id} a={a} />)
        )}
      </div>
    </div>
  )
}
