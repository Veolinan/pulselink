import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Logo from '@/components/ui/Logo'

const STATS = [
  { value: '18,204', label: 'Donors', sub: '+412 this week' },
  { value: '47,912', label: 'Donations', sub: '+1,203 this week' },
  { value: '64', label: 'Centres', sub: '3 pending approval' },
  { value: '47', label: 'Counties', sub: 'across Kenya' },
]

const FEATURES = [
  {
    label: 'For donors',
    title: 'Your ledger.',
    body: 'Every donation logged. Every badge earned. Your eligibility countdown updated automatically after each visit.',
    chip: 'READY · 0 DAYS',
    chipColor: 'text-green-700 bg-green-50 border-green-200',
  },
  {
    label: 'For hospitals',
    title: 'Log a donation.',
    body: 'Search by name. Confirm volume. Commit. The donor\'s record updates instantly — no paper, no delay.',
    chip: '450 ML · COMPLETED',
    chipColor: 'text-ink-2 bg-paper-2 border-line',
  },
  {
    label: 'For coordinators',
    title: 'Run a drive.',
    body: 'Create a drive, share a QR code, track check-ins live. Export a participation report for your CSR team.',
    chip: '142 REGISTERED · 98 CHECKED IN',
    chipColor: 'text-purple-700 bg-purple-50 border-purple-200',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create your profile.',
    body: 'Sign up with Google or email. Tell us your blood type and county. Two minutes.',
  },
  {
    n: '02',
    title: 'Walk into any partner centre.',
    body: 'Donate at any PulseLink hospital or blood bank. Staff log your donation — your record updates instantly.',
  },
  {
    n: '03',
    title: 'Track your impact.',
    body: 'Watch your donor passport grow. Earn badges. Get hero alerts when your blood type is critically needed nearby.',
  },
]

export default function Landing() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-paper text-ink" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-paper/95 backdrop-blur-sm border-b border-line' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            {[['how', 'How it works'], ['features', 'Features'], ['join', 'Join']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-body-sm text-ink-3 hover:text-ink transition-colors">
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/auth/login')}
              className="text-body-sm text-ink-2 hover:text-ink transition-colors">
              Sign in
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-5 py-2 bg-ink text-paper rounded-full text-body-sm font-medium hover:bg-ink-2 active:scale-95 transition-all"
            >
              Become a donor →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-6 w-full py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              {/* Live pill */}
              <div className="inline-flex items-center gap-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                <span className="label-caps">Live · 3 hero alerts in Kenya, right now</span>
              </div>

              <h1 className="editorial-heading text-display-2 text-ink mb-4">
                Every drop,<br />
                <em className="text-brand-red not-italic" style={{ fontStyle: 'italic' }}>every name,</em><br />
                every time.
              </h1>

              <p className="text-body-lg text-ink-2 mb-3 max-w-sm leading-relaxed">
                PulseLink connects Kenya's blood donors to the hospitals
                that need them — in minutes, by name, by blood type,
                by how close you are to the door.
              </p>

              <p className="label-caps mb-8 text-ink-3">
                Unganisha maisha · Connecting life
              </p>

              <div className="flex items-center gap-3 mb-12">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-7 py-3 bg-ink text-paper rounded-full text-body-sm font-medium hover:bg-ink-2 active:scale-95 transition-all flex items-center gap-2"
                >
                  Become a donor
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-7 py-3 bg-paper-2 border border-line text-ink rounded-full text-body-sm font-medium hover:bg-line active:scale-95 transition-all"
                >
                  I'm a hospital
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-line">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="text-heading-2 font-medium text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
                      {s.value}
                    </p>
                    <p className="label-caps mt-0.5">{s.label}</p>
                    <p className="text-body-sm text-ink-3 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — phone mockup */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-72 bg-ink rounded-[40px] p-2 shadow-elevated">
                  <div className="bg-paper rounded-[32px] overflow-hidden">

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                      <span className="text-mono-sm font-medium text-ink">9:41</span>
                      <div className="w-24 h-5 bg-ink rounded-full" />
                      <span className="text-mono-sm text-ink-3">●●●● 100</span>
                    </div>

                    <div className="px-5 pb-6">
                      {/* Greeting */}
                      <div className="mb-4">
                        <p className="label-caps text-ink-3">
                          {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                        </p>
                        <h2 className="text-heading-1 font-medium text-ink mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
                          Habari, <em>Amina.</em>
                        </h2>
                      </div>

                      {/* Eligibility */}
                      <div className="bg-paper-2 border border-line rounded-xl p-4 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="label-caps">Eligibility</span>
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 text-label font-medium">
                            <span className="w-1 h-1 rounded-full bg-green-500" />
                            READY
                          </span>
                        </div>
                        <p className="text-display-3 font-medium text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
                          0 <span className="text-heading-2 text-ink-3">days</span>
                        </p>
                        <p className="text-body-sm text-ink-2 mt-1">
                          You're eligible today. Three hospitals within 8 km have open slots.
                        </p>
                        <button className="mt-3 w-full py-2.5 bg-brand-red text-paper rounded-lg text-body-sm font-medium">
                          Book a donation →
                        </button>
                      </div>

                      {/* Hero alert */}
                      <div className="border border-brand-red rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                            <span className="label-caps text-brand-red">Hero alert · 2 km</span>
                          </div>
                          <span className="text-label text-ink-3">12m ago</span>
                        </div>
                        <p className="text-body-sm text-ink font-medium">
                          O+ needed at <em style={{ fontFamily: "'Fraunces', serif" }}>Kenyatta National.</em>
                        </p>
                        <p className="text-body-sm text-ink-2 mt-0.5">
                          Road accident. They need three donors before 17:00.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button className="flex-1 py-2 bg-ink text-paper rounded-lg text-label font-medium">
                            I can help
                          </button>
                          <button className="flex-1 py-2 border border-line text-ink-2 rounded-lg text-label">
                            Not today
                          </button>
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div className="mt-3 pt-3 border-t border-line">
                        <p className="label-caps mb-1">Your story</p>
                        <p className="text-body-sm text-ink-2">
                          <span className="font-medium text-ink">7</span> donations ·{' '}
                          <span className="font-medium text-ink">3.15 L</span> ·{' '}
                          ≈ <span className="font-medium text-ink">7</span> lives
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 items-start">
            <div>
              <p className="label-caps mb-4">How it works</p>
              <h2 className="editorial-heading text-display-3 text-ink">
                Simple as<br />
                <em className="text-brand-red">three steps.</em>
              </h2>
            </div>
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex flex-col gap-3">
                <p className="text-display-3 font-light text-line" style={{ fontFamily: "'Fraunces', serif" }}>
                  {s.n}
                </p>
                <h3 className="text-heading-2 font-medium text-ink">{s.title}</h3>
                <p className="text-body text-ink-2 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-paper-2 border-y border-line">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="label-caps mb-4">Platform</p>
              <h2 className="editorial-heading text-display-3 text-ink">
                Built for<br />
                <em className="text-brand-red">Kenya's reality.</em>
              </h2>
            </div>
            <p className="text-body text-ink-2 max-w-xs leading-relaxed">
              Every feature designed around how blood donation actually works —
              from walk-in donors to emergency shortages.
            </p>
          </div>

          {/* Feature tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {FEATURES.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setActiveFeature(i)}
                className={`px-4 py-2 rounded-full text-body-sm font-medium border transition-all ${
                  activeFeature === i
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper border-line text-ink-2 hover:border-ink-3'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feature card */}
          <div className="bg-paper border border-line rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label font-medium mb-6 ${FEATURES[activeFeature].chipColor}`}>
                  {FEATURES[activeFeature].chip}
                </span>
                <h3 className="editorial-heading text-display-3 text-ink mb-4">
                  {FEATURES[activeFeature].title}
                </h3>
                <p className="text-body-lg text-ink-2 leading-relaxed">
                  {FEATURES[activeFeature].body}
                </p>
              </div>

              {/* Visual */}
              <div className="flex justify-center md:justify-end">
                {activeFeature === 0 && (
                  <div className="w-full max-w-xs bg-paper-2 border border-line rounded-xl p-5 flex flex-col gap-3">
                    <p className="label-caps">Your ledger</p>
                    <div className="flex justify-between items-baseline">
                      <p className="text-display-2 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>3.15<span className="text-heading-1 text-ink-3">L</span></p>
                      <p className="text-body-sm text-ink-3">Since May 2023</p>
                    </div>
                    {[
                      { date: '14 Jan 2025', place: 'Kenyatta National', ml: '450 ml', color: 'bg-brand-red' },
                      { date: '22 Oct 2024', place: 'Aga Khan Hospital', ml: '450 ml', color: 'bg-brand-red' },
                      { date: '08 Jul 2024', place: 'KNH Blood Centre', ml: '450 ml', color: 'bg-brand-red' },
                    ].map(d => (
                      <div key={d.date} className="flex items-center gap-3 py-2 border-t border-line">
                        <div className={`w-1.5 h-1.5 rounded-full ${d.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-ink truncate">{d.place}</p>
                          <p className="text-label text-ink-3">{d.date}</p>
                        </div>
                        <p className="text-body-sm text-ink-2 flex-shrink-0">{d.ml}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeFeature === 1 && (
                  <div className="w-full max-w-xs bg-paper-2 border border-line rounded-xl p-5 flex flex-col gap-4">
                    <div>
                      <p className="label-caps mb-1">01 · Find the donor</p>
                      <div className="bg-paper border border-line rounded-lg px-3 py-2.5 flex items-center justify-between">
                        <span className="text-body-sm text-ink">Amina Odhiambo</span>
                        <span className="text-label text-brand-red font-medium">MATCHED</span>
                      </div>
                      <div className="mt-2 bg-brand-red-light border border-brand-red/20 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm font-medium text-ink">Amina Odhiambo</span>
                          <span className="text-label bg-brand-red text-paper px-1.5 py-0.5 rounded">O+</span>
                        </div>
                        <p className="text-label text-green-700 mt-0.5">✓ Eligible. 90 days since last donation.</p>
                      </div>
                    </div>
                    <div>
                      <p className="label-caps mb-1">02 · Volume collected</p>
                      <p className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
                        450<span className="text-heading-2 text-ink-3">ml</span>
                      </p>
                    </div>
                    <button className="w-full py-2.5 bg-brand-red text-paper rounded-lg text-body-sm font-medium">
                      Confirm & commit
                    </button>
                  </div>
                )}

                {activeFeature === 2 && (
                  <div className="w-full max-w-xs bg-paper-2 border border-line rounded-xl p-5 flex flex-col gap-3">
                    <p className="label-caps">Drive · JKUAT Campus</p>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>142</p>
                        <p className="text-label text-ink-3">registered</p>
                      </div>
                      <div className="text-right">
                        <p className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>98</p>
                        <p className="text-label text-ink-3">checked in</p>
                      </div>
                    </div>
                    <div className="w-full bg-line rounded-full h-1.5 mt-1">
                      <div className="bg-brand-red h-1.5 rounded-full" style={{ width: '69%' }} />
                    </div>
                    <p className="text-body-sm text-ink-2">69% turnout · Drive closes at 17:00</p>
                    <div className="mt-2 pt-3 border-t border-line">
                      <p className="label-caps mb-2">Recent check-ins</p>
                      {['Brian Kariuki · O+', 'Wanjiru Mathenge · B+', 'Ouma Omondi · A−'].map(name => (
                        <div key={name} className="flex items-center gap-2 py-1.5 border-b border-line last:border-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <p className="text-body-sm text-ink">{name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join */}
      <section id="join" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="label-caps mb-4">Get started</p>
            <h2 className="editorial-heading text-display-3 text-ink mb-3">
              Join PulseLink today.
            </h2>
            <p className="text-body-lg text-ink-2 max-w-md mx-auto">
              Whether you give blood, collect it, or organise drives —
              there's a place for you on PulseLink.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                role: 'Blood donor',
                tagline: 'Free forever · No hospital needed',
                description: 'Track donations, earn badges, get hero alerts, and manage your health history from your phone.',
                cta: 'Sign up as donor',
                ctaBg: 'bg-brand-red text-paper hover:bg-red-800',
                border: 'border-line hover:border-brand-red',
              },
              {
                role: 'Hospital / Blood bank',
                tagline: 'Admin approval · 2 business days',
                description: 'Log donations digitally, manage deferrals, and get real-time centre dashboards for your team.',
                cta: 'Apply as partner',
                ctaBg: 'bg-ink text-paper hover:bg-ink-2',
                border: 'border-line hover:border-ink',
              },
              {
                role: 'Drive coordinator',
                tagline: 'Admin approval · 2 business days',
                description: 'Organise blood drives for your company, university or community. QR check-in, live counts, CSR reports.',
                cta: 'Apply as coordinator',
                ctaBg: 'bg-ink text-paper hover:bg-ink-2',
                border: 'border-line hover:border-ink',
              },
            ].map((card) => (
              <div key={card.role}
                className={`bg-paper border ${card.border} rounded-2xl p-7 flex flex-col gap-4 transition-colors`}>
                <div className="flex-1">
                  <p className="text-heading-2 font-medium text-ink mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    {card.role}
                  </p>
                  <p className="label-caps mb-4">{card.tagline}</p>
                  <p className="text-body text-ink-2 leading-relaxed">{card.description}</p>
                </div>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className={`w-full py-3 rounded-xl text-body-sm font-medium active:scale-95 transition-all ${card.ctaBg}`}
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-ink">
        <div className="max-w-3xl mx-auto text-center">
          <Logo size="lg" dark />
          <p className="label-caps text-ink-3 mt-3 mb-8">
            Unganisha maisha · Connecting life
          </p>
          <h2 className="editorial-heading text-display-2 text-paper mb-6">
            Kenya needs you.
          </h2>
          <p className="text-body-lg text-ink-3 mb-10 max-w-md mx-auto leading-relaxed">
            A single donation can save up to three lives.
            Join the community building a stronger blood supply —
            one donation at a time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-red text-paper rounded-full text-body-sm font-medium hover:bg-red-800 active:scale-95 transition-all"
            >
              Create your account
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-ink-2 text-ink-3 rounded-full text-body-sm font-medium hover:border-ink-3 active:scale-95 transition-all"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-ink border-t border-ink-2">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo dark />
          <p className="label-caps text-ink-3">
            Unganisha maisha · Connecting life
          </p>
          <div className="flex items-center gap-6">
            {[['how', 'How it works'], ['features', 'Features'], ['join', 'Join']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-body-sm text-ink-3 hover:text-ink-2 transition-colors">
                {label}
              </button>
            ))}
            <button onClick={() => router.push('/auth/login')}
              className="text-body-sm text-ink-3 hover:text-ink-2 transition-colors">
              Sign in
            </button>
          </div>
          <p className="text-body-sm text-ink-3">© 2026 PulseLink</p>
        </div>
      </footer>

    </div>
  )
}