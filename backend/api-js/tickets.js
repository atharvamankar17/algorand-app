import express from "express";
import db from "../db/index.js";
import { mintTicketNFT, transferTicket, algodClient } from "../config/algorand.js";
import algosdk from "algosdk";

const router = express.Router();

router.post("/mint", async (req, res) => {
  try {
    const { eventName, metadataUrl, price } = req.body;
    const ownerAddress = req.walletAddress || req.body?.ownerAddress || "PLATFORM";

    const asaId = await mintTicketNFT(metadataUrl);

    db.run(
      "INSERT INTO tickets (event_name, asa_id, price, owner) VALUES (?, ?, ?, ?)",
      [eventName, asaId, price, ownerAddress]
    );

    res.json({ eventName, asaId });
  } catch (err) {
    console.error("❌ Mint failed:", err);
    res.status(500).json({
      error: "Mint failed",
      details: err.message
    });
  }
});

router.post("/buy", async (req, res) => {
  const { asaId } = req.body;
  const buyerAddress = req.walletAddress || req.body?.buyerAddress;

  if (!buyerAddress) {
    return res.status(400).json({ error: "buyerAddress or x-wallet-address is required" });
  }

  await transferTicket(asaId, buyerAddress);

  db.run(
    "UPDATE tickets SET owner=? WHERE asa_id=?",
    [buyerAddress, asaId]
  );

  res.json({ success: true });
});

router.get("/mine", async (req, res) => {
  const walletAddress = req.walletAddress || req.query?.address;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress or x-wallet-address is required" });
  }

  db.all(
    "SELECT id, event_name, asa_id, price, owner FROM tickets WHERE owner = ? ORDER BY id DESC",
    [walletAddress],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const tickets = (rows || []).map((row) => ({
        id: String(row.id),
        eventTitle: row.event_name,
        asaId: row.asa_id,
        price: row.price,
        owner: row.owner,
        status: "valid",
      }));
      return res.json(tickets);
    }
  );
});


// GET /api/tickets/optin-status?address=...&asaId=...
router.get("/optin-status", async (req, res) => {
  const address = req.query?.address || req.walletAddress;
  const { asaId } = req.query;
  if (!address || !asaId) return res.status(400).json({ error: "address & asaId required" });

  try {
    // account information includes asset holdings
    const info = await algodClient.accountInformation(address).do();
    const holding = (info['assets'] || []).find(a => Number(a['asset-id']) === Number(asaId));
    return res.json({ optedIn: Boolean(holding) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets/optin-suggest  (body: { address, asaId })
// Returns base64 unsigned txn for the wallet to sign
router.post("/optin-suggest", async (req, res) => {
  const address = req.body?.address || req.walletAddress;
  const { asaId } = req.body;
  if (!address || !asaId) return res.status(400).json({ error: "address & asaId required" });

  try {
    const params = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex: Number(asaId),
      suggestedParams: params
    });
    const encoded = algosdk.encodeUnsignedTransaction(txn);
    // base64 for transport
    const unsignedB64 = Buffer.from(encoded).toString("base64");
    res.json({ unsignedTx: unsignedB64, txNote: txn.note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
