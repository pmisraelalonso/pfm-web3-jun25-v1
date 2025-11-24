# 🚀 Deployment & Testing Guide

## ✅ Prerequisites Checklist

Before you begin, ensure you have:
- [ ] Node.js v18.19.1 or higher
- [ ] Foundry installed (`forge --version`)
- [ ] MetaMask browser extension
- [ ] Git (optional, for version control)

---

## 📦 Part 1: Smart Contract Deployment

### Step 1: Start Anvil Local Blockchain

Open a terminal and run:
```bash
cd ~/codecrypto/Supply-chain-tracker1/supply-chain-tracker/sc
anvil
```

**Expected output:**
```
Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...

Private Keys
==================
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...

Listening on 127.0.0.1:8545
```

⚠️ **IMPORTANT**: Keep this terminal running! Anvil must stay active.

### Step 2: Deploy the Smart Contract

Open a NEW terminal and run:
```bash
cd ~/codecrypto/Supply-chain-tracker1/supply-chain-tracker/sc

PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast
```

**Expected output:**
```
== Logs ==
  SupplyChain deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  Admin address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
```

✅ **Deployment Complete!** Your contract is live at: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Step 3: Verify Deployment (Optional)

```bash
# Check if contract is deployed
cast code 0x5FbDB2315678afecb367f032d93F642f64180aa3 --rpc-url http://localhost:8545

# Should return bytecode (long hex string)
```

---

## 🌐 Part 2: Frontend Setup

### Step 4: Install Frontend Dependencies

```bash
cd ~/codecrypto/Supply-chain-tracker1/supply-chain-tracker/web

# Install all dependencies
npm install --legacy-peer-deps
```

**Expected output:**
```
added XXX packages in XXs
```

### Step 5: Verify Configuration

The contract address should already be configured in `web/contracts/config.ts`:
```typescript
address: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

If it's different, update it with your deployed address from Step 2.

### Step 6: Start the Frontend

```bash
npm run dev
```

**Expected output:**
```
 ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

✅ **Frontend is running!** Open http://localhost:3000 in your browser.

---

## 🦊 Part 3: MetaMask Configuration

### Step 7: Add Anvil Network to MetaMask

1. Open MetaMask extension
2. Click network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter the following details:

```
Network Name: Anvil Local
RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
```

5. Click "Save"
6. Switch to "Anvil Local" network

### Step 8: Import Test Accounts

You need at least 5 accounts for testing:

**Admin Account (Account 0):**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Producer Account (Account 1):**
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Factory Account (Account 2):**
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Retailer Account (Account 3):**
```
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

**Consumer Account (Account 4):**
```
Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

**To import each account:**
1. Click MetaMask icon
2. Click account icon (top right)
3. Click "Import Account"
4. Paste private key
5. Click "Import"
6. Rename account for clarity (Admin, Producer, etc.)

---

## 🧪 Part 4: Complete Testing Flow

### Test 1: Admin Approves Users

1. **Connect as Admin** (Account 0)
   - Go to http://localhost:3000
   - Click "Connect MetaMask"
   - MetaMask should show "Anvil Local" network
   - Approve connection

2. **Other users register:**
   - Switch to **Producer** account in MetaMask
   - Refresh page
   - Click "Register Role"
   - Select "Producer" → Submit
   - Approve transaction in MetaMask
   
   - Switch to **Factory** account
   - Register as "Factory"
   
   - Switch to **Retailer** account
   - Register as "Retailer"
   
   - Switch to **Consumer** account
   - Register as "Consumer"

3. **Admin approves all:**
   - Switch back to **Admin** account
   - Go to `/admin/users`
   - You should see 4 pending registrations
   - Click "✓ Approve" for each user
   - Approve each transaction in MetaMask

### Test 2: Complete Supply Chain Flow

**Step 1: Producer creates raw material**
- Switch to **Producer** account
- Go to `/tokens/create`
- Create token:
  - Name: "Organic Cotton"
  - Quantity: 1000
  - Metadata: "Harvested in Texas, USDA Organic Certified"
- Submit & approve transaction

**Step 2: Producer transfers to Factory**
- Go to `/tokens`
- Click created token
- Click "Transfer Token"
- Recipient: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Factory)
- Amount: 500
- Submit & approve transaction

**Step 3: Factory accepts transfer**
- Switch to **Factory** account
- Go to `/transfers`
- You should see pending transfer
- Click "✓ Accept"
- Approve transaction

**Step 4: Factory creates finished product**
- Go to `/tokens/create`
- Create token:
  - Name: "White T-Shirt"
  - Quantity: 100
  - Parent Material: Select "Organic Cotton"
  - Metadata: "100% Organic Cotton T-Shirt, Size M"
- Submit & approve transaction

**Step 5: Factory transfers to Retailer**
- Go to `/tokens`
- Click "White T-Shirt"
- Click "Transfer Token"
- Recipient: `0x90F79bf6EB2c4f870365E785982E1f101E93b906` (Retailer)
- Amount: 50
- Submit & approve transaction

**Step 6: Retailer accepts and transfers to Consumer**
- Switch to **Retailer** account
- Go to `/transfers` → Accept transfer
- Go to `/tokens` → Click "White T-Shirt"
- Click "Transfer Token"
- Recipient: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` (Consumer)
- Amount: 1
- Submit & approve transaction

**Step 7: Consumer accepts and verifies**
- Switch to **Consumer** account
- Go to `/transfers` → Accept transfer
- Go to `/tokens` → Click "White T-Shirt"
- View full traceability tree:
  - White T-Shirt → Organic Cotton → Origin

✅ **Complete supply chain tested!**

---

## 🎯 Common Testing Scenarios

### Test Invalid Transfers
- Try transferring from Producer directly to Consumer (should fail)
- Try transferring with insufficient balance (should fail)
- Try creating tokens without approval (should fail)

### Test Admin Functions
- As admin, reject a user registration
- Verify rejected user cannot create tokens
- Re-approve the user and verify they can now operate

### Test Traceability
- Create multiple tokens with different parent relationships
- Verify the traceability tree shows correctly
- Check that all transfers are recorded

---

## 🐛 Troubleshooting

### Problem: "MetaMask not connected"
**Solution:**
- Ensure MetaMask is installed
- Check that you're on "Anvil Local" network (Chain ID 31337)
- Refresh the page

### Problem: "Transaction reverted"
**Solution:**
- Check that user is approved (go to `/admin/users` as admin)
- Verify you have enough balance
- Ensure you're transferring to the correct role

### Problem: "Network error"
**Solution:**
- Check that Anvil is still running (terminal 1)
- Verify RPC URL is `http://localhost:8545`
- Try restarting Anvil

### Problem: "Contract not found"
**Solution:**
- Verify contract address in `web/contracts/config.ts` matches deployed address
- Redeploy the contract (Step 2)
- Update the address in config.ts

### Problem: Frontend shows TypeScript errors
**Solution:**
- These are expected before dependencies install
- Run `npm install --legacy-peer-deps` again
- Errors should disappear once packages are installed

---

## 📊 Verification Checklist

After completing all tests, verify:
- [ ] Admin can approve/reject users
- [ ] Producer can create raw materials
- [ ] Factory can create products from materials
- [ ] Transfers work: Producer → Factory → Retailer → Consumer
- [ ] Rejected transfers update status correctly
- [ ] Traceability shows parent-child relationships
- [ ] Balance updates correctly after transfers
- [ ] Pending transfers show in /transfers page
- [ ] All transactions confirm in MetaMask
- [ ] No errors in browser console

---

## 🎓 Next Steps

### For Development:
1. Add more token types and test complex flows
2. Test with multiple tokens simultaneously
3. Experiment with different metadata formats
4. Create detailed transfer histories

### For Learning:
1. Review the smart contract code in `sc/src/SupplyChain.sol`
2. Check the test suite in `sc/test/SupplyChain.t.sol`
3. Examine Web3 integration in `web/lib/web3.ts`
4. Study the event emission and listening patterns

### For Production:
1. Deploy to a testnet (Sepolia, Mumbai)
2. Get test tokens from faucets
3. Update NETWORK_CONFIG for testnet
4. Test with real blockchain delays

---

## 🎉 Success Criteria

Your deployment is successful if you can:
1. ✅ Connect MetaMask to Anvil
2. ✅ Register as different roles
3. ✅ Admin approves registrations
4. ✅ Create tokens with metadata
5. ✅ Transfer tokens between roles
6. ✅ Accept/reject transfers
7. ✅ View complete traceability

**Congratulations! Your Supply Chain Tracker DApp is fully operational!** 🎊
