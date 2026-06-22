'use strict';

/**
 * Blackgaur TMS seed (idempotent).
 * - 5 system roles with the full permission matrix (TMS Architecture §2.2)
 * - one default branch
 * - one admin user
 *
 * Run: npm run seed
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const SEED_ADMIN_MOBILE = process.env.SEED_ADMIN_MOBILE || '9000000001';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'System Administrator';

const ROLES = [
  { name: 'admin', label: 'Administrator' },
  { name: 'trip_manager', label: 'Trip Manager' },
  { name: 'finance_manager', label: 'Finance Manager' },
  { name: 'account_manager', label: 'Account Manager' },
  { name: 'driver', label: 'Driver' },
];

/**
 * Permission matrix expanded from §2.2.
 * Each entry => array of { resource, action, scope }.
 */
function permsFor(role) {
  const crud = (resource, scope = 'all', extra = []) => [
    { resource, action: 'create', scope },
    { resource, action: 'read', scope },
    { resource, action: 'update', scope },
    { resource, action: 'delete', scope },
    ...extra.map((action) => ({ resource, action, scope })),
  ];
  const read = (resource, scope = 'all') => [{ resource, action: 'read', scope }];

  switch (role) {
    case 'admin':
      return [
        ...crud('users'),
        ...crud('roles'),
        ...crud('trips'),
        ...crud('vehicles'),
        ...crud('drivers'),
        ...crud('trip_expenses', 'all', ['approve']),
        ...crud('fastag_wallets', 'all', ['recharge', 'reconcile']),
        ...read('fastag_transactions').concat([{ resource: 'fastag_transactions', action: 'export', scope: 'all' }]),
        ...crud('fuel_cards', 'all', ['assign']),
        ...read('fuel_transactions').concat([{ resource: 'fuel_transactions', action: 'export', scope: 'all' }]),
        ...crud('invoices', 'all', ['approve']),
        ...crud('clients'),
        ...crud('lr'),
        { resource: 'reports', action: 'read', scope: 'all' },
        { resource: 'audit_logs', action: 'read', scope: 'all' },
      ];

    case 'trip_manager':
      return [
        ...crud('trips'),
        ...crud('vehicles'),
        ...crud('drivers'),
        { resource: 'trip_expenses', action: 'create', scope: 'all' },
        { resource: 'trip_expenses', action: 'read', scope: 'all' },
        ...read('fastag_wallets'),
        ...read('fastag_transactions'),
        ...read('fuel_cards'),
        ...read('fuel_transactions'),
        ...read('clients'),
        ...crud('lr'),
        { resource: 'reports', action: 'read', scope: 'all' },
      ];

    case 'finance_manager':
      return [
        ...read('trips'),
        ...read('vehicles'),
        { resource: 'trip_expenses', action: 'read', scope: 'all' },
        { resource: 'trip_expenses', action: 'approve', scope: 'all' },
        ...read('fastag_wallets').concat([{ resource: 'fastag_wallets', action: 'reconcile', scope: 'all' }]),
        ...read('fastag_transactions').concat([{ resource: 'fastag_transactions', action: 'export', scope: 'all' }]),
        ...read('fuel_cards').concat([{ resource: 'fuel_cards', action: 'reconcile', scope: 'all' }]),
        ...read('fuel_transactions').concat([{ resource: 'fuel_transactions', action: 'export', scope: 'all' }]),
        ...crud('invoices', 'all', ['approve']),
        ...read('clients'),
        ...read('lr'),
        { resource: 'reports', action: 'read', scope: 'all' },
      ];

    case 'account_manager':
      return [
        ...read('trips'),
        ...crud('invoices'),
        ...crud('clients'),
        ...crud('lr'),
        { resource: 'reports', action: 'read', scope: 'all' },
      ];

    case 'driver':
      return [
        { resource: 'trips', action: 'read', scope: 'own' },
        { resource: 'trips', action: 'update', scope: 'own' },
        { resource: 'trip_expenses', action: 'create', scope: 'own' },
        { resource: 'trip_expenses', action: 'read', scope: 'own' },
        { resource: 'lr', action: 'read', scope: 'own' },
      ];

    default:
      return [];
  }
}

async function main() {
  // ── Branch ──
  const branch = await prisma.branch.upsert({
    where: { code: 'HO' },
    update: {},
    create: {
      name: 'Head Office',
      code: 'HO',
      city: 'Ahmedabad',
      state: 'Gujarat',
      stateCode: process.env.COMPANY_STATE_CODE || '24',
      address: process.env.COMPANY_ADDRESS || 'Ahmedabad, Gujarat',
    },
  });
  console.log(`[seed] branch: ${branch.name} (#${branch.id})`);

  // ── Roles + permissions ──
  const roleByName = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { label: r.label, isSystem: true },
      create: { name: r.name, label: r.label, isSystem: true },
    });
    roleByName[r.name] = role;

    // Reset + re-create the permission set idempotently.
    const perms = permsFor(r.name);
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (perms.length) {
      // Dedupe by resource+action (keep widest scope precedence: all > branch > own already implied by data).
      const seen = new Set();
      const data = [];
      for (const p of perms) {
        const key = `${p.resource}:${p.action}`;
        if (seen.has(key)) continue;
        seen.add(key);
        data.push({ roleId: role.id, resource: p.resource, action: p.action, scope: p.scope || 'all' });
      }
      await prisma.rolePermission.createMany({ data });
    }
    console.log(`[seed] role: ${role.name} (${perms.length} perms)`);
  }

  // ── Admin user ──
  const admin = await prisma.user.upsert({
    where: { mobile: SEED_ADMIN_MOBILE },
    update: { roleId: roleByName.admin.id, isActive: true, deletedAt: null },
    create: {
      name: SEED_ADMIN_NAME,
      mobile: SEED_ADMIN_MOBILE,
      roleId: roleByName.admin.id,
      branchId: branch.id,
      languagePref: 'en',
      isActive: true,
    },
  });
  console.log(`[seed] admin user: ${admin.name} (${admin.mobile}) #${admin.id}`);

  console.log('[seed] done.');
}

main()
  .catch((e) => {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
