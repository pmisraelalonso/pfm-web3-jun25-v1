// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title SupplyChain
 * @dev Smart contract for supply chain tracking with role-based access control
 * @notice Manages tokens, transfers, and user roles in a supply chain system
 */
contract SupplyChain {
    // Enums
    enum UserStatus { Pending, Approved, Rejected, Canceled }
    enum TransferStatus { Pending, Accepted, Rejected }

    // Structs
    struct Token {
        uint256 id;
        address creator;
        string name;
        uint256 totalSupply;
        string features; // JSON string
        uint256 parentId; // 0 for raw materials
        uint256 dateCreated;
    }

    struct Transfer {
        uint256 id;
        address from;
        address to;
        uint256 tokenId;
        uint256 dateCreated;
        uint256 amount;
        TransferStatus status;
    }

    struct User {
        uint256 id;
        address userAddress;
        string role; // "Producer", "Factory", "Retailer", "Consumer"
        UserStatus status;
    }

    // State variables
    address public admin;
    uint256 public nextTokenId = 1;
    uint256 public nextTransferId = 1;
    uint256 public nextUserId = 1;

    // Mappings
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => mapping(address => uint256)) public tokenBalances; // tokenId => address => balance
    mapping(uint256 => Transfer) public transfers;
    mapping(uint256 => User) public users;
    mapping(address => uint256) public addressToUserId;

    // Arrays to track user's tokens and transfers
    mapping(address => uint256[]) private userTokenIds;
    mapping(address => uint256[]) private userTransferIds;

    // Events
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply);
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount);
    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, UserStatus status);

    // Constructor
    constructor() {
        admin = msg.sender;
        // Auto-approve admin
        users[nextUserId] = User({
            id: nextUserId,
            userAddress: msg.sender,
            role: "Admin",
            status: UserStatus.Approved
        });
        addressToUserId[msg.sender] = nextUserId;
        nextUserId++;
    }

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApproved() {
        uint256 userId = addressToUserId[msg.sender];
        require(userId != 0, "User not registered");
        require(users[userId].status == UserStatus.Approved, "User not approved");
        _;
    }

    // User Management Functions
    
    /**
     * @dev Request a role in the system
     * @param role The role being requested (Producer, Factory, Retailer, Consumer)
     */
    function requestUserRole(string memory role) public {
        require(addressToUserId[msg.sender] == 0, "User already registered");
        require(
            keccak256(bytes(role)) == keccak256(bytes("Producer")) ||
            keccak256(bytes(role)) == keccak256(bytes("Factory")) ||
            keccak256(bytes(role)) == keccak256(bytes("Retailer")) ||
            keccak256(bytes(role)) == keccak256(bytes("Consumer")),
            "Invalid role"
        );

        users[nextUserId] = User({
            id: nextUserId,
            userAddress: msg.sender,
            role: role,
            status: UserStatus.Pending
        });
        addressToUserId[msg.sender] = nextUserId;
        nextUserId++;

        emit UserRoleRequested(msg.sender, role);
    }

    /**
     * @dev Change the status of a user (admin only)
     * @param userAddress The address of the user
     * @param newStatus The new status to set
     */
    function changeStatusUser(address userAddress, UserStatus newStatus) public onlyAdmin {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");
        require(userAddress != admin, "Cannot change admin status");

        users[userId].status = newStatus;
        emit UserStatusChanged(userAddress, newStatus);
    }

    /**
     * @dev Get user information
     * @param userAddress The address of the user
     * @return User struct
     */
    function getUserInfo(address userAddress) public view returns (User memory) {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");
        return users[userId];
    }

    /**
     * @dev Check if an address is the admin
     * @param userAddress The address to check
     * @return bool true if admin
     */
    function isAdmin(address userAddress) public view returns (bool) {
        return userAddress == admin;
    }

    // Token Management Functions

    /**
     * @dev Create a new token
     * @param name Token name
     * @param totalSupply Total supply of the token
     * @param features JSON string with token features
     * @param parentId Parent token ID (0 for raw materials)
     */
    function createToken(string memory name, uint256 totalSupply, string memory features, uint256 parentId) public onlyApproved {
        require(totalSupply > 0, "Total supply must be greater than 0");
        
        uint256 userId = addressToUserId[msg.sender];
        string memory userRole = users[userId].role;

        // Validate role-based token creation rules
        if (keccak256(bytes(userRole)) == keccak256(bytes("Producer"))) {
            require(parentId == 0, "Producer can only create raw material tokens");
        } else if (keccak256(bytes(userRole)) == keccak256(bytes("Factory")) || 
                   keccak256(bytes(userRole)) == keccak256(bytes("Retailer"))) {
            if (parentId != 0) {
                require(tokens[parentId].id != 0, "Parent token does not exist");
            }
        } else {
            revert("Consumer cannot create tokens");
        }

        tokens[nextTokenId] = Token({
            id: nextTokenId,
            creator: msg.sender,
            name: name,
            totalSupply: totalSupply,
            features: features,
            parentId: parentId,
            dateCreated: block.timestamp
        });

        tokenBalances[nextTokenId][msg.sender] = totalSupply;
        userTokenIds[msg.sender].push(nextTokenId);

        emit TokenCreated(nextTokenId, msg.sender, name, totalSupply);
        nextTokenId++;
    }

    /**
     * @dev Get token information
     * @param tokenId The ID of the token
     * @return Token struct (without balance mapping)
     */
    function getToken(uint256 tokenId) public view returns (Token memory) {
        require(tokens[tokenId].id != 0, "Token does not exist");
        return tokens[tokenId];
    }

    /**
     * @dev Get token balance for a specific user
     * @param tokenId The ID of the token
     * @param userAddress The address of the user
     * @return Balance amount
     */
    function getTokenBalance(uint256 tokenId, address userAddress) public view returns (uint256) {
        require(tokens[tokenId].id != 0, "Token does not exist");
        return tokenBalances[tokenId][userAddress];
    }

    // Transfer Management Functions

    /**
     * @dev Transfer tokens to another address
     * @param to Recipient address
     * @param tokenId Token ID to transfer
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 tokenId, uint256 amount) public onlyApproved {
        require(to != address(0), "Invalid recipient address");
        require(to != msg.sender, "Cannot transfer to yourself");
        require(tokens[tokenId].id != 0, "Token does not exist");
        require(amount > 0, "Amount must be greater than 0");
        require(tokenBalances[tokenId][msg.sender] >= amount, "Insufficient balance");

        uint256 fromUserId = addressToUserId[msg.sender];
        uint256 toUserId = addressToUserId[to];
        
        require(toUserId != 0, "Recipient not registered");
        require(users[toUserId].status == UserStatus.Approved, "Recipient not approved");

        string memory fromRole = users[fromUserId].role;
        string memory toRole = users[toUserId].role;

        // Validate role-based transfer rules
        _validateTransferRoles(fromRole, toRole);

        transfers[nextTransferId] = Transfer({
            id: nextTransferId,
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            dateCreated: block.timestamp,
            amount: amount,
            status: TransferStatus.Pending
        });

        userTransferIds[msg.sender].push(nextTransferId);
        userTransferIds[to].push(nextTransferId);

        emit TransferRequested(nextTransferId, msg.sender, to, tokenId, amount);
        nextTransferId++;
    }

    /**
     * @dev Validate transfer between roles
     * @param fromRole Sender's role
     * @param toRole Recipient's role
     */
    function _validateTransferRoles(string memory fromRole, string memory toRole) private pure {
        if (keccak256(bytes(fromRole)) == keccak256(bytes("Producer"))) {
            require(keccak256(bytes(toRole)) == keccak256(bytes("Factory")), "Producer can only transfer to Factory");
        } else if (keccak256(bytes(fromRole)) == keccak256(bytes("Factory"))) {
            require(keccak256(bytes(toRole)) == keccak256(bytes("Retailer")), "Factory can only transfer to Retailer");
        } else if (keccak256(bytes(fromRole)) == keccak256(bytes("Retailer"))) {
            require(keccak256(bytes(toRole)) == keccak256(bytes("Consumer")), "Retailer can only transfer to Consumer");
        } else if (keccak256(bytes(fromRole)) == keccak256(bytes("Consumer"))) {
            revert("Consumer cannot transfer tokens");
        }
    }

    /**
     * @dev Accept a pending transfer
     * @param transferId The ID of the transfer
     */
    function acceptTransfer(uint256 transferId) public onlyApproved {
        require(transfers[transferId].id != 0, "Transfer does not exist");
        require(transfers[transferId].to == msg.sender, "Only recipient can accept");
        require(transfers[transferId].status == TransferStatus.Pending, "Transfer not pending");

        Transfer storage t = transfers[transferId];
        
        // Check if sender still has sufficient balance
        require(tokenBalances[t.tokenId][t.from] >= t.amount, "Sender has insufficient balance");

        // Update balances
        tokenBalances[t.tokenId][t.from] -= t.amount;
        tokenBalances[t.tokenId][t.to] += t.amount;

        // Add token to recipient's token list if first time receiving this token
        if (!_hasToken(t.to, t.tokenId)) {
            userTokenIds[t.to].push(t.tokenId);
        }

        t.status = TransferStatus.Accepted;
        emit TransferAccepted(transferId);
    }

    /**
     * @dev Reject a pending transfer
     * @param transferId The ID of the transfer
     */
    function rejectTransfer(uint256 transferId) public onlyApproved {
        require(transfers[transferId].id != 0, "Transfer does not exist");
        require(transfers[transferId].to == msg.sender, "Only recipient can reject");
        require(transfers[transferId].status == TransferStatus.Pending, "Transfer not pending");

        transfers[transferId].status = TransferStatus.Rejected;
        emit TransferRejected(transferId);
    }

    /**
     * @dev Get transfer information
     * @param transferId The ID of the transfer
     * @return Transfer struct
     */
    function getTransfer(uint256 transferId) public view returns (Transfer memory) {
        require(transfers[transferId].id != 0, "Transfer does not exist");
        return transfers[transferId];
    }

    // Auxiliary Functions

    /**
     * @dev Get all token IDs owned by a user
     * @param userAddress The address of the user
     * @return Array of token IDs
     */
    function getUserTokens(address userAddress) public view returns (uint256[] memory) {
        return userTokenIds[userAddress];
    }

    /**
     * @dev Get all transfer IDs involving a user
     * @param userAddress The address of the user
     * @return Array of transfer IDs
     */
    function getUserTransfers(address userAddress) public view returns (uint256[] memory) {
        return userTransferIds[userAddress];
    }

    /**
     * @dev Check if user has a specific token in their list
     * @param userAddress The address of the user
     * @param tokenId The token ID to check
     * @return bool true if user has the token
     */
    function _hasToken(address userAddress, uint256 tokenId) private view returns (bool) {
        uint256[] memory tokens = userTokenIds[userAddress];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return true;
            }
        }
        return false;
    }
}
