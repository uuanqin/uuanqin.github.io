// 分数转成星星
function tostar(num) {
    let tmp = ''
    // console.log("星星",num)
    for (let i = 0; i < Math.floor(num); i++) {
        tmp += '<i class="fa-solid fa-star"></i>'
    } // 整数部分加实心星星
    if (num - Math.floor(num) !== 0) tmp += '<i class="fa-solid fa-star-half-alt"></i>' // 小数部分转成半星
    for (let i = 0; i < 5 - Math.ceil(num); i++) {
        tmp += '<i class="fa-regular fa-star"></i>'
    } // 不够5个补空心星星
    return tmp
}

document.querySelectorAll(".art-grade").forEach(block => {
    const value = parseFloat(block.getAttribute("data-value"));
    // console.log("星星",num)
    block.innerHTML = tostar(value);
});

