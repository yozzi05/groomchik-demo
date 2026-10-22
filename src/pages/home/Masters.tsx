import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { masters, type Master } from '../../data/masters'
import { visitRules, visitSteps } from '../../data/salon'
import { useDemo } from '../../store/demoStore'
import { Icon, Img, Modal, container } from '../../components/ui'

function MasterDetails({ m, open, onClose }: { m: Master; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={m.name} size="lg">
      <p className="text-lg font-semibold">
        {m.role} · {m.experience}
      </p>
      <ul className="mt-4 space-y-2">
        {m.details.map((d) => (
          <li key={d} className="flex gap-2.5">
            <Icon name="check" size={18} className="mt-1 text-brand" />
            {d}
          </li>
        ))}
      </ul>
      {m.achievementPhotos && (
        <>
          <h3 className="mt-7 font-bold">Конкурсы и обучение</h3>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {m.achievementPhotos.map((p) => (
              <li key={p.src} className="overflow-hidden rounded-2xl bg-cream">
                <Img src={p.src} alt={p.alt} className="aspect-[3/4] w-full object-cover" />
              </li>
            ))}
          </ul>
        </>
      )}
      {m.certificates && (
        <>
          <h3 className="mt-7 font-bold">Сертификаты</h3>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {m.certificates.map((p) => (
              <li key={p.src} className="overflow-hidden rounded-xl border border-line bg-paper">
                <a href={`${import.meta.env.BASE_URL}img/${p.src}`} target="_blank" rel="noreferrer" aria-label={`${p.alt} — открыть крупно`}>
                  <Img src={p.src} alt={p.alt} className="aspect-[5/7] w-full object-cover" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-6 text-[0.875rem] text-ink-2">Сведения и фотографии — с сайта салона groomchik.ru.</p>
    </Modal>
  )
}

export default function Masters() {
  const [openId, setOpenId] = useState<string>()
  const [rulesOpen, setRulesOpen] = useState(false)
  const navigate = useNavigate()
  const { setDraft } = useDemo()

  return (
    <div className={`${container} py-16 lg:py-24`}>
      <div className="max-w-2xl">
        <p className="eyebrow">Мастера</p>
        <h2 id="masters-title" className="display mt-3 text-4xl sm:text-5xl">
          Познакомьтесь <em>до&nbsp;визита</em>
        </h2>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-14">
        {masters.map((m, i) => (
          <article key={m.id} className={`grid gap-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-end ${i === 1 ? 'md:mt-16' : ''}`}>
            <div className={`${i === 0 ? 'frame-arch bg-butter-soft' : 'frame-leaf bg-brand-soft'} overflow-hidden`}>
              <Img
                src={m.id === 'inna' ? 'inna-480.webp' : 'alena.webp'}
                srcLarge={m.id === 'inna' ? 'inna-835.webp' : undefined}
                sizes="(min-width: 768px) 22vw, 80vw"
                alt={m.photoAlt}
                className={`w-full ${m.id === 'inna' ? 'aspect-[4/5] object-contain object-bottom pt-6' : 'aspect-[4/5] object-cover'}`}
              />
            </div>
            <div>
              <p className="text-[0.9375rem] font-bold text-brand-deep">{m.experience}</p>
              <h3 className="display mt-1 text-3xl">{m.name}</h3>
              <p className="mt-1 font-semibold">{m.role}</p>
              <p className="mt-3 text-ink-2">{m.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setDraft({ masterId: m.id, step: 1 }, true)
                    navigate('/zapis')
                  }}
                >
                  Записаться к мастеру
                </button>
                <button type="button" className="btn btn-sm border border-line bg-paper hover:bg-cream" onClick={() => setOpenId(m.id)}>
                  {m.achievementPhotos ? 'Достижения и сертификаты' : 'Подробнее'}
                </button>
              </div>
            </div>
            <MasterDetails m={m} open={openId === m.id} onClose={() => setOpenId(undefined)} />
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-[1.75rem] bg-ink p-6 text-white sm:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h3 className="display text-3xl sm:text-4xl">Как проходит визит</h3>
          <button type="button" className="btn btn-sm self-start border border-white/40 text-white hover:bg-white hover:text-ink md:self-auto" onClick={() => setRulesOpen(true)}>
            Правила салона
          </button>
        </div>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visitSteps.map((s, i) => (
            <li key={s.title} className="border-t border-white/25 pt-4">
              <span className="font-display text-3xl text-butter">{i + 1}</span>
              <h4 className="mt-2 text-lg font-bold">{s.title}</h4>
              <p className="mt-1.5 text-[0.9375rem] text-white/80">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <Modal open={rulesOpen} onClose={() => setRulesOpen(false)} title="Правила салона">
        <ul className="space-y-3">
          {visitRules.map((r) => (
            <li key={r} className="flex gap-2.5">
              <Icon name="paw" size={18} className="mt-1 text-brand" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[0.875rem] text-ink-2">По материалам страниц услуг и прайс-листов groomchik.ru.</p>
      </Modal>
    </div>
  )
}
