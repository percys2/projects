// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

const rateLimitMap = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.resetTime > 0) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {number} limit - Maximum number of requests
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - { success: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const key = `${identifier}`;
  
  const record = rateLimitMap.get(key);
  
  if (!record) {
    // First request
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }
  
  if (now > record.resetTime) {
    // Window expired, reset
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }
  
  if (record.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  // Increment count
  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
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
