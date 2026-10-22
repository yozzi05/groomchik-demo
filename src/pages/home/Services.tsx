import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { salon } from '../../data/salon'
import { rub, servicesFor, type Service, type Species } from '../../data/services'
import { useDemo } from '../../store/demoStore'
import { PriceButton } from '../../components/PriceTable'
import { FurLine, Icon, container } from '../../components/ui'

const tabs: { id: Species; label: string }[] = [
  { id: 'dog', label: 'Собаки' },
  { id: 'cat', label: 'Кошки' },
]

function ServiceRow({ s, species, index }: { s: Service; species: Species; index: number }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setDraft } = useDemo()
  const panelId = `svc-${species}-${s.id}`

  return (
    <li className="border-t border-line first:border-t-0">
      <div className="grid gap-4 py-6 md:grid-cols-[3rem_1fr_auto] md:items-start md:gap-6">
        <span className="hidden font-display text-2xl text-ink-2 md:block" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold sm:text-[1.375rem]">{s.title}</h3>
          <p className="mt-1.5 text-ink-2">{s.result}</p>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full text-[0.9375rem] font-bold text-brand-deep hover:underline"
          >
            {open ? 'Свернуть' : 'Что входит и условия'}
            <Icon name="down" size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 md:flex-col md:items-end md:text-right">
          <div>
            <p className="text-lg font-extrabold">{s.priceFrom ? `от ${rub(s.priceFrom)}` : 'Уточнить стоимость'}</p>
            <p className="text-[0.875rem] text-ink-2">по прайсу салона</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setDraft({ species, serviceId: s.id, step: 1 }, true)
              navigate('/zapis')
            }}
          >
            Выбрать
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="pb-7 md:pl-[4.5rem]">
        <div className="grid gap-6 rounded-[1.25rem] bg-cream p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h4 className="font-bold">Что входит</h4>
            <ul className="mt-3 space-y-2">
              {s.includes.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Icon name="check" size={18} className="mt-1 text-brand" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 text-[0.9375rem]">
            {s.duration && (
              <p className="flex gap-2">
                <Icon name="clock" size={18} className="mt-0.5 text-brand" />
                <span>
                  <b>Длительность:</b> {s.duration}
                </span>
              </p>
            )}
            {s.notes?.map((n) => (
              <p key={n} className="flex gap-2">
                <Icon name="info" size={18} className="mt-0.5 text-brand" />
                {n}
              </p>
            ))}
            <p className="flex gap-2">
              <Icon name="info" size={18} className="mt-0.5 text-brand" />
              Стоимость зависит от породы, размера, состояния шерсти и опыта мастера; цены указаны без учёта колтунов.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {s.tables && <PriceButton service={s} />}
              <a href={`tel:${salon.phones[0].tel}`} className="btn btn-sm border border-line bg-paper hover:bg-milk">
                Уточнить стоимость
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Services() {
  const [tab, setTab] = useState<Species>('dog')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    setTab(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className={`${container} py-16 lg:py-24`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Услуги и цены</p>
          <h2 id="services-title" className="display mt-3 text-4xl sm:text-5xl">
            Уход по породе <em>и&nbsp;характеру</em>
          </h2>
          <FurLine className="mt-3 w-28 text-butter" />
        </div>
        <div role="tablist" aria-label="Для кого услуги" className="inline-flex self-start rounded-full border border-line bg-paper p-1.5 md:self-auto">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onKeyDown={(e) => onKey(e, i)}
              onClick={() => setTab(t.id)}
              className={`min-h-11 rounded-full px-6 text-[1rem] font-bold transition-colors ${tab === t.id ? 'bg-ink text-white' : 'text-ink hover:bg-cream'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id} className="mt-8">
          <ul className="rounded-[1.75rem] border border-line bg-paper px-5 sm:px-8">
            {servicesFor(t.id).map((s, i) => (
              <ServiceRow key={s.id} s={s} species={t.id} index={i} />
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-5 flex gap-2 text-[0.9375rem] text-ink-2">
        <Icon name="info" size={18} className="mt-0.5 shrink-0" />
        Цены — по прайс-листам на сайте салона; их актуальность и точную стоимость для вашего питомца подтверждает администратор. {salon.prepayment}.
      </p>
    </div>
  )
}
