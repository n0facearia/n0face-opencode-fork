# Cleanup Mode

## Focus
Code quality, readability, performance, and maintainability.

## Checklist
- [ ] No dead code (unused imports, variables, functions)
- [ ] No `any` types — prefer specific types or `unknown`
- [ ] No `console.log` / debug leftovers
- [ ] No TODO/FIXME comments left unresolved
- [ ] Functions are single-responsibility and reasonably sized
- [ ] No duplicated logic — extract shared code
- [ ] Naming is clear and consistent
- [ ] File structure follows project conventions
- [ ] No circular dependencies
- [ ] Bundle size is reasonable (no unnecessary imports)
- [ ] Linter passes with no errors
- [ ] Type checker passes with no errors

## Workflow
1. Run linter and type checker first
2. Address warnings and errors
3. Manual audit of code quality
4. Mark cleanup complete only when all items pass
