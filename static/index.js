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

    function changeFontSize() {
        var fontSize = document.getElementById("font-size").value + "px";
        editor.getWrapperElement().style.fontSize = fontSize;
        editor.refresh();
    }
    
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
    console.log('Machine:', productId, vendorId);

    await port.open({ baudRate: 1000000  });
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // 스트림이 끝났을 때
          console.log("Serial port closed");
          break;
        }
        // 받은 데이터 처리
        if (value) {
          output.innerText += value;
          output.scrollTop = output.scrollHeight;
          console.log("Received:", value);
        }
      }
    } catch (error) {
      console.error("Error reading from serial port:", error);
    } finally {
      reader.releaseLock();
      writer.releaseLock();
      await port.close();
    }  
  });

  if ("serial" in navigator) console.log("Your browser supports Web Serial API!");
  else document.getElementById("output").innerText = alert("Your browser does not support Web Serial API, the latest version of Google Chrome is recommended!");
}
