#!/bin/bash

# HRMS Pro Mobile - Quick Start Script
# This script helps you get started quickly with the HRMS mobile app

echo "🚀 HRMS Pro Mobile - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if expo-cli is installed
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI is not installed. Installing globally..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI version: $(expo --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your backend URL if needed"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Next steps:"
echo ""
echo "1. Ensure your Spring Boot backend is running at http://localhost:8080"
echo ""
echo "2. Start the development server:"
echo "   npm start"
echo ""
echo "3. Run on your preferred platform:"
echo "   - iOS:     npm run ios"
echo "   - Android: npm run android"
echo "   - Web:     npm run web"
echo ""
echo "4. Or scan the QR code with Expo Go app on your phone"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Setup and installation"
echo "   - IMPLEMENTATION_GUIDE.md - Implementation details"
echo "   - SETUP_AND_DEPLOYMENT.md - Deployment guide"
echo "   - PROJECT_SUMMARY.md - Project overview"
echo ""
echo "🐛 Troubleshooting:"
echo "   - Clear cache: npm start -- --reset-cache"
echo "   - Type check: npm run type-check"
echo "   - Lint: npm run lint"
echo ""
echo "Happy coding! 🎨"

