import { Section } from '../components/ui'
import { useSectionScroll } from '../components/SectionLink'
import CareFinder from './home/CareFinder'
import Hero from './home/Hero'
import Loyalty from './home/Loyalty'
import Masters from './home/Masters'
import ReviewsFaq from './home/ReviewsFaq'
import Salons from './home/Salons'
import Services from './home/Services'
import Works from './home/Works'

export default function Home() {
  useSectionScroll()
  return (
    <>
      <Hero />
      <Section id="finder" labelledBy="finder-title">
        <CareFinder />
      </Section>
      <Section id="services" labelledBy="services-title">
        <Services />
      </Section>
      <Section id="works" labelledBy="works-title">
        <Works />
      </Section>
      <Section id="masters" labelledBy="masters-title">
        <Masters />
      </Section>
      <Section id="loyalty" labelledBy="loyalty-title">
        <Loyalty />
      </Section>
      <Section id="reviews" labelledBy="reviews-title">
        <ReviewsFaq />
      </Section>
      <Section id="salons" labelledBy="salons-title">
        <Salons />
      </Section>
    </>
  )
}
