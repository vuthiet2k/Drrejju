export const buildStructure = (data) => {
    if (!data || !Array.isArray(data)) return [];

    const nodeMap = {};
    const rootNodes = [];

    // 1. Khởi tạo nodeMap
    data.forEach((item) => {
        nodeMap[item.id] = { id: item.id, children: [], ...item };
    });

    // 2. Xây dựng cây
    data.forEach((item) => {
        const path = item.tree_path || ""; // nếu không có thì dùng chuỗi rỗng
        const pathSegments = path.split("/").filter((seg) => seg);

        if (pathSegments.length > 1) {
            const parentId = pathSegments[pathSegments.length - 2];
            const parentNode = nodeMap[parentId];

            if (parentNode) {
                parentNode.children.push(nodeMap[item.id]);
            } else {
                // Cha không tồn tại → coi như nút gốc
                rootNodes.push(nodeMap[item.id]);
            }
        } else {
            // Không có tree_path hoặc chỉ có chính nó → nút gốc
            rootNodes.push(nodeMap[item.id]);
        }
    });

    return rootNodes;
};
