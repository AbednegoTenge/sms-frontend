export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))

export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))

export const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency', currency: 'GHS',
  }).format(Number(amount))

export const formatRelative = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDate(date)
}

export const getDueDateStatus = (due: string) => {
  const now = new Date()
  const dueDate = new Date(due)
  const diffHours = (dueDate.getTime() - now.getTime()) / 3600000
  if (diffHours < 0)  return { label: 'Overdue', color: 'text-red-600' }
  if (diffHours < 24) return { label: 'Due today', color: 'text-orange-600' }
  if (diffHours < 72) return { label: 'Due soon', color: 'text-yellow-600' }
  return { label: formatDateTime(due), color: 'text-gray-600' }
}
