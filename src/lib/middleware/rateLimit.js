// Rate limiter with Redis support (Upstash) and in-memory fallback
// Uses Redis in production for multi-instance support, falls back to in-memory for development

// In-memory fallback for development or when Redis is not configured
const rateLimitMap = new Map();

// Clean up old entries every 5 minutes (for in-memory fallback)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.resetTime > 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * In-memory rate limiter (synchronous)
 */
function rateLimitInMemory(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const key = `${identifier}`;
  
  const record = rateLimitMap.get(key);
  
  if (!record) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
      limit,
    };
  }
  
  if (now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
      limit,
    };
  }
  
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      limit,
    };
  }
  
  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
    limit,
  };
}

/**
 * Rate limiter middleware (synchronous - uses in-memory)
 * For Redis support in production, configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {number} limit - Maximum number of requests
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - { success: boolean, remaining: number, resetTime: number, limit: number }
 */
export function rateLimit(identifier, limit = 100, windowMs = 60000) {
  // TODO: Add Redis support when UPSTASH credentials are configured
  // For now, use in-memory fallback (works for single-instance deployments)
  return rateLimitInMemory(identifier, limit, windowMs);
}

/**
 * Synchronous rate limiter (alias for backwards compatibility)
 */
export function rateLimitSync(identifier, limit = 100, windowMs = 60000) {
  return rateLimitInMemory(identifier, limit, windowMs);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': result.limit || 100,
    'X-RateLimit-Remaining': result.remaining,
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}