import { adminService } from '@/core/lib/services/adminService'
import { userService } from '@/core/lib/services/userService'
import { useState, useEffect } from 'react'

export default function DataManager() {
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, tagsData, badgesData] = await Promise.all([
        userService.getUsers(10),
        adminService.getTags(),
        adminService.getBadges(),
      ])

      setUsers(usersData)
      setTags(tagsData)
      setBadges(badgesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="p-3 border rounded">
                <div className="font-medium">
                  {user.username || user.full_name}
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm">
                  Reputation: {user.reputation_score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tags ({tags.length})</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Badges ({badges.length})
          </h2>
          <div className="space-y-2">
            {badges.map(badge => (
              <div key={badge.id} className="p-3 border rounded">
                <div className="font-medium">{badge.name}</div>
                <div className="text-sm text-gray-600">{badge.description}</div>
                <div className="text-sm">Code: {badge.code}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
