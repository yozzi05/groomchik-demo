import { LOYALTY } from '../data/loyalty'
import { Icon } from './ui'

/** Visual five-visit card. */
export function StampCard({ stamps, compact = false }: { stamps: number; compact?: boolean }) {
  const total = LOYALTY.stampsForCoupon
  return (
    <div>
      <ol className={`flex ${compact ? 'gap-2' : 'gap-2.5 sm:gap-3'}`} aria-label={`Отмечено визитов: ${stamps} из ${total}`}>
        {Array.from({ length: total }, (_, i) => {
          const done = i < stamps
          const last = i === total - 1
          return (
            <li
              key={i}
              className={`grid aspect-square flex-1 place-items-center rounded-full border-2 ${compact ? 'max-w-12' : 'max-w-16'} ${
                done ? 'border-ink bg-ink text-butter' : last ? 'border-dashed border-brand bg-paper text-brand' : 'border-dashed border-[#c9bea8] bg-paper text-[#c9bea8]'
              }`}
            >
              {last && !done ? <Icon name="gift" size={compact ? 18 : 22} /> : <Icon name="paw" size={compact ? 18 : 24} />}
              <span className="sr-only">{done ? `Визит ${i + 1} отмечен` : `Визит ${i + 1}`}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
