'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Plus, GitBranch } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

interface VersionSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  currentVersionNumber: number
  totalVersions: number
  onEditCurrent: () => void
  onCreateNewVersion: () => void
}

export function VersionSelectionModal({
  isOpen,
  onClose,
  currentVersionNumber,
  totalVersions,
  onEditCurrent,
  onCreateNewVersion,
}: VersionSelectionModalProps) {
  const t = useTranslations()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background p-6 rounded-lg shadow-xl max-w-md mx-4 w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-6 h-6 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">
                {t('versioning.edit_modal_title')}
              </h3>
            </div>

            <p className="text-sm text-text-secondary mb-6">
              {t('versioning.edit_modal_description')}
            </p>

            <div className="space-y-3">
              {/* Edit Current Version Option */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onEditCurrent()
                }}
                className="w-full p-4 text-left border-2 border-border-color rounded-lg hover:border-accent hover:bg-accent/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {t('versioning.edit_current')}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {t('versioning.edit_current_description').replace(
                        '{number}',
                        currentVersionNumber.toString()
                      )}
                    </p>
                  </div>
                </div>
              </button>

              {/* Create New Version Option */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onCreateNewVersion()
                }}
                className="w-full p-4 text-left border-2 border-border-color rounded-lg hover:border-premium-cta hover:bg-premium-cta/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-premium-cta/10 text-premium-cta transition-colors group-hover:bg-premium-cta/20">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {t('versioning.create_new_version')}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {t('versioning.create_new_description').replace(
                        '{number}',
                        (totalVersions + 1).toString()
                      )}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('actions.cancel')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}