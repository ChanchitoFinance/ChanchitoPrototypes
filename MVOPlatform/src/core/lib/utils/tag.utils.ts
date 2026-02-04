export interface TagDisplayOptions {
  maxCharsPerTag?: number
  maxTagsToShow?: number
  charThresholdForTruncation?: number
}

export interface TagDisplayResult {
  tagsToShow: string[]
  showPlusOne: boolean
  remainingTagsCount: number
}

/**
 * Truncates a tag to a maximum number of characters with ellipsis
 */
export const truncateTag = (tag: string, maxChars: number): string => {
  return tag.length > maxChars ? `${tag.slice(0, maxChars)}...` : tag
}

/**
 * Calculates which tags to display and whether to show a "+1" indicator
 * based on length constraints
 */
export const calculateTagDisplay = (
  tags: string[],
  options: TagDisplayOptions = {}
): TagDisplayResult => {
  const {
    maxCharsPerTag = 10,
    maxTagsToShow = 3,
    charThresholdForTruncation = 10,
  } = options

  // Truncate each tag to max length
  const displayTags = tags
    .slice(0, maxTagsToShow)
    .map(tag => truncateTag(tag, maxCharsPerTag))

  let tagsToShow = displayTags
  let showPlusOne = false
  let remainingTagsCount = tags.length - maxTagsToShow

  // Check if we need to show only 2 tags + "+1" indicator
  if (tags.length >= maxTagsToShow) {
    const firstTwoLength = displayTags[0].length + displayTags[1].length
    if (firstTwoLength > charThresholdForTruncation) {
      tagsToShow = displayTags.slice(0, 2)
      showPlusOne = true
      remainingTagsCount = tags.length - 2
    }
  }

  return {
    tagsToShow,
    showPlusOne,
    remainingTagsCount,
  }
}
