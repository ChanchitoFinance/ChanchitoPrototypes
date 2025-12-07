'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react'

const mockStats = {
  totalIdeas: 1247,
  pendingValidation: 23,
  completedToday: 45,
  revenue: 12450,
}

const mockReports = [
  {
    id: '1',
    idea: 'AI-Powered Meal Planning App',
    author: 'Sarah Chen',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    idea: 'Sustainable Fashion Marketplace',
    author: 'Michael Rodriguez',
    status: 'completed',
    submittedAt: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    idea: 'Remote Team Building Platform',
    author: 'Emily Johnson',
    status: 'completed',
    submittedAt: '2024-01-13T09:15:00Z',
  },
]

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'reports'>(
    'overview'
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold text-text-primary mb-2">
          Admin Dashboard
        </h1>
        <p className="text-base text-text-secondary">
          Manage ideas, reports, and platform settings
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-100">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 text-base font-medium border-b-2 transition-colors ${
            selectedTab === 'overview'
              ? 'border-accent text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('reports')}
          className={`px-4 py-2 text-base font-medium border-b-2 transition-colors ${
            selectedTab === 'reports'
              ? 'border-accent text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Reports
        </button>
      </div>

      {selectedTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-gray-100 rounded-md p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-secondary">
                  Total Ideas
                </h3>
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div className="text-3xl font-semibold text-text-primary">
                {mockStats.totalIdeas.toLocaleString()}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-md p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-secondary">
                  Pending
                </h3>
                <Clock className="w-5 h-5 text-accent-alt" />
              </div>
              <div className="text-3xl font-semibold text-text-primary">
                {mockStats.pendingValidation}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-md p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-secondary">
                  Completed Today
                </h3>
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div className="text-3xl font-semibold text-text-primary">
                {mockStats.completedToday}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-md p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-secondary">
                  Revenue
                </h3>
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div className="text-3xl font-semibold text-text-primary">
                ${mockStats.revenue.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gray-100 rounded-md shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                    Idea
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-base font-medium text-text-primary">
                        {report.idea}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-secondary">
                        {report.author}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium ${
                          report.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {report.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-secondary">
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}

