{
  const fpsMeterScript = document.createElement("script");
  fpsMeterScript.type = "text/javascript";
  fpsMeterScript.src = "js/libs/fpsmeter.js";

  if (document.head) document.head.appendChild(fpsMeterScript);
  else if (document.body) document.body.appendChild(fpsMeterScript);
}

var global = globalThis;
