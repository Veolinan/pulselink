import { useState } from 'react'

type RehabStep = {
  id: string
  title: string
  description: string
  done: boolean
}

const MOCK_DEFERRAL = {
  reason: 'Low haemoglobin',
  deferred_at: '2024-06-04',
  eligible_from: '2024-07-04',
  resolved: false,
}

const INITIAL_STEPS: RehabStep[] = [
  {
    id: 'nutrition',
    title: 'Iron-rich meals',
    description: 'Eat beans, spinach, red meat, and eggs daily for at least 2 weeks.',
    done: true,
  },
  {
    id: 'hydration',
    title: 'Hydration',
    description: 'Drink at least 3 litres of water daily in the week before donating.',
    done: true,
  },
  {
    id: 'checkin',
    title: 'Check-in',
    description: 'Log your haemoglobin level. We will remind you on day 20.',
    done: false,
  },
  {
    id: 'cleared',
    title: 'Ready to donate',
    description: 'Your eligibility window opens on your return date. Book at any blood bank.',
    done: false,
  },
]

const IRON_FOODS = [
  { name: 'Beef liver', amount: '100g → 6.5mg iron' },
  { name: 'Lentils', amount: '1 cup → 6.6mg iron' },
  { name: 'Spinach', amount: '1 cup cooked → 6.4mg iron' },
  { name: 'Kidney beans', amount: '1 cup → 5.2mg iron' },
  { name: 'Pumpkin seeds', amount: '30g → 2.5mg iron' },
  { name: 'Dark chocolate', amount: '30g → 3.4mg iron' },
]

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 0
  return Math.ceil(diff / 86400000)
}

function progressPercent(steps: RehabStep[]) {
  return Math.round((steps.filter(s => s.done).length / steps.length) * 100)
}

export default function Recovery() {
  const [steps, setSteps] = useState<RehabStep[]>(INITIAL_STEPS)
  const [activeTab, setActiveTab] = useState<'plan' | 'nutrition'>('plan')

  const daysLeft = daysUntil(MOCK_DEFERRAL.eligible_from)
  const progress = progressPercent(steps)
  const doneCount = steps.filter(s => s.done).length

  const toggleStep = (id: string) => {
    setSteps(prev =>
      prev.map(s => s.id === id ? { ...s, done: !s.done } : s)
    )
  }

  // No active deferral state
  if (MOCK_DEFERRAL.resolved) {
    return (
      <div className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l5 5 11-11" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900">You are cleared</h2>
        <p className="text-sm text-gray-400">No active deferral. You are ready to donate.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Come back stronger</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Deferred {new Date(MOCK_DEFERRAL.deferred_at).toLocaleDateString('en-KE', {
            day: 'numeric', month: 'short', year: 'numeric'
          })} · {MOCK_DEFERRAL.reason}
        </p>
      </div>

      {/* Eligibility countdown */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
          Eligible from
        </p>
        <p className="text-2xl font-medium text-blue-700">
          {new Date(MOCK_DEFERRAL.eligible_from).toLocaleDateString('en-KE', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
        <p className="text-xs text-blue-500 mt-1">
          {daysLeft > 0 ? `${daysLeft} days away` : 'You are eligible now'}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-500">Rehab progress</p>
          <p className="text-xs font-medium text-gray-700">{doneCount} / {steps.length} steps</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{progress}% complete</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['plan', 'nutrition'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-red-600 border-red-500'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {tab === 'plan' ? 'Recovery plan' : 'Iron-rich foods'}
          </button>
        ))}
      </div>

      {/* Recovery plan tab */}
      {activeTab === 'plan' && (
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`flex gap-3 items-start p-4 rounded-xl border cursor-pointer transition-colors ${
                step.done
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Step indicator */}
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 mt-0.5 transition-colors ${
                step.done
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 bg-white'
              }`}>
                {step.done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.done ? 'text-green-800' : 'text-gray-800'}`}>
                  {step.title}
                </p>
                <p className={`text-xs mt-0.5 ${step.done ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-300 text-center mt-1">
            Tap any step to mark it complete
          </p>
        </div>
      )}

      {/* Nutrition tab */}
      {activeTab === 'nutrition' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400">
            These foods are high in iron and will help raise your haemoglobin before your next donation.
          </p>
          {IRON_FOODS.map((food) => (
            <div
              key={food.name}
              className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-300 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-800">{food.name}</p>
              </div>
              <p className="text-xs text-gray-400">{food.amount}</p>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-1">
            <p className="text-xs text-amber-700">
              Tip: Pair iron-rich foods with vitamin C (oranges, tomatoes) to boost absorption. Avoid tea or coffee within an hour of eating iron-rich meals.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}