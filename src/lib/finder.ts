// Care finder rules. A hint about grooming, not a veterinary conclusion.
import type { Species } from '../data/services'

export type Coat = 'long' | 'double' | 'wire' | 'short'
export type Size = 'small' | 'medium' | 'large'
export type Task = 'haircut' | 'molt' | 'hygiene' | 'unknown'

export const coatOptions: Record<Species, { id: Coat; label: string; examples: string }[]> = {
  dog: [
    { id: 'long', label: 'Длинная или кудрявая', examples: 'йорк, пудель, мальтипу, ши-тцу, бишон' },
    { id: 'double', label: 'Пушистая с подшёрстком', examples: 'шпиц, корги, хаски, самоед, колли' },
    { id: 'wire', label: 'Жёсткая', examples: 'вест-хайленд, джек-рассел, жесткошёрстная такса' },
    { id: 'short', label: 'Короткая гладкая', examples: 'мопс, французский бульдог, бигль, лабрадор' },
  ],
  cat: [
    { id: 'long', label: 'Длинная или полудлинная', examples: 'мейн-кун, перс, британская длинношёрстная' },
    { id: 'short', label: 'Короткая', examples: 'британская, шотландская, метис' },
  ],
}

export const sizeOptions: Record<Species, { id: Size; label: string }[]> = {
  dog: [
    { id: 'small', label: 'Мелкая, до 10 кг' },
    { id: 'medium', label: 'Средняя, 10–25 кг' },
    { id: 'large', label: 'Крупная, от 25 кг' },
  ],
  cat: [
    { id: 'small', label: 'Небольшая' },
    { id: 'medium', label: 'Средняя' },
    { id: 'large', label: 'Крупная, мейн-кун' },
  ],
}

export const taskOptions: { id: Task; label: string }[] = [
  { id: 'haircut', label: 'Стрижка' },
  { id: 'molt', label: 'Линька' },
  { id: 'hygiene', label: 'Гигиена и купание' },
  { id: 'unknown', label: 'Пока не знаю' },
]

export interface Recommendation {
  serviceId: string
  altId?: string
  why: string
  notes: string[]
}

export function recommend(species: Species, coat: Coat, task: Task): Recommendation {
  if (species === 'cat') {
    if (task === 'haircut') return { serviceId: 'cat-haircut', altId: 'cat-express', why: 'Стрижка под машинку 3 мм помогает, когда появились колтуны или шерсти в доме слишком много.', notes: ['Работаем со спокойными кошками; стрижка проходит в четыре руки с помощником.'] }
    if (task === 'molt' || (task === 'unknown' && coat === 'long'))
      return { serviceId: 'cat-express', altId: task === 'molt' ? 'cat-bath' : 'cat-haircut', why: 'Экспресс-линька убирает лишний подшёрсток без стрижки — шубка остаётся, а комков шерсти дома становится меньше.', notes: ['Можно без купания, если кошка сильно волнуется.'] }
    return { serviceId: 'cat-bath', altId: 'cat-express', why: 'Купание подходит, если кошка не справляется с чистотой шерсти сама или после стрижки.', notes: ['Если кошка боится фена, её могут отдать недосушенной — об этом предупредят заранее.'] }
  }

  // dogs
  if (coat === 'wire' && task !== 'hygiene')
    return { serviceId: 'dog-trimming', altId: 'dog-haircut', why: 'Жёсткую шерсть обновляют триммингом: отмершие волоски удаляют вручную и инструментами, и сохраняется характерная фактура.', notes: ['Шнауцеров и фокстерьеров в салоне не триммингуют.'] }
  if (task === 'hygiene')
    return { serviceId: 'dog-hygiene', altId: coat === 'long' ? 'dog-haircut' : 'dog-express', why: 'Гигиенический уход поддерживает чистоту между стрижками: когти, уши, лапы, купание и сушка.', notes: [] }
  if (coat === 'double')
    return { serviceId: task === 'haircut' ? 'dog-haircut' : 'dog-express', altId: task === 'haircut' ? 'dog-express' : 'dog-haircut', why: task === 'haircut' ? 'Пушистым собакам делают аккуратное оформление контура. Часто вместе с ним нужна экспресс-линька.' : 'Собакам с подшёрстком экспресс-линька помогает пережить сезон смены шерсти: подшёрсток вычёсывают до образования колтунов.', notes: ['Шпицев под машинку в салоне не бреют.'] }
  if (coat === 'short')
    return { serviceId: task === 'molt' || task === 'unknown' ? 'dog-express' : 'dog-hygiene', altId: 'dog-hygiene', why: 'Гладкой шерсти модельная стрижка обычно не нужна: помогут вычёсывание выпадающей шерсти и гигиенический уход.', notes: [] }
  return { serviceId: 'dog-haircut', altId: 'dog-hygiene', why: 'Длинная и кудрявая шерсть растёт постоянно: стрижка по породе или пожеланию сохраняет её аккуратной и без колтунов.', notes: task === 'molt' ? ['У пород с растущей шерстью выраженной линьки обычно нет — мастер посмотрит шерсть и подскажет.'] : [] }
}
