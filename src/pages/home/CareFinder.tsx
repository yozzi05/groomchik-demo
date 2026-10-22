import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serviceById, rub, type Species } from '../../data/services'
import { coatOptions, recommend, sizeOptions, taskOptions, type Coat, type Size, type Task } from '../../lib/finder'
import { useDemo } from '../../store/demoStore'
import { Icon, container } from '../../components/ui'

function ChoiceGroup<T extends string>({ legend, options, value, onChange, name }: { legend: string; name: string; options: { id: T; label: string; examples?: string }[]; value?: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[0.9375rem] font-bold">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            name={name}
            onClick={() => onChange(o.id)}
            className={`chip ${o.examples ? 'flex-col !items-start !rounded-2xl text-left' : ''}`}
          >
            <span>{o.label}</span>
            {o.examples && <span className={`text-[0.8125rem] font-medium ${value === o.id ? 'text-white/80' : 'text-ink-2'}`}>{o.examples}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default function CareFinder() {
  const [species, setSpecies] = useState<Species>()
  const [coat, setCoat] = useState<Coat>()
  const [size, setSize] = useState<Size>()
  const [task, setTask] = useState<Task>()
  const navigate = useNavigate()
  const { setDraft } = useDemo()

  const ready = species && coat && task
  const rec = ready ? recommend(species, coat, task) : undefined
  const service = serviceById(rec?.serviceId)
  const alt = serviceById(rec?.altId)

  const pickSpecies = (s: Species) => {
    setSpecies(s)
    setCoat(undefined)
    setSize(undefined)
  }

  const goBook = () => {
    if (!species || !service) return
    const coatLabel = coatOptions[species].find((c) => c.id === coat)?.label.toLowerCase()
    const sizeLabel = sizeOptions[species].find((c) => c.id === size)?.label.toLowerCase()
    const taskLabel = taskOptions.find((t) => t.id === task)?.label.toLowerCase()
    setDraft(
      {
        species,
        serviceId: service.id,
        finderNote: [`шерсть: ${coatLabel}`, sizeLabel && `размер: ${sizeLabel}`, `задача: ${taskLabel}`].filter(Boolean).join('; '),
        step: 1,
      },
      true,
    )
    navigate('/zapis')
  }

  return (
    <div className="border-y border-line bg-cream">
      <div className={`${container} grid gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20`}>
        <div>
          <p className="eyebrow">Подбор ухода · 1 минута</p>
          <h2 id="finder-title" className="display mt-3 text-4xl sm:text-5xl">
            Кого приводим в порядок?
          </h2>
          <p className="mt-3 max-w-xl text-ink-2">Ответьте на три вопроса — подскажем подходящее направление. Телефон не нужен.</p>

          <div className="mt-8 grid gap-7">
            <div className="flex gap-3">
              {(['dog', 'cat'] as Species[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={species === s}
                  onClick={() => pickSpecies(s)}
                  className={`flex min-h-[4.25rem] flex-1 items-center justify-center gap-3 rounded-2xl border-2 px-4 text-lg font-bold transition-colors sm:flex-none sm:px-8 ${
                    species === s ? 'border-ink bg-ink text-white' : 'border-line bg-paper hover:border-ink-2'
                  }`}
                >
                  <Icon name="paw" size={22} className={species === s ? 'text-butter' : 'text-brand'} />
                  {s === 'dog' ? 'Собаку' : 'Кошку'}
                </button>
              ))}
            </div>

            {species && (
              <>
                <ChoiceGroup legend="Какая шерсть?" name="coat" options={coatOptions[species]} value={coat} onChange={setCoat} />
                <ChoiceGroup legend="Размер" name="size" options={sizeOptions[species]} value={size} onChange={setSize} />
                <ChoiceGroup legend="Что нужно сделать?" name="task" options={taskOptions} value={task} onChange={setTask} />
              </>
            )}
          </div>
        </div>

        <div aria-live="polite" className="lg:pt-16">
          {!service ? (
            <div className="hidden h-full min-h-64 flex-col justify-center rounded-[1.75rem] border-2 border-dashed border-line p-8 text-ink-2 lg:flex">
              <Icon name="sparkle" size={28} className="text-butter" />
              <p className="mt-4 text-lg font-semibold text-ink">Здесь появится подсказка</p>
              <p className="mt-1">{!species ? 'Начните с выбора питомца.' : !coat ? 'Выберите тип шерсти.' : 'Выберите задачу.'}</p>
            </div>
          ) : (
            <div className="frame-leaf bg-paper p-7 shadow-[0_1px_0_var(--color-line)] ring-1 ring-line sm:p-9">
              <p className="eyebrow">Подходящее направление</p>
              <h3 className="display mt-2 text-3xl sm:text-4xl">{service.title}</h3>
              <p className="mt-4">{rec!.why}</p>
              {rec!.notes.map((n) => (
                <p key={n} className="mt-3 flex gap-2 text-[0.9375rem] text-ink-2">
                  <Icon name="info" size={18} className="mt-0.5 text-brand" />
                  {n}
                </p>
              ))}
              <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-cream p-4 text-[0.9375rem]">
                <div>
                  <dt className="text-ink-2">По прайсу салона</dt>
                  <dd className="font-bold">{service.priceFrom ? `от ${rub(service.priceFrom)}` : 'Уточнить стоимость'}</dd>
                </div>
                <div>
                  <dt className="text-ink-2">Длительность</dt>
                  <dd className="font-bold">{service.duration ?? 'Уточнит мастер'}</dd>
                </div>
              </dl>
              {alt && <p className="mt-4 text-[0.9375rem] text-ink-2">Также может подойти: <b className="text-ink">{alt.title}</b></p>}
              <button type="button" className="btn btn-primary mt-6 w-full sm:w-auto" onClick={goBook}>
                Перейти к записи
                <Icon name="arrow" size={18} />
              </button>
              <p className="mt-4 text-[0.875rem] text-ink-2">Это подсказка по уходу, а не ветеринарное заключение. Окончательно процедуру подберёт мастер, посмотрев шерсть.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
