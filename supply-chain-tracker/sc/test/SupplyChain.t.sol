// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    SupplyChain public supplyChain;
    
    address admin = address(1);
    address producer = address(2);
    address factory = address(3);
    address retailer = address(4);
    address consumer = address(5);
    address unauthorized = address(6);

    function setUp() public {
        vm.prank(admin);
        supplyChain = new SupplyChain();
    }

    // ==================== User Management Tests ====================

    function testUserRegistration() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.userAddress, producer);
        assertEq(user.role, "Producer");
        assertTrue(user.status == SupplyChain.UserStatus.Pending);
    }

    function testAdminApproveUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertTrue(user.status == SupplyChain.UserStatus.Approved);
    }

    function testAdminRejectUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertTrue(user.status == SupplyChain.UserStatus.Rejected);
    }

    function testUserStatusChanges() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertTrue(user.status == SupplyChain.UserStatus.Approved);
        
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        user = supplyChain.getUserInfo(producer);
        assertTrue(user.status == SupplyChain.UserStatus.Canceled);
    }

    function testOnlyApprovedUsersCanOperate() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.prank(producer);
        vm.expectRevert("User not approved");
        supplyChain.createToken("Raw Material", 100, "{}", 0);
        
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        vm.prank(producer);
        supplyChain.createToken("Raw Material", 100, "{}", 0);
    }

    function testGetUserInfo() public {
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        
        SupplyChain.User memory user = supplyChain.getUserInfo(factory);
        assertEq(user.userAddress, factory);
        assertEq(user.role, "Factory");
    }

    function testIsAdmin() public {
        assertTrue(supplyChain.isAdmin(admin));
        assertFalse(supplyChain.isAdmin(producer));
    }

    // ==================== Token Creation Tests ====================

    function testCreateTokenByProducer() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"type":"grain"}', 0);
        
        SupplyChain.Token memory token = supplyChain.getToken(1);
        assertEq(token.name, "Wheat");
        assertEq(token.totalSupply, 1000);
        assertEq(token.creator, producer);
        assertEq(token.parentId, 0);
    }

    function testCreateTokenByFactory() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"type":"grain"}', 0);
        
        vm.prank(factory);
        supplyChain.createToken("Flour", 500, '{"type":"processed"}', 1);
        
        SupplyChain.Token memory token = supplyChain.getToken(2);
        assertEq(token.name, "Flour");
        assertEq(token.parentId, 1);
    }

    function testCreateTokenByRetailer() public {
        _registerAndApprove(retailer, "Retailer");
        
        vm.prank(retailer);
        supplyChain.createToken("Product", 100, '{"type":"retail"}', 0);
        
        SupplyChain.Token memory token = supplyChain.getToken(1);
        assertEq(token.creator, retailer);
    }

    function testTokenWithParentId() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Raw Material", 1000, "{}", 0);
        
        vm.prank(factory);
        supplyChain.createToken("Product", 500, "{}", 1);
        
        SupplyChain.Token memory childToken = supplyChain.getToken(2);
        assertEq(childToken.parentId, 1);
    }

    function testTokenMetadata() public {
        _registerAndApprove(producer, "Producer");
        
        string memory features = '{"quality":"premium","origin":"organic"}';
        vm.prank(producer);
        supplyChain.createToken("Organic Wheat", 1000, features, 0);
        
        SupplyChain.Token memory token = supplyChain.getToken(1);
        assertEq(token.features, features);
    }

    function testTokenBalance() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        uint256 balance = supplyChain.getTokenBalance(1, producer);
        assertEq(balance, 1000);
    }

    function testGetToken() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        SupplyChain.Token memory token = supplyChain.getToken(1);
        assertEq(token.id, 1);
        assertEq(token.name, "Wheat");
    }

    function testGetUserTokens() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.createToken("Corn", 500, "{}", 0);
        
        uint256[] memory tokens = supplyChain.getUserTokens(producer);
        assertEq(tokens.length, 2);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 2);
    }

    // ==================== Transfer Tests ====================

    function testTransferFromProducerToFactory() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.from, producer);
        assertEq(t.to, factory);
        assertEq(t.amount, 500);
    }

    function testTransferFromFactoryToRetailer() public {
        _setupCompleteChain();
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factory);
        supplyChain.transfer(retailer, 1, 200);
        
        SupplyChain.Transfer memory t = supplyChain.getTransfer(2);
        assertEq(t.from, factory);
        assertEq(t.to, retailer);
    }

    function testTransferFromRetailerToConsumer() public {
        _setupCompleteChain();
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factory);
        supplyChain.transfer(retailer, 1, 200);
        
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);
        
        vm.prank(retailer);
        supplyChain.transfer(consumer, 1, 100);
        
        SupplyChain.Transfer memory t = supplyChain.getTransfer(3);
        assertEq(t.to, consumer);
    }

    function testAcceptTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        uint256 factoryBalance = supplyChain.getTokenBalance(1, factory);
        uint256 producerBalance = supplyChain.getTokenBalance(1, producer);
        
        assertEq(factoryBalance, 500);
        assertEq(producerBalance, 500);
    }

    function testRejectTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.rejectTransfer(1);
        
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertTrue(t.status == SupplyChain.TransferStatus.Rejected);
        
        uint256 producerBalance = supplyChain.getTokenBalance(1, producer);
        assertEq(producerBalance, 1000);
    }

    function testTransferInsufficientBalance() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        vm.expectRevert("Insufficient balance");
        supplyChain.transfer(factory, 1, 2000);
    }

    function testGetTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.id, 1);
        assertEq(t.tokenId, 1);
    }

    function testGetUserTransfers() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        uint256[] memory transfers = supplyChain.getUserTransfers(producer);
        assertEq(transfers.length, 1);
        assertEq(transfers[0], 1);
    }

    // ==================== Validation and Permission Tests ====================

    function testInvalidRoleTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(retailer, "Retailer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        vm.expectRevert("Producer can only transfer to Factory");
        supplyChain.transfer(retailer, 1, 500);
    }

    function testUnapprovedUserCannotCreateToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.prank(producer);
        vm.expectRevert("User not approved");
        supplyChain.createToken("Wheat", 1000, "{}", 0);
    }

    function testUnapprovedUserCannotTransfer() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(factory);
        supplyChain.requestUserRole("Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        vm.expectRevert("Recipient not approved");
        supplyChain.transfer(factory, 1, 500);
    }

    function testOnlyAdminCanChangeStatus() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.prank(unauthorized);
        vm.expectRevert("Only admin can perform this action");
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    function testConsumerCannotTransfer() public {
        _setupCompleteChain();
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factory);
        supplyChain.transfer(retailer, 1, 200);
        
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);
        
        vm.prank(retailer);
        supplyChain.transfer(consumer, 1, 100);
        
        vm.prank(consumer);
        supplyChain.acceptTransfer(3);
        
        address anotherConsumer = address(7);
        _registerAndApprove(anotherConsumer, "Consumer");
        
        vm.prank(consumer);
        vm.expectRevert("Consumer cannot transfer tokens");
        supplyChain.transfer(anotherConsumer, 1, 50);
    }

    function testTransferToSameAddress() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        vm.expectRevert("Cannot transfer to yourself");
        supplyChain.transfer(producer, 1, 500);
    }

    // ==================== Edge Case Tests ====================

    function testTransferZeroAmount() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        vm.expectRevert("Amount must be greater than 0");
        supplyChain.transfer(factory, 1, 0);
    }

    function testTransferNonExistentToken() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        vm.expectRevert("Token does not exist");
        supplyChain.transfer(factory, 999, 100);
    }

    function testAcceptNonExistentTransfer() public {
        _registerAndApprove(factory, "Factory");
        
        vm.prank(factory);
        vm.expectRevert("Transfer does not exist");
        supplyChain.acceptTransfer(999);
    }

    function testDoubleAcceptTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factory);
        vm.expectRevert("Transfer not pending");
        supplyChain.acceptTransfer(1);
    }

    function testTransferAfterRejection() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.rejectTransfer(1);
        
        vm.prank(factory);
        vm.expectRevert("Transfer not pending");
        supplyChain.acceptTransfer(1);
    }

    // ==================== Event Tests ====================

    function testUserRegisteredEvent() public {
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.UserRoleRequested(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
    }

    function testUserStatusChangedEvent() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.UserStatusChanged(producer, SupplyChain.UserStatus.Approved);
        
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    function testTokenCreatedEvent() public {
        _registerAndApprove(producer, "Producer");
        
        vm.expectEmit(true, true, false, true);
        emit SupplyChain.TokenCreated(1, producer, "Wheat", 1000);
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
    }

    function testTransferInitiatedEvent() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.expectEmit(true, true, true, true);
        emit SupplyChain.TransferRequested(1, producer, factory, 1, 500);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
    }

    function testTransferAcceptedEvent() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.TransferAccepted(1);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
    }

    function testTransferRejectedEvent() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.TransferRejected(1);
        
        vm.prank(factory);
        supplyChain.rejectTransfer(1);
    }

    // ==================== Complete Flow Tests ====================

    function testCompleteSupplyChainFlow() public {
        _setupCompleteChain();
        
        // Producer creates raw material
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"origin":"farm"}', 0);
        
        // Producer transfers to Factory
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        // Factory creates product
        vm.prank(factory);
        supplyChain.createToken("Flour", 400, '{"type":"processed"}', 1);
        
        // Factory transfers to Retailer
        vm.prank(factory);
        supplyChain.transfer(retailer, 2, 200);
        
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);
        
        // Retailer transfers to Consumer
        vm.prank(retailer);
        supplyChain.transfer(consumer, 2, 100);
        
        vm.prank(consumer);
        supplyChain.acceptTransfer(3);
        
        // Verify final balances
        assertEq(supplyChain.getTokenBalance(2, consumer), 100);
        assertEq(supplyChain.getTokenBalance(2, retailer), 100);
    }

    function testMultipleTokensFlow() public {
        _registerAndApprove(producer, "Producer");
        
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, "{}", 0);
        
        vm.prank(producer);
        supplyChain.createToken("Corn", 800, "{}", 0);
        
        vm.prank(producer);
        supplyChain.createToken("Rice", 1200, "{}", 0);
        
        uint256[] memory tokens = supplyChain.getUserTokens(producer);
        assertEq(tokens.length, 3);
    }

    function testTraceabilityFlow() public {
        _setupCompleteChain();
        
        // Create chain of products
        vm.prank(producer);
        supplyChain.createToken("Wheat", 1000, '{"origin":"organic"}', 0);
        
        vm.prank(producer);
        supplyChain.transfer(factory, 1, 500);
        
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factory);
        supplyChain.createToken("Flour", 400, '{"process":"milled"}', 1);
        
        // Verify traceability
        SupplyChain.Token memory flour = supplyChain.getToken(2);
        assertEq(flour.parentId, 1);
        
        SupplyChain.Token memory wheat = supplyChain.getToken(flour.parentId);
        assertEq(wheat.name, "Wheat");
        assertEq(wheat.creator, producer);
    }

    // ==================== Helper Functions ====================

    function _registerAndApprove(address user, string memory role) internal {
        vm.prank(user);
        supplyChain.requestUserRole(role);
        
        vm.prank(admin);
        supplyChain.changeStatusUser(user, SupplyChain.UserStatus.Approved);
    }

    function _setupCompleteChain() internal {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        _registerAndApprove(retailer, "Retailer");
        _registerAndApprove(consumer, "Consumer");
    }
}
