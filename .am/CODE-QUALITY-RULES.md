# Code Quality Rules

1. **No dead code**: Remove unused variables, functions, imports, CSS classes, dependencies, and commented-out code.
2. **Readable & maintainable**: Clear descriptive names, short focused functions, reduced cyclomatic complexity, consistent naming.
3. **Type safe**: No `any` types. Proper typing for all parameters and return types. Null/undefined checks implemented.
4. **Performant**: Efficient algorithms, no redundant calculations, memory leak prevention, optimized queries, bundle size optimization.
5. **No duplication**: Extract repeated logic into shared utilities. Follow DRY within reason.
6. **Tested**: Critical paths have behavioral tests. No snapshot abuse.
7. **Consistent style**: Follow the project's existing conventions. Use the same patterns as neighboring code.
