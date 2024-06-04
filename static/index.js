window.onload = function() {
    // Codemirror 초기화
    var editor = CodeMirror.fromTextArea(document.getElementById("python-code"), {
        mode: { name: "python", version: 3, singleLineStringErrors: false },
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        theme: "monokai"
    });
    editor.getWrapperElement().style.fontSize = "20px";
    
    const textEncoder = new TextEncoderStream();
    const textDecoder = new TextDecoderStream();
    const reader = textDecoder.readable.getReader();
    const writer = textEncoder.writable.getWriter();
    const command = document.getElementById('command');
    const result = document.getElementById('result');
    const send = document.getElementById('send');
    
    send.addEventListener('click', async () => {
    console.log(editor.getValue())
    await writer.write(editor.getValue());
    send.disabled = true;
    
    setTimeout(()=> {
       send.disabled = false;
    }, 3000);
    });
    
    document.getElementById('connect').addEventListener('click', async () => {
    
    /*
     const filters = [
      { usbVendorId: 0x2341, usbProductId: 0x0043 },
      { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];
    const port = await navigator.serial.requestPort({ filters });
    */
    const port = await navigator.serial.requestPort();      
    const { productId, vendorId } = port.getInfo();
    console.log(productId, vendorId);
    
    // Wait for the serial port to open.
    await port.open({ baudRate: 115200 });
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // 나중에 시리얼 포트가 닫힐 수 있도록 해준다.
        reader.releaseLock();
        break;
      }
    
      if (value) {
        document.getElementById("output").innerText = value;
        console.log(value);
      }
    }
    });
    
    if ("serial" in navigator) alert("Your browser supports Web Serial API!");
    else document.getElementById("output").innerText = alert("Your browser does not support Web Serial API, the latest version of Google Chrome is recommended!");
}
