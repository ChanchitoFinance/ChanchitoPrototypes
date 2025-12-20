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

### TeamService (`lib/services/teamService.ts`)

Manages teams and enterprise spaces.

```typescript
import { teamService } from '@/lib/services'

// Create a team
const team = await teamService.createTeam({
  name: 'My Team',
  description: 'Team description',
})

// Get all teams
const teams = await teamService.getTeams()

// Create a space
const space = await teamService.createSpace({
  team_id: 'team-id',
  name: 'My Space',
  visibility: 'public',
})

// Get spaces for a team
const spaces = await teamService.getSpaces('team-id')

// Manage team members
await teamService.addTeamMember('team-id', 'user-id', 'member')
const members = await teamService.getTeamMembers('team-id')

// Manage space members
await teamService.addSpaceMember('space-id', 'user-id', 'member')
const spaceMembers = await teamService.getSpaceMembers('space-id')
```

### AdminService (`lib/services/adminService.ts`)

Manages tags, badges, and media assets.

```typescript
import { adminService } from '@/lib/services'

// Manage tags
const tag = await adminService.createTag('New Tag')
const tags = await adminService.getTags()
await adminService.deleteTag('tag-id')

// Manage badges
const badge = await adminService.createBadge({
  code: 'achievement',
  name: 'Achievement',
  description: 'Awarded for achievements',
})
const badges = await adminService.getBadges()
await adminService.updateBadge('badge-id', { name: 'Updated Name' })

// Award badges to users
await adminService.awardBadge('user-id', 'badge-id')
const userBadges = await adminService.getUserBadges('user-id')

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

- `users` - User profiles with reputation and streaks
- `teams` - Team management
- `enterprise_spaces` - Workspaces within teams
- `team_memberships` & `space_memberships` - Membership management
- `ideas` - Main content with rich JSON content
- `idea_votes` - Voting system (dislike, use, pay)
- `comments` - Nested comment system
- `comment_votes` - Comment reactions (upvote, downvote, helpful)
- `tags` & `idea_tags` - Tagging system
- `badges` & `user_badges` - Achievement system
- `media_assets` - File and media management

## Setup Instructions

1. Run `init.sql` in your Supabase SQL editor to create the schema
2. Run `insert.sql` to populate with sample data
3. Import and use the services in your components

## Example Component

See `components/admin/DataManager.tsx` for an example of how to display and manage data using these services.
