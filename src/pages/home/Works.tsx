import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workTags, works, type Work, type WorkTag } from '../../data/media'
import { serviceById, type Species } from '../../data/services'
import { useDemo } from '../../store/demoStore'
import { Icon, Img, Modal, container } from '../../components/ui'

type Filter = 'all' | Species | WorkTag

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'dog', label: 'Собаки' },
  { id: 'cat', label: 'Кошки' },
  { id: 'haircut', label: workTags.haircut },
  { id: 'creative', label: workTags.creative },
  { id: 'care', label: workTags.care },
  { id: 'molt', label: workTags.molt },
]

export default function Works() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string>()
  const navigate = useNavigate()
  const { setDraft } = useDemo()

  const list = useMemo(() => works.filter((w) => filter === 'all' || w.species === filter || w.tag === filter), [filter])
  const idx = list.findIndex((w) => w.id === openId)
  const current: Work | undefined = list[idx]

  const step = (d: number) => setOpenId(list[(idx + d + list.length) % list.length].id)

  const wantSimilar = (w: Work) => {
    setDraft({ species: w.species, serviceId: w.serviceId, exampleId: w.id, step: 1 }, true)
    navigate('/zapis')
  }

  return (
    <div className="bg-paper">
      <div className={`${container} py-16 lg:py-24`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Наши работы</p>
            <h2 id="works-title" className="display mt-3 text-4xl sm:text-5xl">
              Работы мастеров <em>и&nbsp;креативный груминг</em>
            </h2>
            <p className="mt-3 max-w-2xl text-ink-2">Фотографии с сайта салона в едином оформлении. Нажмите на фото, чтобы рассмотреть его и записаться на похожий уход.</p>
          </div>
        </div>

        <div role="group" aria-label="Фильтр работ" className="mt-7 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} className="chip" onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Показано работ: {list.length}
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-5" aria-label="Работы">
          {list.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => setOpenId(w.id)} className="group block w-full text-left">
                <span className={`block aspect-[4/5] overflow-hidden rounded-[1.25rem] ${w.cutout ? 'bg-butter-soft' : 'bg-cream'}`}>
                  <Img
                    src={`${w.img}.webp`}
                    alt={w.caption}
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                    className={`h-full w-full transition-transform duration-300 group-hover:scale-[1.04] ${w.cutout ? 'object-contain object-bottom px-4 pt-5 sm:px-5 sm:pt-6' : 'object-cover'}`}
                  />
                </span>
                <span className="mt-2.5 flex items-start justify-between gap-2 text-[0.9375rem] font-semibold leading-snug">
                  <span className="line-clamp-2">{w.caption}</span>
                  <Icon name="arrow" size={16} className="mt-0.5 shrink-0 text-brand opacity-60 group-hover:opacity-100" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={!!current} onClose={() => setOpenId(undefined)} title={current?.caption ?? ''} size="lg">
        {current && (
          <div
            className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') step(1)
              if (e.key === 'ArrowLeft') step(-1)
            }}
          >
            <div className={`grid place-items-center overflow-hidden rounded-2xl ${current.cutout ? 'bg-butter-soft p-6' : 'bg-cream'}`}>
              <Img src={`${current.large}.webp`} alt={current.caption} className="max-h-[60dvh] w-auto object-contain" eager />
            </div>
            <div>
              <p className="eyebrow">{workTags[current.tag]}</p>
              <p className="mt-2 text-lg">Похожий уход: <b>{serviceById(current.serviceId)?.title}</b></p>
              <p className="mt-3 text-[0.9375rem] text-ink-2">Мастер посмотрит шерсть вашего питомца и скажет, какой результат реально получить. Фото примера добавится к записи.</p>
              <button type="button" className="btn btn-primary mt-5 w-full" onClick={() => wantSimilar(current)}>
                Хочу похожую стрижку
              </button>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button type="button" className="btn btn-sm border border-line" onClick={() => step(-1)} aria-label="Предыдущая работа">
                  <Icon name="back" size={18} /> Назад
                </button>
                <span className="text-[0.875rem] text-ink-2">
                  {idx + 1} из {list.length}
                </span>
                <button type="button" className="btn btn-sm border border-line" onClick={() => step(1)} aria-label="Следующая работа">
                  Дальше <Icon name="arrow" size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
