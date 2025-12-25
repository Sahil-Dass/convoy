#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1. Delete the conflicting folder-based route
# We want to keep 'app/(tabs)/profile.tsx' (the new file we made)
# and remove 'app/(tabs)/profile/' (the old folder)

if [ -d "app/(tabs)/profile" ]; then
    echo "Found conflicting folder 'app/(tabs)/profile'. Removing it..."
    rm -rf "app/(tabs)/profile"
fi

# 2. Also check for other common duplicates from your file list
# 'maps.tsx' vs 'maps/' folder?
if [ -d "app/(tabs)/maps" ] && [ -f "app/(tabs)/maps.tsx" ]; then
    echo "Found conflicting folder 'app/(tabs)/maps'. Removing it..."
    rm -rf "app/(tabs)/maps"
fi

# 'groups.tsx' vs 'groups/' folder?
if [ -d "app/(tabs)/groups" ] && [ -f "app/(tabs)/groups.tsx" ]; then
    echo "Found conflicting folder 'app/(tabs)/groups'. Removing it..."
    rm -rf "app/(tabs)/groups"
fi


rm -rf .expo node_modules/.cache
echo "Done. Removed duplicate route folders. Run: npx expo start --tunnel --clear"
