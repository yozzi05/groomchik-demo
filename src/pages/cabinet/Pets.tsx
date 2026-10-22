import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { speciesLabel, type Species } from '../../data/services'
import { addPet, deletePet, updatePet, validatePet, type Pet, type PetInput } from '../../lib/model'
import { useDemo } from '../../store/demoStore'
import { DemoBadge, Field, Icon, Modal, useToast } from '../../components/ui'

const blank: PetInput = { name: '', species: 'dog', breed: '', birthDate: '', weight: '', wishes: '' }

function ageText(birth?: string) {
  if (!birth) return undefined
  const b = new Date(birth)
  const now = new Date()
  let months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth()
  if (now.getDate() < b.getDate()) months--
  if (months < 0) return undefined
  const y = Math.floor(months / 12)
  const m = months % 12
  const yw = y % 10 === 1 && y % 100 !== 11 ? 'год' : [2, 3, 4].includes(y % 10) && ![12, 13, 14].includes(y % 100) ? 'года' : 'лет'
  return y ? `${y} ${yw}${m ? ` ${m} мес.` : ''}` : `${m} мес.`
}

function PetForm({ initial, onCancel, onSave, submitLabel }: { initial: PetInput; onCancel: () => void; onSave: (p: PetInput) => string | undefined; submitLabel: string }) {
  const [v, setV] = useState<PetInput>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof PetInput, string>>>({})
  const [submitError, setSubmitError] = useState<string>()
  const set = (patch: Partial<PetInput>) => setV((x) => ({ ...x, ...patch }))

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const clean = { ...v, birthDate: v.birthDate || undefined, weight: v.weight?.trim() || undefined, wishes: v.wishes?.trim() || undefined }
        const errs = validatePet(clean)
        setErrors(errs)
        if (Object.keys(errs).length) {
          ;(e.currentTarget.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus()
          return
        }
        setSubmitError(onSave(clean))
      }}
      className="grid gap-5 sm:grid-cols-2"
    >
      <Field label="Имя" error={errors.name}>
        {(p) => <input {...p} className="input" maxLength={30} autoComplete="off" value={v.name} onChange={(e) => set({ name: e.target.value })} />}
      </Field>
      <fieldset>
        <legend className="field-label">Вид</legend>
        <div className="flex gap-2">
          {(['dog', 'cat'] as Species[]).map((s) => (
            <button key={s} type="button" aria-pressed={v.species === s} className="chip" onClick={() => set({ species: s })}>
              {speciesLabel[s]}
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Порода" hint="Если не знаете — «метис»" error={errors.breed}>
        {(p) => <input {...p} className="input" autoComplete="off" value={v.breed} onChange={(e) => set({ breed: e.target.value })} />}
      </Field>
      <Field label="Дата рождения" optional error={errors.birthDate}>
        {(p) => <input {...p} type="date" className="input" max={new Date().toISOString().slice(0, 10)} value={v.birthDate ?? ''} onChange={(e) => set({ birthDate: e.target.value })} />}
      </Field>
      <Field label="Вес, кг" optional hint="Например, 4,5" error={errors.weight}>
        {(p) => <input {...p} inputMode="decimal" className="input" value={v.weight ?? ''} onChange={(e) => set({ weight: e.target.value })} />}
      </Field>
      <div className="sm:col-span-2">
        <Field label="Пожелания к уходу" optional hint="Характер, чувствительные зоны, желаемая длина шерсти">
          {(p) => <textarea {...p} rows={3} className="input" value={v.wishes ?? ''} onChange={(e) => set({ wishes: e.target.value })} />}
        </Field>
      </div>
      {submitError && (
        <p role="alert" className="field-error sm:col-span-2">
          {submitError}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5 sm:col-span-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary btn-sm">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default function Pets() {
  const { state, run, setDraft } = useDemo()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState<Pet | 'new'>()
  const [deleting, setDeleting] = useState<Pet>()
  const [deleteError, setDeleteError] = useState<string>()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl sm:text-5xl">Мои питомцы</h1>
          <p className="mt-2 text-ink-2">Пожелания из профиля видит мастер при записи.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <Icon name="plus" size={18} /> Добавить питомца
        </button>
      </div>

      {state.pets.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border-2 border-dashed border-line p-8 text-center">
          <Icon name="paw" size={36} className="mx-auto text-butter" />
          <p className="mt-3 text-lg font-bold">Питомцев пока нет</p>
          <p className="mt-1 text-ink-2">Добавьте собаку или кошку — при записи профиль подставится автоматически.</p>
          <button type="button" className="btn btn-primary btn-sm mt-5" onClick={() => setEditing('new')}>
            Добавить питомца
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {state.pets.map((p) => {
            const visits = state.appointments.filter((a) => a.petId === p.id && a.status === 'completed').length
            return (
              <li key={p.id} className="flex flex-col rounded-[1.5rem] border border-line bg-paper p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center ${p.species === 'dog' ? 'frame-arch bg-brand-soft text-brand-deep' : 'frame-leaf bg-butter-soft text-[#6b4e00]'}`}>
                    <Icon name="paw" size={26} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="display text-3xl">{p.name}</h2>
                    <p className="text-ink-2">
                      {speciesLabel[p.species]} · {p.breed}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2 text-[0.9375rem]">
                  <div className="rounded-2xl bg-cream px-3 py-2">
                    <dt className="text-[0.8125rem] text-ink-2">Возраст</dt>
                    <dd className="font-bold">{ageText(p.birthDate) ?? '—'}</dd>
                  </div>
                  <div className="rounded-2xl bg-cream px-3 py-2">
                    <dt className="text-[0.8125rem] text-ink-2">Вес</dt>
                    <dd className="font-bold">{p.weight ? `${p.weight} кг` : '—'}</dd>
                  </div>
                  <div className="rounded-2xl bg-cream px-3 py-2">
                    <dt className="text-[0.8125rem] text-ink-2">Визитов</dt>
                    <dd className="font-bold">{visits}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex-1">
                  <p className="text-[0.875rem] font-bold text-ink-2">Пожелания к уходу</p>
                  <p className="mt-1">{p.wishes || <span className="text-ink-2">Не указаны</span>}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setDraft({ petId: p.id, species: p.species, step: 1 }, true)
                      navigate('/zapis')
                    }}
                  >
                    Записать
                  </button>
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => setEditing(p)}>
                    <Icon name="edit" size={17} /> Изменить
                  </button>
                  <button type="button" className="btn btn-sm border border-line hover:bg-danger-soft hover:text-danger" onClick={() => { setDeleteError(undefined); setDeleting(p) }}>
                    <Icon name="trash" size={17} /> Удалить
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-6">
        <DemoBadge>Демонстрационные профили, не связаны с животными на фото сайта</DemoBadge>
      </p>

      <Modal open={!!editing} onClose={() => setEditing(undefined)} title={editing === 'new' ? 'Новый питомец' : `Изменить: ${editing?.name ?? ''}`}>
        {editing && (
          <PetForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? blank : { ...blank, ...editing }}
            submitLabel={editing === 'new' ? 'Добавить' : 'Сохранить'}
            onCancel={() => setEditing(undefined)}
            onSave={(v) => {
              const r = editing === 'new' ? run((s) => { const x = addPet(s, v); return { state: x.state, value: x.pet } }) : run((s) => ({ state: updatePet(s, editing.id, v), value: null }))
              if (!r.ok) return r.error
              toast(editing === 'new' ? `${v.name.trim()} добавлен${v.species === 'cat' ? 'а' : ''} в кабинет` : 'Изменения сохранены')
              setEditing(undefined)
              return undefined
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title={`Удалить ${deleting?.name ?? ''}?`}
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDeleting(undefined)}>
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                const r = run((s) => ({ state: deletePet(s, deleting!.id), value: null }))
                if (!r.ok) return setDeleteError(r.error)
                toast(`Профиль ${deleting!.name} удалён`)
                setDeleting(undefined)
              }}
            >
              Удалить
            </button>
          </>
        }
      >
        <p>Профиль питомца удалится из демо-кабинета. История прошлых визитов сохранится.</p>
        {deleteError && (
          <p role="alert" className="field-error">
            {deleteError}
          </p>
        )}
      </Modal>
    </div>
  )
}
