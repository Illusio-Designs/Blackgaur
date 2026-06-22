'use strict';

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { ok } = require('../lib/response');
const { auditLog } = require('../middleware/auditLogger');

const permissionsSchema = z.object({
  permissions: z
    .array(
      z.object({
        resource: z.string().min(1).max(60),
        action: z.string().min(1).max(20),
        scope: z.enum(['all', 'own', 'branch']).optional(),
      })
    )
    .min(0),
});

const createRoleSchema = z.object({
  name: z.string().min(2).max(60).regex(/^[a-z_]+$/, 'Use snake_case lowercase'),
  label: z.string().min(2).max(80),
  permissions: permissionsSchema.shape.permissions.optional(),
});

/** GET /roles */
async function list(_req, res) {
  const roles = await prisma.role.findMany({
    orderBy: { id: 'asc' },
    include: { permissions: true, _count: { select: { users: true } } },
  });
  const data = roles.map((r) => ({
    id: r.id,
    name: r.name,
    label: r.label,
    isSystem: r.isSystem,
    userCount: r._count.users,
    permissions: r.permissions.map((p) => ({ resource: p.resource, action: p.action, scope: p.scope })),
  }));
  return ok(res, data);
}

/** POST /roles */
async function create(req, res) {
  const b = req.body;
  const role = await prisma.role.create({
    data: {
      name: b.name,
      label: b.label,
      isSystem: false,
      permissions: b.permissions
        ? {
            create: b.permissions.map((p) => ({
              resource: p.resource,
              action: p.action,
              scope: p.scope || 'all',
            })),
          }
        : undefined,
    },
    include: { permissions: true },
  });
  await auditLog(req, 'role.created', 'roles', role.id, null, role, role.name);
  return ok(res, role, { status: 201 });
}

/** PUT /roles/:id/permissions — replace permission set */
async function updatePermissions(req, res) {
  const id = Number(req.params.id);
  const role = await prisma.role.findUnique({ where: { id }, include: { permissions: true } });
  if (!role) throw AppError.notFound('Role not found');

  const before = role.permissions.map((p) => ({ resource: p.resource, action: p.action, scope: p.scope }));
  const incoming = req.body.permissions;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    if (incoming.length) {
      await tx.rolePermission.createMany({
        data: incoming.map((p) => ({
          roleId: id,
          resource: p.resource,
          action: p.action,
          scope: p.scope || 'all',
        })),
      });
    }
    return tx.role.findUnique({ where: { id }, include: { permissions: true } });
  });

  await auditLog(
    req,
    'permission.updated',
    'roles',
    id,
    { permissions: before },
    { permissions: incoming },
    role.name
  );
  return ok(res, updated);
}

/** DELETE /roles/:id — only non-system roles */
async function remove(req, res) {
  const id = Number(req.params.id);
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) throw AppError.notFound('Role not found');
  if (role.isSystem) throw AppError.forbidden('System roles cannot be deleted');
  if (role._count.users > 0) throw AppError.conflict('Role still assigned to users');

  await prisma.role.delete({ where: { id } });
  await auditLog(req, 'role.deleted', 'roles', id, role, null, role.name);
  return ok(res, { id, deleted: true });
}

module.exports = {
  schemas: { permissionsSchema, createRoleSchema },
  list,
  create,
  updatePermissions,
  remove,
};
