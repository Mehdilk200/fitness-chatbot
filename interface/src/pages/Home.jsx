import {
  Navbar,
  Hero,
  About,
  Services,
  Stats,
  Features,
  Testimonial,
  TransformationStories,
  NuvexBanner,
  CtaSection,
  Pricing,
  Contact,
  TestimonialsCarousel,
  Blog,
  Community,
  Location,
  Faq,
  HealthDashboard,
  Footer,
  ChatWidget,
} from '../components/landing';

export default function Home({ theme, toggleTheme }) {
  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <About />
      <Services />
      <Stats />
      <Features />
      <Testimonial />
      <TransformationStories />
      <NuvexBanner />
      <CtaSection />
      <Pricing />
      <Contact />
      <TestimonialsCarousel />
      <Blog />
      <Community />
      <Location />
      <Faq />
      <HealthDashboard />
      <Footer />
      <ChatWidget />
    </>
  );
}
