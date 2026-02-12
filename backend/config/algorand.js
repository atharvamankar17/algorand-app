import dotenv from "dotenv";
dotenv.config();

import algosdk from "algosdk";

// AlgoKit localnet defaults
const ALGOD_ADDRESS = "http://localhost:4001";
const ALGOD_TOKEN =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const algodClient = new algosdk.Algodv2(
  ALGOD_TOKEN,
  ALGOD_ADDRESS
);

// Validate mnemonic early (fail fast)
let platformAccount = null;
if (process.env.PLATFORM_MNEMONIC) {
  try {
    platformAccount = algosdk.mnemonicToSecretKey(
      process.env.PLATFORM_MNEMONIC.trim()
    );
  } catch (err) {
    console.warn("⚠️ Invalid PLATFORM_MNEMONIC in .env");
  }
}

// Create ASA (Algorand Standard Asset) for event tickets
export async function createTicketASA(eventName, totalTickets) {
  if (!platformAccount) {
    console.warn("⚠️ Platform account not configured. Using mock ASA ID.");
    // Return a mock ASA ID for development
    return Math.floor(Math.random() * 1000000000);
  }

  try {
    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: platformAccount.addr,
      total: totalTickets,
      decimals: 0,
      defaultFrozen: false,
      manager: platformAccount.addr,
      reserve: platformAccount.addr,
      freeze: platformAccount.addr,
      clawback: platformAccount.addr,
      unitName: "TKT",
      assetName: eventName.substring(0, 12),
      suggestedParams: params
    });

    const signedTxn = txn.signTxn(platformAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    await algosdk.waitForConfirmation(algodClient, txId, 4);

    const ptx = await algodClient.pendingTransactionInformation(txId).do();
    return ptx["asset-index"];
  } catch (err) {
    console.error("Error creating ASA:", err);
    // Return mock ID on error for development
    return Math.floor(Math.random() * 1000000000);
  }
}

// Mint NFT ticket
export async function mintTicketNFT(metadataUrl) {
  if (!platformAccount) {
    console.warn("⚠️ Cannot mint NFT without platform account");
    return null;
  }

  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: platformAccount.addr,
    total: 1,
    decimals: 0,
    defaultFrozen: false,
    manager: platformAccount.addr,
    reserve: platformAccount.addr,
    freeze: platformAccount.addr,
    clawback: platformAccount.addr,
    unitName: "EVT",
    assetName: "TICKET",
    assetURL: metadataUrl,
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(platformAccount.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

  await algosdk.waitForConfirmation(algodClient, txId, 4);

  const ptx = await algodClient.pendingTransactionInformation(txId).do();
  return ptx["asset-index"];
}

// Transfer NFT to buyer
export async function transferTicket(assetId, receiver) {
  if (!platformAccount) {
    console.warn("⚠️ Cannot transfer ticket without platform account");
    return null;
  }

  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: platformAccount.addr,
    to: receiver,
    amount: 1,
    assetIndex: assetId,
    suggestedParams: params
  });

  const signedTxn = txn.signTxn(platformAccount.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

  await algosdk.waitForConfirmation(algodClient, txId, 4);
  return txId;
}

export { algodClient, platformAccount };
