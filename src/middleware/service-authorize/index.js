import _ from 'lodash';
import ForbiddenError from './ForbiddenError';

/**
 * Middleware for authorising routes.
 * This middleware expects an authentication middleware to have executed before this middleware
 * which has set an object containing permissions on the request object.
 *
 * @param {object} options - Options for the middleware.
 * @param {Array|string} [options.permissionPath='user.permission'] - Define where to find the permissions value.
 *                                                                    Uses 'lodash.get' syntax. Defaults to 'user.permission'.
 */
export default (options={}) => {

  function middleware(req, res, next) {
    const permission = _.get(req, options.permissionPath || 'user.permission', false);
    if (!permission) {
      return next(new ForbiddenError('No permission'));
    }

    next(null);
  }

  return middleware;
};