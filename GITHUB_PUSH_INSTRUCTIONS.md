# Push OPRA to GitHub - Instructions

## Prerequisites
1. Create a GitHub account at https://github.com if you don't have one
2. Install Git on your computer: https://git-scm.com/downloads
3. Configure Git with your credentials:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Repository name: `opra` (or `opra-llm`)
3. Description: "Hand-coded transformer language model built from scratch in TypeScript"
4. Make it **Public** (since it's open source)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Your Code
Run these commands in your project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: OPRA hand-coded language model"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/opra.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify
1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your project files

## Optional: Add GitHub Features

### Add a License
```bash
# Add MIT license
echo "MIT License" > LICENSE
git add LICENSE
git commit -m "Add MIT license"
git push
```

### Add GitHub Actions (CI/CD)
Create `.github/workflows/build.yml`:
```yaml
name: Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
```

Then push:
```bash
git add .github/
git commit -m "Add GitHub Actions workflow"
git push
```

## Troubleshooting

### If you get authentication errors:
```bash
# Use GitHub CLI (recommended)
gh auth login

# Or use personal access token
# 1. Go to GitHub Settings > Developer settings > Personal access tokens
# 2. Generate new token with 'repo' scope
# 3. Use token as password when prompted
```

### If you need to change remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/opra.git
```

### If you want to make it public after creating as private:
1. Go to repository Settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Make public"

## Your Repository Structure
```
opra/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── brain/
│   │   ├── knowledge.ts
│   │   ├── intent.ts
│   │   ├── math.ts
│   │   ├── memory.ts
│   │   └── reasoning.ts
│   └── transformer/
│       ├── tensor.ts
│       ├── tokenizer.ts
│       ├── model.ts
│       └── inference.ts
└── ...
```

## After Pushing
Your repository will be live at:
`https://github.com/YOUR_USERNAME/opra`

Share it with the world! 🚀
