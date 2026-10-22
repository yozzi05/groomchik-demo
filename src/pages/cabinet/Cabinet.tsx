import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useDemo } from '../../store/demoStore'
import { DemoBadge, Icon, Logo, container } from '../../components/ui'
import Bonuses from './Bonuses'
import DemoPanel from './DemoPanel'
import Overview from './Overview'
import Pets from './Pets'
import Profile from './Profile'
import Visits from './Visits'
import NotFound from '../NotFound'

export const cabinetNav = [
  { to: '/kabinet', label: 'Обзор', icon: 'home', end: true },
  { to: '/kabinet/pitomcy', label: 'Питомцы', icon: 'paw' },
  { to: '/kabinet/zapisi', label: 'Записи', icon: 'calendar' },
  { to: '/kabinet/bonusy', label: 'Бонусы', icon: 'gift' },
  { to: '/kabinet/profil', label: 'Профиль', icon: 'user' },
]

function Entry() {
  const { enter } = useDemo()
  return (
    <div className={`${container} grid min-h-[70dvh] place-items-center py-12`}>
      <div className="w-full max-w-lg rounded-[2rem] border border-line bg-paper p-7 text-center sm:p-10">
        <Logo size={72} withText={false} />
        <h1 className="display mt-5 text-4xl">Личный кабинет</h1>
        <p className="mt-3 text-ink-2">Питомцы, записи, история визитов и бонусы — в одном месте.</p>
        <button type="button" className="btn btn-primary mt-7 w-full" onClick={enter}>
          Посмотреть демо-кабинет
        </button>
        <p className="mt-5 text-[0.9375rem] text-ink-2">Откроется заранее подготовленный вымышленный профиль. Пароль, SMS и настоящие данные не нужны.</p>
      </div>
    </div>
  )
}

export default function Cabinet() {
  const { state } = useDemo()
  const [demoMode, setDemoMode] = useState(false)

  if (!state.entered) return <Entry />

  const toggle = (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-[#b8901a] bg-butter-soft/60 px-3 py-2.5 text-[0.875rem] font-bold text-[#5e4500]">
      Режим демонстрации
      <span className="relative inline-flex">
        <input type="checkbox" role="switch" className="peer sr-only" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-[#d9c58a] transition-colors peer-checked:bg-[#5e4500] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-brand" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )

  return (
    <div className={`${container} grid gap-6 pb-28 pt-6 lg:grid-cols-[230px_1fr] lg:gap-10 lg:pb-16 lg:pt-10`}>
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div>
            <p className="text-[0.875rem] text-ink-2">Демо-профиль</p>
            <p className="text-lg font-extrabold">{state.profile.name}</p>
          </div>
          <nav aria-label="Разделы кабинета" className="grid gap-1">
            {cabinetNav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold ${isActive ? 'bg-ink text-white' : 'hover:bg-cream'}`}
              >
                <Icon name={n.icon} size={20} />
                {n.label}
              </NavLink>
            ))}
          </nav>
          {toggle}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:hidden">
          <DemoBadge>Демо-кабинет</DemoBadge>
          <div className="w-60">{toggle}</div>
        </div>
        {demoMode && <DemoPanel onClose={() => setDemoMode(false)} />}
        <Routes>
          <Route index element={<Overview />} />
          <Route path="pitomcy" element={<Pets />} />
          <Route path="zapisi" element={<Visits />} />
          <Route path="bonusy" element={<Bonuses />} />
          <Route path="profil" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <nav aria-label="Разделы кабинета" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {cabinetNav.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[0.75rem] font-bold ${isActive ? 'text-brand-deep' : 'text-ink-2'}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid h-8 w-12 place-items-center rounded-full ${isActive ? 'bg-brand-soft' : ''}`}>
                      <Icon name={n.icon} size={20} />
                    </span>
                    {n.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
