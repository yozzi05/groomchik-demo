import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import sizes from '../data/imageSizes.json'

export const asset = (file: string) => `${import.meta.env.BASE_URL}img/${file}`

// ---------- Image ----------

const sizeMap = sizes as unknown as Record<string, [number, number]>

interface ImgProps {
  src: string // file name in /img
  srcLarge?: string
  alt: string
  className?: string
  eager?: boolean
  sizes?: string
}

/** Reserves the real aspect ratio (no layout shift) and lazy-loads below the first screen. */
export function Img({ src, srcLarge, alt, className = '', eager, sizes: sizesAttr }: ImgProps) {
  const [w, h] = sizeMap[src] ?? [4, 3]
  const srcSet = srcLarge ? `${asset(src)} ${w}w, ${asset(srcLarge)} ${sizeMap[srcLarge]?.[0] ?? w * 2}w` : undefined
  return (
    <img
      src={asset(src)}
      srcSet={srcSet}
      sizes={srcSet ? sizesAttr ?? '(min-width: 1024px) 33vw, 90vw' : undefined}
      width={w}
      height={h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      className={className}
    />
  )
}

// ---------- Logo (original salon logo file) ----------

export function Logo({ size = 52, withText = true, light = false }: { size?: number; withText?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <img src={asset('logo.png')} width={size} height={size} alt={withText ? '' : 'ГрумЧик'} className="shrink-0" style={{ width: size, height: size }} />
      {withText && (
        <span className="leading-none">
          <span className={`block text-[1.35rem] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>ГрумЧик</span>
          <span className={`mt-1 hidden text-[0.8125rem] font-semibold min-[420px]:block ${light ? 'text-white/75' : 'text-ink-2'}`}>груминг · Ростов-на-Дону</span>
        </span>
      )}
    </span>
  )
}

// ---------- Icons ----------

const paths: Record<string, ReactNode> = {
  paw: (
    <>
      <circle cx="7" cy="9" r="1.8" />
      <circle cx="11" cy="6" r="1.8" />
      <circle cx="15.5" cy="7" r="1.8" />
      <circle cx="18" cy="11" r="1.6" />
      <path d="M8.5 15.5c1-2.5 2.5-4 4.2-4 1.8 0 3.3 1.7 4 4 .6 2-1 3.5-3 3-1-.3-1.6-.3-2.6 0-2 .6-3.4-1-2.6-3Z" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5 5-5-5 5-5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-3.5-6-4-6-1.5S12 9 12 9Zm0 0c1.5-3.5 6-4 6-1.5S12 9 12 9Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1.2-3.7 4-5.5 7.5-5.5s6.3 1.8 7.5 5.5" />
    </>
  ),
  home: <path d="M4 11 12 4.5l8 6.5V20h-5.5v-5h-5v5H4v-9Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />,
  trash: <path d="M5 7h14M10 7V4.5h4V7m-7 0 .8 12.5h8.4L17 7" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  repeat: <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />,
  sparkle: <path d="M12 3.5 13.8 10 20.5 12 13.8 14 12 20.5 10.2 14 3.5 12 10.2 10 12 3.5Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.6v.4" />
    </>
  ),
  external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10" />,
  scissors: (
    <>
      <circle cx="6.5" cy="7" r="2.5" />
      <circle cx="6.5" cy="17" r="2.5" />
      <path d="M8.6 8.4 20 17M8.6 15.6 20 7" />
    </>
  ),
}

export function Icon({ name, size = 20, className = '', filled = false }: { name: keyof typeof paths | string; size?: number; className?: string; filled?: boolean }) {
  const isPaw = name === 'paw'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill={isPaw || filled ? 'currentColor' : 'none'}
      stroke={isPaw || filled ? 'none' : 'currentColor'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

/** Thin fur-line accent: a few hand-drawn strands, used sparingly next to headings. */
export function FurLine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 14c12-9 22-9 32 0s22 9 32 0 22-9 32 0 14 7 20 3" />
      <path d="M40 7c2-3 5-4 8-3M76 19c3 2 6 2 9 0" opacity=".6" />
    </svg>
  )
}

export function DemoBadge({ children = 'Демо' }: { children?: ReactNode }) {
  return (
    <span className="demo-badge">
      <Icon name="info" size={14} />
      {children}
    </span>
  )
}

// ---------- Modal (native <dialog>: focus trap, Esc and inert background for free) ----------

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<Element | null>(null)
  const titleId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      opener.current = document.activeElement
      d.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && d.open) {
      d.close()
    }
    return undefined
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onClosed = () => {
      document.documentElement.style.overflow = ''
      if (opener.current instanceof HTMLElement) opener.current.focus()
    }
    d.addEventListener('close', onClosed)
    return () => d.removeEventListener('close', onClosed)
  }, [])

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-4xl' : 'max-w-2xl'

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className={`m-auto w-[calc(100%-1.5rem)] ${width} max-h-[min(90dvh,900px)] rounded-3xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/55`}
    >
      {open && (
        <div className="flex max-h-[min(90dvh,900px)] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
            <h2 id={titleId} className="display pt-1 text-2xl sm:text-[1.75rem]">
              {title}
            </h2>
            <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-cream" aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4 sm:px-7">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

// ---------- Toasts ----------

interface Toast {
  id: number
  text: string
  tone: 'ok' | 'error' | 'info'
}
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((x) => [...x, { id, text, tone }])
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 5000)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-2xl px-4 py-3 text-[0.9375rem] font-semibold shadow-lg ${
              t.tone === 'error' ? 'bg-danger text-white' : t.tone === 'info' ? 'bg-ink text-white' : 'bg-ok text-white'
            }`}
          >
            <Icon name={t.tone === 'error' ? 'info' : 'check'} size={18} className="mt-0.5" />
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

// ---------- Form field ----------

export function Field({
  label,
  hint,
  error,
  children,
  id,
  optional,
}: {
  label: string
  hint?: string
  error?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
  id?: string
  optional?: boolean
}) {
  const auto = useId()
  const fid = id ?? auto
  const desc = [hint && `${fid}-hint`, error && `${fid}-err`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={fid} className="field-label">
        {label}
        {optional && <span className="ml-1 font-medium text-ink-2">— необязательно</span>}
      </label>
      {children({ id: fid, 'aria-invalid': !!error, 'aria-describedby': desc })}
      {hint && (
        <p id={`${fid}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fid}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

export function Section({ id, className = '', children, labelledBy }: { id?: string; className?: string; children: ReactNode; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`scroll-mt-24 ${className}`}>
      {children}
    </section>
  )
}

export const container = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8'
