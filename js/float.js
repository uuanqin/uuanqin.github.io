// 漂浮物
// 新增函数 
// 首先获取 Url，然后把 Url 通过 // 截成两部分，再从后一部分中截取相对路径。如果截取到的相对路径中有参数，则把参数去掉。
// 获取相对路径
function GetUrlRelativePath()
{
    var url = document.location.toString();
    var arrUrl = url.split("//");

    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start);//stop省略，截取从start开始到结尾的所有字符

    if(relUrl.indexOf("?") != -1){
        relUrl = relUrl.split("?")[0];
    }
    return relUrl;
}
var allowAll = false; // true 则允许所有网页存在漂浮物
// 允许显示漂浮物的网址列表
var urlAllowList = [
    "/pages/friends/", // 友链页
    "/p/28a4bfe2/", // 这是介绍 float的那篇文章
]

var isAllowFloat = false;   // 全局变量，允许使用漂浮特效

// 判断
function decide(){
    isAllowFloat = true;
    if(!allowAll){
        // 判断当前页面是否为指定页面
        var url = GetUrlRelativePath();
        var i = 0;
        for(;i<urlAllowList.length;i++){
            if(url===urlAllowList[i]){
                // console.log(i);
                isAllowFloat = true;
                break;
            }
        }
        if(i===urlAllowList.length){
            isAllowFloat = false;
        }
    }
    // console.log(isAllowFloat)
    if(isAllowFloat)startFloat();
}

var stop, staticx;
var img = new Image();
img.src = "/image/star_float.png"; // 图片

function Float(x, y, s, r, fn) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.r = r;
    this.fn = fn;
}

Float.prototype.draw = function(cxt) {
    cxt.save();
    var xc = 40 * this.s / 4;
    cxt.translate(this.x, this.y);
    cxt.rotate(this.r);
    cxt.drawImage(img, 0, 0, 35 * this.s, 35 * this.s)
    //漂浮物大小
    cxt.restore();
}

Float.prototype.update = function() {
    this.x = this.fn.x(this.x, this.y);
    this.y = this.fn.y(this.y, this.y);
    this.r = this.fn.r(this.r);
    if (this.x > window.innerWidth || this.x < 0 || this.y > window.innerHeight || this.y < 0) {
        this.r = getRandom('fnr');
        if (Math.random() > 0.4) {
            this.x = getRandom('x');
            this.y = 0;
            this.s = getRandom('s');
            this.r = getRandom('r');
        } else {
            this.x = window.innerWidth;
            this.y = getRandom('y');
            this.s = getRandom('s');
            this.r = getRandom('r');
        }
    }
}

FloatList = function() {
    this.list = [];
}
FloatList.prototype.push = function(float) {
    this.list.push(float);
}
FloatList.prototype.update = function() {
    for (var i = 0, len = this.list.length; i < len; i++) {
        this.list[i].update();
    }
}
FloatList.prototype.draw = function(cxt) {
    for (var i = 0, len = this.list.length; i < len; i++) {
        this.list[i].draw(cxt);
    }
}
FloatList.prototype.get = function(i) {
    return this.list[i];
}
FloatList.prototype.size = function() {
    return this.list.length;
}

function getRandom(option) {
    var ret, random;
    switch (option) {
    case 'x':
        ret = Math.random() * window.innerWidth;
        break;
    case 'y':
        ret = Math.random() * window.innerHeight;
        break;
    case 's':
        ret = Math.random();
        break;
    case 'r':
        ret = Math.random() * 6;
        break;
    case 'fnx':
        random = -0.5 + Math.random() * 1;
        ret = function(x, y) {
            return x + 0.5 * random - 0.6;
            //x轴速度
        }
        ;
        break;
    case 'fny':
        random = 0.8 + Math.random() * 0.7
        //y轴速度
        ret = function(x, y) {
            return y + random;
        }
        ;
        break;
    case 'fnr':
        random = Math.random() * 0.03;
        ret = function(r) {
            return r + random;
        }
        ;
        break;
    }
    return ret;
}

function startFloat() {

    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
    var canvas = document.createElement('canvas'), cxt;
    staticx = true;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;');
    canvas.setAttribute('id', 'canvas_float');
    document.getElementsByTagName('body')[0].appendChild(canvas);
    cxt = canvas.getContext('2d');
    var floatList = new FloatList();
    for (var i = 0; i < 10; i++) {
        //漂浮物数量
        var float, randomX, randomY, randomS, randomR, randomFnx, randomFny;
        randomX = getRandom('x');
        randomY = getRandom('y');
        randomR = getRandom('r');
        randomS = getRandom('s');
        randomFnx = getRandom('fnx');
        randomFny = getRandom('fny');
        randomFnR = getRandom('fnr');
        float = new Float(randomX,randomY,randomS,randomR,{
            x: randomFnx,
            y: randomFny,
            r: randomFnR
        });
        float.draw(cxt);
        floatList.push(float);
    }
    stop = requestAnimationFrame(function() {
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        floatList.update();
        floatList.draw(cxt);
        stop = requestAnimationFrame(arguments.callee);
    })
}

window.onresize = function() {
    if(!isAllowFloat)return;
    var canvasSnow = document.getElementById('canvas_float');
    canvasSnow.width = window.innerWidth;
    canvasSnow.height = window.innerHeight;
}

function stopp(e) {
    if (!e && document.getElementById("canvas_float")) {
        var child = document.getElementById("canvas_float");
        child.parentNode.removeChild(child);
        window.cancelAnimationFrame(stop);
    } else if (e && !document.getElementById("canvas_float")) {
        decide();
    }
}

window.addEventListener("DOMContentLoaded",decide);