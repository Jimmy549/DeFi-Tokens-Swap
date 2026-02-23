// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC20 - Interface for ERC20 tokens
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title SimpleSwap - Automated Market Maker (AMM) DEX
 * @dev Implements x*y=k constant product formula for token swapping
 *
 * HOW IT WORKS:
 * - Two tokens sit in a pool (reserveA and reserveB)
 * - Formula: reserveA * reserveB = k (constant)
 * - When you add tokenA, you get tokenB (and vice versa)
 * - Price adjusts automatically based on pool ratio
 * - 0.3% fee on every swap goes to liquidity providers
 */
contract SimpleSwap {

    // ============ State Variables ============

    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;   // Amount of Token A in pool
    uint256 public reserveB;   // Amount of Token B in pool

    uint256 public totalLPShares;  // Total liquidity provider shares
    mapping(address => uint256) public lpShares;  // Each provider's share

    // Fee: 0.3% (997/1000 after fee)
    uint256 public constant FEE_NUMERATOR = 997;
    uint256 public constant FEE_DENOMINATOR = 1000;

    address public owner;

    // ============ Events ============
    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 lpSharesMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 lpSharesBurned
    );

    event Swapped(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    // ============ Modifiers ============

    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }

    modifier hasLiquidity() {
        require(reserveA > 0 && reserveB > 0, "Pool has no liquidity");
        _;
    }

    // ============ Constructor ============

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token address");
        require(_tokenA != _tokenB, "Tokens must be different");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        owner = msg.sender;
    }

    // ============ Liquidity Functions ============

    /**
     * @dev Add liquidity to the pool
     * First time: any ratio is accepted
     * After that: must maintain current ratio to get full LP shares
     *
     * @param amountA Amount of Token A to deposit
     * @param amountB Amount of Token B to deposit
     */
    function addLiquidity(uint256 amountA, uint256 amountB)
        external
        validAmount(amountA)
        validAmount(amountB)
        returns (uint256 shares)
    {
        // Transfer tokens from user to this contract
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "Token A transfer failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "Token B transfer failed");

        // Calculate LP shares to mint
        if (totalLPShares == 0) {
            // First liquidity provider: shares = sqrt(amountA * amountB)
            shares = _sqrt(amountA * amountB);
        } else {
            // Subsequent providers: proportional to contribution
            uint256 shareA = (amountA * totalLPShares) / reserveA;
            uint256 shareB = (amountB * totalLPShares) / reserveB;
            shares = shareA < shareB ? shareA : shareB; // Use minimum
        }

        require(shares > 0, "Zero shares minted");

        // Update state
        lpShares[msg.sender] += shares;
        totalLPShares += shares;
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, shares);
    }

    /**
     * @dev Remove liquidity from the pool
     * @param shares Amount of LP shares to burn
     */
    function removeLiquidity(uint256 shares)
        external
        validAmount(shares)
        hasLiquidity
        returns (uint256 amountA, uint256 amountB)
    {
        require(lpShares[msg.sender] >= shares, "Insufficient LP shares");

        // Calculate proportional token amounts
        amountA = (shares * reserveA) / totalLPShares;
        amountB = (shares * reserveB) / totalLPShares;

        require(amountA > 0 && amountB > 0, "Insufficient liquidity amounts");

        // Update state
        lpShares[msg.sender] -= shares;
        totalLPShares -= shares;
        reserveA -= amountA;
        reserveB -= amountB;

        // Transfer tokens back to user
        require(tokenA.transfer(msg.sender, amountA), "Token A transfer failed");
        require(tokenB.transfer(msg.sender, amountB), "Token B transfer failed");

        emit LiquidityRemoved(msg.sender, amountA, amountB, shares);
    }

    // ============ Swap Functions ============

    /**
     * @dev Swap Token A for Token B
     * Uses x*y=k formula with 0.3% fee
     *
     * @param amountAIn Amount of Token A to swap
     * @param minAmountBOut Minimum Token B to receive (slippage protection)
     */
    function swapAforB(uint256 amountAIn, uint256 minAmountBOut)
        external
        validAmount(amountAIn)
        hasLiquidity
        returns (uint256 amountBOut)
    {
        amountBOut = _getAmountOut(amountAIn, reserveA, reserveB);

        require(amountBOut >= minAmountBOut, "Slippage: output below minimum");
        require(amountBOut < reserveB, "Not enough liquidity in pool");

        // Transfer tokens
        require(tokenA.transferFrom(msg.sender, address(this), amountAIn), "Token A transfer failed");
        require(tokenB.transfer(msg.sender, amountBOut), "Token B transfer failed");

        // Update reserves
        reserveA += amountAIn;
        reserveB -= amountBOut;

        emit Swapped(msg.sender, address(tokenA), address(tokenB), amountAIn, amountBOut);
    }

    /**
     * @dev Swap Token B for Token A
     *
     * @param amountBIn Amount of Token B to swap
     * @param minAmountAOut Minimum Token A to receive (slippage protection)
     */
    function swapBforA(uint256 amountBIn, uint256 minAmountAOut)
        external
        validAmount(amountBIn)
        hasLiquidity
        returns (uint256 amountAOut)
    {
        amountAOut = _getAmountOut(amountBIn, reserveB, reserveA);

        require(amountAOut >= minAmountAOut, "Slippage: output below minimum");
        require(amountAOut < reserveA, "Not enough liquidity in pool");

        // Transfer tokens
        require(tokenB.transferFrom(msg.sender, address(this), amountBIn), "Token B transfer failed");
        require(tokenA.transfer(msg.sender, amountAOut), "Token A transfer failed");

        // Update reserves
        reserveB += amountBIn;
        reserveA -= amountAOut;

        emit Swapped(msg.sender, address(tokenB), address(tokenA), amountBIn, amountAOut);
    }

    // ============ View Functions ============

    /**
     * @dev Preview: How much will I get from a swap?
     * @param amountIn Amount to swap
     * @param isAtoB true = Token A → Token B, false = Token B → Token A
     */
    function getSwapPreview(uint256 amountIn, bool isAtoB)
        external
        view
        returns (uint256 amountOut, uint256 priceImpact)
    {
        if (isAtoB) {
            amountOut = _getAmountOut(amountIn, reserveA, reserveB);
            // Price impact in basis points (1 bp = 0.01%)
            uint256 idealOut = (amountIn * reserveB) / reserveA;
            priceImpact = idealOut > 0 ? ((idealOut - amountOut) * 10000) / idealOut : 0;
        } else {
            amountOut = _getAmountOut(amountIn, reserveB, reserveA);
            uint256 idealOut = (amountIn * reserveA) / reserveB;
            priceImpact = idealOut > 0 ? ((idealOut - amountOut) * 10000) / idealOut : 0;
        }
    }

    /**
     * @dev Get current pool reserves
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB) {
        return (reserveA, reserveB);
    }

    /**
     * @dev Get current price of Token A in terms of Token B
     * Returns price * 1e18 for precision
     */
    function getPrice() external view returns (uint256) {
        if (reserveA == 0) return 0;
        return (reserveB * 1e18) / reserveA;
    }

    /**
     * @dev Get LP share info for an address
     */
    function getLPInfo(address provider)
        external
        view
        returns (uint256 shares, uint256 sharePercent, uint256 tokenAValue, uint256 tokenBValue)
    {
        shares = lpShares[provider];
        if (totalLPShares == 0) return (0, 0, 0, 0);
        sharePercent = (shares * 10000) / totalLPShares; // In basis points
        tokenAValue = (shares * reserveA) / totalLPShares;
        tokenBValue = (shares * reserveB) / totalLPShares;
    }

    // ============ Internal Functions ============

    /**
     * @dev Calculate output amount using x*y=k formula with 0.3% fee
     * Formula: amountOut = (reserveOut * amountIn * 997) / (reserveIn * 1000 + amountIn * 997)
     */
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        internal
        pure
        returns (uint256)
    {
        require(amountIn > 0, "Zero input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient reserves");

        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;

        return numerator / denominator;
    }

    /**
     * @dev Calculate square root (Babylonian method)
     */
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}

