import { createPublicClient, http, Address, Hash } from 'viem';
import { base } from 'viem/chains';

// $CLAWNCH token address on Base
export const CLAWNCH_TOKEN_ADDRESS =
  '0xa1F72459dfA10BAD200Ac160eCd78C6b77a747be' as Address;

// Create Base public client
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Verify a transaction on Base blockchain
 */
export async function verifyTransaction(
  txHash: string
): Promise<{
  verified: boolean;
  from?: string;
  to?: string;
  value?: string;
  error?: string;
}> {
  try {
    const transaction = await publicClient.getTransaction({
      hash: txHash as Hash,
    });

    if (!transaction) {
      return {
        verified: false,
        error: 'Transaction not found',
      };
    }

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as Hash,
    });

    if (!receipt) {
      return {
        verified: false,
        error: 'Transaction receipt not found',
      };
    }

    // Check if transaction succeeded
    if (receipt.status !== 'success') {
      return {
        verified: false,
        error: 'Transaction failed',
      };
    }

    return {
      verified: true,
      from: transaction.from,
      to: transaction.to || undefined,
      value: transaction.value.toString(),
    };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(
  address: string,
  tokenAddress: string = CLAWNCH_TOKEN_ADDRESS
): Promise<{
  balance: string;
  error?: string;
}> {
  try {
    const balance = await publicClient.readContract({
      address: tokenAddress as Address,
      abi: [
        {
          constant: true,
          inputs: [
            {
              name: '_owner',
              type: 'address',
            },
          ],
          name: 'balanceOf',
          outputs: [
            {
              name: 'balance',
              type: 'uint256',
            },
          ],
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [address as Address],
    }) as bigint;

    return {
      balance: balance.toString(),
    };
  } catch (error) {
    return {
      balance: '0',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current gas price on Base
 */
export async function getGasPrice(): Promise<{
  gasPrice: string;
  error?: string;
}> {
  try {
    const gasPrice = await publicClient.getGasPrice();

    return {
      gasPrice: gasPrice.toString(),
    };
  } catch (error) {
    return {
      gasPrice: '0',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get block number
 */
export async function getBlockNumber(): Promise<{
  blockNumber: number;
  error?: string;
}> {
  try {
    const blockNumber = await publicClient.getBlockNumber();

    return {
      blockNumber: Number(blockNumber),
    };
  } catch (error) {
    return {
      blockNumber: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
