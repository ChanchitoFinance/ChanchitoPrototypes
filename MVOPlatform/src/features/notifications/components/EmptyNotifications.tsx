import { Bell } from 'lucide-react'

export default function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(110vh-200px)] py-12">
      <div className="mb-4 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
        <Bell className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">
        No notifications yet
      </h3>
      <p className="text-text-secondary text-sm max-w-md text-center">
        You'll see notifications here when someone votes on your ideas, comments
        on them, or when other important events happen.
      </p>
    </div>
  )
}
