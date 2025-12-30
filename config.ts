// import { PublicKey, Connection, Keypair } from '@solana/web3.js';
// import bs58 from 'bs58';

// export const rayFee = new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5');
// export const tipAcct = new PublicKey('Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY');
// export const RayLiqPoolv4 = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

// export const connection = new Connection('', { // RPC URL HERE
//   commitment: 'confirmed',
// });

// export const wallet = Keypair.fromSecretKey(
//   bs58.decode(
//     '' // PRIV KEY OF SOL SENDER
//   )
// );

import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env file

// These seem to be constants, you can keep them as is if they are correct for your target pool
export const rayFee = new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5');
export const tipAcct = new PublicKey('Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY');
export const RayLiqPoolv4 = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

// --- Connection ---
const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
    console.error("RPC_URL not found in .env file.");
    process.exit(1);
}
export const connection = new Connection(rpcUrl, {
    commitment: 'confirmed',
});

// --- Main Payer/Distributor Wallet ---
const distributorSecretKey = process.env.DISTRIBUTOR_SECRET_KEY;
if (!distributorSecretKey) {
    console.error("DISTRIBUTOR_SECRET_KEY not found in .env file.");
    process.exit(1);
}
let mainWalletKeypair: Keypair;
try {
    mainWalletKeypair = Keypair.fromSecretKey(bs58.decode(distributorSecretKey));
} catch (error: any) {
    console.error(`Failed to decode DISTRIBUTOR_SECRET_KEY: ${error.message}. Ensure it's a valid Base58 string.`);
    process.exit(1);
}
export const wallet = mainWalletKeypair; // Exporting it as 'wallet' as per your original snippet
console.log(`Main Payer Wallet Loaded: ${wallet.publicKey.toBase58()}`);

// --- Trading Wallets ---
const tradingSecretKeysEnv = process.env.TRADING_SECRET_KEYS;
if (!tradingSecretKeysEnv) {
    console.error("TRADING_SECRET_KEYS not found in .env file (expected comma-separated Base58 strings).");
    process.exit(1);
}

export const tradingWallets: Keypair[] = tradingSecretKeysEnv
    .split(',')
    .map((key, index) => {
        try {
            if (!key.trim()) {
                throw new Error(`Empty key found at index ${index} in TRADING_SECRET_KEYS.`);
            }
            return Keypair.fromSecretKey(bs58.decode(key.trim()));
        } catch (error: any) {
            console.error(`Failed to parse one of the TRADING_SECRET_KEYS (at index ${index}, key part: "${key.substring(0,5)}..."): ${error.message}. Ensure all are valid Base58 strings, comma-separated.`);
            process.exit(1); // Exit if any key is invalid
        }
    });

if (tradingWallets.length === 0) {
    console.error("No trading wallets loaded. Check TRADING_SECRET_KEYS in .env.");
    // process.exit(1); // Already handled by the map check if TRADING_SECRET_KEYS is empty string after split.
} else {
    console.log(`Loaded ${tradingWallets.length} trading wallets.`);
    // tradingWallets.forEach((tw, i) => console.log(` Trading Wallet ${i+1}: ${tw.publicKey.toBase58()}`));
}

// Example of how you might use these later:
// const firstTradingWallet = tradingWallets[0];
// if (firstTradingWallet) {
//   console.log(`First trading wallet public key: ${firstTradingWallet.publicKey.toBase58()}`);
// }