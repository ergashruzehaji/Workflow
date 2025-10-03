#!/bin/bash

# Workflow Automation API Demo Script
# This script demonstrates the key features of the API

API_KEY="dev-key-12345"
BASE_URL="http://localhost:5000"

echo "🚀 Workflow Automation API Demo"
echo "================================"
echo ""

# Function to make pretty JSON output
pretty_json() {
    python -m json.tool 2>/dev/null || cat
}

# 1. Health Check
echo "1️⃣  Health Check"
echo "----------------------------"
curl -s "$BASE_URL/health" | pretty_json
echo ""
echo ""

# 2. Create a high priority bug task
echo "2️⃣  Creating HIGH priority BUG task (auto-assigns to dev-team, due in 1 day)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/api/tasks" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Critical login bug",
    "type": "bug",
    "priority": "high",
    "description": "Users cannot login with valid credentials"
  }' | pretty_json
echo ""
echo ""

# 3. Create a feature task
echo "3️⃣  Creating MEDIUM priority FEATURE task (auto-assigns to product-team, due in 3 days)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/api/tasks" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add dark mode",
    "type": "feature",
    "priority": "medium",
    "description": "Implement dark mode for better user experience"
  }' | pretty_json
echo ""
echo ""

# 4. Create a documentation task
echo "4️⃣  Creating LOW priority DOCUMENTATION task (auto-assigns to docs-team, due in 7 days)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/api/tasks" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Update API documentation",
    "type": "documentation",
    "priority": "low",
    "description": "Add examples for all endpoints"
  }' | pretty_json
echo ""
echo ""

# 5. Get all tasks
echo "5️⃣  Getting ALL tasks"
echo "----------------------------"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/tasks" | pretty_json
echo ""
echo ""

# 6. Update task status
echo "6️⃣  Updating task #1 to 'in_progress'"
echo "----------------------------"
curl -s -X PATCH "$BASE_URL/api/tasks/1" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }' | pretty_json
echo ""
echo ""

# 7. Filter tasks by status
echo "7️⃣  Filtering tasks by status='in_progress'"
echo "----------------------------"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/tasks?status=in_progress" | pretty_json
echo ""
echo ""

# 8. Create a workflow
echo "8️⃣  Creating an automated workflow"
echo "----------------------------"
curl -s -X POST "$BASE_URL/api/workflows" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto-escalate high priority tasks",
    "trigger": "task.priority == high AND task.age > 24 hours",
    "actions": ["send_notification", "escalate_to_manager"]
  }' | pretty_json
echo ""
echo ""

# 9. Get automation statistics
echo "9️⃣  Getting automation statistics"
echo "----------------------------"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/stats" | pretty_json
echo ""
echo ""

# 10. Test validation (should fail)
echo "🔟 Testing validation (missing required fields - should fail)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/api/tasks" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incomplete task"
  }' | pretty_json
echo ""
echo ""

echo "✅ Demo complete! All automation features demonstrated."
echo ""
echo "Key Features Shown:"
echo "  ✓ Automatic team assignment based on task type"
echo "  ✓ Automatic due date calculation based on priority"
echo "  ✓ Input validation to prevent errors"
echo "  ✓ Task filtering and querying"
echo "  ✓ Workflow automation setup"
echo "  ✓ Statistics tracking"
