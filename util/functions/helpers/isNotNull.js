var $; if (!$)$ = {};

/**
 * Returns true if el is not null.
 *
 * @param obj Object to verify nullity
 * @returns {boolean} True if object is not null
 */
$.isNotNull = function isNotNull(obj) {
    return obj != null;
};