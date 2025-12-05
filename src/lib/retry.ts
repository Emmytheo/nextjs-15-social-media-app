/**
 * Retry utility with exponential backoff for handling transient failures
 * Particularly useful for database operations and network requests
 */

interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 500) */
  initialDelay?: number;
  /** Backoff multiplier for each retry (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number;
  /** Custom function to determine if error is retryable */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Check if an error is related to database connectivity or transient issues
 */
function isDatabaseError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();
  const errorCode = (error as any).code as string | undefined;

  // Common database connection errors
  const connectionErrors = [
    'econnreset',
    'econnrefused',
    'etimedout',
    'enotfound',
    'connection',
    'timeout',
    'deadlock',
    'lock wait timeout',
    'too many connections',
    'unable to connect',
    'connection pool',
  ];

  // Check error code or message
  if (errorCode) {
    const code = errorCode.toLowerCase();
    if (connectionErrors.some((err) => code.includes(err))) {
      return true;
    }
  }

  return connectionErrors.some((err) => errorMessage.includes(err));
}

/**
 * Execute a function with retry logic and exponential backoff
 * 
 * @example
 * ```ts
 * const result = await withRetry(
 *   async () => await prisma.user.findUnique({ where: { id: '123' } }),
 *   { maxAttempts: 3, initialDelay: 500 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 500,
    backoffMultiplier = 2,
    maxDelay = 10000,
    shouldRetry = isDatabaseError,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!shouldRetry(error)) {
        console.warn('[Retry] Non-retryable error encountered:', error);
        throw error;
      }

      // Add jitter to prevent thundering herd (±25% random variation)
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      const delayWithJitter = Math.min(delay + jitter, maxDelay);

      console.warn(
        `[Retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${Math.round(delayWithJitter)}ms...`,
        error instanceof Error ? error.message : error
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayWithJitter));

      // Exponential backoff for next attempt
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  // All attempts failed
  console.error(
    `[Retry] All ${maxAttempts} attempts failed. Last error:`,
    lastError
  );
  throw lastError;
}

/**
 * Wrapper around withRetry specifically for Prisma operations
 * Uses database-specific error detection
 */
export async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return withRetry(fn, {
    maxAttempts,
    initialDelay: 500,
    backoffMultiplier: 2,
    shouldRetry: isDatabaseError,
  });
}
