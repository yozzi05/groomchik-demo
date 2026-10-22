import { useNavigate } from 'react-router-dom'
import type { Profile as P } from '../../lib/model'
import { useDemo } from '../../store/demoStore'
import { DemoBadge, Icon, useToast } from '../../components/ui'

const toggles: { key: keyof Omit<P['reminders'], 'channel'>; label: string; hint: string }[] = [
  { key: 'dayBefore', label: 'Напомнить за день до визита', hint: 'С адресом салона и временем' },
  { key: 'sameDay', label: 'Напомнить за 2 часа', hint: 'В день визита' },
  { key: 'nextVisit', label: 'Подсказать дату следующего ухода', hint: 'По рекомендации мастера' },
]

const channels: { id: P['reminders']['channel']; label: string }[] = [
  { id: 'telegram', label: 'Telegram' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'E-mail' },
]

export default function Profile() {
  const { state, update, leave } = useDemo()
  const toast = useToast()
  const navigate = useNavigate()
  const r = state.profile.reminders

  const setReminders = (patch: Partial<P['reminders']>) => {
    update((s) => ({ ...s, profile: { ...s.profile, reminders: { ...s.profile.reminders, ...patch } } }))
    toast('Настройка сохранена в демо', 'info')
  }

  return (
    <div className="space-y-8">
      <h1 className="display text-4xl sm:text-5xl">Профиль</h1>

      <section aria-labelledby="contacts-title" className="rounded-[1.5rem] border border-line bg-paper p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="contacts-title" className="text-lg font-extrabold">
            Контакты
          </h2>
          <DemoBadge>Вымышленные данные</DemoBadge>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Имя', state.profile.name],
            ['Телефон', state.profile.phone],
            ['E-mail', state.profile.email],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-cream px-4 py-3">
              <dt className="text-[0.875rem] text-ink-2">{k}</dt>
              <dd className="font-bold break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[0.9375rem] text-ink-2">В демоверсии контакты не редактируются: настоящие данные вводить не нужно.</p>
      </section>

      <section aria-labelledby="rem-title" className="rounded-[1.5rem] border border-line bg-paper p-6">
        <h2 id="rem-title" className="text-lg font-extrabold">
          Напоминания
        </h2>
        <p className="mt-2 flex gap-2 rounded-2xl bg-butter-soft px-4 py-3 text-[0.9375rem] font-semibold text-[#5e4500]">
          <Icon name="info" size={18} className="mt-0.5 shrink-0" />
          Демонстрационные настройки. Уведомления не подключены и отправляться не будут.
        </p>
        <ul className="mt-4 divide-y divide-line">
          {toggles.map((t) => (
            <li key={t.key}>
              <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
                <span>
                  <span className="block font-semibold">{t.label}</span>
                  <span className="text-[0.875rem] text-ink-2">{t.hint}</span>
                </span>
                <span className="relative inline-flex shrink-0">
                  <input type="checkbox" role="switch" className="peer sr-only" checked={r[t.key]} onChange={(e) => setReminders({ [t.key]: e.target.checked })} />
                  <span className="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand" />
                  <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </li>
          ))}
        </ul>
        <fieldset className="mt-4">
          <legend className="field-label">Канал</legend>
          <div className="flex flex-wrap gap-2">
            {channels.map((c) => (
              <button key={c.id} type="button" aria-pressed={r.channel === c.id} className="chip" onClick={() => setReminders({ channel: c.id })}>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          leave()
          navigate('/')
        }}
      >
        Выйти из демо-кабинета
      </button>
    </div>
  )
}
