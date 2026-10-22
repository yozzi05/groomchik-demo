// ФОТОГРАФИИ И ИСТОЧНИКИ
// Все изображения скачаны с groomchik.ru (static.tildacdn.com) и оптимизированы скриптом scripts/assets.mjs.
// Подписи описывают только то, что видно на фото: истории и клички животным не приписываются.
// Настоящих пар «до/после» одного животного на сайте нет, поэтому сравнение не делается.

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
  creative: 'Выставки и креатив',
  care: 'Купание и гигиена',
  molt: 'Линька',
}

export const works: Work[] = [
  { id: 'w1', img: 'yorkie-pink-bow-480', large: 'yorkie-pink-bow-800', species: 'dog', tag: 'haircut', serviceId: 'dog-haircut', caption: 'Йоркширский терьер с длинной шерстью и бантом', cutout: true },
  { id: 'w2', img: 'creative-bichons-inna-480', large: 'creative-bichons-inna-720', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Бишоны с креативным окрашиванием и Инна Бродилова' },
  { id: 'w3', img: 'westie-480', large: 'westie-800', species: 'dog', tag: 'haircut', serviceId: 'dog-haircut', caption: 'Вест-хайленд-уайт-терьер после стрижки', cutout: true },
  { id: 'w4', img: 'cat-express-480', large: 'cat-express-800', species: 'cat', tag: 'molt', serviceId: 'cat-express', caption: 'Кошка и вычесанный подшёрсток после экспресс-линьки', cutout: true },
  { id: 'w5', img: 'yorkie-show-480', large: 'yorkie-show-900', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Йоркширский терьер на груминг-столе на конкурсе' },
  { id: 'w6', img: 'cat-towel-480', large: 'cat-towel-800', species: 'cat', tag: 'care', serviceId: 'cat-bath', caption: 'Кот в полотенце после купания', cutout: true },
  { id: 'w7', img: 'creative-poodle-480', large: 'creative-poodle-900', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Пудель с креативной стрижкой и окрашиванием' },
  { id: 'w8', img: 'french-bulldog-480', large: 'french-bulldog-800', species: 'dog', tag: 'care', serviceId: 'dog-hygiene', caption: 'Французский бульдог с чистой гладкой шерстью', cutout: true },
  { id: 'w9', img: 'bichon-rosette-480', large: 'bichon-rosette-900', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Бишон с наградной розеткой на конкурсе' },
  { id: 'w10', img: 'cat-british-480', large: 'cat-british-800', species: 'cat', tag: 'care', serviceId: 'cat-bath', caption: 'Британская кошка с чистой, расчёсанной шерстью', cutout: true },
  { id: 'w11', img: 'puppy-bath-400', large: 'puppy-bath-560', species: 'dog', tag: 'care', serviceId: 'dog-hygiene', caption: 'Купание маленькой собаки в тазике', cutout: true },
  { id: 'w12', img: 'creative-bichons-480', large: 'creative-bichons-900', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Два бишона с окрашенными ушками' },
  { id: 'w13', img: 'yorkie-table-480', large: 'yorkie-table-900', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Йоркширский терьер с бантом рядом с кубком' },
  { id: 'w14', img: 'poodle-trophies-480', large: 'poodle-trophies-900', species: 'dog', tag: 'creative', serviceId: 'dog-haircut', caption: 'Инна с работой и кубками на конкурсе' },
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
