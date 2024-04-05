// 總畫布
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let hasInput = false;
// 設定畫筆屬性
let isDrawing = false;
let brushColor = "#000";
let brushSize = 5;
let lastX, lastY;
// 設定橡皮擦屬性
let eraserColor = getComputedStyle(canvas).backgroundColor;
let eraserSize = 10;

// mode 設定
let mode = "brush";

// 保存一個canvas陣列：undo, redo
let undoHistory = [];
let redoHistory = [];
// 建立一個新的 canvas 元素用於保存之前的繪圖狀態
const savedCanvas = document.createElement('canvas');
const savedCtx = savedCanvas.getContext('2d');
savedCanvas.width = canvas.width;
savedCanvas.height = canvas.height;
// 保存之前的繪圖狀態
function saveCanvas() {
    undoHistory.push(canvas.toDataURL());

    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    savedCtx.drawImage(canvas, 0, 0);

}

// 從保存的繪圖狀態中恢復
function restoreCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(savedCanvas, 0, 0);
}

// Undo function
function undo() {
    if (undoHistory.length > 0) {
        const snapshot = canvas.toDataURL();
        redoHistory.push(snapshot); // Save current state for redo
        const previousState = undoHistory.pop();
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = previousState;
    }
}

// Redo function
function redo() {
    if (redoHistory.length > 0) {
        const snapshot = canvas.toDataURL();
        undoHistory.push(snapshot); // Save current state for undo
        const nextState = redoHistory.pop();
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = nextState;
    }
}
document.getElementById('undoButton').addEventListener('click', undo);
document.getElementById('redoButton').addEventListener('click', redo);


// 設定cursor的style屬性
// 根據不同的模式來顯示不同的icon
const buttonsAll = document.querySelectorAll('button');
buttonsAll.forEach(button => {
    button.addEventListener("click", () => {
        showIcon(button.id); // Call showIcon() function when button is clicked
    });
});



function showIcon(id) {
    if (id === "brush") {
        document.body.style.cursor = "url('icons/brush.png'), auto";
    } else if (id === "eraser") {
        document.body.style.cursor = "url('icons/eraser.png'), auto";
    } else if(id === "text") {
        document.body.style.cursor = "text";
    } else {
        document.body.style.cursor = "auto";
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
    saveCanvas();
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
        else if(mode === "brush") {
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = brushColor;
        }
        else {
            ctx.strokeStyle = "transparent";
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
// Global variable to store saved colors
let savedColors = [];

// Function to add color button with given RGB values
function addColorButton(red, green, blue) {
    const color = `rgb(${red}, ${green}, ${blue})`;
    const button = document.createElement('button');
    button.classList.add('colorButton');
    button.style.backgroundColor = color;
    button.addEventListener('click', function() {
        changeColor(color);
    });
    document.getElementById('color-buttons-container').appendChild(button);
}

// Function to add and save current color
function addColor() {
    const redInput = document.getElementById('color-picker-red');
    const greenInput = document.getElementById('color-picker-green');
    const blueInput = document.getElementById('color-picker-blue');

    const red = parseInt(redInput.value, 10);
    const green = parseInt(greenInput.value, 10);
    const blue = parseInt(blueInput.value, 10);

    // Validate RGB values
    if (isNaN(red) || isNaN(green) || isNaN(blue)) {
        console.error("Invalid RGB values");
        return; // Handle invalid RGB values
    }

    savedColors.push({red, green, blue});

    addColorButton(red, green, blue);
}

//remove color button by index
function removeColorButton(index) {
    savedColors.splice(index, 1);
    const colorButtonsContainer = document.getElementById('color-buttons-container');
    colorButtonsContainer.innerHTML = ''; // Clear existing buttons
    savedColors.forEach(color => {
        addColorButton(color.red, color.green, color.blue);
    });
}

// Function to display current color as color block
function displayCurrentColor(red, green, blue) {
    const currentColorDiv = document.getElementById('current-color');
    currentColorDiv.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
}

// Function to set color from RGB inputs
function setColorFromRGB() {
    const redInput = document.getElementById('color-picker-red');
    const greenInput = document.getElementById('color-picker-green');
    const blueInput = document.getElementById('color-picker-blue');

    const red = parseInt(redInput.value, 10);
    const green = parseInt(greenInput.value, 10);
    const blue = parseInt(blueInput.value, 10);

    // Validate RGB values
    if (isNaN(red) || isNaN(green) || isNaN(blue)) {
        console.error("Invalid RGB values");
        return; // Handle invalid RGB values
    }

    const rgbColor = `rgb(${red}, ${green}, ${blue})`;

    // Update brush color using rgbColor
    changeColor(rgbColor);
    displayCurrentColor(red, green, blue);

    // Update color preview
    updateColorPreview(red, green, blue);
}

// Function to update color preview
function updateColorPreview(red, green, blue) {
    const colorPreview = document.getElementById('color-preview');
    colorPreview.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
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

// 繪製文字方塊
function addInput(event) {
    let input = document.createElement("input");

    input.type = 'text';
    input.style.color = brushColor;
    input.style.position = 'fixed';
    input.style.left = (event.clientX) + 'px';
    input.style.top = (event.clientY) + 'px';
    input.style.fontSize = document.getElementById("font-size").value + "px";
    input.style.fontFamily = document.getElementById("font-family").value;

    input.onkeydown = textDetect;
    document.body.appendChild(input);
    input.focus();
    hasInput = true;
    console.log("addInput finish");
}
function textDetect(event) {
    const keyCode = event.keyCode;

    if (keyCode === 13) {
        // Get text input value
        const text = this.value;

        // Calculate canvas coordinates from page coordinates
        const rect = canvas.getBoundingClientRect();
        const x = parseInt(this.style.left, 10) - rect.left;
        const y = parseInt(this.style.top, 10) - rect.top;

        // Draw text at calculated coordinates
        drawText(text, x, y, this);

        // Remove text input element
        hasInput = false;
        canvas.removeEventListener("mousedown", addInput);

        console.log("textDetect finish");
    }

}
function drawText(text, x, y, rmv) {
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `${document.getElementById("font-size").value}px ${document.getElementById("font-family").value}`;
    ctx.fillStyle = brushColor;
    ctx.fillText(text, x, y);
    document.body.removeChild(rmv);
    console.log("drawText finish");
}

textboxButton.addEventListener("click", function() {
    mode = "text";
    // 監控滑鼠按下事件
    canvas.addEventListener("mousedown", addInput);
});


// 重整按鈕
function refreshCanvas() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rectangles = [];
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
const imageSizeInput = document.getElementById('imageSize');
document.getElementById('readUrl').addEventListener('change', function(){
    if (this.files[0]) {
        const picture = new FileReader();
        picture.readAsDataURL(this.files[0]);
        picture.addEventListener('load', function(event) {
            const img = new Image();
            img.onload = function() {
                const imageSize = imageSizeInput.value / 100;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width * imageSize, img.height * imageSize);
                saveCanvas();
            };
            img.src = event.target.result;
        });
    }
});
imageSizeInput.addEventListener('input', function() {
    const picture = document.getElementById('readUrl');
    if (picture.files[0]) {
        const img = new Image();
        img.onload = function() {
            const imageSize = imageSizeInput.value / 100;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.width * imageSize, img.height * imageSize);
        };
        img.src = URL.createObjectURL(picture.files[0]);
    }
});

// 畫矩形
const rectangleButton = document.getElementById('rectangle');
rectangleButton.addEventListener("click", function() {
    mode = "rectangle";
});
// 畫矩形
let isDrawingRect = false;
let rectStartX, rectStartY;
let rectangles = []; // 存儲繪製的矩形

function drawRectangles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除整個畫布
    restoreCanvas(); // 恢復之前的繪圖狀態
    rectangles.forEach(rect => {
        ctx.beginPath();
        ctx.strokeStyle = rect.color;
        ctx.lineWidth = rect.lineWidth;
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.stroke();
    });
}

canvas.addEventListener('mousedown', function(event) {
    if (mode === "rectangle") {
        isDrawingRect = true;
        const rect = canvas.getBoundingClientRect();
        rectStartX = event.clientX - rect.left;
        rectStartY = event.clientY - rect.top;
    }
});

canvas.addEventListener('mousemove', function(event) {
    if (isDrawingRect) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const width = x - rectStartX;
        const height = y - rectStartY;
        drawRectangles(); // 清除畫布並重新繪製所有矩形
        ctx.beginPath();
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.rect(rectStartX, rectStartY, width, height);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', function(event) {
    if (isDrawingRect) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const width = x - rectStartX;
        const height = y - rectStartY;
        rectangles.push({
            x: rectStartX,
            y: rectStartY,
            width: width,
            height: height,
            color: brushColor,
            lineWidth: brushSize
        });
        isDrawingRect = false;
        drawRectangles(); // 清除畫布並重新繪製所有
    }
});
// 畫圓形
const circleButton = document.getElementById('circle');
circleButton.addEventListener("click", function() {
    mode = "circle";
});

let isDrawingCircle = false;
let circleStartX, circleStartY;
let circleRadius = 0;

canvas.addEventListener('mousedown', function(event) {
    if (mode === "circle") {
        isDrawingCircle = true;
        const rect = canvas.getBoundingClientRect();
        circleStartX = event.clientX - rect.left;
        circleStartY = event.clientY - rect.top;
        circleRadius = 0;
    }
});

canvas.addEventListener('mousemove', function(event) {
    if (isDrawingCircle) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        circleRadius = Math.sqrt(Math.pow(x - circleStartX, 2) + Math.pow(y - circleStartY, 2));
        drawCirTri(); // 繪製圖形
    }
});

canvas.addEventListener('mouseup', function(event) {
    if (isDrawingCircle) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        circleRadius = Math.sqrt(Math.pow(x - circleStartX, 2) + Math.pow(y - circleStartY, 2));
        drawCirTri(); // 繪製圖形
        isDrawingCircle = false;
    }
});

// 畫三角形
const triangleButton = document.getElementById('triangle');
triangleButton.addEventListener("click", function() {
    mode = "triangle";
});

let isDrawingTriangle = false;
let triangleStartX, triangleStartY;
let trianglePoints = [];

canvas.addEventListener('mousedown', function(event) {
    if (mode === "triangle") {
        isDrawingTriangle = true;
        const rect = canvas.getBoundingClientRect();
        triangleStartX = event.clientX - rect.left;
        triangleStartY = event.clientY - rect.top;
        trianglePoints = [{x: triangleStartX, y: triangleStartY}];
    }
});

canvas.addEventListener('mousemove', function(event) {
    if (isDrawingTriangle) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        trianglePoints[1] = {x: x, y: y};
        trianglePoints[2] = {x: triangleStartX - (x - triangleStartX), y: y}; // third point
        drawCirTri(); // 繪製圖形
    }
});

canvas.addEventListener('mouseup', function(event) {
    if (isDrawingTriangle) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        trianglePoints[1] = {x: x, y: y};
        trianglePoints[2] = {x: triangleStartX - (x - triangleStartX), y: y}; // third point
        drawCirTri(); // 繪製圖形
        isDrawingTriangle = false;
    }
});

// 繪製圖形
function drawCirTri() {
    restoreCanvas(); // 恢復之前的繪圖狀態
    ctx.beginPath();
    if (mode === "circle") {
        ctx.arc(circleStartX, circleStartY, circleRadius, 0, Math.PI * 2);
    } else if (mode === "triangle") {
        ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
        ctx.lineTo(trianglePoints[1].x, trianglePoints[1].y);
        ctx.lineTo(trianglePoints[2].x, trianglePoints[2].y);
        ctx.closePath();
    }
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();
}

