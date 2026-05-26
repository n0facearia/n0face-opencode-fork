# Cross-LLM Portability Report

**Audit date:** 2026-05-26
**Files audited:** `.am/agent/*.md` (10 files)

---

## Findings

| File | Issue Found | Fix Applied |
|------|-------------|-------------|
| `manager.md` | None | — |
| `design.md` | None | — |
| `frontend.md` | None | — |
| `backend.md` | None | — |
| `database.md` | None | — |
| `cleanup.md` | None | — |
| `security.md` | None | — |
| `testing.md` | None | — |
| `devops.md` | None | — |
| `documentation.md` | None | — |

**No model-specific syntax was found in any mode file.**

---

## Audit Categories Checked

| Category | Result |
|----------|--------|
| References to specific LLMs (Claude, GPT, Gemini, Llama, etc.) | ✅ None found |
| XML-style tags used as prompt delimiters (`<context>`, `<instruction>`) | ✅ None found (template variables like `<name>` are standard placeholders, not XML tags) |
| "Think step by step" or chain-of-thought patterns | ✅ None found |
| Assumed context window sizes (`200K`, `100K`, `8192`) | ✅ None found |
| Assumed tool-calling formats specific to one provider | ✅ None found |
| Markdown rendering assumptions | ✅ None found (references to "render" are about UI rendering, not markdown) |
| "You are an expert" / "you are a..." role framing | ✅ None found |
| First-person reasoning ("I think", "let me consider") | ✅ None found |

---

## Portability Assessment

**Overall: Fully portable.** All 10 mode files are written in plain language using standard markdown with markdown headers, code blocks, lists, and tables. There are no model-specific prompts, no XML-style delimiters, no chain-of-thought directives, no assumed context windows, and no provider-specific tool-calling formats.

The instructions use declarative role definitions ("This mode owns...", "This mode does NOT..."), explicit behavioral rules ("Run these commands:", "Wait for approval before..."), and template-based output formats that any LLM can follow regardless of provider.

The following patterns are used consistently and are provider-agnostic:
- **Markdown headers** (`##`, `###`) for section hierarchy
- **Backtick code blocks** for commands and templates
- **Bullet lists** for enumerating choices and rules
- **HTML comments** in `.am/changelog.md` for format reference
- **Plain-language instructions** with explicit do/don't rules

---

## Recommendations

### Test with a local model
While no portability issues were found, the mode files should be tested with at least one local/open-weight model (e.g., Llama 3, Qwen 2.5, or DeepSeek) to validate that:
1. The `### a. / ### b. / ### c.` hierarchical numbering in STARTUP BEHAVIOR sections is followed correctly (some models may flatten sub-steps)
2. The conditional handoff logic (read project.md → check completed/remaining → output suggestion) is executed rather than skipped
3. The `---` separator in the LEARNING LAYER format is rendered as a section break, not collapsed

### Watch for template placeholders
The mode files use angle-bracket placeholders extensively (`<action performed>`, `<decision made and rationale>`, `<comma-separated list>`, `<one-sentence reason>`, etc.). While these are standard across all prompt engineering approaches, weaker models may interpret them as XML tags or fail to substitute them with real content. All tested models should be verified to handle these correctly.

### No changes required
No rewrites were necessary. The mode system is already fully LLM-agnostic and portable across providers.
