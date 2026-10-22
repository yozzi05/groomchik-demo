import { useState } from 'react'
import { salon } from '../data/salon'
import type { Service } from '../data/services'
import { Icon, Modal, asset } from './ui'

export function PriceButton({ service, className = 'btn btn-soft btn-sm' }: { service: Service; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Прайс по породам
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={service.title} size="lg">
        {service.tables?.map((t) => (
          <div key={t.title} className="mb-6">
            <h3 className="mb-3 text-lg font-bold">{t.title}</h3>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[520px] border-collapse text-left text-[0.9375rem]">
                <thead className="bg-cream">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">
                      {t.rows[0]?.[0] && /Мелк|Мейн/.test(t.rows[0][0]) ? 'Размер' : 'Порода / услуга'}
                    </th>
                    {t.columns.map((c) => (
                      <th key={c} scope="col" className="px-4 py-3 font-bold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r) => (
                    <tr key={r[0]} className="border-t border-line">
                      <th scope="row" className="px-4 py-2.5 font-semibold">
                        {r[0]}
                      </th>
                      {r.slice(1).map((v, i) => (
                        <td key={i} className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {t.note && <p className="mt-2 text-[0.875rem] text-ink-2">{t.note}</p>}
          </div>
        ))}
        {service.priceText && <p className="mb-4">{service.priceText}</p>}
        <div className="flex flex-col gap-3 rounded-2xl bg-cream p-4 text-[0.9375rem] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2">
            <Icon name="info" size={18} className="mt-0.5 text-brand" />
            Таблица перенесена из прайс-листа на сайте салона. Точную стоимость уточняйте у администратора.
          </p>
          <a href={asset(service.priceImage)} target="_blank" rel="noreferrer" className="link shrink-0 font-semibold">
            Исходный прайс (изображение)
          </a>
        </div>
        <p className="mt-4 text-[0.9375rem]">
          Уточнить стоимость:{' '}
          {salon.phones.map((p, i) => (
            <span key={p.tel}>
              {i > 0 && ', '}
              <a className="link font-semibold" href={`tel:${p.tel}`}>
                {p.display}
              </a>
            </span>
          ))}
        </p>
      </Modal>
    </>
  )
}
