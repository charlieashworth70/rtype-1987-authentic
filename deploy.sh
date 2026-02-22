#!/bin/bash

# R-Type 1987 Authentic Clone - Deployment Script
# Deploys to GitHub Pages

echo "🚀 R-Type 1987 Authentic Clone - Deployment"
echo "=========================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit: R-Type 1987 Authentic Clone"
fi

# Check for remote origin
if ! git remote | grep -q "origin"; then
    echo "⚠️  No remote origin set."
    echo "Please set up a GitHub repository first:"
    echo "1. Create new repository at https://github.com/new"
    echo "2. Name it: rtype-1987-authentic"
    echo "3. Run: git remote add origin https://github.com/YOUR_USERNAME/rtype-1987-authentic.git"
    echo "4. Run this script again"
    exit 1
fi

# Build step (minify if needed)
echo "📦 Preparing deployment files..."
# For now, just copy files as-is
# In production, you might want to minify JS/CSS

# Create docs folder for GitHub Pages (if using docs folder method)
if [ "$1" = "--docs" ]; then
    echo "📁 Using docs/ folder method for GitHub Pages..."
    rm -rf docs
    mkdir docs
    cp -r *.html *.js *.md *.json docs/ 2>/dev/null || true
    # Create .nojekyll to prevent Jekyll processing
    touch docs/.nojekyll
    echo "✅ Files copied to docs/ folder"
    echo ""
    echo "📝 To deploy:"
    echo "1. git add docs/"
    echo "2. git commit -m 'Deploy to GitHub Pages'"
    echo "3. git push origin main"
    echo ""
    echo "⚙️  Then enable GitHub Pages:"
    echo "1. Go to repository Settings > Pages"
    echo "2. Set Source to 'Deploy from a branch'"
    echo "3. Set Branch to 'main' and folder to '/docs'"
    echo "4. Save and wait for deployment"
else
    echo "🌐 Using root method for GitHub Pages..."
    echo ""
    echo "📝 To deploy:"
    echo "1. git add ."
    echo "2. git commit -m 'Update R-Type 1987 game'"
    echo "3. git push origin main"
    echo ""
    echo "⚙️  Then enable GitHub Pages:"
    echo "1. Go to repository Settings > Pages"
    echo "2. Set Source to 'Deploy from a branch'"
    echo "3. Set Branch to 'main' and folder to '/' (root)"
    echo "4. Save and wait for deployment"
fi

echo ""
echo "🎮 Game will be available at:"
echo "https://YOUR_USERNAME.github.io/rtype-1987-authentic/"
echo ""
echo "🔗 Test URL: https://YOUR_USERNAME.github.io/rtype-1987-authentic/test.html"
echo ""
echo "✅ Deployment instructions complete!"