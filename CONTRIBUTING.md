# Contributing to Workflow Automation System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- System information (Node.js version, OS, etc.)

### Suggesting Features

Feature requests are welcome! Please open an issue with:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (optional)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm start
   ./demo.sh
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide clear description
   - Reference related issues
   - Explain your changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Workflow.git
cd Workflow

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Run tests
npm test
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use meaningful variable names
- Keep functions small and focused

### Comments
- Add JSDoc comments for functions
- Explain "why", not "what"
- Keep comments concise

### Error Handling
- Always handle errors
- Provide meaningful error messages
- Use try-catch blocks

## Project Structure

```
src/
├── server.js           # Main Express server
├── database.js         # Database manager
├── taskService.js      # Task business logic
├── workflowService.js  # Workflow automation
└── routes/
    ├── tasks.js        # Task endpoints
    ├── workflows.js    # Workflow endpoints
    └── github.js       # GitHub webhooks
```

## Adding New Features

### Adding a New API Endpoint

1. Add route handler in appropriate file under `src/routes/`
2. Add business logic in service file
3. Update database schema if needed (in `database.js`)
4. Add validation
5. Update API documentation in `API.md`
6. Add usage example

### Adding a New Workflow Trigger

1. Add trigger type to `workflowService.js`
2. Implement trigger logic
3. Update documentation
4. Add example in `examples/workflow-templates.json`

### Adding a New Workflow Action

1. Add action type to `workflowService.js`
2. Implement action execution method
3. Update documentation
4. Add example template

## Testing

### Manual Testing

Use the demo script to test all features:
```bash
./demo.sh
```

### API Testing

Test individual endpoints:
```bash
# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "priority": "high"}'

# Get tasks
curl http://localhost:3000/api/tasks
```

## Documentation

When adding features, update:
- `README.md` - Main documentation
- `API.md` - API reference
- `CHANGELOG.md` - Version history
- Code comments

## Commit Message Guidelines

Use clear, descriptive commit messages:

- `Add: description` - New features
- `Fix: description` - Bug fixes
- `Update: description` - Updates to existing features
- `Docs: description` - Documentation changes
- `Refactor: description` - Code refactoring
- `Test: description` - Test additions/changes

Examples:
```
Add: workflow scheduling support
Fix: validation error on task creation
Update: improve error messages
Docs: add API examples for workflows
```

## Code Review Process

All pull requests will be reviewed for:
- Code quality and style
- Test coverage
- Documentation updates
- Breaking changes

## Questions?

Feel free to open an issue for any questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
