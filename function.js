// 總畫布
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let foont = "14px Arial"
let hasInput = false;

// 建立繪製圖層和顯示圖層
const drawingCanvas = document.createElement('canvas');
const drawingCtx = drawingCanvas.getContext('2d', { alpha: false });

// 用於繪製橡皮擦效果的畫布。
const eraserCanvas = document.createElement('canvas');
const eraserCtx = eraserCanvas.getContext('2d');

drawingCanvas.width = canvas.width;
drawingCanvas.height = canvas.height;


// 設定畫筆屬性
let isDrawing = false;
let brushColor = "#000000";
let brushSize = 5;
let lastX, lastY;

// 設定橡皮擦屬性
let eraserColor = getComputedStyle(canvas).backgroundColor;
let eraserSize = 10;

// mode 設定
let mode = "draw";

// 繪製點
function drawDot(x, y) {
    drawingCtx.beginPath();
    if(mode === "eraser") {
        drawingCtx.arc(x, y, eraserSize, 0, Math.PI * 2);
        drawingCtx.fillStyle = eraserColor;
    }
    if(mode === "brush") {
        drawingCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        drawingCtx.fillStyle = brushColor;
    }
    drawingCtx.fill();
}

// 開始繪製
function startDrawing(event) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
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
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("left:" ,rect.left);
    console.log("top:" ,rect.top);

    // 繪製點
    if (event.movementX === 0 && event.movementY === 0) {
        drawDot(x, y);
    }
    else {
        drawingCtx.beginPath();
        if(mode === "eraser") {
            drawingCtx.lineWidth = eraserSize;
            drawingCtx.strokeStyle = eraserColor;
        }
        if(mode === "brush") {
            drawingCtx.lineWidth = brushSize;
            drawingCtx.strokeStyle = brushColor;
        }
        drawingCtx.lineCap = "round";
        drawingCtx.moveTo(lastX, lastY);
        drawingCtx.lineTo(x, y);
        drawingCtx.stroke();

        [lastX, lastY] = [x, y];
    }

    // 更新顯示圖層
    updateDisplay();
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
    ctx.drawImage(drawingCanvas, 0, 0);
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
});

const brushButton = document.getElementById('brush');
brushButton.addEventListener("click", function() {
    mode = "brush";
});

// 偵測鍵盤輸入
const textboxButton = document.getElementById("text");
// 儲存所有文字方塊的資料
const textRects = [];
// 繪製文字方塊背景
function textboxInit(event) {
    if(mode !== "text") return ;
    // 儲存文字方塊的位置和大小
    const textRect = {
        x: event.x,
        y: event.y,
        width: canvas.width / 5,
        height: canvas.height / 8,
        isEditing: true,
    };
    // 將文字方塊新增到陣列中
    textRects.push(textRect);
    // 新增一個文字方塊
    const textbox = drawingCtx.createElement("input");
    textbox.innerHTML = document.getElementById("textbox-template").innerHTML;
    textbox.style.position = "absolute";
    textbox.style.left = event.x + "px";
    textbox.style.top = event.y + "px";
    textbox.style.width = (document.getElementById("font-size").value * 8) + "px";
    textbox.style.height = (document.getElementById("font-size").value*1.2) + "px";
    textbox.style.fontFamily = document.getElementById("font-family").value;
    textbox.style.fontSize = document.getElementById("font-size").value + "px";
    // document.body.appendChild(textbox);


    // // 監控輸入框中的文字變化
    // const textInput = document.querySelector("input");
    // textInput.addEventListener("input", (event) => {
    //     // 清除畫布上的文字
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //
    //     // 繪製文字
    //     ctx.fillText(event.target.value, event.x, event.y);
    // });
    drawingCtx.appendChild(textbox);
}

function textboxDetect(event) {
    if(mode !== "text") return ;
    const textbox = document.createElement("div");
    const textInput = document.querySelector("input");
    // 檢查滑鼠按下位置是否在任何文字方塊內
    for (const textRect of textRects) {
        if (
            event.x >= textRect.x &&
            event.x <= textRect.x + textRect.width &&
            event.y >= textRect.y &&
            event.y <= textRect.y + textRect.height
        ) {
            // 顯示輸入框
            textInput.style.display = "block";
            textInput.focus();

            // 設定文字方塊為編輯狀態
            textRect.isEditing = true;

            break;
        } else {
            // 隱藏輸入框
            textInput.style.display = "none";

            // 設定所有文字方塊為非編輯狀態
            for (const textRect of textRects) {
                textRect.isEditing = false;
            }
        }
    }
}

function textboxMove(event) {
    if(mode !== "text") return ;
    // 檢查滑鼠移動位置是否在任何文字方塊內
    for (const textRect of textRects) {
        if (
            textRect.isEditing &&
            event.x >= textRect.x &&
            event.x <= textRect.x + textRect.width &&
            event.y >= textRect.y &&
            event.y <= textRect.y + textRect.height
        ) {
            // 設定文字方塊的游標為拖曳游標
            canvas.style.cursor = "move";

            break;
        } else {
            // 設定文字方塊的游標為預設游標
            canvas.style.cursor = "default";
        }
    }
}

function textboxOut(event) {
    if(mode !== "text") return ;
    const textInput = document.querySelector("input");
    // 檢查滑鼠拖曳位置是否在任何文字方塊內
    for (const textRect of textRects) {
        if (
            textRect.isEditing &&
            event.x >= textRect.x &&
            event.x <= textRect.x + textRect.width &&
            event.y >= textRect.y &&
            event.y <= textRect.y + textRect.height
        ) {
            // 更新文字方塊的位置
            textRect.x = event.x;
            textRect.y = event.y;

            break;
        }
    }

    // 隱藏輸入框
    textInput.style.display = "none";

    // 設定所有文字方塊為非編輯狀態
    for (const textRect of textRects) {
        textRect.isEditing = false;
    }
}

textboxButton.addEventListener("click", function() {
    mode = "text";
    // 監控滑鼠按下事件
    canvas.addEventListener("mousedown", textboxInit);
    canvas.addEventListener("mousedown", textboxDetect);
    canvas.addEventListener("mousemove", textboxMove);
    canvas.addEventListener("mouseup", textboxOut);

// 偵測字型選單中的選取
    const fontFamilySelect = document.getElementById("font-family");
    const fontSizeSelect = document.getElementById("font-size");

    fontFamilySelect.addEventListener("change", (event) => {
        // 更新畫布上的字型
        ctx.font = `${fontSizeSelect.value}px ${fontFamilySelect.value}`;
    });
});



