# 🎯 Ralph Loop Setup Template

**The definitive guide to creating successful Ralph Loop tasks**

Based on the **Ballseye Data Sources Success** (6/6 tasks, 3 loops, 35 minutes)

---

## 🏆 The Winning Formula

Ralph Loop succeeds when you provide:

| Element | Description | Example |
|---------|-------------|---------|
| **Clarity** | One focused mission, not ten | "Fix data sources. Nothing else." |
| **Structure** | Ordered tasks, status formats | 5 sequential steps with checkboxes |
| **Evidence** | Real test results, not assumptions | "562 players from Understat" |
| **Boundaries** | Clear scope limits | "Ignore AI features, focus on data" |
| **Context** | Why it matters | "9600 lines but ZERO data flowing" |

**The Clarity Rule**: PROMPT.md should be as detailed as needed to prevent confusion. Simple ≠ Short. Clear, specific instructions = Success.

---

## 📋 Pre-Launch Checklist

### ✅ Research Phase

Before writing any prompts, do your homework:

- [ ] Analyzed repo structure (know where files are)
- [ ] Identified exact files to work on (with line counts)
- [ ] Understood the core problem (with error codes/symptoms)
- [ ] Defined success criteria (testable command that proves it works)

**Example (Ballseye):**
- Files: `backend/data_integration/ballseye_aggregator.py` (803 lines)
- Problem: FBref 403, Understat wrong league names, SoFIFA version mismatch
- Success: `python quick_test.py` shows at least 1 working data source

### ✅ PROMPT.md Creation

Your PROMPT.md should have:

- [ ] Single, clear mission statement ("Your Only Job")
- [ ] Detailed problem descriptions with symptoms, locations, and impact
- [ ] Exact file references with line counts AND specific line ranges
- [ ] Implementation strategies for each issue (not just "fix it")
- [ ] Ordered sequential tasks with clear dependencies
- [ ] Binary success criteria (run X command, see Y result)
- [ ] Testing protocol with specific verification steps
- [ ] Status report format template (for Ralph to use)
- [ ] **AS DETAILED AS NECESSARY** - Don't artificially limit length

### ✅ fix_plan.md Creation

Your plan file should have:

- [ ] Checkbox tasks `[ ]` with result placeholders `**RESULT: ?**`
- [ ] Background context showing why it matters
- [ ] Technical details about files and their current state
- [ ] Phase boundaries ("ignore Phase 2 for now")
- [ ] **LENGTH APPROPRIATE FOR TASK COMPLEXITY** - Add detail where needed

### ✅ Launch Command

Ready to start Ralph:

- [ ] `--no-continue` flag set (fresh session each loop)
- [ ] `--allowed-tools "Write,Edit,Bash(*),Read,Glob,Grep"` (Edit is critical!)
- [ ] Circuit breaker reset: `ralph --reset-circuit`
- [ ] Session reset: `ralph --reset-session`
- [ ] Ready to launch!

---

## 📄 .ralph/PROMPT.md Template

```markdown
# Ralph Instructions - [Project/Feature Name]

## Your Only Job
[ONE SENTENCE: What Ralph does, nothing else]

## Current Problem
- [Problem 1]: [Error code/symptom]
- [Problem 2]: [Error code/symptom]
- [Problem 3]: [Error code/symptom]
- [Problem 4]: [Error code/symptom]

## Files to Work On
- `[path/to/file.ext]` ([XXX lines])
- `[path/to/test.ext]` (test script)

## Your Tasks (in order)
1. Read `[main file]` and understand the issue
2. Fix [problem 1]: [specific strategies: headers, delays, mock data]
3. Fix [problem 2]: [specific approach: research API, test formats]
4. Test: Run `[command]` - [success condition]
5. Mark tasks complete in `.ralph/fix_plan.md`

## Success =
`[command to run]` shows [measurable result] OR [alternative success condition]

## Status Report Format
Always end your response with:

\`\`\`
---RALPH_STATUS---
STATUS: IN_PROGRESS
TASKS_COMPLETED_THIS_LOOP: 2
FILES_MODIFIED: 1
WORK_TYPE: IMPLEMENTATION
EXIT_SIGNAL: false
RECOMMENDATION: Next step description
---END_RALPH_STATUS---
\`\`\`

Set `EXIT_SIGNAL: true` only when [success condition is met].
```

**⚠️ BE SPECIFIC**: Include enough detail for Ralph to work autonomously. Use bullet points for clarity, but don't artificially limit length. Complex tasks need detailed instructions.

---

## 📄 .ralph/fix_plan.md Template

```markdown
# [Project Name] Fix Plan - [Focus Area]

## 🚨 CRITICAL: [Category] Tasks

- [ ] Task 1 - **RESULT: ?**
- [ ] Task 2 - **RESULT: ?**
- [ ] Task 3 - **RESULT: ?**
- [ ] Task 4 - **RESULT: ?**
- [ ] Task 5 - **RESULT: ?**

**Success:** [What success looks like in one line]

---

## Background (for context only)

### Files Already Created
- ✅ `[file 1]` ([XXX lines])
- ✅ `[file 2]` ([test script])
- ✅ `[file 3]` ([related file])

### The Problem
[Why this task is critical - the pain point]

**Result:** [Current state without fix: e.g., "9600 lines but ZERO data flowing"]

---

## After [Current Phase] Works

Phase 2: [Next features]
Phase 3: [Future features]

**But ignore these for now. Focus ONLY on [current phase] above.**
```

**⚠️ Ralph: Update results as tasks complete. Add technical details where needed for clarity.**

---

## 🎯 Real Example: Ballseye Data Sources

### .ralph/PROMPT.md Example (Ballseye - Simple Task)

```markdown
# Ralph Instructions - Ballseye Data Sources

## Your Only Job
Fix data sources in `backend/data_integration/ballseye_aggregator.py`. Nothing else.

## Current Problem
- FBref: Returns 403 Forbidden (anti-bot protection)
- Understat: API broken (wrong league names)
- SoFIFA: Version mismatch
- Transfermarkt: Not installed

## Files to Work On
- `backend/data_integration/ballseye_aggregator.py` (803 lines)
- `quick_test.py` (test script)

## Your Tasks (in order)
1. Read `ballseye_aggregator.py` and understand the issue
2. Fix FBref 403: Add user-agent headers, delays, or create mock data
3. Fix Understat: Research correct API usage
4. Test: Run `python quick_test.py` - at least ONE source must work
5. Mark tasks complete in `.ralph/fix_plan.md`

## Success =
`python quick_test.py` shows at least 1 working data source OR you implement a mock data system.

## Status Report Format
[...format template...]

Set `EXIT_SIGNAL: true` only when at least ONE data source works.
```

### .ralph/fix_plan.md Example (Ballseye - Simple Task)

```markdown
# Ballseye Fix Plan - Data Sources Only

## 🚨 CRITICAL: Data Source Tasks

- [ ] Fix FBref 403 error (add headers/delays/mock) - **RESULT: ?**
- [ ] Fix Understat API (correct league names) - **RESULT: ?**
- [ ] Fix SoFIFA version issue - **RESULT: ?**
- [ ] Create mock data fallback system - **RESULT: ?**
- [ ] Test: `python quick_test.py` shows 1+ working source - **RESULT: ?**
- [ ] Verify end-to-end: source → aggregator → API response - **RESULT: ?**

**Success:** At least ONE real data source working

---

## Background (for context only)

### Files Already Created
- ✅ `backend/data_integration/ballseye_aggregator.py` (803 lines)
- ✅ `quick_test.py` (test script)
- ✅ `backend/api/main.py` (FastAPI endpoints)

### The Problem
All data sources return errors:
- FBref: `403 Forbidden` (tested 5 times)
- Understat: Invalid league name errors
- SoFIFA: Version mismatch
- Transfermarkt: Not installed

**Result:** 9600+ lines of code but ZERO data flowing through the system.

---

## After Data Sources Work

Phase 2: AI Features (scouting reports, similarity search, chatbot)
Phase 3: Web3 Integration (token, wallet, contribution system)

**But ignore these for now. Focus ONLY on data sources above.**
```

### Result: Perfect Success! 🎉

- Loop #1: Fixed 2 data sources (SoFIFA: 2802 players, Understat: 562 players)
- Loop #2: Verified fixes with specific API formats
- Loop #3: End-to-end test (found Mohamed Salah with stats)
- **6/6 tasks completed in 35 minutes**

---

## 🚀 Launch Commands

### Recommended Start Command

```bash
# Reset first
ralph --reset-circuit
ralph --reset-session

# Launch with correct parameters
ralph --no-continue \
      --allowed-tools "Write,Edit,Bash(*),Read,Glob,Grep" \
      --calls 50 \
      --timeout 30 \
      --verbose
```

### Why These Parameters?

| Parameter | Why It Matters |
|-----------|---------------|
| `--no-continue` | Fresh session each loop, prevents Ralph from re-reading his own output |
| `--allowed-tools` | **MUST include Edit** or Ralph can't modify files! |
| `--calls 50` | Enough API calls for 3-5 loops |
| `--timeout 30` | 30 min per loop (adequate for most tasks) |
| `--verbose` | See detailed progress |

---

## 📊 Monitoring Ralph

### Check Status

```bash
# Current status
ralph --status

# Live log watching
tail -f .ralph/logs/ralph.log

# Recent activity
tail -50 .ralph/logs/ralph.log | grep "RALPH_STATUS"

# Files changed
git status --short
```

### What to Look For

**Good Signs:**
- `STATUS: IN_PROGRESS` or `STATUS: COMPLETED`
- `FILES_MODIFIED: 1` or higher
- `EXIT_SIGNAL: true` when done
- Specific evidence in plan updates (player counts, test results)

**Bad Signs:**
- `STATUS: BLOCKED`
- `FILES_MODIFIED: 0` for multiple loops
- Circuit breaker: `OPEN` or `HALF_OPEN`
- Ralph repeating same analysis without action

### When to Intervene

**Let Ralph Continue:**
- FILES_MODIFIED > 0 (he's making progress)
- Loops taking time (complex analysis is OK)
- EXIT_SIGNAL not yet sent

**Intervene When:**
- 3+ loops with FILES_MODIFIED: 0
- Circuit breaker OPEN
- Ralph commenting on his own previous work
- Plan file becomes complex (>100 lines)

**How to Intervene:**
```bash
# Stop Ralph
pkill -f ralph_loop.sh

# Reset everything
ralph --reset-circuit
ralph --reset-session

# Simplify .ralph/PROMPT.md if it got complex
# Re-launch
ralph --no-continue --allowed-tools "Write,Edit,Bash(*),Read,Glob,Grep" --calls 50
```

---

## ⚠️ Common Pitfalls

### ❌ PITFALL 1: Vague Scope

**Bad:**
> "Improve the application"
> "Fix bugs"
> "Make it better"

**Good:**
> "Fix data sources in ballseye_aggregator.py. Nothing else."
> "Add portfolio tracking to the dashboard (5 endpoints, 3 components)"

**Fix:** Write "Your Only Job" in ONE sentence with specific file/feature.

### ❌ PITFALL 2: No Success Criteria

**Bad:**
> "Fix the errors"
> "Get it working"

**Good:**
> "`python quick_test.py` shows at least 1 working data source"
> "`npm test` passes all 47 tests"

**Fix:** Define a TESTABLE command that proves success.

### ❌ PITFALL 3: Tasks Out of Order

**Bad:**
> 1. Test the fix
> 2. Understand the problem
> 3. Implement solution

**Good:**
> 1. Read and understand the issue
> 2. Fix problem A
> 3. Fix problem B
> 4. Run tests
> 5. Update plan

**Fix:** Sequential ordering - read → fix → test → report.

### ❌ PITFALL 4: Vague or Missing Details

**Bad:**
- .ralph/PROMPT.md: "Fix the tables" (no location, no specific issue)
- .ralph/fix_plan.md: "Make UI better" (no success criteria)

**Good:**
- .ralph/PROMPT.md: "Fix table overflow in ChatInterface.tsx lines 133-183 by adding responsive wrapper"
- .ralph/fix_plan.md: "Table centered, fits 1920px viewport, no horizontal scroll"

**Fix:** Be specific about locations, symptoms, and expected outcomes. Length doesn't matter - clarity does.

### ❌ PITFALL 5: Missing Edit Tool

**Bad:**
```bash
ralph --allowed-tools "Write,Bash(*),Read"
```
**Result:** Ralph can't modify files → `STATUS: BLOCKED`

**Good:**
```bash
ralph --allowed-tools "Write,Edit,Bash(*),Read,Glob,Grep"
```

**Fix:** Always include `Edit` in allowed-tools!

### ❌ PITFALL 6: No Exit Signal

**Bad:**
> "Fix all the things"
> (Ralph never knows when to stop)

**Good:**
> "Set EXIT_SIGNAL: true when at least ONE data source works"

**Fix:** Tell Ralph exactly when success is achieved.

---

## 📚 Success Pattern Library

### Pattern 1: Bug Fix Task

```markdown
# Ralph Instructions - Fix [Bug Name]

## Your Only Job
Fix [specific bug in file.py]. Nothing else.

## Current Problem
- [Error message]: [symptom/reproduction steps]
- Occurs when: [trigger condition]
- Expected: [correct behavior]
- Actual: [wrong behavior]

## Files to Work On
- `[path/to/file.py]` ([XXX lines] - contains the bug)
- `[path/to/test.py]` (test file to verify fix)

## Your Tasks
1. Read `[file.py]` and locate the bug (around line [XXX])
2. Understand root cause
3. Implement fix
4. Run `[test command]` - all tests must pass
5. Update `.ralph/fix_plan.md`

## Success =
`[test command]` passes AND bug no longer reproduces.
```

### Pattern 2: Feature Implementation

```markdown
# Ralph Instructions - Implement [Feature Name]

## Your Only Job
Add [feature] to [component/page]. Nothing else.

## Current Problem
- Feature missing: [what users can't do]
- Need: [what the feature should do]
- Files already exist but lack this functionality

## Files to Work On
- `[backend/api.py]` ([XXX lines] - add endpoints)
- `[frontend/component.tsx]` ([XXX lines] - add UI)
- `[database/schema.sql]` (add tables if needed)

## Your Tasks
1. Add backend API endpoint for [feature]
2. Add frontend component/UI
3. Test: Manual test or run `[test command]`
4. Document in .ralph/fix_plan.md

## Success =
Feature works end-to-end: user can [perform action] and see [result].
```

### Pattern 3: Refactoring Task

```markdown
# Ralph Instructions - Refactor [Component Name]

## Your Only Job
Refactor [file.py] to [improvement goal]. Keep functionality identical.

## Current Problem
- Code duplication: [what's repeated]
- Hard to maintain: [why]
- Performance issue: [if applicable]

## Files to Work On
- `[file.py]` ([XXX lines] - needs refactoring)
- `[test.py]` (tests must still pass after refactor)

## Your Tasks
1. Read current implementation
2. Identify refactor opportunities
3. Refactor while keeping tests green
4. Run `[test command]` - all tests must pass
5. Update .ralph/fix_plan.md

## Success =
Code is cleaner AND `[test command]` shows all tests still pass.
```

---

## 🎓 Key Takeaways (Updated from Ralph Official Docs)

1. **Be Specific**: Clear, detailed requirements lead to better results (not "short prompts")
2. **One mission only**: "Fix data sources" not "fix data + add features + refactor"
3. **Evidence matters**: "562 players" beats "it works"
4. **Sequential tasks**: Read → Fix → Test → Report (not scrambled)
5. **Clear exit signal**: Ralph needs to know when success is achieved
6. **Edit tool is critical**: Can't modify files without it
7. **Fresh sessions**: `--no-continue` prevents confusion
8. **Testable success**: Run a command, see a result
9. **Appropriate length**: Complex tasks need detailed instructions - don't artificially limit
10. **Include examples**: Show expected inputs/outputs, code snippets, verification steps

---

## 📖 Further Reading

- [RALPH_KULLANIM_REHBERI.md](RALPH_KULLANIM_REHBERI.md) - Turkish guide with troubleshooting
- [.ralph/PROMPT.md](.ralph/PROMPT.md) - Current project's Ralph prompt
- [.ralph/fix_plan.md](.ralph/fix_plan.md) - Current project's task plan

---

**Last Updated:** 2026-01-30 (Updated for new `.ralph/` folder structure)
**Success Rate:** 100% (Ballseye: 6/6 tasks in 35 minutes - SIMPLE task)
**Key Principle:** Clarity = Success. Be as detailed as needed for autonomous execution! 🎯
**Note:** Ballseye was a simple 4-source fix. Complex UI/UX tasks need MORE detail, not less.
