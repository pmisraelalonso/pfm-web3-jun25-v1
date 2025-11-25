#!/bin/bash

# Script to fund any MetaMask account with ETH from Anvil's first account
# Usage: ./fund-account.sh <address>

if [ -z "$1" ]; then
    echo "Usage: ./fund-account.sh <address>"
    echo "Example: ./fund-account.sh 0x1234567890123456789012345678901234567890"
    exit 1
fi

ADDRESS=$1
AMOUNT="10ether"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
RPC_URL="http://localhost:8545"

echo "Sending $AMOUNT to $ADDRESS..."
cast send $ADDRESS \
    --value $AMOUNT \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL

echo ""
echo "Checking balance..."
cast balance $ADDRESS --rpc-url $RPC_URL
