import { ethers } from 'hardhat';

async function main() {
  const C = await ethers.getContractFactory('ScilogNotary');
  const c = await C.deploy();
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log('ScilogNotary deployed at:', addr);
  console.log('Add to .env: NOTARY_CONTRACT_ADDRESS=' + addr);
}
main().catch(e => { console.error(e); process.exit(1); });
