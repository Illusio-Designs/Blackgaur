'use strict';

const crypto = require('crypto');
const env = require('../config/env');

const ALGO = 'aes-256-gcm';
const IV_LEN = 12; // GCM recommended IV length

/** Resolve the 32-byte key from hex env. Falls back to a derived dev key. */
function getKey() {
  const hex = env.ENCRYPTION_KEY || '';
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return Buffer.from(hex, 'hex');
  }
  // Dev fallback: derive a deterministic 32-byte key so the app boots without config.
  return crypto.createHash('sha256').update(hex || 'blackgaur-dev-key').digest();
}

/**
 * AES-256-GCM encrypt. Returns "ivHex:tagHex:cipherHex".
 * @param {string} plaintext
 */
function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

/**
 * AES-256-GCM decrypt of value produced by encrypt(). Returns null on malformed input.
 * @param {string} payload
 */
function decrypt(payload) {
  if (!payload || typeof payload !== 'string' || !payload.includes(':')) return null;
  const [ivHex, tagHex, dataHex] = payload.split(':');
  if (!ivHex || !tagHex || !dataHex) return null;
  try {
    const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const dec = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return dec.toString('utf8');
  } catch (_e) {
    return null;
  }
}

/**
 * Mask a card number to ****1234 form (TMS Architecture §7, §17.3).
 * @param {string} value plaintext card number
 */
function mask(value) {
  if (!value) return null;
  const s = String(value).replace(/\s+/g, '');
  if (s.length <= 4) return '****';
  return `****${s.slice(-4)}`;
}

/** Extract last 4 digits of plaintext for storage/index. */
function last4(value) {
  if (!value) return null;
  const s = String(value).replace(/\s+/g, '');
  return s.slice(-4);
}

module.exports = { encrypt, decrypt, mask, last4 };
