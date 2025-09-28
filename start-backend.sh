#!/bin/bash

echo "🚀 Starting RouteMate Backend with Supabase connection..."

# Set environment variables
export SUPABASE_URL="https://abqahjdmscmpoipjxplw.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicWFoamRtc2NtcG9pcGp4cGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NzExNDksImV4cCI6MjA3NDM0NzE0OX0.OgvKNU8aCggaWaSh3P9qOhxYks2azu5o05HDqQmi-3g"
export PORT=5005
export NODE_ENV=development

# Start the server
cd backend && node server.js
