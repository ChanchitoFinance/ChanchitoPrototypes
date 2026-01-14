# Services Usage Guide

This guide shows how to use the Supabase services for managing data in the MVO Platform.

## Available Services

### IdeaService (`lib/services/ideaService.ts`)

Manages ideas, votes, and related data.

```typescript
import { ideaService } from '@/lib/services'

// Get ideas with pagination
const ideas = await ideaService.getIdeas(10, 0)

// Get trending ideas
const trending = await ideaService.getTrendingIdeas(5)

// Get new ideas
const newIdeas = await ideaService.getNewIdeas(2)

// Get ideas for "For You" section
const forYou = await ideaService.getForYouIdeas(10, 0)

// Get idea by ID
const idea = await ideaService.getIdeaById('idea-id')
```

### CommentService (`lib/services/commentService.ts`)

Manages comments and votes on comments.

```typescript
import { commentService } from '@/lib/services'

// Get comments for an idea
const comments = await commentService.getComments('idea-id')

// Add a new comment
const comment = await commentService.addComment(
  'idea-id',
  'Great idea!',
  'author',
  null,
  null
)

// Vote on comments
await commentService.toggleUpvoteComment('comment-id', 'idea-id')
await commentService.toggleDownvoteComment('comment-id', 'idea-id')
await commentService.toggleHelpfulComment('comment-id', 'idea-id')

// Get comment count
const count = await commentService.getCommentCount('idea-id')
```

### UserService (`lib/services/userService.ts`)

Manages user profiles and data.

```typescript
import { userService } from '@/lib/services'

// Get current user profile
const profile = await userService.getCurrentUser()

// Update user profile
const updated = await userService.updateProfile({
  full_name: 'New Name',
  reputation_score: 100,
})

// Get user by ID
const user = await userService.getUserById('user-id')

// Get all users
const users = await userService.getUsers(50, 0)
```

### AdminService (`lib/services/adminService.ts`)

Manages tags and media assets.

```typescript
import { adminService } from '@/lib/services'

// Manage tags
const tag = await adminService.createTag('New Tag')
const tags = await adminService.getTags()
await adminService.deleteTag('tag-id')

// Manage media assets
const media = await adminService.uploadMedia(
  'image',
  'https://example.com/image.jpg'
)
const mediaAssets = await adminService.getMediaAssets('image')
await adminService.deleteMediaAsset('media-id')
```

## Database Schema

The database includes the following tables:

- `users` - User profiles
- `ideas` - Main content with rich JSON content
- `idea_votes` - Voting system (dislike, use, pay)
- `comments` - Nested comment system
- `comment_votes` - Comment reactions (upvote, downvote, helpful)
- `tags` & `idea_tags` - Tagging system
- `media_assets` - File and media management
- `notifications` - User notifications

## Setup Instructions

1. Run `init.sql` in your Supabase SQL editor to create the schema
2. Run `insert.sql` to populate with sample data
3. Import and use the services in your components

## Example Component

See `components/admin/DataManager.tsx` for an example of how to display and manage data using these services.
