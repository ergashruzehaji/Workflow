#!/bin/bash

# Quick Start Script for Workflow Automation System

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Workflow Automation System - Quick Start              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created. You can edit it to customize your configuration."
    echo ""
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    mkdir -p data
    echo "✓ Created data directory"
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Starting Workflow Automation System                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "The server will start at http://localhost:3000"
echo ""
echo "API Endpoints:"
echo "  - Tasks:     http://localhost:3000/api/tasks"
echo "  - Workflows: http://localhost:3000/api/workflows"
echo "  - GitHub:    http://localhost:3000/api/github/webhook"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
