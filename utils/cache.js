const cache = require('memory-cache');

exports.getCacheData = (cacheKey) => {
    const result = cache.get(cacheKey);
    return result;
}

exports.setCacheData = (cacheKey, data, duration) => {
    const result = cache.put(cacheKey, data, duration);
    return result;
}