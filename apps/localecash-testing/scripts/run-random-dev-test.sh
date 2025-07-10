#!/bin/bash

# Script to randomly run one of 4 test cases in dev environment
# Sets TEST_ENV=dev and runs one of: release, release-with-deposit, return, return-with-deposit

# Array of available test commands
test_cases=(
    "test:release"
    "test:release-with-deposit" 
    "test:return"
    "test:return-with-deposit"
)

# Get the number of test cases
num_cases=${#test_cases[@]}

# Generate a random number between 0 and (num_cases - 1)
random_index=$((RANDOM % num_cases))

# Select the random test case
selected_test=${test_cases[$random_index]}

# Print header
echo "🎲 Random Dev Test Runner"
echo "========================="
echo "Environment: DEV"
echo "Available test cases: ${test_cases[*]}"
echo "Randomly selected: $selected_test"
echo "========================="
echo ""

# Export the environment variable and run the test
TEST_ENV=dev pnpm "$selected_test"