#!/bin/bash

# Test script for mcp-http-client
# This simulates how Claude Desktop would interact with the MCP client

SERVER_URL="https://latch-support-mcp-production.up.railway.app"

echo "Testing mcp-http-client with $SERVER_URL"
echo ""
echo "Starting client..."
echo ""

# The client will start and wait for MCP protocol messages on stdin
# For now, we'll just test that it starts and connects successfully
node index.js "$SERVER_URL" &
CLIENT_PID=$!

# Wait a moment for the client to initialize
sleep 2

# Check if the process is still running (it should be)
if ps -p $CLIENT_PID > /dev/null; then
    echo "✅ Client started successfully and is running"
    echo "   PID: $CLIENT_PID"
    echo ""
    echo "Stopping client..."
    kill $CLIENT_PID
    echo "✅ Test passed"
else
    echo "❌ Client failed to start or crashed"
    exit 1
fi
