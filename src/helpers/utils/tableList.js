export const getVisualDataFromAttr = function (attr, item) {
    function getValueByPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }
    let pathData = ""
    if (attr.path.includes('.')) pathData = getValueByPath(item, attr.path)
    else pathData = item[attr.path] ?? "_"
    if (typeof (pathData) == typeof ("")) return pathData
    if (typeof (pathData) == typeof ({})) return pathData?.str
    if (!pathData) pathData = "_"
    return pathData
}