export function printCanvas(canvas: HTMLCanvasElement): void {
  const dataUrl = canvas.toDataURL("image/png");
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`<!doctype html><html><head><title>Print</title>
    <style>
      @page { margin: 6mm; }
      html, body { margin: 0; padding: 0; background: white; }
      .wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      img { max-width: 100%; max-height: calc(100vh - 12mm); display: block; }
    </style>
    </head><body><div class="wrap"><img alt="Print sheet" src="${dataUrl}" /></div></body></html>`);
  doc.close();

  const img = doc.querySelector("img");
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1500);
    }
  };

  if (!img) {
    triggerPrint();
    return;
  }

  if (img.complete) {
    triggerPrint();
  } else {
    img.addEventListener("load", triggerPrint, { once: true });
  }
}