import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { salon } from '../data/salon'
import { useDemo } from '../store/demoStore'
import { Icon, Logo, container } from './ui'
import { SectionLink } from './SectionLink'

export const mainNav = [
  { section: 'services', label: 'Услуги и цены' },
  { section: 'works', label: 'Наши работы' },
  { section: 'masters', label: 'Мастера' },
  { section: 'salons', label: 'Салоны' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { clearDraft } = useDemo()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-milk/95 backdrop-blur-sm">
      <div className={`${container} flex h-[72px] items-center gap-4`}>
        <Link to="/" className="shrink-0 rounded-xl" aria-label="ГрумЧик — на главную">
          <span className="hidden sm:inline">
            <Logo size={50} />
          </span>
          <span className="sm:hidden">
            <Logo size={44} />
          </span>
        </Link>

        <nav aria-label="Основная навигация" className="ml-4 hidden items-center gap-1 xl:flex">
          {mainNav.map((n) => (
            <SectionLink key={n.section} section={n.section} className="whitespace-nowrap rounded-full px-3 py-2 text-[0.9375rem] font-semibold hover:bg-cream">
              {n.label}
            </SectionLink>
          ))}
          <NavLink to="/shkola" className="ml-2 whitespace-nowrap rounded-full px-3 py-2 text-[0.875rem] font-medium text-ink-2 hover:bg-cream hover:text-ink">
            Школа груминга
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavLink to="/kabinet" className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[0.9375rem] font-semibold hover:bg-cream md:inline-flex">
            <Icon name="user" size={19} />
            Личный кабинет
          </NavLink>
          <Link to="/zapis" onClick={() => clearDraft()} className="btn btn-primary btn-sm whitespace-nowrap sm:min-h-[2.875rem] sm:px-5 sm:text-base">
            <span className="hidden sm:inline">Записать питомца</span>
            <span className="sm:hidden">Записаться</span>
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-milk xl:hidden">
          <nav aria-label="Меню" className={`${container} grid gap-1 py-4`}>
            {mainNav.map((n) => (
              <SectionLink key={n.section} section={n.section} onNavigate={() => setOpen(false)} className="flex items-center justify-between rounded-2xl px-3 py-3 text-lg font-semibold hover:bg-cream">
                {n.label}
                <Icon name="chevron" className="text-ink-2" />
              </SectionLink>
            ))}
            <Link to="/kabinet" className="flex items-center justify-between rounded-2xl px-3 py-3 text-lg font-semibold hover:bg-cream">
              Личный кабинет
              <Icon name="user" className="text-ink-2" />
            </Link>
            <Link to="/shkola" className="flex items-center justify-between rounded-2xl px-3 py-3 text-base font-medium text-ink-2 hover:bg-cream">
              Школа груминга
              <Icon name="chevron" />
            </Link>
            <div className="mt-2 grid gap-2 border-t border-line pt-4 text-[0.9375rem]">
              {salon.phones.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className="flex items-center gap-2 px-3 py-1.5 font-semibold">
                  <Icon name="phone" size={18} className="text-brand" />
                  {p.display}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
