let style = document.createElement('style')
let graySelector = 'gray-filter'
style.setAttribute('type', 'text/css')
style.textContent = `.${graySelector}{
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);
  -ms-filter: grayscale(100%);
  -o-filter: grayscale(100%);
  filter: grayscale(100%);
  filter: gray;
  filter: progid:dximagetransform.microsoft.basicimage(grayscale=1);
}`
document.head.appendChild(style)

let root = document.querySelector('html')
url = window.location.pathname
toggleClassName(root,graySelector)

function toggleClassName(el,name){
    if(url==="/p/26a31d07/") // 指定你要变灰的网页
        el.className = [el.className, name].join(' ')
}
