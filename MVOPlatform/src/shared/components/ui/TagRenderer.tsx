import { calculateTagDisplay } from '@/core/lib/utils/tag.utils'

interface TagRendererProps {
  tags: string[]
  className?: string
  tagClassName?: string
  maxCharsPerTag?: number
  maxTagsToShow?: number
  charThresholdForTruncation?: number
  showHash?: boolean
}

export function TagRenderer({
  tags,
  className = '',
  tagClassName = '',
  maxCharsPerTag = 10,
  maxTagsToShow = 3,
  charThresholdForTruncation = 10,
  showHash = true,
}: TagRendererProps) {
  const { tagsToShow, showPlusOne, remainingTagsCount } = calculateTagDisplay(
    tags,
    {
      maxCharsPerTag,
      maxTagsToShow,
      charThresholdForTruncation,
    }
  )

  if (tags.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tagsToShow.map((tag, index) => (
        <span
          key={tags[index]}
          className={`font-bold px-2.5 py-1 rounded-md ${tagClassName}`}
          style={{
            fontSize: '13px',
            backgroundColor: 'rgba(100, 100, 100, 0.8)',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {showHash ? '#' : ''}
          {tag}
        </span>
      ))}
      {showPlusOne && (
        <span
          className={`font-bold px-2.5 py-1 rounded-md ${tagClassName}`}
          style={{
            fontSize: '13px',
            backgroundColor: 'rgba(100, 100, 100, 0.8)',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          +{remainingTagsCount}
        </span>
      )}
    </div>
  )
}
