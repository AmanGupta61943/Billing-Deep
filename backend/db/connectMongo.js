const mongoose = require('mongoose');

/**
 * Encode username/password in a MongoDB URI so special characters in passwords work.
 */
function encodeMongoCredentials(uri) {
  if (!uri || typeof uri !== 'string') return uri;
  return uri.replace(
    /^(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/i,
    (full, prefix, _srv, user, pass) => {
      let safe = pass;
      try {
        safe = encodeURIComponent(decodeURIComponent(pass));
      } catch {
        safe = encodeURIComponent(pass);
      }
      return `${prefix}${user}:${safe}@`;
    }
  );
}

/** Ensure Atlas-friendly query params (retryWrites, w) */
function ensureMongoQueryParams(uri) {
  if (!uri || !uri.includes('mongodb+srv')) return uri;
  const qIndex = uri.indexOf('?');
  const base = qIndex === -1 ? uri : uri.slice(0, qIndex);
  const queryStr = qIndex === -1 ? '' : uri.slice(qIndex + 1);
  const params = new URLSearchParams(queryStr);
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  if (!params.has('w')) params.set('w', 'majority');
  return `${base}?${params.toString()}`;
}

function mongoUriMissingDatabaseName(uri) {
  const base = String(uri).split('?')[0];
  const afterHost = base.replace(/^mongodb(\+srv)?:\/\/[^/]+/i, '');
  return !/^\/[^/]+/.test(afterHost);
}

/**
 * @param {object} opts
 * @param {string} opts.mongoUriForConnect
 * @param {boolean} opts.usingDefaultMongo
 * @param {string} opts.dbName
 * @param {number} [opts.maxAttempts=6]
 * @param {number} [opts.delayMs=3000]
 */
async function connectMongo({
  mongoUriForConnect,
  usingDefaultMongo,
  dbName,
  maxAttempts = 6,
  delayMs = 3000,
}) {
  let uri = String(mongoUriForConnect).trim();
  uri = encodeMongoCredentials(uri);
  uri = ensureMongoQueryParams(uri);

  const mongooseOptions = {
    serverSelectionTimeoutMS: 20000,
    maxPoolSize: 10,
  };
  if (!usingDefaultMongo && mongoUriMissingDatabaseName(uri)) {
    mongooseOptions.dbName = dbName;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        return { ok: true, uriUsed: uri };
      }
      await mongoose.connect(uri, mongooseOptions);
      const name = mongoose.connection?.db?.databaseName;
      console.log('Connected to MongoDB', name ? `(database: ${name})` : '');
      return { ok: true, uriUsed: uri };
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed:`,
        err.message || err
      );
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      } catch {
        // ignore
      }
      if (attempt === maxAttempts) {
        console.error(
          '[hint] Atlas: whitelist IP (Network Access), verify DB user/password, cluster not paused. Local: run mongod or fix MONGODB_URI.'
        );
        return { ok: false, error: err, uriUsed: uri };
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return { ok: false, uriUsed: uri };
}

module.exports = {
  connectMongo,
  encodeMongoCredentials,
  ensureMongoQueryParams,
  mongoUriMissingDatabaseName,
};
