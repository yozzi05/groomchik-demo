import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SCHEMA_VERSION, STORAGE_KEY, emptyState, seedState } from '../data/demo'
import type { MasterId } from '../data/masters'
import type { SalonId } from '../data/salon'
import type { Species } from '../data/services'
import { DemoError, type DemoState } from '../lib/model'

// ---------- persistence ----------
// Only fictional demo data is stored, under a dedicated key with a schema version.

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.version === SCHEMA_VERSION && parsed.state?.pets) return parsed.state as DemoState
    }
  } catch {
    /* storage unavailable or corrupted: fall back to the seed */
  }
  return seedState()
}

function save(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), state }))
  } catch {
    /* private mode: the demo still works for this tab */
  }
}

// ---------- booking draft ----------

export interface BookingDraft {
  species?: Species
  petId?: string // existing pet id or 'new'
  newPetName?: string
  newPetBreed?: string
  serviceId?: string
  salonId?: SalonId
  masterId?: MasterId | 'any'
  day?: string
  start?: string
  comment?: string
  exampleId?: string
  finderNote?: string
  repeatOf?: string
  payment?: 'none' | 'bonus' | 'coupon'
  bonusAmount?: number
  step?: number
}

const DRAFT_KEY = 'groomchik-demo-draft'

function loadDraft(): BookingDraft {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}')
  } catch {
    return {}
  }
}

// ---------- context ----------

type Result<T = void> = { ok: true; value: T } | { ok: false; error: string }

interface DemoCtx {
  state: DemoState
  run<T>(fn: (s: DemoState) => { state: DemoState; value: T }): Result<T>
  update(fn: (s: DemoState) => DemoState): Result
  enter(): void
  leave(): void
  reset(): void
  makeEmpty(): void
  draft: BookingDraft
  setDraft(patch: BookingDraft, replace?: boolean): void
  clearDraft(): void
}

const Ctx = createContext<DemoCtx | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load)
  const [draft, setDraftState] = useState<BookingDraft>(loadDraft)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => save(state), [state])
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
  }, [draft])

  // keep several open tabs of the demo in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const run = useCallback(<T,>(fn: (s: DemoState) => { state: DemoState; value: T }): Result<T> => {
    try {
      const r = fn(stateRef.current)
      stateRef.current = r.state
      setState(r.state)
      return { ok: true, value: r.value }
    } catch (e) {
      if (e instanceof DemoError) return { ok: false, error: e.message }
      throw e
    }
  }, [])

  const update = useCallback((fn: (s: DemoState) => DemoState) => run((s) => ({ state: fn(s), value: undefined })), [run])

  const value = useMemo<DemoCtx>(
    () => ({
      state,
      run,
      update,
      enter: () => update((s) => ({ ...s, entered: true })),
      leave: () => update((s) => ({ ...s, entered: false })),
      reset: () => {
        const s = { ...seedState(), entered: stateRef.current.entered }
        stateRef.current = s
        setState(s)
        setDraftState({})
      },
      makeEmpty: () => {
        const s = emptyState()
        stateRef.current = s
        setState(s)
        setDraftState({})
      },
      draft,
      setDraft: (patch, replace) => setDraftState((d) => (replace ? patch : { ...d, ...patch })),
      clearDraft: () => setDraftState({}),
    }),
    [state, run, update, draft],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDemo() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useDemo outside DemoProvider')
  return c
}
