import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

const STATS = [
  { value: '25%', label: 'of WHO recommended blood units available in Kenya' },
  { value: '4,500+', label: 'units needed every single day across Kenya' },
  { value: '1 in 3', label: 'Kenyans will need blood in their lifetime' },
]

const FEATURES = [
  {
    title: 'Real-time hero alerts',
    description: 'Donors get notified instantly when their blood type is critically needed nearby. Calm tone, clear opt-out.',
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    iconColor: '#A32D2D',
    icon: 'M10 3C7 3 5 5.5 5 8v4l-1.5 2h13L15 12V8c0-2.5-2-5-5-5z M8 15a2 2 0 004 0',
  },
  {
    title: 'Eligibility countdown',
    description: 'Donors always know exactly when they can give again — updated automatically after every donation.',
    bg: 'bg-green-50',
    border: 'border-green-100',
    iconBg: 'bg-green-100',
    iconColor: '#3B6D11',
    icon: 'M10 10m-7 0a7 7 0 1014 0 7 7 0 00-14 0 M10 7v3l2 1.5',
  },
  {
    title: 'Donor passport',
    description: 'Every donation earns badges and builds a verified health history donors carry with pride.',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: '#BA7517',
    icon: 'M10 3l1.8 3.6L15.5 7l-2.75 2.7.65 3.8L10 11.7l-3.4 1.8.65-3.8L4.5 7l3.7-.4L10 3z',
  },
  {
    title: 'Deferred donor care',
    description: 'Donors turned away get a guided recovery plan — iron-rich meal tips, hydration reminders, re-eligibility alerts.',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: '#185FA5',
    icon: 'M10 4C7 4 5 6 5 9c0 2 1.5 3.5 3 4.5V16h4v-2.5C13.5 12.5 15 11 15 9c0-3-2-5-5-5z',
  },
  {
    title: 'Partner dashboard',
    description: 'Hospitals and blood banks log donations in seconds. Real-time centre stats. No paperwork.',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
    iconColor: '#534AB7',
    icon: 'M3 17V8l7-5 7 5v9 M7 11h6v6H7z',
  },
  {
    title: 'Community blood drives',
    description: 'Coordinators create drives with QR check-in, live donor counts, and CSR certificates.',
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    iconBg: 'bg-gray-100',
    iconColor: '#5F5E5A',
    icon: 'M3 4h14v13H3z M3 8h14 M7 2v4M13 2v4',
  },
]

const STEPS = [
  {
    number: '1',
    title: 'Create your profile',
    description: 'Sign up with Google or email. Tell us your blood type and county. Takes under 2 minutes.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    number: '2',
    title: 'Walk into any partner centre',
    description: 'Donate at any PulseLink-partnered hospital or blood bank. Staff log your donation digitally.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    number: '3',
    title: 'Track your impact',
    description: 'Watch your donor passport grow. Get hero alerts. Earn badges. See when you can donate again.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
]

const TESTIMONIALS = [
  {
    quote: 'I used to donate and never know what happened to my blood. Now I can see the whole journey.',
    name: 'Amina K.',
    tag: 'Donor · Nairobi',
    initials: 'AK',
    color: 'bg-red-100 text-red-700',
  },
  {
    quote: 'The deferral recovery plan is something no other platform does. We see donors come back.',
    name: 'Dr. Omondi',
    tag: 'Partner · KNH Blood Bank',
    initials: 'DO',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    quote: 'Our campus drive had 200 registrations. The QR check-in made it seamless.',
    name: 'Grace M.',
    tag: 'Coordinator · JKUAT',
    initials: 'GM',
    color: 'bg-purple-100 text-purple-700',
  },
]

export default function Landing() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
              </svg>
            </div>
            <span className="text-base font-medium text-gray-900">PulseLink</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              How it works
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </button>
            <button onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Join
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-red-50 opacity-60" />
          <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-red-50 opacity-40" />
          <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-gray-50 opacity-80" />
          {/* Dot grid */}
          <svg className="absolute top-0 right-0 opacity-20" width="400" height="400" viewBox="0 0 400 400">
            {Array.from({ length: 10 }).map((_, row) =>
              Array.from({ length: 10 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={col * 40 + 20} cy={row * 40 + 20} r="1.5" fill="#ef4444"/>
              ))
            )}
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-700 font-medium">
                  Now live across Kenya
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-medium text-gray-900 leading-[1.1] mb-6">
                Every drop
                <br />
                <span className="text-red-600">saves a life.</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                PulseLink connects blood donors, hospitals, and
                coordinators across Kenya with real-time alerts,
                digital records, and community drives.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-8 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
                >
                  Start donating
                </button>
                <button
                  onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Partner with us
                </button>
              </div>

              {/* Mini stats */}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-medium text-gray-900">4,500+</p>
                  <p className="text-xs text-gray-400">units needed daily</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-2xl font-medium text-gray-900">47</p>
                  <p className="text-xs text-gray-400">counties covered</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-2xl font-medium text-gray-900">25%</p>
                  <p className="text-xs text-gray-400">of WHO target met</p>
                </div>
              </div>
            </div>

            {/* Right — app mockup cards */}
            <div className="hidden md:flex flex-col gap-3">

              {/* Timer card */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                  Eligible to donate
                </p>
                <p className="text-3xl font-medium text-green-700">Ready now</p>
                <p className="text-xs text-green-600 mt-1 opacity-80">
                  Next donation window is open
                </p>
              </div>

              {/* Alert card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">O+ needed · Nairobi</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Critical shortage at KNH. 2.1 km from you.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium">
                        I can help
                      </span>
                      <span className="px-3 py-1 border border-amber-300 text-amber-700 rounded-lg text-xs">
                        Not now
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3l1.8 3.6L15.5 7l-2.75 2.7.65 3.8L10 11.7l-3.4 1.8.65-3.8L4.5 7l3.7-.4L10 3z"
                      fill="#B4B2A9" stroke="#888780" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Silver savior</p>
                  <p className="text-xs text-gray-400">5 donations · earned today</p>
                </div>
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  silver
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-red-600 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-4xl font-medium text-white mb-1">{stat.value}</p>
              <p className="text-sm text-red-200 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              For donors
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-gray-900 max-w-sm">
              Simple as three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  activeStep === i
                    ? `${step.bg} border-transparent`
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => setActiveStep(i)}
              >
                <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center mb-4 ${
                  activeStep === i ? 'bg-white' : ''
                }`}>
                  <span className={`text-lg font-medium ${step.color}`}>{step.number}</span>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Platform features
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 max-w-sm">
                Built for Kenya's reality
              </h2>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Every feature designed around how blood donation actually works —
                from walk-in donors to emergency shortages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`${f.bg} border ${f.border} rounded-2xl p-6 flex flex-col gap-4 hover:scale-[1.01] transition-transform cursor-default`}
              >
                <div className={`w-10 h-10 ${f.iconBg} rounded-xl flex items-center justify-center`}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d={f.icon} stroke={f.iconColor} strokeWidth="1.2"
                      strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Community
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-gray-900">
              Voices from the field
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-medium">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.tag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join — role picker */}
      <section id="join" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Get started
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-gray-900">
              Join PulseLink today
            </h2>
            <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
              Whether you give blood, collect it, or organise drives —
              there's a place for you on PulseLink.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Donor */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-red-200 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3C10 3 5 7.5 5 11a5 5 0 0010 0C15 7.5 10 3 10 3z"
                    stroke="#A32D2D" strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 mb-1">Blood donor</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Track donations, earn badges, get hero alerts,
                  and manage your health history.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-3">Free forever · No hospital needed</p>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
                >
                  Sign up as donor
                </button>
              </div>
            </div>

            {/* Partner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <path d="M3 17V8l7-5 7 5v9"
                    stroke="#185FA5" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                  <rect x="7" y="11" width="6" height="6"
                    stroke="#185FA5" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 mb-1">Hospital / Blood bank</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Log donations digitally, manage deferrals,
                  and get real-time centre dashboards.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-3">Admin approval · 2 business days</p>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Apply as partner
                </button>
              </div>
            </div>

            {/* Coordinator */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:border-purple-200 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="13" rx="2"
                    stroke="#534AB7" strokeWidth="1.2" fill="none"/>
                  <path d="M3 8h14M7 2v4M13 2v4"
                    stroke="#534AB7" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 mb-1">Drive coordinator</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Organise blood drives for your company,
                  university, or community group.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-3">Admin approval · 2 business days</p>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 active:scale-95 transition-all"
                >
                  Apply as coordinator
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
            Kenya needs you.
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            A single donation can save up to three lives.
            Join PulseLink and become part of Kenya's blood donor community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
            >
              Create your account
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-gray-700 text-gray-300 rounded-2xl text-sm font-medium hover:border-gray-500 active:scale-95 transition-all"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-white">PulseLink</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              How it works
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Features
            </button>
            <button onClick={() => router.push('/auth/signup')}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Sign up
            </button>
            <button onClick={() => router.push('/auth/login')}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Sign in
            </button>
          </div>

          <p className="text-xs text-gray-600">
            © 2026 PulseLink · Saving lives across Kenya
          </p>
        </div>
      </footer>

    </div>
  )
}