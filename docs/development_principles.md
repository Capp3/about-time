# About Time - Development Principles

This document outlines the core principles that guide our development process for the About Time application. These principles are non-negotiable and must be followed throughout the project lifecycle.

## 1. Slow and Deliberate Development

> We value quality over speed. Moving slowly and deliberately produces better results than rushing.

### Why Move Slowly?

- **Reduced Technical Debt**: Taking time to implement features properly means less refactoring later
- **Higher Quality**: Careful implementation leads to fewer bugs and better user experience
- **Better Architecture**: Time to think through design decisions leads to more maintainable code
- **More Complete Testing**: Thorough testing requires time but prevents future issues
- **Comprehensive Documentation**: Well-documented code and features improve long-term maintainability

### Implementation Guidelines

- **Weekly Iterations**: Focus on small, manageable chunks of work each week
- **Daily Code Review**: All code must be reviewed before merging
- **Testing First**: Write tests before or alongside implementation
- **Document Everything**: Update documentation with each feature
- **No Shortcuts**: Don't take implementation shortcuts to save time

## 2. Zero Tolerance for Feature Creep

> We commit to building exactly what's in the PRD - nothing more, nothing less.

### What is Feature Creep?

Feature creep occurs when:
- New features are added beyond the original scope
- Simple features become more complex than required
- "Just one more thing" gets added repeatedly
- Edge cases lead to scope expansion

### Anti-Feature Creep Rules

1. **PRD as Source of Truth**: All features must be explicitly defined in the PRD
2. **Formal Change Process**: Any change to requirements requires formal approval
3. **Parking Lot**: Good ideas not in scope go to the parking lot for future consideration
4. **Weekly Scope Review**: Regular check to ensure we haven't drifted from original scope
5. **"No" as Default**: The default answer to new feature requests is "no"

### Feature Request Process

When a new feature is requested:

1. Check if it's in the PRD
2. If not, add it to the parking lot
3. Focus on completing the defined MVP first
4. Revisit parked features only after MVP completion

## 3. Ask Questions Before Implementing

> When in doubt, ask. Never guess about requirements or implementation details.

### Question-Driven Development

- **Identify Ambiguities**: Actively look for unclear or undefined aspects
- **Question Assumptions**: Don't assume you know what's needed - verify
- **Seek Clarification**: Request more information when requirements are vague
- **Document Decisions**: Record all clarifications and decisions
- **Validate Understanding**: Confirm your interpretation before implementing

### Questions and Decisions Log

We maintain a dedicated Questions and Decisions Log that:

1. Tracks all questions raised during development
2. Records decisions made and their rationale
3. Documents assumptions that require validation
4. Notes clarifications received from stakeholders

This log is reviewed weekly to ensure all questions are addressed.

## 4. UV as Python Package Manager

> UV is our standard Python package manager for this project.

### Why UV?

- **Performance**: Significantly faster than pip/poetry
- **Deterministic Builds**: Ensures consistent environments
- **Lock File Support**: Precise dependency resolution
- **Compatibility**: Works with standard Python package ecosystem
- **Modern**: Built with Rust for reliability and speed

### UV Usage Requirements

1. **Use UV for all Python dependencies**:
   ```bash
   uv pip install <package>
   ```

2. **Always update lock files**:
   ```bash
   uv pip freeze > requirements.txt
   # or when using pyproject.toml
   uv pip compile pyproject.toml -o requirements.txt
   ```

3. **Use UV with virtualenvs**:
   ```bash
   uv venv
   source .venv/bin/activate
   ```

4. **Version pinning required**:
   - All dependencies must have specific versions
   - No open-ended version requirements (e.g., `>=3.0.0`)
   - Lock files must be committed to version control

5. **Regular security scanning**:
   - Dependencies scanned weekly for vulnerabilities
   - Updates applied promptly for security issues

## 5. Daily Development Practices

These daily practices reinforce our core principles:

### Morning Standup Questions

Each day, team members answer:
1. What did you complete yesterday?
2. What will you work on today?
3. What obstacles are you facing?
4. **Have any features expanded beyond their original scope?**
5. **What questions do you need answered before proceeding?**

### End-of-Day Documentation

Each day, update:
1. Progress on assigned tasks
2. New questions that arose
3. Decisions made
4. Updated documentation
5. Test coverage status

### Code Review Checklist

For each code review:
1. Does the implementation strictly follow the PRD?
2. Is there any unnecessary complexity?
3. Are all edge cases covered by tests?
4. Is documentation updated?
5. Are dependencies managed correctly with UV?

## Enforcing These Principles

To ensure these principles are followed:

1. **Regular Audits**: Weekly review of code and documentation
2. **Metrics**: Track questions asked, scope changes proposed/rejected, test coverage
3. **Team Accountability**: Team members remind each other of these principles
4. **Principle Visibility**: These principles are referenced in daily work
5. **Lead by Example**: Team leads demonstrate these principles in their work

## Conclusion

These development principles are the foundation of our work on the About Time project. By moving slowly, avoiding feature creep, asking questions, and using consistent tools like UV, we will deliver a high-quality product that exactly meets the defined requirements.
