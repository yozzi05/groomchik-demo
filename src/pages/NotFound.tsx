import { Link } from 'react-router-dom'
import { Icon, container } from '../components/ui'

export default function NotFound() {
  return (
    <div className={`${container} grid min-h-[50dvh] place-items-center py-16 text-center`}>
      <div>
        <Icon name="paw" size={40} className="mx-auto text-butter" />
        <h1 className="display mt-4 text-4xl">Страница не найдена</h1>
        <p className="mt-2 text-ink-2">Возможно, ссылка устарела.</p>
        <Link to="/" className="btn btn-primary mt-6">
          На главную
        </Link>
      </div>
    </div>
  )
}
