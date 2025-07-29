#!/bin/bash

echo "🚀 Setting up Warehouse Management System Frontend..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js 18+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if backend is running
echo "🔍 Checking backend API..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "⚠️  Backend API is not running on localhost:8080"
    echo "   Please make sure to start the backend services first:"
    echo "   cd ../.. && docker-compose up -d"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Available commands:"
echo "   npm run dev      - Start development server"
echo "   npm run build    - Build for production" 
echo "   npm run preview  - Preview production build"
echo "   npm run lint     - Run ESLint"
echo ""
echo "🌐 Frontend will be available at:"
echo "   Development: http://localhost:3000"
echo "   Production:  http://localhost:3000 (with Docker)"
echo ""
echo "🚀 Start development with:"
echo "   npm run dev"
