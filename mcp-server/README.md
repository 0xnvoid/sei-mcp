# Sei MCP Server

A Model Context Protocol (MCP) server for Sei blockchain operations with persistent encrypted wallet storage, plus an external Faucet API integration.

## Features

- 🔐 **AES-256-GCM Encrypted Wallet Storage** - Private keys are encrypted and stored locally
- 💾 **Persistent Storage** - Wallets survive server restarts
- 🔑 **Master Password Protection** - Single password protects all wallets
- ✅ **Two-Step Transfer Confirmation** - Secure transfer workflow with confirmation codes
- 🛠️ **MCP Protocol Support** - Standard MCP tools for blockchain operations
- 🌐 **HTTP API Support** - Traditional REST API endpoints

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd sei-mcp-server-rs

# Install dependencies
cargo build --release
```

## Configuration

Create a `.env` file in the project root:

```env
# REQUIRED: JSON map of chain_id -> RPC URL
# Example contains both EVM and native testnets
CHAIN_RPC_URLS={"sei-evm-testnet":"https://evm-rpc-testnet.sei-apis.com","sei-native-testnet":"https://rpc-testnet.sei-apis.com"}

# Server port (HTTP mode)
PORT=3000

# External Faucet API base URL
FAUCET_API_URL=https://sei-mcp.onrender.com

# Optional (only if you use direct-signed /api/tx/send):
# EVM default sender key (back-compat fallbacks: FAUCET_PRIVATE_KEY_EVM, FAUCET_PRIVATE_KEY)
TX_PRIVATE_KEY_EVM=0x...
# Optional default sender address for native sends (back-compat fallback: FAUCET_ADDRESS)
DEFAULT_SENDER_ADDRESS=sei1...
# Native send parameters (back-compat fallbacks supported)
NATIVE_DENOM=usei
NATIVE_GAS_LIMIT=200000
NATIVE_FEE_AMOUNT=5000
NATIVE_CHAIN_ID=atlantic-2
NATIVE_BECH32_HRP=sei
```

Notes:
- CHAIN_RPC_URLS is now required. There is no localhost fallback.
- The Faucet is handled entirely by the external API. MCP does not store faucet keys.
 - You can quickly start by copying `env.example` to `.env` and adjusting values.

### MCP Client Configuration

Update your `mcp.json` file:

```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "cargo",
      "args": [
        "run",
        "--",
        "--mcp"
      ],
      "cwd": "/path/to/sei-mcp-server-rs",
      "env": {
        "CHAIN_RPC_URLS": "{\"sei-evm-testnet\":\"https://evm-rpc-testnet.sei-apis.com\",\"sei-native-testnet\":\"https://rpc-testnet.sei-apis.com\"}",
        "FAUCET_API_URL": "https://sei-mcp.onrender.com",
        "PORT": "3000"
      }
    }
  }
}
```

**Important**: Replace `/path/to/sei-mcp-server-rs` with the actual path to your project directory.

#### Using the installed binary (after running the install script)

If you installed via the provided script and `~/.local/bin` is on your PATH, reference the binary directly:

```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "sei-mcp-server-rs",
      "args": ["--mcp"],
      "env": {
        "CHAIN_RPC_URLS": "{\"sei-evm-testnet\":\"https://evm-rpc-testnet.sei-apis.com\",\"atlantic-2\":\"https://rpc-testnet.sei-apis.com\",\"sei-evm-mainnet\":\"https://evm-rpc.sei-apis.com\",\"pacific-1\":\"https://sei-rpc.polkachu.com\"}",
        "FAUCET_API_URL": "https://sei-mcp.onrender.com",
        "PORT": "8080"
      }
    }
  }
}
```

## Usage

### MCP Server Mode (Recommended)

The MCP server runs on stdin/stdout and provides encrypted wallet storage:

```bash
# Start MCP server
cargo run -- --mcp
```

### HTTP Server Mode

```bash
# Start HTTP server
cargo run
```

## Secure Wallet Registration

Use the built-in MCP tools to register wallets securely (no external script required). See examples below under Wallet Management.

## Wallet Management

### 1. Register a Wallet

First, register a wallet with encryption:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "register_wallet",
    "arguments": {
      "wallet_name": "my_wallet",
      "private_key": "0x7f0d4c977cf0b0891798702e6bd740dc2d9aa6195be2365ee947a3c6a08a38fa",
      "master_password": "your_secure_password"
    }
  }
}
```

### 2. List Stored Wallets

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "list_wallets",
    "arguments": {
      "master_password": "your_secure_password"
    }
  }
}
```

### 3. Get Wallet Balance

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_wallet_balance",
    "arguments": {
      "wallet_name": "my_wallet",
      "chain_id": "sei",
      "master_password": "your_secure_password"
    }
  }
}
```

### 4. Transfer Tokens (Two-Step Process)

#### Step 1: Initiate Transfer

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "transfer_from_wallet",
    "arguments": {
      "wallet_name": "my_wallet",
      "to_address": "0x1234567890123456789012345678901234567890",
      "amount": "1000000000000000000",
      "chain_id": "sei",
      "master_password": "your_secure_password"
    }
  }
}
```

This returns a confirmation code and transaction ID.

#### Step 2: Confirm Transfer

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "confirm_transaction",
    "arguments": {
      "transaction_id": "ABC123",
      "confirmation_code": "XYZ789",
      "master_password": "your_secure_password"
    }
  }
}
```

### 5. Remove Wallet

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "remove_wallet",
    "arguments": {
      "wallet_name": "my_wallet",
      "master_password": "your_secure_password"
    }
  }
}
```

## Available Tools

### Basic Tools
- `get_balance` — Get address balance
- `create_wallet` — Create new wallet
- `import_wallet` — Import wallet from private key/mnemonic
- `get_transaction_history` — Get transaction history
- `get_transaction_info` — Get a transaction by hash
- `get_chain_info` — Chain/network info snapshot
- `estimate_fees` — Estimate transaction fees
- `transfer_evm` — EVM value transfer (requires private key)
- `transfer_sei` — Cosmos native transfer (requires private key)
- `request_faucet` — Request tokens via the external Faucet API
- `post_discord_message` — Send a message via Discord webhook/bot (optional)

### Enhanced Tools (with Persistent Storage)
- `register_wallet` — Register wallet with encryption
- `list_wallets` — List stored wallets
- `get_wallet_balance` — Balance for a stored wallet
- `transfer_from_wallet` — Transfer from stored wallet (two-step)
- `confirm_transaction` — Confirm pending transaction
- `remove_wallet` — Remove wallet from storage

### Token & Contract Tools
- `get_token_info` — ERC20 name/symbol/decimals/totalSupply (decoded + raw)
- `get_token_balance` — ERC20 balanceOf (decoded + raw)
- `get_token_allowance` — ERC20 allowance (owner → spender)
- `transfer_token` — ERC20 transfer
- `approve_token_spending` — ERC20 approve
- `get_nft_info` — ERC721 tokenURI
- `check_nft_ownership` — ERC721 ownerOf
- `get_nft_balance` — ERC721 balanceOf
- `get_erc1155_token_uri` — ERC1155 uri
- `get_erc1155_balance` — ERC1155 balanceOf
- `transfer_erc1155` — ERC1155 safeTransferFrom
- `is_contract` — Check if address has code
- `read_contract` — eth_call by ABI/function/args
- `write_contract` — Signed contract write by ABI/function/args

## Security Features

### 🔐 Encryption
- Private keys encrypted with AES-256-GCM
- Argon2 key derivation from master password
- Unique nonce for each encryption
- Base64 encoding for storage

### 🔑 Master Password
- SHA-256 hashed for verification
- Required for all wallet operations
- Protects all stored wallets

### ✅ Confirmation System
- 6-character confirmation codes (3 letters + 3 numbers)
- 5-minute expiration for pending transactions
- Two-step transfer process

## Storage Location

Wallets are stored in: `~/.sei-mcp-server/wallets.json`

The file structure:
```json
{
  "wallets": {
    "wallet_name": {
      "wallet_name": "my_wallet",
      "encrypted_private_key": "base64_encrypted_key",
      "public_address": "0x...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  },
  "master_password_hash": "sha256_hash",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Testing

Run the test suite:

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_wallet_storage

# Run integration tests
./tests/test_persistent_wallet.sh
```

## Development

### Project Structure
```
src/
├── mcp/
│   ├── encryption.rs      # AES-256-GCM encryption helpers
│   ├── wallet_storage.rs  # Encrypted wallet registry + persistence
│   ├── handler.rs         # MCP dispatcher and tool implementations
│   ├── protocol.rs        # MCP protocol types
│   └── mod.rs             # Module glue
├── blockchain/
│   ├── client.rs          # HTTP client + RPC orchestration
│   └── services/          # Contract, token, chain, tx utilities
├── api/                   # HTTP API endpoints
├── main.rs                # Entry point for HTTP and MCP modes
└── lib.rs                 # Library entrypoint (tests reuse)
```

### Adding New Tools

1. Implement the tool logic in `src/mcp/handler.rs` within `handle_tool_call()`.
2. Add the tool to the tools list response in `handle_mcp_request()` for discovery (name, description, JSON schema for arguments).
3. If needed, add helpers under `src/blockchain/services/` and call them from the handler.

## License

MIT License 