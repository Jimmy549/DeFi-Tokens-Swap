export const DECIMALS = 18;

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

export const SWAP_ABI = [
  "function tokenA() view returns (address)",
  "function tokenB() view returns (address)",
  "function reserveA() view returns (uint256)",
  "function reserveB() view returns (uint256)",
  "function totalLPShares() view returns (uint256)",
  "function lpShares(address) view returns (uint256)",
  "function getPrice() view returns (uint256)",
  "function getReserves() view returns (uint256, uint256)",
  "function getSwapPreview(uint256 amountIn, bool isAtoB) view returns (uint256 amountOut, uint256 priceImpact)",
  "function getLPInfo(address provider) view returns (uint256 shares, uint256 sharePercent, uint256 tokenAValue, uint256 tokenBValue)",
  "function addLiquidity(uint256 amountA, uint256 amountB) returns (uint256 shares)",
  "function removeLiquidity(uint256 shares) returns (uint256 amountA, uint256 amountB)",
  "function swapAforB(uint256 amountAIn, uint256 minAmountBOut) returns (uint256 amountBOut)",
  "function swapBforA(uint256 amountBIn, uint256 minAmountAOut) returns (uint256 amountAOut)",
];

export const SLIPPAGE_OPTIONS = [0.5, 1, 2, 5];

export const SUPPORTED_NETWORKS: Record<number, string> = {
  1: "Ethereum",
  11155111: "Sepolia",
  137: "Polygon",
  80001: "Mumbai",
  31337: "Hardhat",
  1337: "Local",
};
