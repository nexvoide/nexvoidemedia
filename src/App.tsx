import { useState, useEffect, useRef } from 'react';
import { Menu, X, Scissors, Lock, TrendingUp, ArrowRight, Check, Quote, Send, Phone, AlertTriangle, Sparkles, Shield, Users, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

// Define types for form data
interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

// Custom hook for scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Helper components
const Minus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencyOptions = [
    { value: 'USD', label: 'United States', symbol: '$' },
    { value: 'AUD', label: 'Australia', symbol: 'A$' },
    { value: 'CAD', label: 'Canada', symbol: 'C$' },
    { value: 'GBP', label: 'United Kingdom', symbol: '£' },
    { value: 'ILS', label: 'Israel', symbol: '₪' },
    { value: 'EUR', label: 'Germany', symbol: '€' },
  ] as const;

  type CurrencyCode = (typeof currencyOptions)[number]['value'];

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [fxRates, setFxRates] = useState<Record<string, number>>({ USD: 1 });
  const [fxLoading, setFxLoading] = useState(true);

  // Pricing Section State and Data
  const pricingPackages = [
    {
      name: 'SIDEKICK',
      basePrice: 1600,
      badge: '',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      features: [
        { label: 'Dedicated Editor', detail: '1', icon: '👥' },
        { label: 'Editor Coverage', detail: '4 hours/day Mon-Fri', icon: '📅' },
        { label: 'Turnaround', detail: '48-72hr', icon: '⚡' },
        { label: 'Revisions', detail: 'Unlimited', icon: '🔄' },
        { label: 'Delivery', detail: 'White label', icon: '🏷️' },
        { label: 'Support', detail: 'Business hours', icon: '🎯' },
      ],
    },
    {
      name: 'FOUNDERS',
      basePrice: 2400,
      badge: 'Recommended',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/60',
      features: [
        { label: 'Dedicated Editor', detail: '1', icon: '👥' },
        { label: 'Editor Coverage', detail: '6 hours/day Mon-Fri', icon: '📅' },
        { label: 'Turnaround', detail: '24-48hr', icon: '⚡' },
        { label: 'Revisions', detail: 'Unlimited', icon: '🔄' },
        { label: 'Delivery', detail: 'White label', icon: '🏷️' },
        { label: 'Priority Queue', detail: 'Yes', icon: '⭐' },
        { label: 'Support', detail: 'Priority', icon: '🎯' },
      ],
    },
    {
      name: 'MEDIA HOUSES',
      basePrice: 3200,
      badge: '',
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      features: [
        { label: 'Dedicated Editor', detail: '1', icon: '👥' },
        { label: 'Editor Coverage', detail: '8 hours/day Mon-Fri', icon: '📅' },
        { label: 'Turnaround', detail: '24-48hr + rush available', icon: '⚡' },
        { label: 'Revisions', detail: 'Unlimited', icon: '🔄' },
        { label: 'Delivery', detail: 'White label', icon: '🏷️' },
        { label: 'Account Manager', detail: 'Dedicated', icon: '👤' },
        { label: 'Support', detail: 'Priority', icon: '🎯' },
      ],
    },
  ];

  const [packageEditorCounts, setPackageEditorCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(pricingPackages.map((pkg) => [pkg.name, 1]))
  );
  const updatePackageEditorCount = (packageName: string, delta: number) => {
    setPackageEditorCounts((prev) => ({
      ...prev,
      [packageName]: Math.max(1, (prev[packageName] ?? 1) + delta),
    }));
  };

  const calculatePrice = (basePrice: number, editors: number) => {
    return basePrice * editors;
  };

  const selectedCurrencyOption = currencyOptions.find((option) => option.value === selectedCurrency) ?? currencyOptions[0];

  const formatCurrency = (amount: number, currency: CurrencyCode) => {
    const rate = fxRates[currency] ?? 1;
    const converted = amount * rate;

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(converted);
    } catch {
      return `${currency} ${Math.round(converted).toLocaleString()}`;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const currenciesToFetch = ['AUD', 'CAD', 'GBP', 'ILS', 'EUR'];

    setFxLoading(true);

    fetch('https://open.er-api.com/v6/latest/USD')
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return;

        const rates = {
          USD: 1,
          ...Object.fromEntries(
            currenciesToFetch.map((currency) => [currency, Number(data?.rates?.[currency] ?? 1)])
          ),
        };

        setFxRates(rates);
      })
      .catch(() => {
        if (!isMounted) return;

        setFxRates({
          USD: 1,
          AUD: 1.4153,
          CAD: 1.3954,
          GBP: 0.7415,
          ILS: 2.9987,
          EUR: 0.8655,
        });
      })
      .finally(() => {
        if (isMounted) {
          setFxLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Case Studies
  const caseStudies = [
    {
      title: 'From 30 to 200 Videos/Month',
      subtitle: 'Tel Aviv · Foundera',
      description: 'Founder had 3 startup clients and a single editor. Turnarounds were slow, deadlines missed, and growth stalled. Thousands of dollars were wasted each month with no capacity to scale.',
      result: 'Nexvoide became the full production backbone: fast turnarounds, scalable capacity, and a fraction of the cost of a full-time hire. The founder reinvested savings into growth, client pitches, and tools — moving from operator to agency founder.',
      stats: [
        { value: '200', label: 'Videos/Month' },
        { value: '0', label: 'Burnout' },
        { value: '$12.5k', label: 'Cost Saved' },
      ],
      testimonial: {
        quote: 'One editor couldn’t keep up. Nexvoide gave me scalable capacity at the right cost — I reinvested the savings and grew into Tel Aviv’s biggest tech founder agency.',
        author: 'Founder & CEO',
        company: 'Foundera',
        photo: '/ron.svg',
      },
    },
    {
      title: '50 → 150 videos/month',
      subtitle: 'United States · Millennial Marketing Agency',
      description: 'Millennial Marketing Agency had a major client campaign demanding triple the output — fast. Going over capacity risked quality. Hiring fast risked consistency. They needed a third option.',
      result: 'We embedded directly into their workflow as a dedicated editing team. Same tone, same style guides, same quality bar — just three times the throughput and a 24-hour turnaround SLA.',
      stats: [
        { value: '3x', label: 'Scale Increase' },
        { value: '40%', label: 'Cost Reduction' },
        { value: '24h', label: 'Avg Turnaround' },
      ],
      testimonial: {
        quote: 'The quality and speed exceeded every expectation. Our client assumed wed hired a whole new in house team. We hadnt touched our headcount',
        author: 'Founder & CEO',
        company: 'Millennial Marketing Agency',
        photo: '/cindy.svg',
      },
    },
    {
      title: 'Podcast Production at Scale',
      subtitle: 'United States · Nafta Production',
      description: 'Nafta Production was launching a podcast network from zero — 20 episodes a month, multi-cam editing, audio cleanup, chapters, and promo clips. That requires a full production team. They didnt have one.',
      result: 'We became their white-label production studio. Every episode delivered under their brand, on time, with no trace of outsourcing. Listeners never knew. The client always knew the difference.',
      stats: [
        { value: '20', label: 'Episodes/Month' },
        { value: '48h', label: 'Turnaround' },
        { value: '100%', label: 'White-Label' },
        
      ],
      testimonial: {
        quote: 'Nexvoide handles everything behind the scenes. Our listeners have no idea its not our internal team and thats exactly the point.',
        author: 'Podcast Producer',
        company: 'Nafta Production',
        photo: '/gravy.svg',
      },
    },
  ];

  const toolStack = [
    {
      name: 'WhatsApp',
      logo: 'https://cdn.simpleicons.org/whatsapp/25D366',
      fallbackLogo: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/whatsapp.svg',
    },
    {
      name: 'Discord',
      logo: 'https://cdn.simpleicons.org/discord/5865F2',
      fallbackLogo: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/discord.svg',
    },
    {
      name: 'Payoneer',
      logo: 'https://img.icons8.com/color/480/payoneer.png',
      fallbackLogo: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/payoneer.svg',
    },
    {
      name: 'Premiere Pro',
      logo: '/premiere.webp',
      fallbackLogo: '', // Add empty string or remove fallback logic for this item
    },
    {
      name: 'CapCut',
      logo: '/capcut.webp',
      fallbackLogo: '',
    },
    {
      name: 'After Effects',
      logo: '/aftereffects.webp',
      fallbackLogo: '',
    },
    {
      name: 'Slack',
      logo: 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-slack-replace-email-text-messaging-and-instant-messaging-for-your-team-logo-color-tal-revivo.png',
      fallbackLogo: '',
    },
    {
      name: 'DaVinci Resolve',
      logo: '/resolve.webp',
      fallbackLogo: '',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, shouldUpdateHash = true) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 96;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const scrollTarget = Math.max(elementTop - headerOffset, 0);
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });

      if (shouldUpdateHash && window.location.hash !== `#${id}`) {
        window.history.pushState(null, '', `#${id}`);
      }

      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    // Delay ensures sections are mounted before we try to scroll.
    const timer = window.setTimeout(() => {
      scrollToSection(hash, false);
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  // EmailJS handler
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceId = 'service_dzwtzcg';
      const templateId = 'template_v600g9r';
      const publicKey = 'Nl6-xaQPSSSwkWpO5';

      const templateParams = {
        to_name: 'Nexvoide Team',
        user_name: formData.name,
        user_company: formData.company,
        user_email: formData.email,
        user_phone: formData.phone,
        user_message: formData.message,
      };

      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

      if (response.status === 200) {
        setFormSubmitted(true);
        setFormData({ name: '', company: '', email: '', phone: '', message: '' });

        setTimeout(() => {
          setFormSubmitted(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const navLinks = [
    { label: 'Services', id: 'services' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Case Studies', id: 'case-studies' },
    { label: 'Portfolio', id: 'portfolio', onClick: () => setIsPortfolioOpen(true) },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-[#010333]">
      {/* Header / Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#010333]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
          }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/logo.webp"
                alt="Nexvoide"
                className="h-4 w-auto md:h-6"
              />
              <span className="hidden sm:inline text-xs md:text-sm text-white/60 border-l border-white/20 pl-2 ml-1">
                Media House Division
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => link.onClick ? link.onClick() : scrollToSection(link.id)}
                  className="text-sm text-white/80 hover:text-white transition-colors duration-200 font-medium"
                >
                  {link.label}
                </button>
              ))}
              <Button
                onClick={() => scrollToSection('contact')}
                className="bg-[#2642ff] hover:bg-[#1e35cc] text-white text-sm font-medium px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#2642ff]/25"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-[#010333]/98 backdrop-blur-md border-t border-white/10 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
        >
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => link.onClick ? link.onClick() : scrollToSection(link.id)}
                className="text-left text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection('contact')}
              className="bg-[#2642ff] hover:bg-[#1e35cc] text-white font-medium py-3 rounded-xl mt-2"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Portfolio Popup Modal */}
      <Dialog open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
        <DialogContent className="bg-[#0a0d4a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <AlertTriangle className="w-6 h-6 text-[#2642ff]" />
              White-Label Confidentiality
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              We are a white-label editing partner. We do not share client work publicly to protect our clients' confidentiality.
            </p>
            <p className="text-white/60 text-sm">
              Contact us to see relevant samples under NDA.
            </p>
            <Button
              onClick={() => {
                setIsPortfolioOpen(false);
                scrollToSection('contact');
              }}
              className="w-full bg-[#2642ff] hover:bg-[#1e35cc] text-white"
            >
              Contact Us
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[#2642ff]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#2642ff]/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2642ff]/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2642ff]/10 border border-[#2642ff]/20 mb-6 md:mb-8">
                <span className="w-2 h-2 rounded-full bg-[#2642ff] animate-pulse" />
                <span className="text-sm text-[#2642ff] font-medium">Trusted by Media Houses Worldwide</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 md:mb-8">
                Overflow Editing Partner for{' '}
                <span className="text-[#2642ff]">Media Houses</span> & Agencies
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
                We handle the volume. Your team stays focused on creative work. White-label post-production that scales with you.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => scrollToSection('contact')}
                  className="w-full sm:w-auto bg-[#2642ff] hover:bg-[#1e35cc] text-white font-semibold px-8 py-6 rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#2642ff]/30 hover:-translate-y-0.5"
                >
                  Start with a Test Project
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => scrollToSection('case-studies')}
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-6 rounded-xl text-base transition-all duration-200"
                >
                  View Case Studies
                </Button>
              </div>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection delay={400}>
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 md:mt-20 max-w-2xl mx-auto">
                {[
                  { value: '500+', label: 'Videos/Month' },
                  { value: '24-48h', label: 'Turnaround' },
                  { value: '100%', label: 'White-Label' },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-20 md:py-32">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  What We Handle
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  End-to-end post-production services designed to scale with your agency
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Scissors,
                  title: 'Overflow Editing',
                  description: 'When your team hits capacity, we take the extra work. Seamless extension of your existing workflow.',
                },
                {
                  icon: Lock,
                  title: 'White-Label Post-Production',
                  description: 'Your brand. Our editors. Your clients never know. We work behind the scenes as your team.',
                },
                {
                  icon: TrendingUp,
                  title: 'Scalable Volume',
                  description: 'From 30 to 200+ videos/month. No hiring. No burnout. Scale up or down as needed.',
                },
              ].map((service, index) => (
                <AnimatedSection key={index} delay={index * 100}>
                  <Card className="bg-[#0a0d4a]/50 border-white/10 hover:border-[#2642ff]/30 transition-all duration-300 hover:-translate-y-1 group h-full">
                    <CardContent className="p-6 md:p-8">
                      <div className="w-14 h-14 rounded-xl bg-[#2642ff]/10 flex items-center justify-center mb-6 group-hover:bg-[#2642ff]/20 transition-colors">
                        <service.icon className="w-7 h-7 text-[#2642ff]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                      <p className="text-white/60 leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 md:py-32 bg-[#020544]/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Simple Workflow. Predictable Output.
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Three steps to seamless post-production scaling
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  step: '01',
                  title: 'You Share',
                  description: 'Raw footage. Brief. Your brand guidelines. We align with your standards.',
                },
                {
                  step: '02',
                  title: 'We Edit',
                  description: 'Our team edits. You review. Revisions included until it\'s perfect.',
                },
                {
                  step: '03',
                  title: 'You Deliver',
                  description: 'Final videos. Your brand. Your client. Seamless handoff every time.',
                },
              ].map((item, index) => (
                <AnimatedSection key={index} delay={index * 150}>
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#2642ff] flex items-center justify-center mb-6 shadow-lg shadow-[#2642ff]/30">
                        <span className="text-2xl font-bold text-white">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-white/60 leading-relaxed">{item.description}</p>
                    </div>
                    {index < 2 && (
                      <div className="hidden md:block absolute top-8 left-[calc(100%+1.5rem)] w-[calc(100%-3rem)]">
                        <ArrowRight className="w-8 h-8 text-[#2642ff]/40 absolute -translate-x-1/2" />
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-8 md:mb-10 lg:mb-12">
                <div className="inline-block mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-xs font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Flexible Plans
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                  Right Pricing Packages
                </h2>
                <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
                  Choose your plan and scale by adding more editors.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="flex flex-col items-center justify-center gap-3 mb-6 md:mb-8">
                <div className="text-sm text-white/60">Show pricing in</div>
                <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as CurrencyCode)}>
                  <SelectTrigger className="w-full sm:w-[240px] rounded-xl border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#010333] text-white">
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="focus:bg-white/10">
                        {option.label} ({option.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/40">
                  {fxLoading ? 'Loading live exchange rates…' : `Prices are shown in ${selectedCurrencyOption.label} using live rates.`}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={140}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {pricingPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative"
                  >
                    <Card className={`relative border ${pkg.borderColor} bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30 hover:shadow-2xl transition-all duration-300 overflow-hidden group`}>
                      <CardContent className="p-4 lg:p-6">
                        {/* Header */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h3 className="text-white text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                              {pkg.name}
                            </h3>
                            {pkg.badge && (
                              <span className="relative px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                                {pkg.badge}
                              </span>
                            )}
                          </div>

                          <div className="mb-1">
                            <span className="text-3xl lg:text-4xl font-bold text-white">
                              {formatCurrency(calculatePrice(pkg.basePrice, packageEditorCounts[pkg.name] ?? 1), selectedCurrency)}
                            </span>
                            <span className="text-white/40 text-base">/month</span>
                          </div>
                          <p className="text-xs text-white/40">
                            for {(packageEditorCounts[pkg.name] ?? 1)} editor{(packageEditorCounts[pkg.name] ?? 1) > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                          {pkg.features.map((feature) => (
                            <div key={feature.label} className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm opacity-60">{feature.icon}</span>
                                <span className="text-xs text-white/70">{feature.label}</span>
                              </div>
                              <span className="text-xs text-white font-medium text-right">
                                {feature.detail}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Editor Counter & CTA */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-1 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updatePackageEditorCount(pkg.name, -1)}
                                disabled={packageEditorCounts[pkg.name] <= 1}
                                className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${packageEditorCounts[pkg.name] <= 1
                                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                                  }`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="min-w-[50px] text-center">
                                <span className="text-base font-semibold text-white">
                                  {packageEditorCounts[pkg.name] ?? 1}
                                </span>
                                <span className="text-xs text-white/50 ml-0.5">x</span>
                              </div>
                              <button
                                onClick={() => updatePackageEditorCount(pkg.name, 1)}
                                className="h-8 w-8 rounded-md flex items-center justify-center transition-all bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <Button
                            onClick={() => scrollToSection('contact')}
                            className="w-full h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold"
                          >
                            Get Started
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>

                        {/* Per Editor Price */}
                        <div className="mt-3 pt-3 border-t border-white/10 text-center">
                          <p className="text-[10px] text-white/40">
                            {formatCurrency(pkg.basePrice, selectedCurrency)}/month per editor
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* Additional Info */}
            <AnimatedSection delay={200}>
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <span className="text-xs text-white/60">Need a custom plan?</span>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                  >
                    Contact our sales team →
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="relative py-20 md:py-32 bg-[#020544]/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Client Success Stories
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Real results from media houses and agencies worldwide
                </p>
              </div>
            </AnimatedSection>

            <div className="space-y-16">
              {caseStudies.map((study, index) => (
                <AnimatedSection key={index} delay={index * 100}>
                  <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2642ff]/10 border border-[#2642ff]/20 mb-6">
                        <span className="text-sm text-[#2642ff] font-medium">Case Study {index + 1}</span>
                      </div>

                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                        {study.title}
                      </h3>
                      <p className="text-lg text-white/60 mb-6">
                        {study.subtitle}
                      </p>

                      <div className="space-y-4 mb-8">
                        <p className="text-white/80 leading-relaxed">
                          {study.description}
                        </p>
                        <p className="text-white/80 leading-relaxed">
                          {study.result}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {study.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="text-center p-4 rounded-xl bg-[#0a0d4a]/50 border border-white/10">
                            <div className="text-xl md:text-2xl font-bold text-[#2642ff] mb-1">{stat.value}</div>
                            <div className="text-xs text-white/50">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                      <Card className="bg-gradient-to-br from-[#0a0d4a] to-[#050735] border-white/10 h-full">
                        <CardContent className="p-8 md:p-10">
                          <Quote className="w-10 h-10 text-[#2642ff]/40 mb-6" />
                          <blockquote className="text-lg md:text-xl text-white leading-relaxed mb-8">
                            "{study.testimonial.quote}"
                          </blockquote>
                          <div className="flex items-center gap-4">
                            {study.testimonial.photo ? (
                              <img
                                src={study.testimonial.photo}
                                alt={`${study.testimonial.company} author`}
                                className="w-12 h-12 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#2642ff]/20 flex items-center justify-center">
                                <span className="text-[#2642ff] font-bold text-sm">
                                  {study.testimonial.author.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-white font-semibold">{study.testimonial.author}</div>
                              <div className="text-white/50 text-sm">{study.testimonial.company}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tool Stack Strip */}
      <section className="relative pb-20 md:pb-24 bg-[#020544]/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="rounded-2xl border border-white/10 bg-[#0a0d4a]/50 backdrop-blur-sm py-5">
                <div className="relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0d4a] to-transparent z-10" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0d4a] to-transparent z-10" />

                  <motion.div
                    className="flex w-max items-center gap-3 px-4"
                    animate={{ x: ['-50%', '0%'] }}
                    transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
                  >
                    {[...toolStack, ...toolStack].map((tool, index) => (
                      <div
                        key={`${tool.name}-${index}`}
                        className="flex items-center gap-2 px-3 py-2 whitespace-nowrap"
                      >
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="w-4 h-4 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallbackApplied) {
                              target.dataset.fallbackApplied = 'true';
                              target.src = tool.fallbackLogo;
                              return;
                            }

                            target.style.display = 'none';
                            const sibling = target.nextElementSibling as HTMLSpanElement | null;
                            if (sibling) sibling.classList.remove('hidden');
                          }}
                        />
                        <span className="hidden text-[10px] md:text-xs text-white/60 uppercase tracking-wide">
                          {tool.name.slice(0, 2)}
                        </span>
                        <span className="text-xs md:text-sm text-white/80">{tool.name}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Founder Message Section - Modern Card */}
      <section className="relative py-20 md:py-32 bg-[#020544]/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <div className="relative">
                {/* Main Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0d4a] via-[#080b3d] to-[#050735] border border-white/10">
                  <div className="relative p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Founder Profile - Full left side */}
                      <div className="lg:w-[340px] relative overflow-hidden rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none">
                        {/* Photo fills entire left section */}
                        <div className="relative h-72 lg:h-[420px]">
                          <img
                            src="/founder.webp"
                            alt="Ahsan Ullah - Founder & CEO"
                            className="w-full h-full object-cover object-[center_20%] md:object-center scale-110"
                          />
                          {/* Subtle gradient overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#020544]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#020544]/60 lg:via-transparent lg:to-transparent" />

                          {/* Name overlay */}
                          <div className="absolute bottom-5 left-5 right-5">
                            <h3 className="text-xl font-bold text-white">Ahsan Ullah</h3>
                            <p className="text-white/70 text-sm">Founder, Nexvoide</p>
                          </div>
                        </div>
                      </div>

                      {/* Message Content - Right side */}
                      <div className="flex-1 p-6 md:p-8 lg:p-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2642ff]/10 border border-[#2642ff]/20 mb-5">
                          <Quote className="w-4 h-4 text-[#2642ff]" />
                          <span className="text-sm text-[#2642ff] font-medium">Founder's Message</span>
                        </div>

                        <blockquote className="text-base md:text-lg text-white/90 leading-relaxed mb-6">
                          We started Nexvoide with one goal: help agencies scale without the hiring headache. Since then, we've delivered thousands of polished videos for media houses across the globe. Our dedicated team works through the night, so you wake up to finished, broadcast-ready edits every morning. While you focus on growing your business, we handle the production. That's not just a service — that's a partnership built on results.
                        </blockquote>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <Shield className="w-3.5 h-3.5 text-[#2642ff]" />
                            <span className="text-xs text-white/70">Your brand</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <Users className="w-3.5 h-3.5 text-[#2642ff]" />
                            <span className="text-xs text-white/70">Your clients</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-[#2642ff]" />
                            <span className="text-xs text-white/70">Our commitment</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 md:py-32 bg-[#020544]/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Ready to Scale Without Burnout?
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Try us with a 3-video test project. No commitment. Just quality.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <Card className="bg-gradient-to-br from-[#0a0d4a] to-[#050735] border-white/10">
                <CardContent className="p-8 md:p-12">
                  {formSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-[#2642ff]/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-[#2642ff]" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                      <p className="text-white/60">We'll respond within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Name</label>
                          <Input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="bg-[#010333] border-white/10 text-white placeholder:text-white/40 focus:border-[#2642ff] focus:ring-[#2642ff]/20 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Company</label>
                          <Input
                            type="text"
                            name="company"
                            placeholder="Your company"
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                            className="bg-[#010333] border-white/10 text-white placeholder:text-white/40 focus:border-[#2642ff] focus:ring-[#2642ff]/20 h-12"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Email</label>
                          <Input
                            type="email"
                            name="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="bg-[#010333] border-white/10 text-white placeholder:text-white/40 focus:border-[#2642ff] focus:ring-[#2642ff]/20 h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Phone</label>
                          <Input
                            type="tel"
                            name="phone"
                            placeholder="Add number with country code"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-[#010333] border-white/10 text-white placeholder:text-white/40 focus:border-[#2642ff] focus:ring-[#2642ff]/20 h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Message</label>
                        <Textarea
                          name="message"
                          placeholder="Tell us about your project needs..."
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="bg-[#010333] border-white/10 text-white placeholder:text-white/40 focus:border-[#2642ff] focus:ring-[#2642ff]/20 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#2642ff] hover:bg-[#1e35cc] text-white font-semibold py-6 rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#2642ff]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Request Test Project
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Contact Info */}
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="grid sm:grid-cols-2 gap-6 text-center sm:text-left">
                      <div>
                        <p className="text-white/50 text-sm mb-2">Email us directly</p>
                        <a
                          href="mailto:info@nexvoide.com"
                          className="inline-flex items-center gap-2 text-[#2642ff] hover:text-[#3d57ff] transition-colors font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          info@nexvoide.com
                        </a>
                      </div>
                      <div>
                        <p className="text-white/50 text-sm mb-2">Call us</p>
                        <a
                          href="tel:+923364558535"
                          className="inline-flex items-center gap-2 text-[#2642ff] hover:text-[#3d57ff] transition-colors font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          +92 336 4558535
                        </a>
                      </div>
                    </div>
                    <p className="text-center text-white/40 text-sm mt-6">
                      We'll respond within 24 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Add WhatsApp button here */}
      <WhatsAppButton />

      {/* Footer */}
      <footer className="relative py-12 md:py-16 border-t border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <img
                  src="/logo.webp"
                  alt="Nexvoide"
                  className="h-9 w-auto mx-auto md:mx-0 mb-4"
                />
                <p className="text-white/50 text-sm">
                  Overflow Editing for Media Houses & Agencies
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {navLinks.filter(l => !l.onClick).map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={() => setIsPortfolioOpen(true)}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Portfolio
                </button>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-white/40 text-sm">
                © 2026 Nexvoide. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;