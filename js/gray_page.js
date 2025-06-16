let style=document.createElement('style'),graySelector='gray-filter',root=(style.setAttribute('type','text/css'),style.textContent=`.${graySelector}{
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);
  -ms-filter: grayscale(100%);
  -o-filter: grayscale(100%);
  filter: grayscale(100%);
  filter: gray;
  filter: progid:dximagetransform.microsoft.basicimage(grayscale=1);
}`,document.head.appendChild(style),document.querySelector('html'));function toggleClassName(el,name){'/p/26a31d07/'===url&&(el.className=[el.className,name].join(' '))}url=window.location.pathname,toggleClassName(root,graySelector);