// 用于解决遮挡问题

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有 .aclass 元素
    const aclassElements = document.querySelectorAll('.table-wrap');

    aclassElements.forEach(function(tableWrapElement) {
        // 检查 .aclass 元素是否包含 .b 类的 span 元素
        if (tableWrapElement.querySelector('span.yukari')) {
            // 如果包含，则设置 overflow: visible;
            tableWrapElement.style.overflow = 'visible';
        }
    });
});