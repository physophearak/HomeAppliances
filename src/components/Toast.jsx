export default function Toast({ toast }) {
  if (!toast) return null
  const isError = toast.type === 'error'

  return (
    <div className="fixed top-48 left-1/2 -translate-x-1/2 z-[60] animate-pop-in px-4 w-full max-w-md">
      <div
        className={`rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg text-center ${
          isError ? 'bg-red-600' : 'bg-emerald-600'
        }`}
      >
        {toast.message}
      </div>
    </div>
  )
}
