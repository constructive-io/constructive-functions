import app from '@constructive-io/knative-job-fn';
import { ethers } from 'ethers';

app.post('/', async (req: any, res: any) => {
    console.log('[crypto-login] Request received');
    const { chain = 'ethereum', address, message, signature, publicKey } = req.body || {};

    if (!address || !message || !signature) {
        return res.status(400).json({ error: "Missing address, message, or signature" });
    }

    try {
        let isValid = false;
        const chainlower = chain.toString().toLowerCase();

        if (chainlower === 'ethereum') {
            // Standard Ethers verification
            const recoveredAddress = ethers.verifyMessage(message, signature);
            isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

        } else if (chainlower === 'solana') {
            // Solana verification: requires publicKey + signature (Uint8Array or base64)
            if (!publicKey) return res.status(400).json({ error: "Missing publicKey for Solana verification" });

            // Dynamic import for esm-only modules if needed, or rely on compiled TS
            const nacl = require('tweetnacl');
            const { PublicKey } = require('@solana/web3.js');
            const bs58 = require('bs58');

            const messageBytes = new TextEncoder().encode(message);
            // signature can be base64 or array of numbers
            let signatureBytes;
            if (typeof signature === 'string') {
                // Try base64 decoding usually, or bs58
                signatureBytes = bs58.decode(signature);
            } else {
                signatureBytes = new Uint8Array(signature);
            }
            const pubKeyBytes = new PublicKey(publicKey).toBytes();

            isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, pubKeyBytes);
            // Verify publicKey matches address
            if (new PublicKey(publicKey).toBase58() !== address) isValid = false;

        } else if (chainlower === 'bitcoin') {
            // Bitcoin verification
            const bitcoinMessage = require('bitcoinjs-message');
            isValid = bitcoinMessage.verify(message, address, signature);

        } else if (chainlower === 'cosmos') {
            // Cosmos verification
            if (!publicKey) return res.status(400).json({ error: "Missing publicKey for Cosmos verification" });

            try {
                // InterchainJS utils export standard secp256k1
                const { Secp256k1 } = require('@interchainjs/utils');
                const crypto = require('crypto');

                // Assuming message signed was sha256 hash or handled by library if passing msg
                // Secp256k1.verify usually takes (signature, messageHash, publicKey)
                // We create hash of the message to be safe as standard secp256k1 expects 32-byte hash
                const messageHash = crypto.createHash('sha256').update(message).digest();

                let signatureBytes;
                if (typeof signature === 'string') {
                    // Try to decode based on format, assume base64 for Cosmos standard
                    signatureBytes = Buffer.from(signature, 'base64');
                } else {
                    signatureBytes = Buffer.from(signature);
                }

                let pubKeyBytes;
                if (typeof publicKey === 'string') {
                    pubKeyBytes = Buffer.from(publicKey, 'base64');
                } else {
                    pubKeyBytes = Buffer.from(publicKey);
                }

                // Verify
                isValid = await Secp256k1.verify(signatureBytes, messageHash, pubKeyBytes);
            } catch (err: any) {
                console.error(`[crypto-login] Cosmos verification failed: ${err.message}`);
                isValid = false;
            }

        } else {
            return res.status(400).json({ error: `Unsupported chain: ${chain}` });
        }

        if (isValid) {
            console.log(`[crypto-login] Verified ${chain} signature for ${address}`);
            return res.status(200).json({ success: true, verified: true, chain, address });
        } else {
            console.warn(`[crypto-login] Signature mismatch for ${chain} address ${address}`);
            return res.status(401).json({ success: false, error: "Signature mismatch" });
        }

    } catch (error: any) {
        console.error('[crypto-login] Error verifying signature:', error);
        res.status(500).json({ error: error.message });
    }
});

export default app;

if (require.main === module) {
    const port = Number(process.env.PORT ?? 8080);
    (app as any).listen(port, () => {
        console.log(`[crypto-login] listening on port ${port}`);
    });
}
