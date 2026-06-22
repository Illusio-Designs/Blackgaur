'use strict';

const AppError = require('../lib/AppError');

/**
 * RBAC guard factory (TMS Architecture §2, §5).
 * Permissions in the JWT are strings of the form "resource:action" or
 * "resource:action:scope". A bare "resource:action" implies scope "all".
 *
 * The resolved scope is attached to req.permissionScope so controllers can
 * narrow queries (own / branch / all).
 *
 * @param {string} resource
 * @param {string} action
 * @returns {import('express').RequestHandler}
 */
function hasPermission(resource, action) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());

    const perms = req.user.permissions || [];
    let matchedScope = null;

    for (const p of perms) {
      const [r, a, s] = String(p).split(':');
      if (r === resource && a === action) {
        matchedScope = s || 'all';
        break;
      }
    }

    if (!matchedScope) {
      return next(
        AppError.forbidden(`Missing permission: ${resource}:${action}`)
      );
    }

    req.permissionScope = matchedScope;
    return next();
  };
}

/**
 * Returns true if the user holds the given resource:action regardless of scope.
 * Useful inside controllers for conditional fields (e.g. admin-only card last4).
 */
function userHasPermission(req, resource, action) {
  const perms = (req.user && req.user.permissions) || [];
  return perms.some((p) => {
    const [r, a] = String(p).split(':');
    return r === resource && a === action;
  });
}

module.exports = hasPermission;
module.exports.userHasPermission = userHasPermission;
