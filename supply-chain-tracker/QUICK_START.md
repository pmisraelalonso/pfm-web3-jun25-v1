# 🚀 Quick Start Guide - Supply Chain Tracker

## ⚡ TL;DR - Get Started in 5 Minutes

### Current Status
- ✅ Smart Contract: Deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- ✅ Anvil Blockchain: Running on localhost:8545 (Process 44234)
- ✅ Frontend: Running on http://localhost:3000
- ✅ All systems operational

### Access Your DApp
**Open your browser**: http://localhost:3000

---

## 🦊 MetaMask Setup (2 Minutes)

### 1. Add Anvil Network
```
Network Name:     GoChain Testnet
RPC URL:          http://localhost:8545
Chain ID:         31337
Currency Symbol:  GO
```

### 2. Import Test Accounts
Import these 5 accounts (copy private key, paste in MetaMask):

**Admin** (Approve users)
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Producer** (Create raw materials)
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Factory** (Create products)
```
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Retailer** (Distribute products)
```
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

**Consumer** (Final owner)
```
0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

---

## 🎯 Test Flow (3 Minutes)

### Step 1: Register Users (Switch accounts in MetaMask)
1. **Producer** → Connect → Register as "Producer" → Submit
2. **Factory** → Connect → Register as "Factory" → Submit
3. **Retailer** → Connect → Register as "Retailer" → Submit
4. **Consumer** → Connect → Register as "Consumer" → Submit

### Step 2: Admin Approves
1. Switch to **Admin** account
2. Go to `/admin/users`
3. Click "✓ Approve" for each user (4 users)

### Step 3: Create Raw Material
1. Switch to **Producer**
2. Go to `/tokens/create`
3. Create token:
   - Name: "Organic Cotton"
   - Quantity: 1000
   - Metadata: "USDA Organic"

### Step 4: Producer → Factory Transfer
1. Click token → "Transfer Token"
2. Recipient: Factory address (copy from MetaMask)
3. Amount: 500
4. Submit

### Step 5: Factory Accepts & Creates Product
1. Switch to **Factory**
2. `/transfers` → "✓ Accept"
3. `/tokens/create`:
   - Name: "White T-Shirt"
   - Quantity: 100
   - Parent: "Organic Cotton"

### Step 6: Factory → Retailer
1. Click "White T-Shirt" → Transfer
2. Recipient: Retailer address
3. Amount: 50

### Step 7: Retailer → Consumer
1. **Retailer**: Accept transfer
2. Transfer 1 to Consumer

### Step 8: View Traceability
1. Switch to **Consumer**
2. Accept transfer
3. Click "White T-Shirt"
4. See full chain: T-Shirt → Cotton → Origin ✨

---

## 📋 Address Quick Reference

Copy-paste these when transferring:

```
Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Consumer: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

---

## 🐛 Troubleshooting

**"MetaMask not connected"**
→ Switch to "Anvil Local" network (Chain ID 31337)

**"Transaction reverted"**
→ Check user is approved in `/admin/users`

**"Wrong role"**
→ Transfer order: Producer → Factory → Retailer → Consumer

**Frontend not loading**
→ Check both servers running:
- Anvil: `ps aux | grep anvil` should show process 44234
- Frontend: Should show "Ready" on http://localhost:3000

---

## 🎨 Page Navigation

```
/                      → Landing (Connect MetaMask)
/dashboard             → Role-based dashboard
/profile               → Register/view profile
/tokens                → All tokens list
/tokens/create         → Create new token
/tokens/[id]           → Token details & traceability
/tokens/[id]/transfer  → Transfer token
/transfers             → Incoming/outgoing transfers
/admin                 → Admin dashboard (admin only)
/admin/users           → User management (admin only)
```

---

## ✅ Success Checklist

After testing, you should have:
- [ ] 5 accounts connected to Anvil
- [ ] 4 users registered and approved
- [ ] 1 raw material token created
- [ ] 1 product token (with parent)
- [ ] Multiple transfers completed
- [ ] Full traceability visible

---

## 📚 Full Documentation

For detailed instructions, see:
- **DEPLOYMENT_GUIDE.md** - Complete setup & testing
- **FINAL_STATUS.md** - Project summary & features

---

**🎉 Happy Testing!** Your DApp is ready to use at http://localhost:3000
