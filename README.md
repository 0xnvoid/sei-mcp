# Sei MCP Server (Rust)

A Model Context Protocol (MCP) server providing tools to interact with Sei EVM and Cosmos networks. It exposes wallet management, balances, faucet, transactions, contract utilities, token (ERC20/721/1155) helpers, and observability via SeiStream.

## Quickstart

### 1) Installation (script)

```bash
curl -fsSL https://raw.githubusercontent.com/0xnvoid/seiyn-mcp/main/scripts/install.sh | GITHUB_REPO=0xnvoid/seiyn-mcp bash
```

Ensure your shell PATH includes `~/.local/bin` so `seiyn_mcp` is discoverable:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
# or zsh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

### 2) Configure your MCP client (copiable)

Create or edit your `mcp.json` and add this entry:

```json
{
  "mcpServers": {
    "sei-mcp": {
      "command": "seiyn_mcp",
      "args": ["--mcp"],
      "env": {
        "CHAIN_RPC_URLS": "{\"sei-evm-testnet\":\"https://evm-rpc-testnet.sei-apis.com\",\"atlantic-2\":\"https://rpc-testnet.sei-apis.com\",\"sei-evm-mainnet\":\"https://evm-rpc.sei-apis.com\",\"pacific-1\":\"https://sei-rpc.polkachu.com\"}",
        "FAUCET_API_URL": "https://sei-mcp.onrender.com",
        "DISCORD_API_URL": "https://sei-mcp-tdj3.onrender.com"
      }
    }
  }
}
```

Notes:

- `CHAIN_RPC_URLS` is a JSON string map of `chain_id -> rpc_url`.
- `FAUCET_API_URL` points to the optional faucet microservice in `faucet-api/`.
- `DISCORD_API_URL` points to the optional Discord microservice (used by the `post_discord_message` tool). If unset, Discord-related tools will be unavailable.
- You can also run locally without installing: set `command` to your built binary path and add `cwd` if needed.

## Repository Structure

```
.
├── mcp-server/         # Rust MCP server and HTTP API
│   ├── src/
│   └── README.md       # Server-specific setup and tools
├── faucet-api/         # TypeScript faucet microservice (optional external service)
│   ├── src/
│   └── README.md       # Faucet endpoints, env, deploy
├── scripts/
│   └── install.sh      # Optional helper installer
└── README.md           # You are here (top-level overview)
```

## Features
---
### Wallets 👛
This category includes tools for creating, importing, and securely managing user wallets.

* **`create_wallet`**: Generates a new EVM-compatible wallet, providing a new address, private key, and mnemonic phrase.
* **`import_wallet`**: Imports an existing EVM wallet using a private key, returning the wallet's address and public key.
* **`register_wallet`**: Encrypts a private key with a master password and saves it locally under a user-provided name for secure storage.
* **`list_wallets`**: Lists the names of all wallets that have been securely registered. Requires the master password to view.
* **`transfer_from_wallet`**: Executes a token transfer from a securely stored wallet. It requires the wallet's name and the master password to decrypt the private key for the transaction.

---

### Balances & Faucet 💧
These tools are for checking account balances and acquiring testnet tokens.

* **`get_balance`**: Fetches the native coin balance (e.g., SEI) for a given address on a specified chain.
* **`request_faucet`**: Sends a request to a configured faucet to receive testnet tokens for a specific address.

---

### Transfers 💸
This group of functions handles the movement of assets, from native coins to various token types.

* **`transfer_evm`**: Sends a specified amount of the native EVM coin from one address to another using a provided private key.
* **`transfer_sei`**: Executes a native Cosmos-based bank transfer for moving `usei` between Sei addresses.
* **`transfer_nft_evm`**: Transfers a specific ERC-721 token from a sender to a receiver.
* **`transfer_token`**: Transfers a specified amount of an ERC20 token to a recipient address.
* **`transfer_erc1155`**: Transfers a specified amount of an ERC1155 token from one address to another.

---

### Contracts 📜
These tools provide functionalities for interacting with and inspecting smart contracts.

* **`get_contract`**: Retrieves general on-chain details about a smart contract from the SeiStream indexing service.
* **`get_contract_code`**: Fetches the deployed bytecode for a smart contract at a given address.
* **`get_contract_transactions`**: Obtains a history of transactions associated with a specific smart contract from SeiStream.
* **`is_contract`**: Checks if a given address has smart contract code deployed to it, differentiating it from a standard wallet address.
* **`read_contract`**: Performs a read-only call to a smart contract function without creating a transaction, using the contract's ABI to format the request.
* **`write_contract`**: Creates and sends a signed transaction to execute a state-changing function on a smart contract, using its ABI.

---

### Tokens 🪙
This section covers a wide range of tools for interacting with ERC20, ERC721, and ERC1155 token standards.

#### ERC20
* **`get_token_info`**: Fetches standard metadata for an ERC20 token, such as its name, symbol, and decimal precision.
* **`get_token_balance`**: Checks the balance of a specific ERC20 token held by a wallet address.
* **`get_token_allowance`**: Checks the amount of an ERC20 token that a "spender" address is authorized to withdraw from an owner's address.
* **`approve_token_spending`**: Grants a "spender" address permission to transfer a specified amount of an ERC20 token on the owner's behalf.

#### ERC721
* **`get_nft_info`**: Retrieves the metadata URI (`tokenURI`) for a specific ERC-721 non-fungible token (NFT).
* **`check_nft_ownership`**: Verifies the current owner of a specific ERC-721 token by its token ID.
* **`get_nft_balance`**: Counts the total number of ERC-721 tokens from a specific contract that a wallet address owns.
* **`get_nft_metadata`**: Fetches metadata for all ERC-721 items within a given contract from the SeiStream service.

#### ERC1155
* **`get_erc1155_token_uri`**: Gets the metadata URI for a specific ERC1155 token ID.
* **`get_erc1155_balance`**: Checks an address's balance of a specific token ID within an ERC1155 contract.

---

### Chain & Tx ⛓️
These tools offer insights into the blockchain's status and transaction history.

* **`get_chain_info`**: Retrieves general information about the blockchain from SeiStream, including the network name and latest block height.
* **`get_transaction_info`**: Fetches detailed information about a single transaction using its unique hash from SeiStream.
* **`get_transaction_history`**: Provides a list of past transactions for a given wallet address from SeiStream.
* **`search_events`**: Queries the blockchain for specific log events emitted by smart contracts based on filters like address and topic.

---

### Utilities 🛠️
This category contains miscellaneous helper tools.

* **`discord_post_message`**: Sends a message to a pre-configured Discord channel via a webhook.
* **`redirect_to_seidocs`**: Provides the URL for the official Sei documentation (`https://docs.sei.io/`).

## Additional Installation Options

One-liner installer (adjust repo env if needed):

```bash
curl -fsSL https://raw.githubusercontent.com/0xnvoid/seiyn-mcp/main/scripts/install.sh | GITHUB_REPO=0xnvoid/seiyn-mcp bash
```

Or build locally:

```bash
cd mcp-server
cargo build --release
```

See `mcp-server/README.md` for detailed server usage and tool references.

### Manual download and setup

If you prefer downloading a specific release asset (without the script):

```bash
# Set the tag you want
TAG=v0.1.0

# Pick the correct artifact for your OS/arch
# linux:   seiyn_mcp-linux-x86_64.tar.gz   or   seiyn_mcp-linux-arm64.tar.gz
# macOS:   seiyn_mcp-macos-x86_64.tar.gz   or   seiyn_mcp-macos-arm64.tar.gz
# windows: seiyn_mcp-windows-x86_64.zip    or   seiyn_mcp-windows-arm64.zip

ART=seiyn_mcp-linux-x86_64.tar.gz   # change to your OS/arch
curl -fsSL -o "$ART" "https://github.com/0xnvoid/seiyn-mcp/releases/download/${TAG}/${ART}"

# Extract and install (Linux/macOS)
tar -xzf "$ART"
install -m 0755 seiyn_mcp "$HOME/.local/bin/seiyn_mcp"

# Ensure PATH contains ~/.local/bin
case :$PATH: in
  *:"$HOME/.local/bin":*) ;; 
  *) echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc" ;;
esac
```

Note: Configure required env (e.g. `CHAIN_RPC_URLS`) in your MCP client entry.

### Install via script (recommended)

The script downloads the latest release and installs the binary to `~/.local/bin`.

```bash
curl -fsSL https://raw.githubusercontent.com/0xnvoid/seiyn-mcp/main/scripts/install.sh | GITHUB_REPO=0xnvoid/seiyn-mcp bash
```

Ensure your shell PATH includes `~/.local/bin`:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
# or for zsh:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

After install, use the binary name `seiyn_mcp` in your MCP config (no absolute path needed if PATH is set).

## Uninstall

To remove the MCP server installed via the script/manual steps, delete the binary:

```bash
rm -f "$HOME/.local/bin/seiyn_mcp"
```

If you added an entry in your MCP client config (e.g., `mcp.json`), you may also remove the `sei-mcp` entry there.

## Configuration

Set chain RPC URLs in config (the server already loads from its internal config). Supported `chain_id` examples:

- `sei-evm-testnet`
- `sei-evm-mainnet`

Most tools accept `chain_id` or `network` (alias). If omitted, defaults to `sei-evm-testnet`.

## MCP Tools (Highlights)

Below is a non-exhaustive list. See `mcp-server/src/mcp/handler.rs` for the canonical schemas.

- get_balance
- create_wallet, import_wallet
- request_faucet
- transfer_evm, transfer_sei
- get_contract, get_contract_code, get_contract_transactions
- get_chain_info, get_transaction_info, get_transaction_history
- search_events
- post_discord_message

Newly added token/contract tools:

- get_token_info
- get_token_balance
- get_token_allowance
- transfer_token
- approve_token_spending
- get_nft_info (ERC721 tokenURI)
- check_nft_ownership (ERC721 ownerOf)
- get_nft_balance (ERC721 balanceOf)
- get_erc1155_token_uri
- get_erc1155_balance
- transfer_erc1155
- is_contract
- read_contract
- write_contract

## Usage (MCP Client)

Examples of tool calls (JSON-RPC-like payloads). Replace addresses and private keys accordingly.

- ERC20 Info
```json
{
  "method": "tools/call",
  "params": {"name": "get_token_info", "arguments": {"tokenAddress": "0x...", "chain_id": "sei-evm-testnet"}}
}
```

- ERC20 Balance
```json
{
  "method": "tools/call",
  "params": {"name": "get_token_balance", "arguments": {"tokenAddress": "0x...", "ownerAddress": "0x..."}}
}
```

- ERC20 Allowance
```json
{
  "method": "tools/call",
  "params": {"name": "get_token_allowance", "arguments": {"tokenAddress": "0x...", "ownerAddress": "0x...", "spenderAddress": "0x..."}}
}
```

- ERC20 Transfer
```json
{
  "method": "tools/call",
  "params": {"name": "transfer_token", "arguments": {"private_key": "<hex>", "tokenAddress": "0x...", "toAddress": "0x...", "amount": "1000000000000000000"}}
}
```

- ERC20 Approve
```json
{
  "method": "tools/call",
  "params": {"name": "approve_token_spending", "arguments": {"private_key": "<hex>", "tokenAddress": "0x...", "spenderAddress": "0x...", "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935"}}
}
```

The large `amount` above is `2^256 - 1` (max uint256), a common pattern for "infinite approval" so you don’t need to re-approve each transfer. Consider the security trade‑off: if the spender is compromised, it can spend up to that limit. Prefer smaller, purpose‑scoped allowances when appropriate.

- ERC721 tokenURI
```json
{
  "method": "tools/call",
  "params": {"name": "get_nft_info", "arguments": {"tokenAddress": "0x...", "tokenId": "1"}}
}
```

- ERC1155 balance
```json
{
  "method": "tools/call",
  "params": {"name": "get_erc1155_balance", "arguments": {"tokenAddress": "0x...", "tokenId": "1", "ownerAddress": "0x..."}}
}
```

- Read Contract (ABI)
```json
{
  "method": "tools/call",
  "params": {"name": "read_contract", "arguments": {"contractAddress": "0x...", "abi": "[ ... ABI JSON ... ]", "functionName": "balanceOf", "args": ["0x..."]}}
}
```

- Write Contract (ABI)
```json
{
  "method": "tools/call",
  "params": {"name": "write_contract", "arguments": {"private_key": "<hex>", "contractAddress": "0x...", "abi": "[ ... ABI JSON ... ]", "functionName": "approve", "args": ["0x...", "1000"]}}
}
```

## Decoding

For many calls we return both `raw` (hex) and `decoded` (string/decimal) when possible. Consumers can rely on `decoded` for human-readable values.

## Security

- Never commit or log private keys/mnemonics.
- Use the secure wallet storage tools for encryption at rest.
- Testnet faucet is for development only.

## Development

```bash
cargo build
cargo test
```

Key modules:

- `mcp-server/src/mcp/handler.rs`: MCP dispatcher and tool registry
- `mcp-server/src/blockchain/client.rs`: RPC orchestration
- `mcp-server/src/blockchain/services/`: blockchain and utility services

### Faucet Service

The server delegates testnet token requests to an external Faucet API. A reference implementation lives in `faucet-api/`.

- Configure the server with `FAUCET_API_URL` (see `mcp-server/mcp.json` example below).
- See `faucet-api/README.md` for its own environment and deploy instructions.

### MCP client configuration example

If you use an MCP-capable client, add an entry. After installing with the script, prefer referencing the binary name directly and pass env inline:

```json
{
  "mcpServers": {
    "sei-mcp": {
      "command": "seiyn_mcp",
      "args": ["--mcp"],
      "cwd": "/path/to/mcp-server", 
      "env": {
        "CHAIN_RPC_URLS": "{\"sei-evm-testnet\":\"https://evm-rpc-testnet.sei-apis.com\",\"atlantic-2\":\"https://rpc-testnet.sei-apis.com\",\"sei-evm-mainnet\":\"https://evm-rpc.sei-apis.com\",\"pacific-1\":\"https://sei-rpc.polkachu.com\"}",
        "FAUCET_API_URL": "https://sei-mcp.onrender.com",
        "PORT": "8080"
      }
    }
  }
}
```

### Setup (env files)

- Copy `mcp-server/env.example` to `mcp-server/.env` and adjust values.
- If you deploy the faucet, copy `faucet-api/env.example` to `faucet-api/.env` and adjust values.

