module.exports = function optionalAccess(obj, path, def) {
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