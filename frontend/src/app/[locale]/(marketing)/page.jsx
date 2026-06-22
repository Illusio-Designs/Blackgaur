import Hero from '@/components/marketing/Hero';
import StatsStrip from '@/components/marketing/StatsStrip';
import ServicesGrid from '@/components/marketing/ServicesGrid';
import HowItWorks from '@/components/marketing/HowItWorks';
import CTASection from '@/components/marketing/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <ServicesGrid />
      <HowItWorks />
      <CTASection />
    </>
  );
}
