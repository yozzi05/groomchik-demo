import { Link } from 'react-router-dom'
import { driveUrl, salon, school, schoolDocs } from '../data/salon'
import { Icon, Img, asset, container } from '../components/ui'

export default function School() {
  return (
    <div>
      <div className={`${container} grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16`}>
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-2 hover:text-ink">
            <Icon name="back" size={18} /> К салону
          </Link>
          <p className="eyebrow mt-6">Отдельное направление</p>
          <h1 className="display mt-3 text-4xl sm:text-6xl">
            Школа груминга <em>«ГрумЧик»</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            Лицензированная школа стрижки собак и кошек. Основатель и преподаватель — Инна Бродилова. Курс «Груминг с нуля» для тех, кто хочет освоить профессию.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={school.site.url} target="_blank" rel="noreferrer" className="btn btn-primary">
              Сайт школы {school.site.label} <Icon name="external" size={17} />
            </a>
            <a href={school.programDoc} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Программа «Основы груминга»
            </a>
          </div>
        </div>
        <div className="frame-leaf bg-cream">
          <Img src="school-forum.webp" alt="Инна Бродилова и коллеги на Международном форуме грумеров «Петергрум 2025»" eager className="w-full object-cover" />
        </div>
      </div>

      <div className="border-y border-line bg-paper">
        <div className={`${container} grid gap-8 py-12 md:grid-cols-3`}>
          {[
            ['Программа', school.program],
            ['Формат и срок', `${school.format}. ${school.hoursText}.`],
            ['Адрес учебного центра', school.address],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="eyebrow">{k}</p>
              <p className="mt-2">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${container} grid gap-10 py-12 lg:grid-cols-[1fr_300px] lg:py-16`}>
        <section aria-labelledby="docs-title">
          <h2 id="docs-title" className="display text-3xl sm:text-4xl">
            Сведения об образовательной организации
          </h2>
          <p className="mt-3 text-ink-2">Основные документы школы. Полный перечень опубликован на groomchik.ru; файлы открываются в Google Drive.</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            <li>
              <a href={school.contractDoc} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 font-semibold hover:border-ink-2">
                Договор на обучение по платным программам
                <Icon name="external" size={16} className="text-ink-2" />
              </a>
            </li>
            {schoolDocs.map((d) => (
              <li key={d.id}>
                <a href={driveUrl(d.id)} target="_blank" rel="noreferrer" className="flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 font-semibold hover:border-ink-2">
                  {d.title}
                  <Icon name="external" size={16} className="shrink-0 text-ink-2" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.9375rem] text-ink-2">
            {salon.legal}. Политика обработки персональных данных —{' '}
            <a href={salon.privacyUrl} className="link" target="_blank" rel="noreferrer">
              на сайте салона
            </a>
            .
          </p>
        </section>
        <aside>
          <h2 className="font-bold">Образец сертификата</h2>
          <a href={asset('school-cert-sample.jpg')} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-2xl border border-line bg-paper" aria-label="Образец сертификата школы — открыть крупно">
            <Img src="school-cert-sample.jpg" alt="Образец сертификата школы стрижки животных ГрумЧик" className="w-full" />
          </a>
          <p className="mt-3 text-[0.9375rem] text-ink-2">Стоимость и ближайшие даты курса уточняйте по телефону {salon.phones[0].display}.</p>
        </aside>
      </div>
    </div>
  )
}
