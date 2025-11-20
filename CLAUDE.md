- In all interactions and commit messages, be extremely concise, and sacrifice grammar for the sake of concision.
- Don't overengineer (YAGNI)
- Keep best coding practices, and keep things simple
- Don't use "useEffect" unless completely necessary

## Plan

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise, sacrifice grammar for the sake of concision.
- Don't implement things we are not using (use the YAGNI principle)
- Don't design for backwards compatibility, as this project is in MVP state

## Project Overview

AskSync is an asynchronous Q&A and notification management platform that helps users control when and how they engage with questions and notifications. Built as a fullstack monorepo with Next.js (SSG), Convex backend, and shared packages using pnpm workspaces.

## Platform Concept

AskSync enables "asynchronous" asking and answering of questions, allowing users to:

- **Control notification flow**: Batch questions based on availability and preferences
- **Tag-based organization**: Categorize questions and associate them with time availability
- **Time block management**: Define when users are available to answer specific types of questions
- **Thread-based conversations**: Continue discussions after initial question/answer exchanges

## Tech Stack

- **Frontend**: Next.js 15.5.3 with static export (`output: "export"`)
- **Backend**: Convex with real-time data synchronization
- **Authentication**: Clerk + Convex integration with organization support
- **Package Manager**: pnpm 10.16+ (monorepo with workspaces)
- **Node**: 22.19.0+ (LTS)
- **TypeScript**: Latest with strict configuration
- **Linting**: ESLint 9 (flat config) + Prettier
- **Styling**: Tailwind CSS + shadcn/ui components
- **Utilities**: Custom scripts for development tasks

## Monorepo Structure

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

## Key Features

- **Organization-scoped data**: All data includes `orgId` and `userId` fields
- **Organization management**: Auto-redirect to create org or accept invites
- **Real-time sync**: Convex handles live data updates within organizations
- **Shared packages**: Common utilities accessible across apps
- **Development utilities**: Scripts for Clerk data management
- **Type safety**: Full TypeScript coverage with path aliases
- **Modern UI**: shadcn/ui components with customizable design system
- **Responsive sidebar**: Application branding, organization switcher, and navigation with breadcrumbs

## Backend Organization (Convex)

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

## Frontend Organization

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
- **Avoid useEffect** unless for actual side effects (API calls, DOM manipulation)
- **Don't use useEffect** for state synchronization or derived state
- **Prefer derived state** and proper state management
- **Use custom hooks** for complex logic extraction
- **NEVER add shadcn components manually** - always request installation
- **Always use shadcn/ui** components when building UI elements
