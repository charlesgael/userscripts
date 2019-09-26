var $; if (!$)$ = {};

/**
 * Access inside an object null-safe way with default value.
 *
 * @param obj Object to query
 * @param path Path to required attribute
 * @param def Default value
 * @returns {object} Property found
 */
$.optionalAccess = function optionalAccess(obj, path, def) {
    const groups = [...path.matchAll(/\[([^\]]+)\]/gm)]
        .map(x=>x[1]);
    let pathWithGroups = groups
        .reduce((acc, el, idx)=>acc.replace(`[${el}]`, `.$${idx}`), path);
    if (pathWithGroups.startsWith('.')) pathWithGroups = pathWithGroups.substring(1);
    return pathWithGroups
        .split('.')
        .map(x=>x.startsWith('$') ? groups[x.substr(1)] : x)
        .reduce((acc, prop) => acc[prop] || def, obj);
};