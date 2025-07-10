#!/bin/bash

# This script generates authentication states for wallet roles
# Usage: ./generate-auth-roles.sh [environment] [role1] [role2] ...
# Environment: local (default) or dev
# Local env: Seller, Buyer, Arb roles
# Dev env: Seller, Buyer roles only
# 
# Examples:
# ./generate-auth-roles.sh                    # Generate all roles for local env
# ./generate-auth-roles.sh local              # Generate all roles for local env  
# ./generate-auth-roles.sh dev                # Generate all roles for dev env
# ./generate-auth-roles.sh local Seller Buyer # Generate specific roles for local env
# ./generate-auth-roles.sh dev Seller         # Generate specific roles for dev env

# Navigate to project root
cd "$(dirname "$0")/.."

# Parse environment argument
ENVIRONMENT="local"
ROLES_TO_GENERATE=()

# Check if first argument is an environment
if [[ "$1" =~ ^(local|dev)$ ]]; then
  ENVIRONMENT="$1"
  shift # Remove environment from arguments
fi

# Set environment-specific configurations
if [ "$ENVIRONMENT" = "dev" ]; then
  AVAILABLE_ROLES=("Seller" "Buyer")
  AUTH_FOLDER="data-auth/dev"
  WALLET_TYPES=("SellerDevWallet" "BuyerDevWallet")
  echo "🌐 Environment: DEV (https://dev.localecash.com)"
else
  AVAILABLE_ROLES=("Seller" "Buyer" "Arb") 
  AUTH_FOLDER="data-auth/local"
  WALLET_TYPES=("SellerLocalWallet" "BuyerLocalWallet" "ArbLocalWallet")
  echo "🏠 Environment: LOCAL"
fi

# Create auth directory if it doesn't exist
mkdir -p "$AUTH_FOLDER"

# Check if seeds.json exists, if not create it from template
if [ ! -f "seeds.json" ]; then
  echo "seeds.json not found. Creating from template..."
  cp seeds.template.json seeds.json
  echo "Please edit seeds.json to add your wallet recovery phrases and phone numbers"
  echo "Then run this script again"
  exit 1
fi

# Function to validate seeds.json has proper wallet data
validate_seeds_json() {
  local missing_wallets=()
  local json_content=$(cat seeds.json)
  
  # Check each wallet type based on environment
  for wallet in "${WALLET_TYPES[@]}"; do
    if ! echo "$json_content" | grep -q "\"$wallet\""; then
      missing_wallets+=("$wallet")
    else
      # Check if wallet has placeholder values
      local recovery_phrase=$(echo "$json_content" | grep -A 3 "\"$wallet\"" | grep "recoveryPhrase" | grep -o "\".*\"" | sed 's/"//g' | sed 's/^.*: //')
      if [[ "$recovery_phrase" == *"your"* ]] || [[ "$recovery_phrase" == *"here"* ]]; then
        echo "Warning: $wallet appears to have placeholder values. Please update it in seeds.json"
      fi
    fi
  done
  
  # If any wallets are missing, report and exit
  if [ ${#missing_wallets[@]} -gt 0 ]; then
    echo "Error: The following wallet types are missing from seeds.json for $ENVIRONMENT environment:"
    for wallet in "${missing_wallets[@]}"; do
      echo "  - $wallet"
    done
    echo "Please update seeds.json to include all required wallet types"
    exit 1
  fi
}

# Validate seeds.json before proceeding
validate_seeds_json

# Function to generate auth for a specific role
generate_auth_for_role() {
  local role=$1
  echo "🔑 Generating authentication for $role role in $ENVIRONMENT environment..."
  
  # Set environment variables for the role and environment
  TEST_ENV="$ENVIRONMENT" WALLET_ROLE="$role" npx playwright test tests/generate-auth.spec.ts --project=chromium --headed
  
  local exit_code=$?
  if [ $exit_code -eq 0 ]; then
    echo "✅ Completed authentication for $role role"
    echo "📁 Auth files saved to: $AUTH_FOLDER/${role,,}-auth.json"
  else
    echo "❌ Failed to generate authentication for $role role"
    return $exit_code
  fi
}

# Parse remaining arguments as specific roles
if [ $# -gt 0 ]; then
  # Validate provided roles against available roles for environment
  for role in "$@"; do
    # Normalize role name (capitalize first letter, lowercase rest)
    normalized_role=$(echo "$role" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
    
    # Check if role is valid for current environment
    if [[ " ${AVAILABLE_ROLES[@]} " =~ " ${normalized_role} " ]]; then
      ROLES_TO_GENERATE+=("$normalized_role")
    else
      echo "❌ Error: Invalid role '$role' for $ENVIRONMENT environment."
      echo "Available roles: ${AVAILABLE_ROLES[*]}"
      exit 1
    fi
  done
else
  # No specific roles provided, use all available roles for environment
  ROLES_TO_GENERATE=("${AVAILABLE_ROLES[@]}")
fi

echo "🚀 Generating auth for roles: ${ROLES_TO_GENERATE[*]}"
echo "📂 Output directory: $AUTH_FOLDER"
echo "🔄 Running tests in parallel..."
echo "----------------------------------------"

# Generate auth for specified roles in parallel
pids=()
failed_roles=()

for role in "${ROLES_TO_GENERATE[@]}"; do
  # Run each role generation in background
  (
    generate_auth_for_role "$role"
    echo $? > "/tmp/auth_result_${role}_$$"
  ) &
  pids+=($!)
  echo "🚀 Started authentication generation for $role role (PID: $!)"
done

# Wait for all background processes to complete
echo "⏳ Waiting for all authentication processes to complete..."
for pid in "${pids[@]}"; do
  wait $pid
done

# Check results
echo "----------------------------------------"
echo "📊 Authentication Generation Results:"
for role in "${ROLES_TO_GENERATE[@]}"; do
  result_file="/tmp/auth_result_${role}_$$"
  if [ -f "$result_file" ]; then
    result=$(cat "$result_file")
    if [ "$result" -eq 0 ]; then
      echo "✅ $role: SUCCESS"
    else
      echo "❌ $role: FAILED"
      failed_roles+=("$role")
    fi
    rm -f "$result_file"
  else
    echo "❓ $role: UNKNOWN (result file not found)"
    failed_roles+=("$role")
  fi
done

# Final status
if [ ${#failed_roles[@]} -eq 0 ]; then
  echo "🎉 All authentication generation completed successfully!"
  echo "📁 Auth files location: $AUTH_FOLDER"
  echo "🔧 You can now run tests with these authentication states"
  exit 0
else
  echo "❌ Authentication generation failed for: ${failed_roles[*]}"
  echo "📁 Successful auth files location: $AUTH_FOLDER"
  echo "🔧 Please retry failed roles or check the error logs"
  exit 1
fi
