// middleware/auth.js
export function authMiddleware(req, res, next) {
  // TEMP: hardcoded dev user
  req.user = { id: 1, walletAddress: req.walletAddress || null };
  next();
}
