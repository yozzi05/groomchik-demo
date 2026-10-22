import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import Booking from './pages/Booking'
import Cabinet from './pages/cabinet/Cabinet'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import School from './pages/School'

const titles: [RegExp, string][] = [
  [/^\/zapis/, 'Запись'],
  [/^\/kabinet/, 'Личный кабинет'],
  [/^\/shkola/, 'Школа груминга'],
]

export default function App() {
  const { pathname, state } = useLocation()

  useEffect(() => {
    const t = titles.find(([re]) => re.test(pathname))?.[1]
    document.title = t ? `${t} · ГрумЧик (демо)` : 'ГрумЧик — груминг-салон в Ростове-на-Дону · демо'
  }, [pathname])

  // Scroll to top on page change unless a section scroll was requested
  useEffect(() => {
    if (!(state as { section?: string } | null)?.section) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, state])

  const inCabinet = pathname.startsWith('/kabinet')

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        Перейти к содержанию
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/zapis" element={<Booking />} />
          <Route path="/kabinet/*" element={<Cabinet />} />
          <Route path="/shkola" element={<School />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer compact={inCabinet} />
    </div>
  )
}
