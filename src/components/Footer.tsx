import { Link } from 'react-router-dom'
import { SOURCE_URL, salon, salons, school } from '../data/salon'
import { Icon, Logo, container } from './ui'
import { SectionLink } from './SectionLink'
import { mainNav } from './Header'

export default function Footer({ compact }: { compact?: boolean }) {
  return (
    <footer className={`bg-ink text-white ${compact ? 'pb-20 lg:pb-0' : ''}`}>
      <div className={`${container} grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:py-14`}>
        <div>
          <span className="inline-block rounded-2xl bg-white p-2">
            <Logo size={64} withText={false} />
          </span>
          <p className="mt-4 text-xl font-extrabold">ГрумЧик</p>
          <p className="mt-1 max-w-sm text-white/75">Груминг для собак и кошек в Ростове-на-Дону с {salon.since} года.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {salon.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/30 px-3.5 py-1.5 text-[0.9375rem] font-semibold hover:bg-white hover:text-ink">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-butter">Контакты</h2>
          <ul className="mt-4 space-y-2.5">
            {salon.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="inline-flex items-center gap-2 text-lg font-bold hover:text-butter">
                  <Icon name="phone" size={18} />
                  {p.display}
                </a>
              </li>
            ))}
            {salons.map((s) => (
              <li key={s.id} className="flex gap-2 text-white/85">
                <Icon name="pin" size={18} className="mt-1" />
                <span>
                  {s.address}, {s.district}
                </span>
              </li>
            ))}
            <li className="flex gap-2 text-white/85">
              <Icon name="clock" size={18} className="mt-1" />
              <span>{salon.hours.map((h) => `${h.days} ${h.time}`).join(' · ')}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-butter">Разделы</h2>
          <ul className="mt-4 space-y-2">
            {mainNav.map((n) => (
              <li key={n.section}>
                <SectionLink section={n.section} className="hover:text-butter">
                  {n.label}
                </SectionLink>
              </li>
            ))}
            <li>
              <Link to="/kabinet" className="hover:text-butter">
                Личный кабинет
              </Link>
            </li>
            <li>
              <Link to="/shkola" className="hover:text-butter">
                Школа груминга и документы
              </Link>
            </li>
            <li>
              <a href={school.site.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-butter">
                Сайт школы {school.site.label} <Icon name="external" size={15} />
              </a>
            </li>
            <li>
              <a href={salon.privacyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-butter">
                Политика обработки персональных данных <Icon name="external" size={15} />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className={`${container} flex flex-col gap-2 py-5 text-[0.875rem] text-white/70 md:flex-row md:items-center md:justify-between`}>
          <p>{salon.legal}</p>
          <p>
            Демоверсия нового сайта. Сведения, фото и логотип —{' '}
            <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">
              groomchik.ru
            </a>
            . Заявки и платежи не отправляются.
          </p>
        </div>
      </div>
    </footer>
  )
}
