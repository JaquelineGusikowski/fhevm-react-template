# Contributing to FHEVM SDK

Thank you for considering contributing to the FHEVM SDK! This document provides guidelines for contributing.

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Suggesting Features

1. Check if feature already requested
2. Create feature request with:
   - Use case description
   - Expected behavior
   - Mockups/examples (if applicable)

### Code Contributions

#### Setup Development Environment

```bash
# Fork and clone
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK
npm run build
```

#### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. Commit with clear messages:
   ```bash
   git commit -m "feat: add new encryption type support"
   ```

#### Commit Message Format

We follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(sdk): add support for uint128 encryption
fix(react): resolve hook dependency issue
docs(readme): update installation instructions
```

#### Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit PR with:
   - Clear title
   - Description of changes
   - Related issue numbers
   - Screenshots (if UI changes)

#### Code Review

- Address reviewer comments
- Keep PR focused and small
- Update PR based on feedback

## Coding Standards

### JavaScript Style

- Use ES6+ features
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic

### React Hooks

```javascript
// Good: Clear naming, proper dependencies
function useEncrypt() {
  const { client } = useFhevm();
  const [encrypting, setEncrypting] = useState(false);

  const encrypt = useCallback(async (value, type) => {
    // Implementation
  }, [client]);

  return { encrypt, encrypting };
}
```

### Error Handling

```javascript
// Good: Clear error messages
if (!this.initialized) {
  throw new Error('FHEVM SDK not initialized. Call initialize() first.');
}

// Good: Catch and expose errors
try {
  await operation();
} catch (error) {
  setError(error);
  throw error;
}
```

### Documentation

- Add JSDoc comments for public APIs
- Include usage examples
- Document parameters and return values

```javascript
/**
 * Encrypt a value for use in contract calls
 * @param {number|bigint} value - Value to encrypt
 * @param {string} type - Data type (uint8, uint16, uint32, uint64, address, bool)
 * @returns {Promise<Uint8Array>} Encrypted value
 */
async encrypt(value, type = 'uint32') {
  // Implementation
}
```

## Testing

### Writing Tests

```javascript
describe('FhevmClient', () => {
  it('should initialize successfully', async () => {
    const client = new FhevmClient();
    await client.initialize(config);
    expect(client.isInitialized()).toBe(true);
  });

  it('should encrypt values', async () => {
    const encrypted = await client.encrypt(42, 'uint32');
    expect(encrypted).toBeInstanceOf(Uint8Array);
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Specific package
npm run test:sdk

# With coverage
npm run coverage
```

## Documentation

### Updating Documentation

- Update README.md for API changes
- Update examples for new features
- Add code comments
- Update QUICKSTART.md for workflow changes

### Documentation Structure

```
fhevm-react-template/
├── README.md              # Main documentation
├── QUICKSTART.md          # Getting started guide
├── ARCHITECTURE.md        # System design
├── DEPLOYMENT.md          # Deployment guide
├── CONTRIBUTING.md        # This file
└── packages/fhevm-sdk/
    └── README.md          # SDK API reference
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Creating a Release

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
4. Create GitHub release
5. Publish to npm (if applicable)

## Community

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

### Getting Help

- GitHub Issues
- Discord community
- Documentation

### Communication

- Use GitHub issues for bugs/features
- Use GitHub discussions for questions
- Be clear and concise
- Provide context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- GitHub contributors page
- Release notes

Thank you for contributing to FHEVM SDK!
