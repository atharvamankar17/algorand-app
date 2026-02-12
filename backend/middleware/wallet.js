function normalizeWalletAddress(value) {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}

export function getWalletAddressFromRequest(req) {
  return (
    normalizeWalletAddress(req.headers["x-wallet-address"]) ||
    normalizeWalletAddress(req.headers["wallet-address"]) ||
    normalizeWalletAddress(req.query?.walletAddress) ||
    normalizeWalletAddress(req.query?.buyerAddress) ||
    normalizeWalletAddress(req.query?.address) ||
    normalizeWalletAddress(req.body?.walletAddress) ||
    normalizeWalletAddress(req.body?.buyerAddress) ||
    normalizeWalletAddress(req.body?.address) ||
    normalizeWalletAddress(req.body?.fromAddress)
  );
}

export function walletMiddleware(req, _res, next) {
  req.walletAddress = getWalletAddressFromRequest(req);
  next();
}

