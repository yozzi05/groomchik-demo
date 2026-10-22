import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOYALTY_DISCLAIMER } from '../data/loyalty'
import { workById } from '../data/media'
import { masterById, masters } from '../data/masters'
import { salon, salons } from '../data/salon'
import { bonusesText, rub, serviceById, servicesFor, speciesLabel, type Species } from '../data/services'
import { activeCoupon, addPet, bonusBalance, bonusesToEarn, createAppointment, maxBonusSpend, type Appointment, type Payment } from '../lib/model'
import { formatDateTime } from '../lib/time'
import { useDemo, type BookingDraft } from '../store/demoStore'
import { SlotPicker } from '../components/SlotPicker'
import { DemoBadge, Field, Icon, Img, container } from '../components/ui'

const steps = ['Питомец и услуга', 'Салон и мастер', 'Дата и время', 'Подтверждение']

type Errors = Partial<Record<'pet' | 'newPetName' | 'newPetBreed' | 'species' | 'service' | 'salon' | 'master' | 'slot' | 'bonus' | 'submit', string>>

export default function Booking() {
  const { state, draft, setDraft, run, clearDraft } = useDemo()
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<Appointment>()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const step = draft.step ?? 1

  const pet = state.pets.find((p) => p.id === draft.petId)
  const species: Species | undefined = pet?.species ?? draft.species
  const service = serviceById(draft.serviceId)
  const salonObj = salons.find((s) => s.id === draft.salonId)
  const master = draft.masterId === 'any' ? undefined : masterById(draft.masterId)
  const example = workById(draft.exampleId)

  // Preselect the only pet of the chosen species (e.g. after the care finder)
  useEffect(() => {
    if (!draft.petId && draft.species) {
      const matching = state.pets.filter((p) => p.species === draft.species)
      if (matching.length === 1) setDraft({ petId: matching[0].id })
    }
  }, [draft.petId, draft.species, state.pets, setDraft])

  const goStep = (n: number) => {
    setErrors({})
    setDraft({ step: n })
    requestAnimationFrame(() => {
      headingRef.current?.focus()
      headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }

  const validate = (n: number): Errors => {
    const e: Errors = {}
    if (n === 1) {
      if (!draft.petId) e.pet = 'Выберите питомца или добавьте нового.'
      if (draft.petId === 'new') {
        if (!draft.newPetName?.trim()) e.newPetName = 'Укажите имя питомца.'
        if (!draft.species) e.species = 'Выберите вид питомца.'
        if (!draft.newPetBreed?.trim()) e.newPetBreed = 'Укажите породу или «метис».'
      }
      if (!service) e.service = 'Выберите услугу.'
      else if (species && !service.species.includes(species)) e.service = `Услуга «${service.title}» не подходит для вида «${speciesLabel[species].toLowerCase()}». Выберите другую.`
    }
    if (n === 2) {
      if (!draft.salonId) e.salon = 'Выберите салон.'
      if (!draft.masterId) e.master = 'Выберите мастера или «Любой подходящий мастер».'
    }
    if (n === 3 && !draft.start) e.slot = 'Выберите дату и свободное время.'
    return e
  }

  const next = () => {
    const e = validate(step)
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], .field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
      return
    }
    goStep(step + 1)
  }

  // ---- payment (step 4) ----
  const balance = bonusBalance(state)
  const estimate = service?.demoPrice ?? 0
  const maxBonus = maxBonusSpend(estimate, balance)
  const coupon = activeCoupon(state)
  const payKind = draft.payment ?? 'none'
  const bonusAmount = Math.min(draft.bonusAmount ?? maxBonus, maxBonus)
  const payment: Payment =
    payKind === 'bonus' && bonusAmount > 0 ? { kind: 'bonus', amount: bonusAmount } : payKind === 'coupon' && coupon ? { kind: 'coupon', couponId: coupon.id, amount: Math.min(coupon.value, estimate) } : { kind: 'none' }
  const nonCash = payment.kind === 'none' ? 0 : payment.amount

  const confirm = () => {
    for (const n of [1, 2, 3]) {
      const e = validate(n)
      if (Object.keys(e).length) {
        setErrors(e)
        goStep(n)
        return
      }
    }
    if (payKind === 'bonus' && (draft.bonusAmount ?? maxBonus) > maxBonus) {
      setErrors({ bonus: `Максимум к списанию — ${maxBonus}.` })
      return
    }
    const comment = [draft.comment?.trim(), draft.finderNote && `Подбор ухода: ${draft.finderNote}`, example && `Пример работы: ${example.caption}`].filter(Boolean).join('\n')
    const r = run((s) => {
      let st = s
      let petId = draft.petId!
      if (petId === 'new') {
        const added = addPet(st, { name: draft.newPetName ?? '', species: draft.species!, breed: draft.newPetBreed ?? '' })
        st = added.state
        petId = added.pet.id
      }
      const created = createAppointment(st, {
        petId,
        serviceId: service!.id,
        salonId: draft.salonId!,
        masterId: draft.masterId!,
        start: draft.start!,
        estimate,
        payment,
        comment,
        exampleId: draft.exampleId,
      })
      return { state: { ...created.state, entered: true }, value: created.appt }
    })
    if (!r.ok) {
      setErrors({ submit: r.error })
      return
    }
    setDone(r.value)
    clearDraft()
    window.scrollTo({ top: 0 })
  }

  const takenTimes = useMemo(() => state.appointments.filter((a) => a.status === 'upcoming' && a.petId === draft.petId).map((a) => a.start), [state.appointments, draft.petId])

  if (done) return <Success appt={done} onAnother={() => setDone(undefined)} />

  return (
    <div className={`${container} py-8 lg:py-12`}>
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-2 hover:text-ink">
          <Icon name="back" size={18} /> На главную
        </Link>
        <DemoBadge>Демо-запись · в салон не отправляется</DemoBadge>
      </div>
      <h1 className="display mt-4 text-4xl sm:text-5xl">Записать питомца</h1>
      {draft.repeatOf && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-[0.9375rem] text-brand-deep">
          <Icon name="repeat" size={18} className="mt-0.5" /> Повторная запись: питомец и услуга подставлены из прошлого визита. Салон, мастера и дату можно изменить.
        </p>
      )}

      <ol className="mt-7 grid grid-cols-4 gap-2" aria-label="Шаги записи">
        {steps.map((t, i) => {
          const n = i + 1
          const state_ = n < step ? 'done' : n === step ? 'current' : 'todo'
          return (
            <li key={t}>
              <button
                type="button"
                disabled={n > step}
                onClick={() => goStep(n)}
                aria-current={state_ === 'current' ? 'step' : undefined}
                className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
              >
                <span className={`h-1.5 rounded-full ${state_ === 'todo' ? 'bg-line' : 'bg-brand'}`} />
                <span className={`flex items-center gap-1.5 text-[0.8125rem] font-bold sm:text-[0.9375rem] ${state_ === 'current' ? 'text-ink' : 'text-ink-2'}`}>
                  <span className={`hidden h-6 w-6 shrink-0 place-items-center rounded-full text-[0.75rem] sm:grid ${state_ === 'done' ? 'bg-brand text-white' : state_ === 'current' ? 'bg-ink text-white' : 'bg-cream'}`}>
                    {state_ === 'done' ? <Icon name="check" size={14} /> : n}
                  </span>
                  <span className={state_ === 'done' ? 'group-hover:underline' : ''}>
                    <span className="sm:hidden">{n}. </span>
                    <span className={state_ === 'current' ? '' : 'hidden sm:inline'}>{t}</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="rounded-[1.75rem] border border-line bg-paper p-5 sm:p-8">
          <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-28 text-2xl font-extrabold outline-none">
            {step}. {steps[step - 1]}
          </h2>

          {step === 1 && <StepPet draft={draft} setDraft={setDraft} errors={errors} species={species} />}
          {step === 2 && <StepPlace draft={draft} setDraft={setDraft} errors={errors} />}
          {step === 3 && draft.salonId && draft.masterId && (
            <div className="mt-6">
              <SlotPicker
                salonId={draft.salonId}
                masterId={draft.masterId}
                day={draft.day}
                start={draft.start}
                taken={takenTimes}
                onDay={(d) => setDraft({ day: d, start: draft.start?.startsWith(d) ? draft.start : undefined })}
                onStart={(iso) => {
                  setDraft({ start: iso })
                  setErrors({})
                }}
                error={errors.slot}
              />
            </div>
          )}
          {step === 4 && service && (
            <div className="mt-6 space-y-7">
              <section aria-labelledby="pay-title">
                <h3 id="pay-title" className="text-lg font-bold">
                  Стоимость
                </h3>
                <p className="mt-2">
                  Итоговую стоимость согласует администратор: она зависит от породы, состояния шерсти и мастера.
                  {service.priceFrom ? ` По прайсу салона — от ${rub(service.priceFrom)}.` : ' Цена по этой услуге не опубликована.'}
                </p>
                <p className="mt-2 flex gap-2 text-[0.9375rem] text-ink-2">
                  <Icon name="info" size={18} className="mt-0.5 shrink-0" />
                  На сайте салона указано: «{salon.prepayment}». В демо оплата не подключена и не имитируется.
                </p>
              </section>

              <section aria-labelledby="bonus-title" className="rounded-[1.25rem] bg-butter-soft p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 id="bonus-title" className="text-lg font-bold">
                    Бонусы и купон
                  </h3>
                  <DemoBadge>{LOYALTY_DISCLAIMER}</DemoBadge>
                </div>
                <p className="mt-2 text-[0.9375rem]">
                  Для расчёта используется <b>примерная сумма {rub(estimate)}</b> — она условная и не является ценой салона. На балансе: <b>{bonusesText(balance)}</b>.
                </p>
                <div role="radiogroup" aria-label="Способ скидки" className="mt-4 grid gap-2">
                  <PayOption checked={payKind === 'none'} onSelect={() => setDraft({ payment: 'none' })} title="Без скидки" text="Бонусы останутся на балансе" />
                  <PayOption
                    checked={payKind === 'bonus'}
                    disabled={maxBonus === 0}
                    onSelect={() => setDraft({ payment: 'bonus', bonusAmount: maxBonus })}
                    title="Списать бонусы"
                    text={
                      balance === 0
                        ? 'На балансе пока 0 бонусов — они начисляются после завершённого визита'
                        : maxBonus < Math.floor(estimate * 0.2)
                          ? `Доступно к списанию: ${maxBonus} из ${Math.floor(estimate * 0.2)} — на балансе меньше лимита 20%`
                          : `Максимум к списанию: ${maxBonus} — это 20% примерной суммы`
                    }
                  />
                  {payKind === 'bonus' && maxBonus > 0 && (
                    <div className="ml-11 max-w-xs">
                      <Field label="Сколько бонусов списать" hint={`От 1 до ${maxBonus}`} error={errors.bonus}>
                        {(p) => (
                          <input
                            {...p}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={maxBonus}
                            className="input"
                            value={draft.bonusAmount ?? maxBonus}
                            onChange={(e) => {
                              const v = Math.floor(Number(e.target.value))
                              setDraft({ bonusAmount: Number.isFinite(v) ? Math.max(0, v) : 0 })
                              setErrors(v > maxBonus ? { bonus: `Максимум к списанию — ${maxBonus}.` } : {})
                            }}
                          />
                        )}
                      </Field>
                    </div>
                  )}
                  <PayOption
                    checked={payKind === 'coupon'}
                    disabled={!coupon}
                    onSelect={() => setDraft({ payment: 'coupon' })}
                    title={`Купон ${rub(coupon?.value ?? 300)}`}
                    text={coupon ? 'Купон за пять визитов. Не суммируется со списанием бонусов' : 'Появится после пятого завершённого визита'}
                  />
                </div>
                <dl className="mt-5 grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-[#e8d9a6] pt-4 text-[0.9375rem]">
                  <dt>Примерная сумма</dt>
                  <dd className="text-right tabular-nums">{rub(estimate)}</dd>
                  <dt>Скидка бонусами или купоном</dt>
                  <dd className="text-right tabular-nums">−{rub(nonCash)}</dd>
                  <dt className="font-bold">Деньгами (условно)</dt>
                  <dd className="text-right font-bold tabular-nums">{rub(estimate - nonCash)}</dd>
                  <dt className="text-brand-deep">Начислится после визита</dt>
                  <dd className="text-right font-bold text-brand-deep tabular-nums">+{bonusesToEarn(estimate, payment)}</dd>
                </dl>
              </section>

              <section aria-labelledby="contact-title">
                <h3 id="contact-title" className="text-lg font-bold">
                  Контакты
                </h3>
                <p className="mt-2 text-[0.9375rem] text-ink-2">Из демо-профиля. Данные вымышленные, вводить настоящие не нужно.</p>
                <p className="mt-2 font-semibold">
                  {state.profile.name} · {state.profile.phone}
                </p>
              </section>

              {errors.submit && (
                <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 font-semibold text-danger">
                  {errors.submit}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            {step > 1 ? (
              <button type="button" className="btn btn-ghost" onClick={() => goStep(step - 1)}>
                <Icon name="back" size={18} /> Назад
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Далее <Icon name="arrow" size={18} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={confirm}>
                Подтвердить демо-запись
              </button>
            )}
          </div>
        </div>

        <aside aria-label="Резюме записи" className="rounded-[1.75rem] bg-ink p-6 text-white lg:sticky lg:top-24">
          <h2 className="font-bold text-butter">Ваша запись</h2>
          <dl className="mt-4 space-y-3 text-[0.9375rem]">
            <SummaryRow label="Питомец" value={pet ? `${pet.name}, ${pet.breed}` : draft.petId === 'new' ? draft.newPetName || 'Новый питомец' : undefined} onEdit={step > 1 ? () => goStep(1) : undefined} />
            <SummaryRow label="Услуга" value={service?.title} onEdit={step > 1 ? () => goStep(1) : undefined} />
            <SummaryRow label="Салон" value={salonObj ? `${salonObj.address}` : undefined} onEdit={step > 2 ? () => goStep(2) : undefined} />
            <SummaryRow label="Мастер" value={draft.masterId === 'any' ? 'Любой подходящий' : master?.name} onEdit={step > 2 ? () => goStep(2) : undefined} />
            <SummaryRow label="Дата и время" value={draft.start ? formatDateTime(draft.start) : undefined} onEdit={step > 3 ? () => goStep(3) : undefined} />
          </dl>
          {example && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
              <Img src={`${example.img}.webp`} alt="" className="h-16 w-14 rounded-xl bg-butter-soft object-contain" />
              <p className="text-[0.875rem]">
                Пример: {example.caption}
                <button type="button" className="mt-1 block font-semibold text-butter underline" onClick={() => setDraft({ exampleId: undefined })}>
                  Убрать пример
                </button>
              </p>
            </div>
          )}
          <p className="mt-5 border-t border-white/20 pt-4 text-[0.875rem] text-white/75">Запись сохранится только в демо-кабинете в этом браузере.</p>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, onEdit }: { label: string; value?: string; onEdit?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-white/65">{label}</dt>
        <dd className={value ? 'font-semibold' : 'text-white/50'}>{value ?? 'не выбрано'}</dd>
      </div>
      {onEdit && value && (
        <button type="button" onClick={onEdit} className="shrink-0 rounded-full px-2 py-1 text-[0.8125rem] font-bold text-butter underline" aria-label={`Изменить: ${label.toLowerCase()}`}>
          Изменить
        </button>
      )}
    </div>
  )
}

function PayOption({ checked, disabled, onSelect, title, text }: { checked: boolean; disabled?: boolean; onSelect: () => void; title: string; text: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-2xl border-2 bg-paper px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60 ${checked ? 'border-ink' : 'border-transparent'}`}
    >
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${checked ? 'border-ink bg-ink' : 'border-ink-2'}`}>{checked && <span className="h-2 w-2 rounded-full bg-white" />}</span>
      <span>
        <b className="block">{title}</b>
        <span className="text-[0.875rem] text-ink-2">{text}</span>
      </span>
    </button>
  )
}

// ---------- Step 1 ----------

function StepPet({ draft, setDraft, errors, species }: { draft: BookingDraft; setDraft: (p: BookingDraft) => void; errors: Errors; species?: Species }) {
  const { state } = useDemo()
  const list = species ? servicesFor(species) : []

  return (
    <div className="mt-6 space-y-8">
      <fieldset>
        <legend className="field-label">Питомец</legend>
        <p className="field-hint -mt-1 mb-3">Питомцы из демо-кабинета. Можно добавить нового — он появится в кабинете после подтверждения.</p>
        <div role="radiogroup" aria-label="Питомец" aria-invalid={!!errors.pet} className="grid gap-2 sm:grid-cols-2">
          {state.pets.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={draft.petId === p.id}
              onClick={() => setDraft({ petId: p.id, species: p.species, serviceId: serviceById(draft.serviceId)?.species.includes(p.species) ? draft.serviceId : undefined })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${draft.petId === p.id ? 'border-ink bg-cream' : 'border-line hover:border-ink-2'}`}
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${p.species === 'dog' ? 'bg-brand-soft text-brand-deep' : 'bg-butter-soft text-[#6b4e00]'}`}>
                <Icon name="paw" />
              </span>
              <span>
                <b className="block">{p.name}</b>
                <span className="text-[0.875rem] text-ink-2">
                  {speciesLabel[p.species]} · {p.breed}
                </span>
              </span>
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={draft.petId === 'new'}
            onClick={() => setDraft({ petId: 'new' })}
            className={`flex items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3 text-left ${draft.petId === 'new' ? 'border-ink bg-cream' : 'border-line hover:border-ink-2'}`}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream">
              <Icon name="plus" />
            </span>
            <b>Другой питомец</b>
          </button>
        </div>
        {errors.pet && <p className="field-error">{errors.pet}</p>}
      </fieldset>

      {draft.petId === 'new' && (
        <div className="grid gap-4 rounded-[1.25rem] bg-cream p-4 sm:grid-cols-2 sm:p-5">
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Вид</legend>
            <div className="flex gap-2">
              {(['dog', 'cat'] as Species[]).map((s) => (
                <button key={s} type="button" aria-pressed={draft.species === s} className="chip" onClick={() => setDraft({ species: s, serviceId: serviceById(draft.serviceId)?.species.includes(s) ? draft.serviceId : undefined })}>
                  {speciesLabel[s]}
                </button>
              ))}
            </div>
            {errors.species && <p className="field-error">{errors.species}</p>}
          </fieldset>
          <Field label="Имя питомца" error={errors.newPetName}>
            {(p) => <input {...p} className="input" autoComplete="off" maxLength={30} value={draft.newPetName ?? ''} onChange={(e) => setDraft({ newPetName: e.target.value })} />}
          </Field>
          <Field label="Порода" hint="Если не знаете — напишите «метис»" error={errors.newPetBreed}>
            {(p) => <input {...p} className="input" autoComplete="off" value={draft.newPetBreed ?? ''} onChange={(e) => setDraft({ newPetBreed: e.target.value })} />}
          </Field>
        </div>
      )}

      <fieldset>
        <legend className="field-label">Услуга</legend>
        {!species ? (
          <p className="rounded-2xl bg-cream px-4 py-3 text-ink-2">Сначала выберите питомца — покажем подходящие услуги.</p>
        ) : (
          <div role="radiogroup" aria-label="Услуга" aria-invalid={!!errors.service} className="grid gap-2 sm:grid-cols-2">
            {list.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={draft.serviceId === s.id}
                onClick={() => setDraft({ serviceId: s.id })}
                className={`rounded-2xl border-2 px-4 py-3 text-left ${draft.serviceId === s.id ? 'border-ink bg-cream' : 'border-line hover:border-ink-2'}`}
              >
                <b className="block">{s.title}</b>
                <span className="text-[0.875rem] text-ink-2">{s.priceFrom ? `по прайсу от ${rub(s.priceFrom)}` : 'Уточнить стоимость'}</span>
              </button>
            ))}
          </div>
        )}
        {errors.service && <p className="field-error">{errors.service}</p>}
      </fieldset>

      {draft.finderNote && (
        <p className="flex items-start gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-[0.9375rem] text-brand-deep">
          <Icon name="sparkle" size={18} className="mt-0.5" />
          <span>
            Из подбора ухода: {draft.finderNote}.{' '}
            <button type="button" className="font-bold underline" onClick={() => setDraft({ finderNote: undefined })}>
              Не передавать
            </button>
          </span>
        </p>
      )}

      <Field label="Пожелания к уходу" optional hint="Например: характер питомца, колтуны, желаемая длина шерсти">
        {(p) => <textarea {...p} rows={3} className="input" value={draft.comment ?? ''} onChange={(e) => setDraft({ comment: e.target.value })} />}
      </Field>
    </div>
  )
}

// ---------- Step 2 ----------

function StepPlace({ draft, setDraft, errors }: { draft: BookingDraft; setDraft: (p: BookingDraft) => void; errors: Errors }) {
  const reset = { day: undefined, start: undefined }
  return (
    <div className="mt-6 space-y-8">
      <fieldset>
        <legend className="field-label">Салон</legend>
        <div role="radiogroup" aria-label="Салон" className="grid gap-2 sm:grid-cols-2">
          {salons.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={draft.salonId === s.id}
              onClick={() => setDraft({ salonId: s.id, ...reset })}
              className={`rounded-2xl border-2 px-4 py-3 text-left ${draft.salonId === s.id ? 'border-ink bg-cream' : 'border-line hover:border-ink-2'}`}
            >
              <b className="block">{s.address}</b>
              <span className="text-[0.875rem] text-ink-2">
                {s.name} · {s.district}
              </span>
            </button>
          ))}
        </div>
        {errors.salon && <p className="field-error">{errors.salon}</p>}
      </fieldset>

      <fieldset>
        <legend className="field-label">Мастер</legend>
        <div role="radiogroup" aria-label="Мастер" className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            role="radio"
            aria-checked={draft.masterId === 'any'}
            onClick={() => setDraft({ masterId: 'any', ...reset })}
            className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${draft.masterId === 'any' ? 'border-ink bg-cream' : 'border-line hover:border-ink-2'}`}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-deep">
              <Icon name="paw" />
            </span>
            <span>
              <b className="block">Любой подходящий мастер</b>
              <span className="text-[0.875rem] text-ink-2">Больше свободного времени</span>
            </span>
          </button>
          {masters.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={draft.masterId === m.id}
              onClick={() => setDraft({ masterId: m.id, ...reset })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${draft.masterId === m.id ? 'border-ink bg-cream' : 'border-line hover:border-ink-2'}`}
            >
              <Img src={m.id === 'inna' ? 'inna-480.webp' : 'alena.webp'} alt="" className="h-12 w-12 shrink-0 rounded-full bg-butter-soft object-cover object-top" />
              <span>
                <b className="block">{m.name}</b>
                <span className="text-[0.875rem] text-ink-2">{m.experience}</span>
              </span>
            </button>
          ))}
        </div>
        {errors.master && <p className="field-error">{errors.master}</p>}
        <p className="field-hint mt-3">В каком салоне работает мастер в выбранный день, подтвердит администратор. Стоимость полного комплекса в прайсе зависит от опыта мастера.</p>
      </fieldset>
    </div>
  )
}

// ---------- Success ----------

function Success({ appt, onAnother }: { appt: Appointment; onAnother: () => void }) {
  const navigate = useNavigate()
  const service = serviceById(appt.serviceId)
  const s = salons.find((x) => x.id === appt.salonId)
  const m = appt.masterId === 'any' ? 'Любой подходящий мастер' : masterById(appt.masterId)?.name
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => ref.current?.focus(), [])

  return (
    <div className={`${container} py-12 lg:py-16`}>
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-line bg-paper p-6 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok-soft text-ok">
          <Icon name="check" size={32} />
        </span>
        <h1 ref={ref} tabIndex={-1} className="display mt-5 text-4xl outline-none">
          {appt.pet.name} записан{appt.pet.species === 'cat' ? 'а' : ''}
        </h1>
        <p role="status" className="mx-auto mt-3 max-w-md rounded-2xl bg-butter-soft px-4 py-3 font-semibold text-[#5e4500]">
          Демо-запись сохранена. В салон заявка не отправлена.
        </p>
        <dl className="mt-7 grid gap-3 text-left sm:grid-cols-2">
          {[
            ['Питомец', appt.pet.name],
            ['Услуга', service?.title],
            ['Место', s ? `${s.name}, ${s.address}` : ''],
            ['Мастер', m],
            ['Дата и время', formatDateTime(appt.start)],
            ['Стоимость', 'Согласуется с администратором'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-cream px-4 py-3">
              <dt className="text-[0.875rem] text-ink-2">{k}</dt>
              <dd className="font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        {appt.payment.kind !== 'none' && (
          <p className="mt-4 text-[0.9375rem] text-ink-2">
            {appt.payment.kind === 'bonus' ? `Зарезервировано: ${bonusesText(appt.payment.amount)}` : `Зарезервирован купон ${rub(appt.payment.amount)}`} — вернётся при отмене.
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/kabinet/zapisi')}>
            Открыть мои записи
          </button>
          <button type="button" className="btn btn-ghost" onClick={onAnother}>
            Записать ещё
          </button>
        </div>
      </div>
    </div>
  )
}
