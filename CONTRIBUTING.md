# Contributing to OPRA

Thank you for your interest in contributing to OPRA! This document provides guidelines and information for contributors.

## 🎯 Project Goals

OPRA aims to demonstrate that a language model can be built from scratch without relying on existing ML frameworks. We value:

- **Educational value**: Code should be clear and well-commented
- **Hand-crafted implementation**: No external ML libraries for core functionality
- **Browser-first**: Everything runs client-side
- **Open source**: MIT licensed, free for everyone

## 🚀 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Check existing issues before creating a new one
- Provide clear steps to reproduce bugs
- Include browser version and OS information

### Suggesting Features
- Open an issue with the "enhancement" label
- Explain the use case and benefits
- Be open to discussion and alternatives

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/opra.git
   cd opra
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a pull request on GitHub

## 💻 Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new files
- Define clear interfaces and types
- Avoid `any` types when possible

### React
- Use functional components with hooks
- Keep components focused and small
- Use meaningful variable and function names

### Comments
- Add JSDoc comments for exported functions
- Explain "why" not just "what"
- Keep comments up-to-date with code changes

### File Organization
```
src/
├── brain/          # Reasoning and knowledge
├── transformer/    # Transformer implementation
├── App.tsx         # Main UI component
└── index.css       # Global styles
```

## 🧪 Testing

Currently, OPRA doesn't have automated tests. When adding new features:
- Test manually in multiple browsers
- Verify the build succeeds: `npm run build`
- Check for TypeScript errors
- Test edge cases

## 📚 Areas for Contribution

### High Priority
- **Expand knowledge graph**: Add more entities and facts
- **Improve intent classification**: Better pattern matching
- **Add more math operations**: Trigonometry, logarithms, etc.
- **Browser compatibility**: Test and fix issues

### Medium Priority
- **Performance optimization**: Faster matrix operations
- **UI improvements**: Better mobile support
- **Documentation**: More examples and tutorials
- **Unit tests**: Add testing framework

### Nice to Have
- **Training implementation**: Add backpropagation
- **More visualizations**: Interactive attention diagrams
- **Export functionality**: Save chat history
- **Plugin system**: Extensible architecture

## 🤝 Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Celebrate contributions of all sizes

## 📄 License

By contributing to OPRA, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to open an issue for any questions about contributing!

---

Thank you for helping make OPRA better! 🚀
