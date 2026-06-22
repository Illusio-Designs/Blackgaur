'use strict';

const axios = require('axios');
const dayjs = require('dayjs');
const { nanoid } = require('nanoid');
const prisma = require('../lib/prisma');
const env = require('../config/env');

const MSG91_BASE = 'https://api.msg91.com/api/v5';

/**
 * Generate a 6-digit OTP (used in stub mode).
 */
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Request an OTP for a mobile number (TMS Architecture §3.1).
 * Real mode: POST MSG91 flow API. Stub mode (no MSG91_AUTH_KEY): log OTP, store in DB.
 *
 * @param {string} mobile 10-digit Indian mobile
 * @param {string} [ip]
 * @returns {Promise<{ requestId: string, stub: boolean }>}
 */
async function requestOtp(mobile, ip) {
  const expiresAt = dayjs().add(env.OTP_EXPIRY_SEC, 'second').toDate();

  if (env.flags.msg91) {
    // Real MSG91 Flow API call. The flow template injects {{otp}} server-side.
    const resp = await axios.post(
      `${MSG91_BASE}/otp`,
      {
        template_id: env.MSG91_FLOW_ID,
        mobile: `91${mobile}`,
        sender: env.MSG91_SENDER_ID,
        DLT_TE_ID: env.MSG91_DLT_TE_ID || undefined,
        otp_expiry: Math.ceil(env.OTP_EXPIRY_SEC / 60),
      },
      { headers: { authkey: env.MSG91_AUTH_KEY }, timeout: 10000 }
    );
    const requestId = (resp.data && (resp.data.request_id || resp.data.requestId)) || nanoid();
    await prisma.otpSession.create({
      data: { mobile, msg91RequestId: requestId, otpCode: null, expiresAt, ipAddress: ip || null },
    });
    return { requestId, stub: false };
  }

  // ── Stub mode ──
  const otp = genOtp();
  const requestId = `stub_${nanoid(12)}`;
  await prisma.otpSession.create({
    data: { mobile, msg91RequestId: requestId, otpCode: otp, expiresAt, ipAddress: ip || null },
  });
  // eslint-disable-next-line no-console
  console.log(`[msg91:stub] OTP for ${mobile} = ${otp} (requestId=${requestId})`);
  return { requestId, stub: true };
}

/**
 * Verify an OTP (TMS Architecture §3.1 step 6).
 * Real mode: GET MSG91 verify. Stub mode: accept stored OTP, or any 6-digit in dev.
 *
 * @param {string} mobile
 * @param {string} otp
 * @param {string} [requestId]
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
async function verifyOtp(mobile, otp, requestId) {
  const session = await prisma.otpSession.findFirst({
    where: {
      mobile,
      isVerified: false,
      ...(requestId ? { msg91RequestId: requestId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!session) return { ok: false, reason: 'No active OTP session' };
  if (dayjs(session.expiresAt).isBefore(dayjs())) return { ok: false, reason: 'OTP expired' };
  if (session.attempts >= env.OTP_MAX_ATTEMPTS) return { ok: false, reason: 'Max attempts exceeded' };

  await prisma.otpSession.update({
    where: { id: session.id },
    data: { attempts: { increment: 1 } },
  });

  let verified = false;

  if (env.flags.msg91) {
    try {
      const resp = await axios.get(`${MSG91_BASE}/otp/verify`, {
        params: { mobile: `91${mobile}`, otp },
        headers: { authkey: env.MSG91_AUTH_KEY },
        timeout: 10000,
      });
      verified = resp.data && String(resp.data.type).toLowerCase() === 'success';
    } catch (_e) {
      verified = false;
    }
  } else {
    // Stub: match stored OTP, or accept any 6-digit when running in dev.
    if (session.otpCode && session.otpCode === otp) verified = true;
    else if (!env.isProd && /^\d{6}$/.test(String(otp))) verified = true;
  }

  if (!verified) return { ok: false, reason: 'Invalid OTP' };

  await prisma.otpSession.update({
    where: { id: session.id },
    data: { isVerified: true, verifiedAt: new Date() },
  });
  return { ok: true };
}

module.exports = { requestOtp, verifyOtp };
