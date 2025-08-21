# AIBasedLockedToken Smart Contract Documentation

## Overview

`AIBasedLockedToken` is a Solidity smart contract that implements a non-transferable ERC20 token. This token is designed for a specific distribution mechanism where whitelisted users can claim a fixed amount of tokens. The contract leverages OpenZeppelin's secure and battle-tested `ERC20` and `Ownable` implementations.

The primary feature of this token is its **non-transferability**; once claimed, tokens cannot be transferred between regular user accounts. This is enforced by overriding the internal `_update` function. The distribution is managed by an owner who can add addresses to a whitelist, allowing them to claim tokens once. There is a maximum limit to the total number of claims that can be made.

-----

## Key Features 📝

  * **ERC20 Standard:** Implements the standard `ERC20` interface for token functionality.
  * **Non-Transferable:** Tokens cannot be transferred between external accounts, only minted (claimed) or burned.
  * **Whitelist System:** Only addresses added to a whitelist by the contract owner can claim tokens.
  * **Ownable:** The contract has an owner with administrative privileges, such as adding addresses to the whitelist. This is managed by OpenZeppelin's `Ownable` contract.
  * **Capped Claims:** There is a hard cap on the total number of claims (`MAX_CLAIMS`) that can ever be processed.
  * **Fixed Claim Amount:** Each whitelisted user can claim a predefined, fixed amount of tokens (`CLAIM_AMOUNT`).

-----

## Contract Details

### State Variables

  * `mapping(address => bool) public whitelist;`
      * A mapping to store addresses that are approved to claim tokens. The owner can add addresses here.
  * `mapping(address => bool) public hasClaimed;`
      * A mapping to track which addresses have already claimed their tokens to prevent double-claiming.
  * `uint256 public totalClaims;`
      * A counter for the total number of claims made so far.
  * `uint256 public constant MAX_CLAIMS = 100;`
      * A constant defining the maximum number of users who can claim tokens.
  * `uint256 public constant CLAIM_AMOUNT = 10 * 10**18;`
      * A constant defining the amount of tokens (10 tokens with 18 decimals) a user receives when they claim.

### Constructor

```solidity
constructor(address initialOwner) ERC20("AIBLockedToken", "AIBL") Ownable(initialOwner) {}
```



Here is a complete `README.md` document for your `AIBNFTMarketplace` project.

-----

# AIBNFTMarketplace 🖼️

[](https://opensource.org/licenses/MIT)

AIBNFTMarketplace is a decentralized, secure, and feature-rich marketplace for listing, buying, and selling **ERC721** non-fungible tokens (NFTs) on the Ethereum blockchain.

The smart contract is built with security and standards in mind, leveraging the battle-tested [OpenZeppelin](https://openzeppelin.com/contracts/) library. It includes comprehensive test suites in both JavaScript (Hardhat) and Solidity (Foundry).

-----

## ✨ Core Features

  * **List & Lock**: Sellers can list their NFTs for a set price. The marketplace contract takes custody of (locks) the NFT to ensure a secure transfer upon sale.
  * **Buy NFT**: Buyers can purchase any listed NFT by sending the required amount of ETH.
  * **Cancel Listing**: Sellers have the flexibility to cancel their listings at any time to retrieve their NFTs.
  * **Update Price**: Sellers can dynamically adjust the price of their listed items.
  * **Admin Controls**: The contract owner can manage the listing fee and pause the contract in case of an emergency.
  * **Fee Collection**: A listing fee is collected by the contract, which can be withdrawn by the owner.

-----

## 🛠️ Tools & Technologies

  * **Solidity (`^0.8.20`)**: The smart contract programming language.
  * **OpenZeppelin Contracts**: For secure, standard implementations of `Ownable`, `Pausable`, and `ERC721Holder`.
  * **Hardhat**: For Ethereum development, compiling, and running tests in JavaScript.
  * **Foundry**: For compiling, testing, and deploying smart contracts in Solidity.
  * **Ethers.js & Chai**: Used in the Hardhat test suite for assertions and blockchain interaction.

-----

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or later)
  * [Git](https://git-scm.com/)
  * [Foundry](https://getfoundry.sh/): Install by running `curl -L https://foundry.paradigm.xyz | bash` followed by `foundryup`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd AIBNFTMarketplace
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```
3.  **Install Foundry dependencies:**
    ```bash
    forge install
    ```

-----

## ✅ Running Tests

The project includes two complete test suites to ensure the contract's functionality and security.

### 1\. Hardhat Tests (JavaScript)

This suite uses Ethers.js and Chai to run tests in a simulated Node.js environment.

```bash
npx hardhat test
```

### 2\. Foundry Tests (Solidity)

This suite runs tests written directly in Solidity for faster and more granular control.

```bash
forge test
```

You can also increase verbosity to see logs from each test:

```bash
forge test -vvv
```

-----

## 📜 Smart Contract API

### For Users (Sellers & Buyers)

  * `listNFT(address _nftContract, uint256 _tokenId, uint256 _price)`: Lists an NFT for sale. Requires the marketplace to be approved for the token and payment of the `listingFee`.
  * `buyNFT(address _nftContract, uint256 _tokenId)`: Buys a listed NFT. Requires sending ETH equal to or greater than the listing price.
  * `cancelListing(address _nftContract, uint256 _tokenId)`: Cancels a listing and returns the NFT to the seller. Can only be called by the original seller.
  * `updatePrice(address _nftContract, uint256 _tokenId, uint256 _newPrice)`: Allows the seller to change the price of their listed NFT.
  * `getListing(address _nftContract, uint256 _tokenId)`: A view function to get the details of a specific listing.
  * `getListingFee()`: A view function that returns the current listing fee.

### For the Contract Owner (Admin)

  * `updateListingFee(uint256 _newFee)`: Updates the fee required to list an NFT.
  * `withdrawFees()`: Withdraws the accumulated listing fees from the contract balance.
  * `pause()`: Pauses major contract functions like `listNFT` and `buyNFT`.
  * `unpause()`: Resumes normal contract operations.
  * `getContractBalance()`: A view function to check the total ETH held by the contract from fees.

-----

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
# LockToken Solidity Contract

A Foundry project demonstrating a time-lock contract for any ERC20 token. Users can lock their tokens for a specified duration and can only withdraw them once that period has elapsed.

This contract is built using OpenZeppelin's battle-tested `Ownable`, `Pausable`, and `SafeERC20` libraries for enhanced security.

---

## ✨ Features

- **Lock Tokens**: Users can lock a specific amount of an ERC20 token for any duration.
- **Withdraw Tokens**: Users can withdraw their tokens only after the lock duration has expired.
- **Extend Lock**: Users can choose to extend the duration of an existing lock.
- **Multiple Locks**: Users can have multiple, independent locks.
- **Admin Controls**:
    - **Pausable**: The contract owner can pause and unpause core functions (`lock`, `withdraw`) in case of an emergency.
    - **Stuck Token Retrieval**: The owner can retrieve any other ERC20 tokens that are accidentally sent to the contract.
- **View Functions**: Rich set of view functions to query the state of the contract, such as:
    - Get details for a specific lock (`getLockDetails`).
    - Get all lock IDs for a user (`getLocksForUser`).
    - Get total tokens locked in the contract (`totalLocked`).
    - Get total tokens locked by a specific user (`userTotalLockedAmount`).

---

## 🔧 Getting Started with Foundry

### Prerequisites

- [Foundry](https://getfoundry.sh/): You must have Foundry installed.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Install dependencies:**
    This project uses `forge-std` and `openzeppelin-contracts`. Install them using forge:
    ```bash
    forge install OpenZeppelin/openzeppelin-contracts
    forge install foundry-rs/forge-std
    ```

### Build

Compile the contracts to ensure everything is set up correctly:
```bash
forge build
```

### Test

Run the test suite. The `-vvv` flag provides detailed, human-readable trace logs for each test.
```bash
forge test -vvv
```

### Deploy

To deploy the `LockToken` contract, you'll need the address of the ERC20 token you want to be lockable.

Here is a sample deployment command using `forge create`. Replace `YOUR_TOKEN_ADDRESS` with the actual token contract address.

```bash
forge create --rpc-url <your_rpc_url> \
    --private-key <your_private_key> \
    --constructor-args <YOUR_TOKEN_ADDRESS> \
    src/LockToken.sol:LockToken \
    --etherscan-api-key <your_etherscan_key> --verify
```

---

## ⚙️ How It Works

The user workflow is simple and secure:

1.  **Approve**: Before a user can lock tokens, they must first call the `approve()` function on the ERC20 token contract, granting the `LockToken` contract an allowance to spend their tokens.
2.  **Lock**: The user then calls the `lock(amount, duration)` function on the `LockToken` contract. The contract uses `transferFrom` to pull the approved tokens into the contract.
3.  **Wait**: The tokens are held in the contract until `block.timestamp` is greater than or equal to the `unlockTime` of the lock.
4.  **Withdraw**: Once the time has passed, the user can call `withdraw(lockId)` to retrieve their tokens.

---

## 🔒 Security

- **OpenZeppelin Contracts**: Utilizes standard, audited contracts for Ownership, Pausable functionality, and safe ERC20 interactions.
- **Checks-Effects-Interactions Pattern**: State changes are made before external calls (like token transfers) to prevent re-entrancy attacks.
- **Disclaimer**: This contract is for educational purposes. For production use, it should undergo a professional security audit.