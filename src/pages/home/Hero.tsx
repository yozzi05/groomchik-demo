import { useNavigate } from 'react-router-dom'
import { hero } from '../../data/media'
import { salon, salons } from '../../data/salon'
import { useDemo } from '../../store/demoStore'
import { scrollToSection } from '../../components/SectionLink'
import { FurLine, Icon, Img, container } from '../../components/ui'

export default function Hero() {
  const navigate = useNavigate()
  const { setDraft } = useDemo()

  return (
    <div className="relative overflow-hidden">
      <div className={`${container} grid items-center gap-10 pb-10 pt-8 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:pt-12 lg:pb-14 lg:pt-16`}>
        <div className="relative z-10">
          <p className="eyebrow flex items-center gap-2">
            <Icon name="paw" size={16} className="text-butter" />
            Груминг-салон · Ростов-на-Дону · с {salon.since} года
          </p>
          <h1 className="display mt-5 text-[2.75rem] sm:text-6xl lg:text-[4.5rem]">
            Любимый питомец.
            <br />
            <em className="text-brand-deep">Ухоженный и&nbsp;довольный</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-2 sm:text-xl">
            Стрижка и уход для собак и кошек в Ростове-на-Дону. Поможем подобрать процедуру и познакомим с мастером.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => scrollToSection('finder')}>
              Подобрать уход
              <Icon name="arrow" size={18} />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => scrollToSection('works')}>
              Посмотреть работы
            </button>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-[460px] md:max-w-none">
          <div className="frame-arch relative mx-auto aspect-[4/4.6] w-[88%] bg-butter-soft">
            <svg viewBox="0 0 200 230" className="absolute inset-0 h-full w-full text-butter" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".7">
              <path d="M20 230V100a80 80 0 0 1 160 0v130" />
            </svg>
            <Img src={`${hero.img}-520.webp`} srcLarge={`${hero.img}-900.webp`} sizes="(min-width: 768px) 40vw, 85vw" eager alt={hero.caption} className="absolute bottom-0 left-1/2 h-auto max-h-[94%] w-[94%] -translate-x-1/2 object-contain object-bottom" />
          </div>
          <FurLine className="absolute -left-2 top-10 hidden w-28 text-brand md:block" />
          <figcaption className="relative mx-auto -mt-5 w-fit rounded-full border border-line bg-paper px-4 py-2 text-[0.9375rem] font-semibold shadow-sm">
            {hero.caption}
          </figcaption>
        </figure>
      </div>

      <div className={`${container} pb-12`}>
        <div className="grid gap-3 rounded-[1.5rem] border border-line bg-paper p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          {salons.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setDraft({ salonId: s.id }, true)
                navigate('/zapis')
              }}
              className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-left hover:bg-cream"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-deep">
                <Icon name="pin" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{s.address}</span>
                <span className="block text-[0.9375rem] text-ink-2">
                  {s.name} · {s.district}
                </span>
              </span>
              <span className="hidden items-center gap-1 text-[0.9375rem] font-bold text-brand-deep group-hover:underline lg:inline-flex">
                Выбрать
                <Icon name="chevron" size={16} />
              </span>
            </button>
          ))}
          <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-[0.9375rem] sm:col-span-2 lg:col-span-1">
            <Icon name="clock" className="text-brand-deep" />
            <span>
              {salon.hours.map((h) => (
                <span key={h.days} className="block whitespace-nowrap">
                  <b>{h.days}</b> {h.time}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
