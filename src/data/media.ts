// ФОТОГРАФИИ И ИСТОЧНИКИ
// Все изображения скачаны с groomchik.ru (static.tildacdn.com) и оптимизированы скриптом scripts/assets.mjs.
// Подписи описывают только то, что видно на фото: истории и клички животным не приписываются.
// Настоящих пар «до/после» одного животного на сайте нет, поэтому сравнение не делается.
// Пёстрые фото с конкурсов не используются; оставшиеся приведены к единому кадру 4:5 и мягкой обработке.

import type { Species } from './services'

export type WorkTag = 'haircut' | 'creative' | 'care' | 'molt'

export interface Work {
  id: string
  img: string // base name; `-480.webp` and a larger variant exist in /img
  large: string
  species: Species
  tag: WorkTag
  serviceId: string
  caption: string
  cutout?: boolean
}

export const workTags: Record<WorkTag, string> = {
  haircut: 'Стрижки',
  creative: 'Креативный груминг',
  care: 'Купание и гигиена',
  molt: 'Линька',
}

export const works: Work[] = [
  { id: 'w1', img: 'work-yorkie-480', large: 'work-yorkie-960', species: 'dog', tag: 'haircut', serviceId: 'dog-haircut', caption: 'Йоркширский терьер с длинной шерстью и бантом', cutout: true },
  { id: 'w2', img: 'work-bichons-480', large: 'work-bichons-960', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Два бишона с окрашенными ушками' },
  { id: 'w3', img: 'work-westie-480', large: 'work-westie-960', species: 'dog', tag: 'haircut', serviceId: 'dog-haircut', caption: 'Вест-хайленд-уайт-терьер после стрижки', cutout: true },
  { id: 'w4', img: 'work-cat-molt-480', large: 'work-cat-molt-960', species: 'cat', tag: 'molt', serviceId: 'cat-express', caption: 'Кошка и вычесанный подшёрсток после экспресс-линьки', cutout: true },
  { id: 'w5', img: 'work-poodle-480', large: 'work-poodle-960', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Пудель с креативной стрижкой и окрашиванием' },
  { id: 'w6', img: 'work-cat-towel-480', large: 'work-cat-towel-960', species: 'cat', tag: 'care', serviceId: 'cat-bath', caption: 'Кот в полотенце после купания', cutout: true },
  { id: 'w7', img: 'work-frenchie-480', large: 'work-frenchie-960', species: 'dog', tag: 'care', serviceId: 'dog-hygiene', caption: 'Французский бульдог с чистой гладкой шерстью', cutout: true },
  { id: 'w8', img: 'work-bichons-inna-480', large: 'work-bichons-inna-960', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Бишоны с креативным окрашиванием и Инна Бродилова' },
  { id: 'w9', img: 'work-cat-british-480', large: 'work-cat-british-960', species: 'cat', tag: 'care', serviceId: 'cat-bath', caption: 'Британская кошка с чистой, расчёсанной шерстью', cutout: true },
  { id: 'w10', img: 'work-puppy-bath-480', large: 'work-puppy-bath-960', species: 'dog', tag: 'care', serviceId: 'dog-hygiene', caption: 'Купание маленькой собаки в тазике', cutout: true },
]

export const workById = (id: string | undefined) => works.find((w) => w.id === id)

export const hero = {
  img: 'yorkie-red-bow',
  caption: 'Йоркширский терьер после модельной стрижки',
}

export const imageSources = {
  site: 'https://groomchik.ru/',
  cdn: 'static.tildacdn.com',
  note: 'Фотографии, логотип и прайс-листы — с сайта groomchik.ru.',
}
