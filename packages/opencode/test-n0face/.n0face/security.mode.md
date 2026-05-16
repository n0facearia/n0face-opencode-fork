# Security Mode

## Focus
Security hardening, input validation, authentication, authorization, and data protection.

## Checklist
- [ ] All user inputs validated and sanitized
- [ ] No hardcoded secrets, API keys, or credentials
- [ ] Authentication uses standard library (no custom crypto)
- [ ] Authorization checks on every protected endpoint
- [ ] SQL/NoSQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding, CSP headers)
- [ ] CSRF protection where applicable
- [ ] Dependencies audited for known vulnerabilities
- [ ] HTTPS enforced in production
- [ ] Rate limiting on auth endpoints
- [ ] Proper error handling (no stack traces in responses)
- [ ] Session/cookie security flags set (HttpOnly, Secure, SameSite)

## Workflow
1. Run dependency vulnerability scan
2. Manual code review against checklist
3. Document any findings and remediation steps
