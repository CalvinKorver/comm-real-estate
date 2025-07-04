# Development Partnership

We're building production-quality Next.js applications together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY

**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement

**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:

1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!

_Leverage subagents aggressively_ for better results:

- Spawn agents to explore different parts of the codebase in parallel
- Use one agent to write tests while another implements features
- Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
- For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints

**Stop and validate** at these moments:

- After implementing a complete feature
- Before starting a new major component
- When something feels wrong
- Before declaring "done"
- **WHEN HOOKS FAIL WITH ERRORS** ❌

Run: `npm run lint && npm run typecheck && npm test && npm run build`

> Why: You can lose track of what's actually working. These checkpoints prevent cascading failures.

### 🚨 CRITICAL: Hook Failures Are BLOCKING

**When hooks report ANY issues (exit code 2), you MUST:**

1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:

- Formatting issues (Prettier, ESLint auto-fix)
- Linting violations (ESLint, TypeScript errors)
- Type checking failures
- Build errors
- Test failures
- ALL other checks

Your code must be 100% clean. No exceptions.

**Recovery Protocol:**

- When interrupted by a hook failure, maintain awareness of your original task
- After fixing all issues and verifying the fix, continue where you left off
- Use the todo list to track both the fix and your original task

## Working Memory Management

### When context gets long:

- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:

```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Next.js-Specific Rules

### FORBIDDEN - NEVER DO THESE:

- **NO `any` types** - use proper TypeScript types!
- **NO `setTimeout()` or `setInterval()` without cleanup** - use useEffect cleanup!
- **NO** keeping old and new code together
- **NO** migration functions or compatibility layers
- **NO** versioned component names (ButtonV2, HeaderNew)
- **NO** inline styles in JSX (use CSS modules or Tailwind)
- **NO** TODOs in final code
- **NO** `useEffect` without dependency arrays
- **NO** client-side data fetching that should be server-side

> **AUTOMATED ENFORCEMENT**: ESLint and TypeScript will BLOCK commits that violate these rules.  
> When you see `❌ FORBIDDEN PATTERN`, you MUST fix it immediately!

### Required Standards:

- **Delete** old code when replacing it
- **Meaningful names**: `userId` not `id`, `UserCard` not `Card`
- **Early returns** to reduce nesting
- **Proper TypeScript**: interfaces for props, strict typing
- **Server Components by default**: Only use Client Components when needed
- **Proper error handling**: Error boundaries and error.tsx files
- **SEO-friendly**: Proper metadata, semantic HTML
- **Accessible**: ARIA labels, keyboard navigation, proper contrast

### Next.js Best Practices:

- **App Router over Pages Router** for new features
- **Server Components** for data fetching and static content
- **Client Components** only for interactivity (`"use client"`)
- **Route handlers** for API endpoints (not API routes in pages)
- **Dynamic imports** for code splitting
- **Image optimization** with next/image
- **Font optimization** with next/font

## Implementation Standards

### Our code is complete when:

- ✅ All linters pass with zero issues
- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ Build succeeds
- ✅ Feature works end-to-end
- ✅ Old code is deleted
- ✅ JSDoc on all exported functions/components

### Testing Strategy

- Complex business logic → Write tests first
- Simple UI components → Write tests after
- API routes → Always test
- Critical user flows → Add E2E tests with Playwright
- Skip tests for simple layout components

### Project Structure

```
app/                # App Router pages and layouts
components/         # Reusable UI components
lib/               # Utility functions and configurations
types/             # TypeScript type definitions
public/            # Static assets
__tests__/         # Test files
```

## Problem-Solving Together

When you're stuck or confused:

1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:

- No premature optimization
- Use Next.js built-in analytics
- Lighthouse for real performance metrics
- Bundle analyzer for bundle size

### **Security Always**:

- Validate all inputs (zod for schemas)
- Sanitize user content
- Use environment variables for secrets
- CSRF protection for forms
- Rate limiting for API routes

## Communication Protocol

### Progress Updates:

```
✓ Implemented user authentication (all tests passing)
✓ Added rate limiting middleware
✗ Found issue with SSR hydration - investigating
```

### Suggesting Improvements:

"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.
