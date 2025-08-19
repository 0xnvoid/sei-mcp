# Sei MCP Server (Rust)

A Model Context Protocol (MCP) server providing tools to interact with Sei EVM and Cosmos networks. It exposes wallet management, balances, faucet, transactions, contract utilities, token (ERC20/721/1155) helpers, and observability via SeiStream.

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

- Wallets
  - create/import EVM wallets
  - secure storage with master password
- Balances & Faucet
  - native balance, faucet (testnet)
- Transfers
  - EVM value transfer, SEI native transfer, NFT transfer placeholder
- Contracts
  - get contract info/code/txs (SeiStream)
  - read/write via ABI, is_contract
- Tokens
  - ERC20: info, balance, allowance, transfer, approve
  - ERC721: tokenURI, ownerOf, balanceOf
  - ERC1155: uri, balanceOf, safeTransferFrom
- Chain & Tx
  - chain info, tx info, tx history
- Utilities
  - Discord webhook posting (optional)

## Install

One-liner installer (adjust repo env if needed):

```bash
curl -fsSL https://raw.githubusercontent.com/0xnvoid/sei-mcp/main/scripts/install.sh | GITHUB_REPO=0xnvoid/sei-mcp bash
```

Or build locally:

```bash
cd mcp-server
cargo build --release
```

See `mcp-server/README.md` for detailed server usage and tool references.

### Install via script (recommended)

The script downloads the latest release and installs the binary to `~/.local/bin`.

```bash
curl -fsSL https://raw.githubusercontent.com/0xnvoid/sei-mcp/main/scripts/install.sh | GITHUB_REPO=0xnvoid/sei-mcp bash
```

Ensure your shell PATH includes `~/.local/bin`:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
# or for zsh:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

After install, use the binary name `sei-mcp-server-rs` in your MCP config (no absolute path needed if PATH is set).

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
      "command": "sei-mcp-server-rs",
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

