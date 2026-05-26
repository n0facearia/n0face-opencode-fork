# Skill Sources

This directory contains imports from three upstream open-source repositories.
All files preserve their original relative paths and are unmodified.

## 1. nexu-io/open-design

- **Repository**: <https://github.com/nexu-io/open-design>
- **License**: MIT
- **Branch**: main
- **Imported**: 2026-05-25
- **Files**: 17
- **Destination**: `.am/skills/open-design/`

### Imported Skills

| Domain | Upstream Path |
|---|---|
| Web Prototype | `plugins/_official/examples/web-prototype/` |
| SaaS Landing | `plugins/_official/examples/saas-landing/` |
| Dashboard | `plugins/_official/examples/dashboard/` |
| Component Library | `plugins/_official/design-systems/application/` |

Root-level files: `AGENTS.md`, `CLAUDE.md`, `LICENSE`

## 2. addyosmani/agent-skills

- **Repository**: <https://github.com/addyosmani/agent-skills>
- **License**: Apache-2.0
- **Branch**: main
- **Imported**: 2026-05-25
- **Files**: 10
- **Destination**: `.am/skills/agent-skills/`

### Imported Skills

| Domain | Upstream Path |
|---|---|
| API & Interface Design | `skills/api-and-interface-design/SKILL.md` |
| Test-Driven Development | `skills/test-driven-development/SKILL.md` |
| Documentation & ADRs | `skills/documentation-and-adrs/SKILL.md` |
| Spec-Driven Development | `skills/spec-driven-development/SKILL.md` |
| Incremental Implementation | `skills/incremental-implementation/SKILL.md` |
| Code Review & Quality | `skills/code-review-and-quality/SKILL.md` |
| Browser Testing with DevTools | `skills/browser-testing-with-devtools/SKILL.md` |
| Debugging & Error Recovery | `skills/debugging-and-error-recovery/SKILL.md` |
| Shipping & Launch | `skills/shipping-and-launch/SKILL.md` |
| CI/CD & Automation | `skills/ci-cd-and-automation/SKILL.md` |

## 3. wshobson/agents

- **Repository**: <https://github.com/wshobson/agents>
- **License**: MIT
- **Branch**: main
- **Imported**: 2026-05-25
- **Files**: 96
- **Destination**: `.am/skills/wshobson-agents/`

### Imported Plugins

| Domain | Import Path (≈ Upstream) |
|---|---|
| Backend Architecture | `backend-architecture/` (from upstream `plugins/backend-development/`) |
| Database Design | `database-design/` (from upstream `plugins/database-design/`) |
| DevOps Engineering | `devops-engineering/` (from upstream `plugins/cicd-automation/`, `plugins/cloud-infrastructure/`) |
| Resilience & Observability | `resilience-and-observability/` (from upstream `plugins/observability-monitoring/`, `plugins/distributed-debugging/`) |

---

**Total imported files: 123**

### Update Strategy

To refresh from upstream, re-run the clone steps:
1. `git clone --depth 1 --filter=blob:none --sparse <repo-url> /tmp/<tmp-dir>`
2. `git sparse-checkout set <needed-paths>`
3. Copy only the checked-out files retaining relative paths.
