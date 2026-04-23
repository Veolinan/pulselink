import { useState } from 'react'

type Donation = {
  id: string
  blood_bank: string
  county: string
  donated_at: string
  volume_ml: number
  status: 'completed' | 'deferred'
  deferral_reason?: string
}

const MOCK_DONATIONS: Donation[] = [
  {
    id: '1',
    blood_bank: 'Kenyatta National Hospital',
    county: 'Nairobi',
    donated_at: '2025-03-14',
    volume_ml: 450,
    status: 'completed',
  },
  {
    id: '2',
    blood_bank: 'JKUAT Health Centre',
    county: 'Kiambu',
    donated_at: '2024-12-12',
    volume_ml: 450,
    status: 'completed',
  },
  {
    id: '3',
    blood_bank: 'Kabarak University Clinic',
    county: 'Nakuru',
    donated_at: '2024-09-03',
    volume_ml: 450,
    status: 'completed',
  },
  {
    id: '4',
    blood_bank: 'Nairobi Hospital',
    county: 'Nairobi',
    donated_at: '2024-06-04',
    volume_ml: 0,
    status: 'deferred',
    deferral_reason: 'Low haemoglobin',
  },
  {
    id: '5',
    blood_bank: 'Kenya Red Cross — Upperhill',
    county: 'Nairobi',
    donated_at: '2024-03-20',
    volume_ml: 450,
    status: 'completed',
  },
  {
    id: '6',
    blood_bank: 'Moi Teaching & Referral Hospital',
    county: 'Uasin Gishu',
    donated_at: '2023-12-01',
    volume_ml: 450,
    status: 'completed',
  },
  {
    id: '7',
    blood_bank: 'Aga Khan Hospital',
    county: 'Nairobi',
    donated_at: '2023-08-15',
    volume_ml: 450,
    status: 'completed',
  },
]

type Filter = 'all' | 'completed' | 'deferred'

export default function History() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = MOCK_DONATIONS.filter((d) => {
    if (filter === 'all') return true
    return d.status === filter
  })

  const completed = MOCK_DONATIONS.filter(d => d.status === 'completed')
  const totalVolume = completed.reduce((sum, d) => sum + d.volume_ml, 0)
  const deferred = MOCK_DONATIONS.filter(d => d.status === 'deferred')

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Donation history</h1>
        <p className="text-sm text-gray-400 mt-0.5">Every drop counts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-medium text-gray-900">{completed.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Completed</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-medium text-gray-900">
            {(totalVolume / 1000).toFixed(2)}L
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Total given</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-medium text-gray-900">{deferred.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Deferred</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-100">
        {(['all', 'completed', 'deferred'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f
                ? 'text-red-600 border-red-500'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Donation list */}
      <div className="flex flex-col divide-y divide-gray-50">
        {filtered.map((donation) => (
          <div key={donation.id} className="py-3 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-900">{donation.blood_bank}</p>
              <p className="text-xs text-gray-400">
                {new Date(donation.donated_at).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })} · {donation.county}
              </p>
              {donation.deferral_reason && (
                <p className="text-xs text-amber-600">{donation.deferral_reason}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {donation.status === 'completed' ? (
                <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Completed
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  Deferred
                </span>
              )}
              {donation.volume_ml > 0 && (
                <p className="text-xs text-gray-400">{donation.volume_ml} ml</p>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}