# Work Mode Implementation Plan

## Overview

Implementation of a Pomodoro-style work mode that integrates with timeblocks, checklists, and questions to create a focused productivity environment.

## Core Requirements

- ✅ Flexible per-timeblock durations
- ✅ Show only assigned questions with matching timeblock tags
- ✅ Allow skipping breaks
- ✅ Multi-device sync
- ✅ Team visibility for work status
- ✅ Focus mode presets
- ❌ No gamification (yet)
- ❌ No auto-assignment of questions
- ❌ No calendar event creation
- ❌ No AI task ordering (yet)
- ❌ No distraction blocking (yet)

## Implementation Phases

### Phase 1: Core Timer Infrastructure ⏱️ ✅ COMPLETED

**Goal:** Basic Pomodoro timer with session tracking

#### Backend Tasks

- [x] Extend Convex schema with `workSessions` table
- [x] Create `pomodoroSettings` table for user preferences
- [x] Implement core mutations: `startSession`, `pauseSession`, `resumeSession`, `endSession`
- [x] Implement queries: `getActiveSession`, `getPomodoroSettings`
- [x] Add session validation and permission checks

#### Frontend Tasks

- [x] Create `/work` route and page structure
- [x] Build `PomodoroTimer` component with circular progress
- [x] Implement `workModeStore` with Zustand
- [x] Add timer logic with client-side countdown
- [x] Create basic control buttons (Start/Pause/Skip/End)
- [x] Add sound notifications on completion

#### Files to Create

```
apps/backend/convex/
├── workSessions/
│   ├── queries.ts
│   ├── mutations.ts
│   └── helpers.ts

apps/web/src/
├── app/work/
│   └── page.tsx
├── work/
│   ├── components/
│   │   └── PomodoroTimer.tsx
│   ├── stores/
│   │   └── workModeStore.ts
│   ├── hooks/
│   │   └── useTimer.ts
│   └── types.ts
```

---

### Phase 2: Timeblock & Task Integration 📋 ✅ COMPLETED

**Goal:** Connect work sessions with existing timeblocks and tasks

#### Backend Tasks

- [x] Add `timeblockId` and `taskId` fields to sessions
- [x] Create query to get current timeblock based on time
- [x] Add mutations for task switching during session
- [x] Track task completions in session

#### Frontend Tasks

- [x] Build `CurrentFocusPanel` component
- [x] Implement timeblock detection logic
- [x] Add task list display and selection
- [x] Create task completion tracking
- [x] Add progress indicators
- [x] Integrate with existing task mutations

#### Files to Create/Modify

```
apps/web/src/work/components/
├── CurrentFocusPanel.tsx
├── TaskSelector.tsx
└── TaskProgress.tsx

apps/web/src/work/hooks/
├── useCurrentTimeblock.ts
└── useTaskManagement.ts
```

---

### Phase 3: UI Enhancements & Polish 🎨 ✅ COMPLETED

**Goal:** Enhanced timer visibility and collapsible focus panel

#### Frontend Tasks

- [x] Remove Card wrapper from timer for cleaner look
- [x] Increase timer size dramatically (responsive scaling)
- [x] Improve control button styling with better icons
- [x] Create `FocusPanelDrawer` component with collapse/expand
- [x] Implement auto-collapse when timer starts
- [x] Add mobile-responsive drawer (bottom sheet on mobile)
- [x] Center timer on page with full height
- [x] Add hover effects and transitions

#### Files Created/Modified

```
apps/web/src/work/components/
├── FocusPanelDrawer.tsx (NEW)
├── PomodoroTimer.tsx (MODIFIED - removed Card, increased sizes)
├── CircularProgress.tsx (MODIFIED - larger dimensions)
└── page.tsx (MODIFIED - new layout)

apps/web/src/hooks/
└── use-media-query.tsx (NEW)
```

---

### Phase 4: Question Integration 💬 ✅ COMPLETED

**Goal:** Show and manage assigned questions during work sessions

#### Backend Tasks

- [x] Create query to filter questions by timeblock tags and assignment
- [x] Add mutation to mark question as "working on"
- [x] Track question interactions in sessions

#### Frontend Tasks

- [x] Build `QuestionsPanel` component with tabs integration
- [x] Implement question filtering logic
- [x] Add view thread action with modal overlay
- [x] Create urgency indicators (overdue, time remaining)
- [x] Integrate with CurrentFocusPanel using tabs
- [x] Add question count to WorkStatusBar

#### Files Created

```
apps/backend/convex/workSessions/queries/
└── questions.ts (NEW - filter questions by timeblock)

apps/web/src/work/components/focusPanel/
├── QuestionsPanel.tsx (NEW)
├── QuestionItem.tsx (NEW)
└── QuestionThreadModal.tsx (NEW)

apps/web/src/work/hooks/
└── useTimeblockQuestions.ts (NEW)

apps/web/src/work/components/focusPanel/
└── CurrentFocusPanel.tsx (MODIFIED - added tabs for Tasks/Questions)

apps/web/src/work/components/
└── WorkStatusBar.tsx (MODIFIED - added question count)
```

---

### Phase 5: Focus Mode Presets & Settings ⚙️ ✅ COMPLETED

**Goal:** Customizable timer durations and user preferences

#### Backend Tasks

- [x] Implement focus mode presets in settings
- [x] Create settings update mutations with validation
- [x] Add preset schema validation (durations 1-180 min)

#### Frontend Tasks

- [x] Build `FocusModeSelector` component with custom duration dialog
- [x] Create settings page at /settings/work-mode
- [x] Add duration adjustment controls (DurationControl component)
- [x] Implement preset switching
- [x] Store preferences in backend
- [x] Chrome notification support with permission handling
- [x] Auto-start countdown with cancel option
- [x] One-time custom duration OR save as preset

#### Files Created

```
apps/web/src/
├── app/settings/work-mode/
│   └── page.tsx (Settings page with all sections)
├── work/components/settings/
│   ├── DurationControl.tsx (Reusable duration input)
│   ├── PresetEditor.tsx (Edit all presets)
│   ├── NotificationSettings.tsx (Browser & sound toggles)
│   └── AutomationSettings.tsx (Auto-start toggles)
├── work/utils/
│   └── notifications.ts (Chrome notification utilities)
└── work/components/
    ├── FocusModeSelector.tsx (UPDATED - custom duration dialog)
    └── PomodoroTimer.tsx (UPDATED - auto-start countdown badge)

apps/backend/convex/workSessions/mutations/
└── settings.ts (UPDATED - validation added)
```

---

### Phase 6: Multi-Device Sync 📱💻

**Goal:** Continue sessions across devices seamlessly

#### Backend Tasks

- [ ] Add `deviceId` tracking to sessions
- [ ] Implement conflict resolution logic
- [ ] Create device handoff mutations
- [ ] Add real-time sync subscriptions

#### Frontend Tasks

- [ ] Generate and persist deviceId
- [ ] Detect existing sessions on load
- [ ] Build device handoff dialog
- [ ] Implement periodic sync (every 10s)
- [ ] Handle tab visibility changes

#### Files to Create

```
apps/web/src/work/hooks/
├── useMultiDeviceSync.ts
└── useDeviceHandoff.ts

apps/web/src/work/components/
└── DeviceHandoffDialog.tsx
```

---

### Phase 7: Team Visibility 👥

**Goal:** Share work status with team members

#### Backend Tasks

- [ ] Create `userWorkStatus` table
- [ ] Implement status update mutations
- [ ] Add team status query with subscriptions
- [ ] Add privacy settings

#### Frontend Tasks

- [ ] Build `TeamWorkStatus` component
- [ ] Create status indicators in UI
- [ ] Add team view page/panel
- [ ] Implement privacy controls
- [ ] Show active team members in work mode

#### Files to Create

```
apps/backend/convex/
└── teamStatus/
    ├── queries.ts
    └── mutations.ts

apps/web/src/work/components/
├── TeamWorkStatus.tsx
├── TeamMemberCard.tsx
└── WorkStatusIndicator.tsx

apps/web/src/app/work/team/
└── page.tsx
```

---

### Phase 8: Polish & Analytics 📊

**Goal:** Enhanced UX and productivity insights

#### Backend Tasks

- [ ] Create session statistics queries
- [ ] Add daily/weekly aggregations
- [ ] Implement streak tracking

#### Frontend Tasks

- [ ] Build statistics dashboard
- [ ] Add animations and transitions
- [ ] Implement keyboard shortcuts
- [ ] Optimize mobile responsive design
- [ ] Add dark mode support
- [ ] Create `WorkStatusBar` component

#### Files to Create

```
apps/web/src/app/work/stats/
└── page.tsx

apps/web/src/work/components/
├── WorkStatusBar.tsx
├── SessionStats.tsx
└── ProductivityChart.tsx

apps/web/src/work/hooks/
└── useKeyboardShortcuts.ts
```

---

## Database Schema

### workSessions Table

```typescript
{
  _id: Id<"workSessions">
  userId: string
  orgId: string

  // Session type and context
  sessionType: "work" | "shortBreak" | "longBreak"
  timeblockId?: Id<"timeblocks">
  taskId?: Id<"tasks">
  questionId?: Id<"questions">

  // Timing
  startedAt: number
  endedAt?: number
  pausedDuration: number // total pause time in ms
  targetDuration: number // planned duration in ms
  actualDuration: number // elapsed active time in ms

  // Configuration
  focusMode: "deep" | "normal" | "quick" | "review" | "custom"
  customDuration?: number

  // Progress tracking
  tasksCompleted: Id<"tasks">[]
  questionsAnswered: Id<"questions">[]

  // Status
  status: "active" | "paused" | "completed" | "skipped"
  deviceId: string

  // Timestamps
  createdAt: number
  updatedAt: number
}
```

### pomodoroSettings Table

```typescript
{
  _id: Id<"pomodoroSettings">
  userId: string
  orgId: string

  // Default durations (in minutes)
  defaultWorkDuration: number // default: 25
  defaultShortBreak: number // default: 5
  defaultLongBreak: number // default: 15
  sessionsBeforeLongBreak: number // default: 4

  // Focus mode presets
  presets: {
    deep: { work: 90, shortBreak: 15, longBreak: 30 }
    normal: { work: 25, shortBreak: 5, longBreak: 15 }
    quick: { work: 15, shortBreak: 3, longBreak: 10 }
    review: { work: 45, shortBreak: 10, longBreak: 20 }
  }

  // User preferences
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  currentFocusMode: "deep" | "normal" | "quick" | "review" | "custom"

  // Timestamps
  createdAt: number
  updatedAt: number
}
```

### userWorkStatus Table

```typescript
{
  _id: Id<"userWorkStatus">
  userId: string
  orgId: string

  // Current status
  status: "working" | "break" | "offline"
  currentTaskId?: Id<"tasks">
  currentQuestionId?: Id<"questions">
  currentTimeblockId?: Id<"timeblocks">

  // Session info
  sessionStartedAt?: number
  expectedEndAt?: number
  focusMode: string
  sessionType: "work" | "shortBreak" | "longBreak"

  // Privacy
  shareDetails: boolean // whether to show task/question details

  // Timestamps
  lastUpdated: number
}
```

## Component Architecture

### Main Layout Structure

```tsx
<WorkModeLayout>
  <Header>
    <NavBar /> {/* Minimal nav in work mode */}
  </Header>

  <MainContent>
    <TimerSection>
      <PomodoroTimer />
      <FocusModeSelector />
    </TimerSection>

    <WorkArea>
      <CurrentFocusPanel />
      <QuestionQueuePanel />
    </WorkArea>

    <StatusBar>
      <WorkStatusBar />
    </StatusBar>
  </MainContent>
</WorkModeLayout>
```

## UI/UX Specifications

### Color Scheme

- **Work Mode**: Blue to Purple gradient (#3B82F6 → #8B5CF6)
- **Short Break**: Green (#10B981)
- **Long Break**: Orange (#F97316)
- **Completed**: Gray (#6B7280)
- **Overdue/Urgent**: Red (#EF4444)

### Typography

- Timer: `text-6xl font-bold tabular-nums`
- Task Title: `text-2xl font-semibold`
- Body Text: `text-base`
- Small Text: `text-sm text-muted-foreground`

### Responsive Breakpoints

- Mobile: < 640px (stack all panels)
- Tablet: 640px - 1024px (2 column grid)
- Desktop: > 1024px (optimal layout)

### Animation Timings

- Timer tick: every 1000ms
- Progress ring: smooth linear
- Panel transitions: 200ms ease-in-out
- Pulse effect: 2s infinite

## Technical Considerations

### Performance Optimizations

- Use `requestAnimationFrame` for smooth timer updates
- Debounce backend syncs to every 30 seconds
- Implement virtual scrolling for long question lists
- Memoize expensive computations
- Use React.memo for static components

### Error Handling

- Graceful degradation when offline
- Session recovery after browser crash
- Clear error messages with retry options
- Fallback to localStorage for critical data

### Accessibility (WCAG 2.1 AA)

- ARIA live regions for timer announcements
- Keyboard shortcuts with visible indicators
- Focus management for modal dialogs
- Color contrast ratios > 4.5:1
- Screen reader friendly status updates

## Keyboard Shortcuts

- `Space`: Start/Pause timer
- `S`: Skip current session
- `R`: Reset timer
- `T`: Focus next task
- `Shift+T`: Focus previous task
- `Q`: Toggle questions panel
- `F`: Open focus mode selector
- `Esc`: Exit work mode
- `?`: Show keyboard shortcuts

## Testing Strategy

### Unit Tests

- Timer logic and calculations
- Session state management
- Permission checks
- Data transformations

### Integration Tests

- Session creation and updates
- Multi-device sync scenarios
- Team status updates
- Question filtering

### E2E Tests

- Complete work session flow
- Task completion tracking
- Break transitions
- Settings persistence

## Migration & Rollback Plan

1. Deploy backend schema changes first (backwards compatible)
2. Deploy frontend with feature flag
3. Test with internal team
4. Gradual rollout to users
5. Monitor error rates and performance
6. Full rollout or rollback based on metrics

## Success Metrics

- Session completion rate > 70%
- Average focus time per day
- Task completion velocity increase
- User retention in work mode
- Error rate < 0.1%
- Page load time < 1s

## Future Enhancements (Post-MVP)

- [ ] AI-powered task suggestions
- [ ] Calendar blocking for deep work
- [ ] Integration with focus apps (Freedom, Cold Turkey)
- [ ] Gamification (streaks, achievements)
- [ ] Advanced analytics and insights
- [ ] Voice commands
- [ ] Ambient sound options
- [ ] Collaboration features (pair programming timer)
- [ ] Export session data
- [ ] Custom notification sounds

## Current Status

- Phase 1: ✅ COMPLETED (Core Timer Infrastructure)
- Phase 2: ✅ COMPLETED (Timeblock & Task Integration)
- Phase 3: ✅ COMPLETED (UI Enhancements & Polish)
- Phase 4: ✅ COMPLETED (Question Integration)
- Phase 5: ✅ COMPLETED (Focus Mode Presets & Settings)
- Break System: ✅ COMPLETED (Auto-breaks & Manual breaks)
- Last Updated: 2025-12-07
- Next Step: Phase 7 (Team Visibility) or Phase 8 (Polish & Analytics)
- **Note:** Phase 6 (Multi-Device Sync) skipped for now

## Completed Features

- ✅ Fully functional Pomodoro timer with work/break sessions
- ✅ Circular progress visualization with smooth animations
- ✅ Focus mode presets (Deep Work, Normal, Quick, Review)
- ✅ Session persistence across page refreshes
- ✅ Daily statistics tracking (sessions, focus time, tasks, streak)
- ✅ Sound notifications on timer completion
- ✅ Current timeblock detection and display
- ✅ Task list integration with selection and completion
- ✅ Progress indicators for task completion
- ✅ Real-time task status updates
- ✅ Responsive layout (timer + focus panel)
- ✅ Memoized components for performance
- ✅ Clean hook architecture with separation of concerns
- ✅ Enhanced timer UI with dramatic sizing
- ✅ Collapsible focus panel drawer
- ✅ Auto-collapse on timer start
- ✅ Mobile-responsive drawer (bottom sheet)
- ✅ Improved control button styling
- ✅ Centered timer layout with full height
- ✅ Question integration with tabs (Tasks | Questions)
- ✅ Question filtering by timeblock tags
- ✅ Urgency indicators for questions
- ✅ Thread modal overlay for viewing/answering questions
- ✅ Question count in status bar
- ✅ Session tracking for answered questions
- ✅ Comprehensive settings page at /settings/work-mode
- ✅ Customizable preset durations for all focus modes
- ✅ Custom duration with one-time or save options
- ✅ Chrome browser notifications with permission handling
- ✅ Auto-start breaks and work sessions with countdown
- ✅ Sound and notification toggles
- ✅ Settings button in work mode for quick access
- ✅ Backend validation for duration ranges
- ✅ Auto-break start after work session completion
- ✅ Break type determination (short/long) based on session count
- ✅ Manual break button with type selection dialog
- ✅ Skip break functionality
- ✅ Session progress indicator (X/4 before long break)
- ✅ Completed work sessions tracking
- ✅ Different UI states for work vs break sessions
- ✅ Reset session counter after long break
