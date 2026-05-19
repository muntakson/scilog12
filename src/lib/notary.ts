import crypto from 'crypto';
import { ethers } from 'ethers';

// Canonical JSON: sort object keys recursively so hash is deterministic.
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize((value as any)[k])).join(',') + '}';
}

export function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

const ABI = [
  'function anchor(bytes32 contentHash) external',
  'event Anchored(address indexed submitter, bytes32 indexed contentHash, uint256 timestamp)',
];

export async function anchorOnChain(hashHex: string): Promise<{ txHash: string; blockNumber: number; contract: string } | null> {
  const rpc = process.env.BASE_SEPOLIA_RPC_URL;
  const pk = process.env.NOTARY_PRIVATE_KEY;
  const contract = process.env.NOTARY_CONTRACT_ADDRESS;
  if (!rpc || !pk || !contract) return null;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const c = new ethers.Contract(contract, ABI, wallet);
  const tx = await c.anchor('0x' + hashHex);
  const receipt = await tx.wait();
  return { txHash: receipt!.hash, blockNumber: receipt!.blockNumber, contract };
}
