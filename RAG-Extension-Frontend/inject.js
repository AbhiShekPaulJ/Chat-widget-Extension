if (!document.getElementById("rag-extension-root")) {

  // FLOATING BUTTON
  const btn = document.createElement("button");
  btn.innerText = "💬";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.zIndex = "999999";
  btn.style.padding = "12px";
  btn.style.borderRadius = "50%";
  btn.style.border = "none";
  btn.style.background = "#2563eb";
  btn.style.color = "white";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

  document.body.appendChild(btn);

  // CHAT IFRAME (HIDDEN INITIALLY)
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("client/dist/index.html");

  iframe.style.position = "fixed";
  iframe.style.bottom = "80px";
  iframe.style.right = "20px";
  iframe.style.width = "400px";
  iframe.style.height = "550px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "10px";
  iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
  iframe.style.zIndex = "999999";
  iframe.style.display = "none";

  document.body.appendChild(iframe);

  // TOGGLE
  let open = false;

  btn.onclick = () => {
    iframe.style.display = open ? "none" : "block";
    open = !open;
  };
}