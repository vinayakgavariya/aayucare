# Contributing to AayuCare

Thank you for your interest in contributing to AayuCare! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, etc.)

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (if you have ideas)

### Code Contributions

1. **Fork the repository**

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
   - Follow existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test your changes**
   - Test backend changes locally
   - Test frontend changes in browser
   - Ensure no breaking changes

5. **Commit your changes**
```bash
git add .
git commit -m "Add: brief description of your changes"
```

Use commit message prefixes:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for updates to existing features
- `Docs:` for documentation changes
- `Style:` for formatting changes
- `Refactor:` for code refactoring
- `Test:` for test additions/changes

6. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Wait for review

## Development Guidelines

### Backend (Python/FastAPI)

- Follow PEP 8 style guide
- Use type hints
- Add docstrings to functions
- Handle errors gracefully
- Test API endpoints

Example:
```python
async def find_doctors(request: FindDoctorsRequest) -> FindDoctorsResponse: """
    Find doctors based on symptoms using Gemini + Google Maps.
    
    Args:
        request: Request containing symptom text and location
        
    Returns:
        FindDoctorsResponse with recommendations and doctor list
        
    Raises:
        HTTPException: If the search fails
    """
    # Implementation
```

### Frontend (TypeScript/React/Next.js)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components
- Keep components small and focused
- Add proper error handling
- Make UI responsive

Example:
```typescript
interface ComponentProps {
  data: string;
  onComplete: (result: any) => void;
}

export default function Component({ data, onComplete
}: ComponentProps) {
    // Implementation
}
```

### Code Style

**Backend**:
```bash
# Format code
black main.py

# Check types
mypy main.py
```

**Frontend**:
```bash
# Format code
npm run format

# Lint
npm run lint
```

## Areas for Contribution

### High Priority
- [] Add more language support
- [] Improve voice recognition accuracy
- [] Better error handling
- [] Add loading states
- [] Implement caching
- [] Add rate limiting

### Medium Priority
- [] Add user feedback system
- [] Implement analytics
- [] Add more health facility types
- [] Improve mobile UI
- [] Add offline support
- [] Better SEO

### Low Priority
- [] Dark mode
- [] Accessibility improvements
- [] More documentation
- [] Add tests
- [] Performance optimizations

## Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
- Test voice input in different languages
- Test text input with various symptoms
- Test on different devices/browsers
- Test with slow network
- Test error scenarios

## Documentation

When adding features:
- Update README.md
- Update API documentation
- Add code comments
- Update SETUP.md if needed
- Update DEPLOYMENT.md if needed

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow the code of conduct

## Questions?

If you have questions:
- Open a discussion on GitHub
- Ask in pull request comments
- Check existing issues/PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AayuCare and helping improve rural healthcare access! 🙏

