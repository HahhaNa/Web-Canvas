// 總畫布
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let hasInput = false;

// 設定畫筆屬性
let isDrawing = false;
let brushColor = "#000000";
let brushSize = 5;
let lastX, lastY;

// 設定橡皮擦屬性
let eraserColor = getComputedStyle(canvas).backgroundColor;
let eraserSize = 10;

// mode 設定
let mode = "brush";


// 設定cursor的style屬性
// 根據不同的模式來顯示不同的icon
function showIcon() {
    if (mode === "brush") {
        document.body.style.cursor = "url('icons/pen-2.png'), auto";
    } else if (mode === "eraser") {
        document.body.style.cursor = "url('icons/eraser-2.png'), auto";
    } else {
        document.body.style.cursor = "none";
    }
}


// 繪製點
function drawDot(x, y) {
    ctx.beginPath();
    if(mode === "eraser") {
        ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
        ctx.fillStyle = eraserColor;
    }
    if(mode === "brush") {
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = brushColor;
    }
    ctx.fill();
}

// 開始繪製
function startDrawing(event) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - 7;
    const y = event.clientY - rect.top + 17;
    [lastX, lastY] = [x, y];
    draw(event);
}
// 停止繪製
function stopDrawing() {
    isDrawing = false;
}
// 繪製
function draw(event) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - 7;
    const y = event.clientY - rect.top + 17;


    // 繪製點
    if (event.movementX === 0 && event.movementY === 0) {
        drawDot(x, y);
    }
    else {
        ctx.beginPath();
        if(mode === "eraser") {
            ctx.lineWidth = eraserSize;
            ctx.strokeStyle = eraserColor;
        }
        if(mode === "brush") {
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = brushColor;
        }
        ctx.lineCap = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }

}

// 讀取顏色選擇
const buttons = document.querySelectorAll(".colorButton");

for (const button of buttons) {
    const color = button.dataset.color;
    button.style.backgroundColor = color;

    button.onclick = function() {
        changeColor(color);
    };
}
// hex碼輸入顏色
function hexInputColor() {
    const hexCode = document.getElementById("hex-code").value;
    if(hexCode[0] != '#') changeColor('#'+hexCode);
    else changeColor(hexCode);
}
// 筆刷顏色
function changeColor(newColor) {
    brushColor = newColor;
}
// 筆刷粗細
function changeBrushSize(newSize) {
    brushSize = newSize;
}
function changeEraserSize(newSize) {
    eraserSize = newSize;
}
// 更新顯示圖層
function updateDisplay() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0);
}

// 事件監聽器
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);


// 橡皮擦按鈕
const eraserButton = document.getElementById('eraser');
eraserButton.addEventListener("click", function() {
    mode = "eraser";
    showIcon();
});

const brushButton = document.getElementById('brush');
brushButton.addEventListener("click", function() {
    mode = "brush";
    showIcon();
});

// 偵測鍵盤輸入
const textboxButton = document.getElementById("text");

// 繪製文字方塊背景
function addInput(event) {
    let input = document.createElement('input');

    input.type = 'text';
    input.style.position = 'fixed';
    input.style.left = (event.clientX - 4) + 'px';
    input.style.top = (event.clientY - 4) + 'px';
    input.style.fontSize = document.getElementById("font-size").value + "px";
    input.style.fontFamily = document.getElementById("font-family").value;

    input.onkeydown = textDetect;

    document.body.appendChild(input);

    input.focus();

    hasInput = true;
}

function textDetect(event) {
    var keyCode = event.keyCode;
    if (keyCode === 13) {
        drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));
        document.body.removeChild(this);
        hasInput = false;
    }
    canvas.removeEventListener("mousedown", addInput);
}

function drawText(text, x, y) {
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(text, x - 4, y - 4);
}

textboxButton.addEventListener("click", function() {
    mode = "text";
    // 監控滑鼠按下事件
    canvas.addEventListener("mousedown", addInput);
    // canvas.addEventListener("mousemove", textboxMove);
});


// 重整按鈕
function refreshCanvas() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 移除文字方塊
    const inputs = document.getElementsByTagName("input");
    let i = 0;
    while (inputs.length-i) {
        if(inputs[i].type !== "text") {
            i += 1;
            continue;
        }
        inputs[i].parentNode.removeChild(inputs[i]);
    }

}

// Download 按鍵
function downloadCanvas() {
    var image = canvas.toDataURL();
// Create a link
    var aDownloadLink = document.createElement('a');
// Add the name of the file to the link
    aDownloadLink.download = 'canvas_image.png';
// Attach the data to the link
    aDownloadLink.href = image;
// Get the code to click the download link
    aDownloadLink.click();
}


// image upload
document.getElementById('readUrl').addEventListener('change', function(){
    if (this.files[0] ) {
        var picture = new FileReader();
        picture.readAsDataURL(this.files[0]);
        picture.addEventListener('load', function(event) {
            document.getElementById('uploadedImage').setAttribute('src', event.target.result);
            document.getElementById('uploadedImage').style.display = 'block';
        });
    }
});




