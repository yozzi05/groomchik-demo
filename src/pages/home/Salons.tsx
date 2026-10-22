import { useNavigate } from 'react-router-dom'
import { salon, salons } from '../../data/salon'
import { useDemo } from '../../store/demoStore'
import { Icon, container } from '../../components/ui'

export default function Salons() {
  const navigate = useNavigate()
  const { setDraft } = useDemo()

  return (
    <div className="border-t border-line bg-paper">
      <div className={`${container} py-16 lg:py-24`}>
        <p className="eyebrow">Салоны</p>
        <h2 id="salons-title" className="display mt-3 text-4xl sm:text-5xl">
          Два адреса <em>в&nbsp;Ростове-на-Дону</em>
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {salons.map((s, i) => (
            <article key={s.id} className="relative overflow-hidden rounded-[1.75rem] border border-line bg-milk p-6 sm:p-8">
              <svg viewBox="0 0 200 120" aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-4 w-48 ${i ? 'text-butter' : 'text-brand'} opacity-50`} fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M10 100c30-10 40-60 80-60s50 40 100 20M30 20c20 10 30 30 30 60M120 10c-5 30 10 50 40 60" />
                <circle cx="150" cy="58" r="6" />
              </svg>
              <p className="text-[0.9375rem] font-bold text-brand-deep">{s.name}</p>
              <h3 className="display mt-2 text-3xl sm:text-[2.25rem]">{s.address}</h3>
              <p className="mt-1 text-ink-2">{s.district}</p>

              <dl className="mt-6 grid gap-3 text-[0.9375rem]">
                <div className="flex gap-3">
                  <dt className="sr-only">Часы работы</dt>
                  <Icon name="clock" size={18} className="mt-0.5 text-brand" />
                  <dd>
                    {salon.hours.map((h) => (
                      <span key={h.days} className="mr-4 inline-block">
                        <b>{h.days}</b> {h.time}
                      </span>
                    ))}
                  </dd>
                </div>
                {s.note && (
                  <div className="flex gap-3">
                    <dt className="sr-only">Особенности</dt>
                    <Icon name="sparkle" size={18} className="mt-0.5 text-brand" />
                    <dd>{s.note}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-7 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setDraft({ salonId: s.id }, true)
                    navigate('/zapis')
                  }}
                >
                  Выбрать этот салон
                </button>
                <a href={s.routeUrl} target="_blank" rel="noreferrer" className="btn btn-sm border border-line bg-paper hover:bg-cream">
                  Маршрут
                  <Icon name="external" size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[1.25rem] bg-cream p-5 text-[0.9375rem] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-brand" />
            {salon.hoursNote} Фотографии салонов на сайте не опубликованы.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-bold">
            {salon.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="whitespace-nowrap hover:text-brand-deep">
                {p.display}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
