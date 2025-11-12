- In all interactions and commit messages, be extremely concise, and sacrifice grammar for the sake of concision.

## Plan

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise, sacrifice grammar for the sake of concision.

## Project Overview

AskSync is an asynchronous Q&A and notification management platform that helps users control when and how they engage with questions and notifications. Built as a fullstack monorepo with Next.js (SSG), Convex backend, and shared packages using pnpm workspaces.

### Platform Concept

AskSync enables "asynchronous" asking and answering of questions, allowing users to:

- **Control notification flow**: Batch questions based on availability and preferences
- **Tag-based organization**: Categorize questions and associate them with time availability
- **Time block management**: Define when users are available to answer specific types of questions
- **Thread-based conversations**: Continue discussions after initial question/answer exchanges

### Tech Stack

- **Frontend**: Next.js 15.5.3 with static export (`output: "export"`)
- **Backend**: Convex with real-time data synchronization
- **Authentication**: Clerk + Convex integration with organization support
- **Package Manager**: pnpm 10.16+ (monorepo with workspaces)
- **Node**: 22.19.0+ (LTS)
- **TypeScript**: Latest with strict configuration
- **Linting**: ESLint 9 (flat config) + Prettier
- **Styling**: Tailwind CSS + shadcn/ui components
- **Utilities**: Custom scripts for development tasks

## Architecture

### Monorepo Structure

```fa
asksync/
├── apps/
│   ├── web/                 # Next.js frontend (SSG)
│   ├── backend/            # Convex backend
│   └── scripts/            # Utility scripts (Clerk cleanup, etc.)
├── packages/
│   ├── shared/             # Shared utilities and types
│   └── eslint-config/      # ESLint configuration
└── pnpm-workspace.yaml    # Workspace configuration
```

### Authentication & Organization Flow

- **Client-side authentication**: Static export requires client-side auth handling
- **Organization-first approach**: All data scoped to organizations
- **Convex integration**: Uses `ConvexProviderWithClerk` for auth state
- **Route protection**: Handled by `AuthenticatedWrapper` and `UnauthenticatedWrapper`
- **Organization routing**: `OrganizationRouter` handles org-specific redirects
- **Catch-all routes**: `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` for Clerk flows

### Key Features

- **Organization-scoped data**: All data includes `orgId` and `userId` fields
- **Organization management**: Auto-redirect to create org or accept invites
- **Real-time sync**: Convex handles live data updates within organizations
- **Shared packages**: Common utilities accessible across apps
- **Development utilities**: Scripts for Clerk data management
- **Type safety**: Full TypeScript coverage with path aliases
- **Modern UI**: shadcn/ui components with customizable design system
- **Responsive sidebar**: Application branding, organization switcher, and navigation with breadcrumbs

## Core Data Model

### Tags

Tags serve dual purposes in AskSync:

- **Question categorization**: Label questions by topic, priority, or type
- **Availability windows**: Define when users are available to answer questions for specific categories

**Properties**:

- **Basic**: id, name, color, description
- **Timing**: answerMode ("on-demand" | "scheduled"), responseTimeMinutes
- **Organization**: orgId, createdBy, isPublic
- **Metadata**: createdAt, updatedAt

**Answer Modes**:

- **On-demand**: Questions answered within specified time (15min, 1hr, etc.)
- **Scheduled**: Questions batched and answered during associated timeblocks

### Timeblocks

Calendar events that define availability for answering questions:

- **Custom timeblocks**: Created directly in AskSync
- **Integrated timeblocks**: Synced from external calendars (Google, Outlook)

**Properties**:

- **Basic**: id, title, description
- **Timing**: startTime, endTime, timezone, recurrenceRule
- **Association**: tagIds[], userId, orgId
- **Integration**: source ("asksync" | "google" | "outlook"), externalId
- **Appearance**: color (custom color override)
- **Exceptions**: exceptionDates[] (UTC midnight timestamps for excluded recurring instances)
- **Metadata**: createdAt, updatedAt

**Recurring Event Exception Handling**:

- **Simple two-option approach**: "This event only" vs "All events"
- **Exception storage**: Array of UTC midnight timestamps stored directly on timeblock
- **Smart instance editing**: Creates standalone non-recurring events for single modifications
- **Automatic filtering**: Recurring event expansion automatically excludes exception dates
- **Clean architecture**: No separate exception table needed - self-contained timeblock data

### Questions

The core entity representing inquiries between users:

- **Assignment**: Questions directed to specific users
- **Tag association**: Linked to one or more tags for categorization
- **Status tracking**: Lifecycle from creation to resolution

**Properties**:

- **Content**: id, title, content, priority
- **Assignment**: creatorId, assigneeId, orgId
- **Categorization**: tagIds[], status
- **Tracking**: createdAt, updatedAt, dueDate
- **Relationships**: threadId (created when answered)

**Status Flow**: `pending` → `assigned` → `in_progress` → `answered` → `resolved` | `archived`

### Question Threads

Conversation containers created when questions are answered:

- **Multi-party communication**: Support asker, answerer, and additional participants
- **Message organization**: Contain all related messages and attachments
- **Status management**: Track conversation state

**Properties**:

- **Basic**: id, questionId, orgId
- **Participants**: participants[] (userIds), status
- **Metadata**: createdAt, updatedAt, lastMessageAt

### Messages

Individual communication units within threads:

- **Rich content**: Support text, attachments, and formatting
- **User attribution**: Track sender and timestamp
- **Thread organization**: Maintain conversation flow

**Properties**:

- **Content**: id, content, messageType, attachments[]
- **Attribution**: threadId, userId, orgId
- **Metadata**: createdAt, editedAt, isDeleted

### User Settings

Per-user, per-organization configuration:

- **Notification preferences**: Control when and how to receive question notifications
- **Availability defaults**: Set default response times and availability
- **Integration settings**: Configure external calendar connections

**Properties**:

- **Identity**: userId, orgId
- **Notifications**: defaultNotificationTime, batchingEnabled, quietHours
- **Preferences**: timezone, defaultResponseTime
- **Integrations**: connectedCalendars[], syncSettings

## Coding Standards

### Backend Organization (Convex)

- **Feature-based structure**: Each feature has its own folder with queries, mutations, and helpers
- **File separation**: Separate files for `queries.ts`, `mutations.ts`, `permissions.ts`, and `helpers.ts`
- **Common types**: Shared types in `common/types.ts`
- **Example structure**:
  ```
  convex/
  ├── tags/
  │   ├── queries.ts      # Read operations
  │   └── mutations.ts    # Write operations
  ├── timeblocks/
  │   ├── queries.ts
  │   ├── mutations.ts
  │   ├── permissions.ts  # Access control logic
  │   └── helpers.ts      # Utility functions
  └── common/
      └── types.ts        # Shared type definitions
  ```

### Frontend Organization

- **Feature-based architecture**: Organize by domain/feature, not by file type
- **Component files**: Always start with capital letter (e.g., `UserProfile.tsx`, `OrganizationRouter.tsx`)
- **Non-component files**: Use camelCase (e.g., `apiHelpers.ts`, `userUtils.ts`)
- **One component per file**: Match component name to file name exactly
- **Feature structure**:
  ```
  src/
  ├── schedule/              # Feature folder
  │   ├── components/        # Feature-specific components
  │   ├── dialogs/          # Complex dialogs grouped together
  │   ├── hooks/            # Feature-specific hooks
  │   ├── stores/           # Zustand stores for complex state
  │   ├── types.ts          # Feature types
  │   ├── utils.ts          # Feature utilities
  │   ├── constants.ts      # Feature constants
  │   └── index.ts          # Public API exports
  ├── tags/
  │   ├── components/
  │   └── hooks/
  ├── components/           # Cross-cutting UI components
  │   ├── sidebar/          # Sidebar navigation
  │   ├── breadcrumbs/      # Breadcrumb navigation
  │   └── ui/               # shadcn/ui components
  └── hooks/                # Cross-cutting hooks
  ```

### State Management

- **Zustand for complex state**: Use stores when state is needed across multiple components
- **Store organization**: Keep stores in `feature/stores/` folder
- **Store naming**: Use descriptive names like `calendarViewStore.ts`, `temporaryEventStore.ts`
- **Simple state**: Use React state for component-local state
- **Server state**: Rely on Convex for real-time data synchronization

### Component Architecture

- **Keep components small**: Focus on single responsibility
- **Extract reusable hooks**: Create custom hooks for complex logic
- **Group related dialogs**: Place complex dialogs in `dialogs/` subfolder
- **Public API**: Export through feature's `index.ts` for clean imports
- **SOLID principles**: Apply throughout the codebase

### Architectural Principles

- **Feature-first organization**: Group by business domain, not technical layer
- **Clear separation of concerns**: Each component/hook has one responsibility
- **Co-location**: Keep related files close together within feature folders
- **Cross-cutting concerns**: Only truly shared code goes in root-level folders
- **Explicit dependencies**: Import paths should clearly show relationships
- **Barrel exports**: Use index.ts files to define public APIs for features

### React Best Practices

- **Avoid useEffect** unless for actual side effects (API calls, DOM manipulation)
- **Don't use useEffect** for state synchronization or derived state
- **Prefer derived state** and proper state management
- **Use custom hooks** for complex logic extraction

### shadcn/ui Components

- **Always use shadcn/ui** components when building UI elements
- **NEVER add shadcn components manually** - always request installation
- **Installation process**: When shadcn components are needed, Claude will notify which components to install, then the user installs them personally
- **Component consistency**: Use shadcn for buttons, forms, dialogs, cards, etc. to maintain design consistency

## Key Implementation Details

### Static Export Compatibility

- **No server-side middleware**: All authentication handled client-side
- **generateStaticParams**: Required for catch-all routes with static export
- **Client-side redirects**: Using Next.js router for auth redirects

### Authentication Components

- `AuthenticatedWrapper`: Shows content when user is authenticated
- `UnauthenticatedWrapper`: Handles unauthenticated state and redirects
- Both use `startsWith` to handle trailing slashes in routes

### ESLint Configuration

- **ESLint 9 flat config** format
- **Import rules**: Enforce absolute imports over relative
- **Prettier integration**: Resolves conflicts between ESLint and Prettier
- **TypeScript support**: Full type checking and rules

## Common Issues & Solutions

### Static Export Limitations

- **Server actions don't work**: Clerk may show console errors after signup, but functionality works
- **Catch-all routes**: Require proper `generateStaticParams` configuration
- **Trailing slashes**: Handle with `startsWith` checks in route logic

### Convex Authentication & Organization Support

- Always use `ctx.auth.getUserIdentity()` in queries/mutations
- **Organization-scoped data**: All data requires both `userId` and `orgId`
- Check for active organization: `identity.orgId` must exist and be a string
- Use proper indexing for organization queries: `["orgId", "userId", "name"]`
- **Auto-redirect logic**: Users without organizations are redirected to create one
- **Invitation handling**: Users with pending invitations are redirected to accept them

## Development Notes

- Use absolute imports (`@/`) for better maintainability
- Keep components focused and testable
- Follow the established patterns for consistency
- **Organization data model**: All user data is scoped to organizations for proper multi-tenancy
- **TypeScript configuration**: Uses `"moduleResolution": "bundler"` (not the deprecated "node10")
- **Development workflow**: Use utility scripts for quick database cleanup during development
- **Responsive design**: UI components adapt between mobile and desktop with appropriate sizing
- **Theme customization**: Custom sidebar theme colors defined in `globals.css` with `--sidebar-primary`
- **Navigation consistency**: All routes use Next.js Link with proper active state management

## API Design Patterns

### Convex Function Naming

- **Queries**: `list*`, `get*`, `search*` (e.g., `listTagsByOrg`, `getQuestionById`)
- **Mutations**: `create*`, `update*`, `delete*`, `assign*` (e.g., `createTag`, `updateQuestion`)
- **Actions**: `sync*`, `notify*`, `batch*` (e.g., `syncCalendar`, `notifyUsers`)

### Data Access Patterns

- **Organization-scoped**: All queries include `orgId` filter
- **User-scoped**: Include `userId` for user-specific data
- **Permission checks**: Validate user access in all mutations
- **Optimistic updates**: Use for immediate UI feedback

### Real-time Subscriptions

- **Tag updates**: Live updates when tags are modified
- **Timeblock updates**: Live calendar updates when timeblocks are modified
- **Question assignments**: Real-time notifications for new questions
- **Message threads**: Live messaging within threads
- **Availability changes**: Update availability indicators

### Recurring Event Exception Patterns

- **Exception storage**: Array of UTC midnight timestamps on timeblock document
- **Exception filtering**: Client-side filtering during event expansion
- **Standalone creation**: Non-recurring events for single instance modifications
- **Clean separation**: Exceptions and standalone evnts maintain data integrity

### Integration Patterns

- **Calendar sync**: Scheduled actions for external calendar polling
- **Webhook handling**: Process external calendar events
- **Error handling**: Graceful degradation for integration failures
- **Rate limiting**: Respect external API limits
