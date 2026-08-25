import { useMemo } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd, formatKhr } from '../lib/currency'
import { getSalesLog } from '../lib/api'
import ManageHeader from './ManageHeader'

function isToday(isoString) {
  const d = new Date(isoString)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export default function ReportsTab({ role }) {
  const { t } = useLanguage()

  const { totalUsd, saleCount, itemCount, topItems } = useMemo(() => {
    const sales = getSalesLog().filter((s) => isToday(s.timestamp))
    const totalUsd = sales.reduce((sum, s) => sum + Number(s.total || 0), 0)
    const itemTotals = new Map()
    let itemCount = 0
    sales.forEach((s) => {
      ;(s.items || []).forEach((line) => {
        itemCount += Number(line.qty || 0)
        itemTotals.set(line.nameEn, (itemTotals.get(line.nameEn) || 0) + Number(line.qty || 0))
      })
    })
    const topItems = [...itemTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    return { totalUsd, saleCount: sales.length, itemCount, topItems }
  }, [])

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('reportsTitle')} subtitle={t('reportsSubtitle')} role={role} />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label={t('totalRevenue')} value={formatUsd(totalUsd)} sub={formatKhr(totalUsd)} />
        <StatCard label={t('numberOfSales')} value={saleCount} />
        <StatCard label={t('itemsSold')} value={itemCount} />
      </div>

      <h3 className="text-xl font-extrabold text-gray-900 mb-2">{t('topSellers')}</h3>
      {topItems.length === 0 ? (
        <p className="text-gray-500">{t('noSalesToday')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {topItems.map(([name, qty]) => (
            <li
              key={name}
              className="flex items-center justify-between bg-white rounded-2xl border-4 border-gray-100 px-4 py-3"
            >
              <span className="font-bold text-gray-900">{name}</span>
              <span className="font-extrabold text-emerald-700">
                {qty} {t('unitsShort')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border-4 border-gray-100 p-4">
      <p className="text-sm font-bold text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-sm text-gray-400">{sub}</p>}
    </div>
  )
}
