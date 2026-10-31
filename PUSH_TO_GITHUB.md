# 🚀 Quick Start: Push OPRA to GitHub

## One-Time Setup (if you haven't already)

```bash
# Install Git (if not installed)
# macOS: brew install git
# Windows: Download from https://git-scm.com/download/win
# Linux: sudo apt install git

# Configure Git (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name**: `opra`
   - **Description**: `Hand-coded transformer language model built from scratch in TypeScript`
   - **Public** ✓
   - **DO NOT** initialize with README/gitignore/license
3. Click **Create repository**

## Step 2: Push Your Code

Copy and run these commands in your terminal (in the project directory):

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: OPRA hand-coded language model"

# Add GitHub remote (IMPORTANT: Replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/opra.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to `https://github.com/YOUR_USERNAME/opra`
2. Refresh the page
3. You should see all your project files!

---

## 🎉 That's it!

Your OPRA repository is now live on GitHub.

### What's included:
- ✅ Complete source code
- ✅ MIT License
- ✅ Comprehensive README
- ✅ Contributing guidelines
- ✅ GitHub Actions CI/CD
- ✅ .gitignore file

### Next steps:
- Share the link: `https://github.com/YOUR_USERNAME/opra`
- Add a description to your repo
- Consider adding topics/tags for discoverability

---

## 🔧 Troubleshooting

### Authentication Error?
```bash
# Option 1: Use GitHub CLI (recommended)
gh auth login

# Option 2: Use Personal Access Token
# 1. Go to: https://github.com/settings/tokens
# 2. Generate new token (classic) with 'repo' scope
# 3. Use token as password when git asks
```

### Need to change remote URL?
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/opra.git
```

### Want to update after making changes?
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 📝 Notes

- The `.gitignore` file excludes `node_modules/` and `dist/` (they'll be regenerated)
- GitHub Actions will automatically build your project on every push
- The MIT License allows others to use, modify, and distribute your code

**Good luck with your open source project!** 🚀
