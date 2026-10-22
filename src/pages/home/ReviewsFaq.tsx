import { useState, type ReactNode } from 'react'
import { SOURCE_URL, promosNote, publishedPromos, reviews, salon, visitRules } from '../../data/salon'
import { Icon, Modal, asset, container } from '../../components/ui'

function Promos() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <p>
        В прайс-листе салона опубликованы скидки для щенков и котят, на третьего питомца, в день рождения и накопительная визитка.{' '}
        <button type="button" className="link font-semibold" onClick={() => setOpen(true)}>
          Посмотреть условия
        </button>
      </p>
      <Modal open={open} onClose={() => setOpen(false)} title="Акции из прайс-листа салона">
        <ul className="space-y-3">
          {publishedPromos.map((p) => (
            <li key={p.text} className="flex gap-4 rounded-2xl bg-cream p-4">
              <b className="w-16 shrink-0 font-display text-2xl text-brand-deep">{p.value}</b>
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.9375rem] text-ink-2">{promosNote}</p>
        <a href={asset('price-promo.jpg')} target="_blank" rel="noreferrer" className="link mt-3 inline-block font-semibold">
          Исходное изображение «Акции и скидки»
        </a>
      </Modal>
    </>
  )
}

const faq: { q: string; a: ReactNode }[] = [
  {
    q: 'Как подготовить питомца к визиту?',
    a: (
      <ul className="list-disc space-y-1.5 pl-5">
        {visitRules.slice(0, 2).map((r) => (
          <li key={r}>{r}</li>
        ))}
        <li>Расскажите администратору о характере питомца, колтунах и пожеланиях к стрижке — так проще подобрать время и мастера.</li>
      </ul>
    ),
  },
  {
    q: 'Сколько длится процедура?',
    a: 'По прайсу салона: купание кошки — 30–60 минут, экспресс-линька собак — от 1,5 до 6 часов в зависимости от породы, тримминг — 2,5–5 часов. Время для вашего питомца уточнит администратор при записи.',
  },
  {
    q: 'Сколько стоит уход?',
    a: 'Стоимость зависит от породы, размера, состояния шерсти и опыта мастера. Таблицы по породам — в разделе «Услуги и цены». Цены в прайсе указаны без учёта колтунов; точную сумму называет администратор.',
  },
  {
    q: 'Как выбрать процедуру?',
    a: 'Воспользуйтесь подбором ухода выше или опишите задачу администратору. Окончательно мастер подскажет на месте, посмотрев шерсть.',
  },
  {
    q: 'Какие условия записи?',
    a: `${salon.prepayment} — так указано на сайте салона. Порядок оплаты, переноса и отмены уточняйте у администратора.`,
  },
  {
    q: 'Используете ли вы успокоительные?',
    a: 'Нет. На сайте салона указано: все процедуры проводятся без наркоза и седативных средств. Салон работает с животными, которые не проявляют агрессию.',
  },
  { q: 'Есть ли скидки?', a: <Promos /> },
]

export default function ReviewsFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className={`${container} grid gap-14 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24`}>
      <div>
        <p className="eyebrow">Отзывы</p>
        <h2 id="reviews-title" className="display mt-3 text-4xl sm:text-5xl">
          Что говорят <em>владельцы</em>
        </h2>
        <ul className="mt-8 space-y-6">
          {reviews.map((r, i) => (
            <li key={r.quote} className={`border-l-2 pl-5 ${i % 2 ? 'border-butter' : 'border-brand'}`}>
              <blockquote className="font-display text-[1.375rem] leading-snug sm:text-2xl">«{r.quote}»</blockquote>
              <p className="mt-2 text-[0.875rem] text-ink-2">
                Видеоотзыв клиента ({r.length}),{' '}
                <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="link">
                  groomchik.ru
                </a>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow">Вопросы</p>
        <h2 className="display mt-3 text-4xl sm:text-5xl">Перед первым визитом</h2>
        <div className="mt-8 divide-y divide-line rounded-[1.5rem] border border-line bg-paper">
          {faq.map((f, i) => (
            <div key={f.q}>
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={open === i}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[1.0625rem] font-bold sm:px-6"
                >
                  {f.q}
                  <Icon name="down" className={`text-brand transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={open !== i} className="px-5 pb-5 text-ink-2 sm:px-6">
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
