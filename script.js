let selectedChars = new Set();
let draggingElements = [];
let isSelecting = false;
let startX = 0,
  startY = 0;
const selectionBox = document.getElementById("selectionBox");

function displayText() {
  const input = document.getElementById("textInput").value;
  const output = document.getElementById("output");
  output.innerHTML = "";
  clearSelection();

  for (let i = 0; i < input.length; i++) {
    const span = document.createElement("span");
    span.classList.add("char");
    span.textContent = input[i];
    span.setAttribute("draggable", "true");

    span.addEventListener("click", (event) => toggleSelection(event, span));
    span.addEventListener("dragstart", (event) => dragStart(event, span));
    span.addEventListener("dragover", (event) => event.preventDefault());
    span.addEventListener("drop", (event) => drop(event, span));
    span.addEventListener("dragend", () => {
      draggingElements.forEach((el) => el.classList.remove("dragging"));
      draggingElements = [];
    });

    output.appendChild(span);
  }
}

function toggleSelection(event, element) {
  event.stopPropagation();
  if (event.ctrlKey) {
    if (selectedChars.has(element)) {
      selectedChars.delete(element);
      element.classList.remove("selected");
    } else {
      selectedChars.add(element);
      element.classList.add("selected");
    }
  } else {
    clearSelection();
    selectedChars.add(element);
    element.classList.add("selected");
  }
}

function clearSelection() {
  selectedChars.forEach((el) => el.classList.remove("selected"));
  selectedChars.clear();
}

function dragStart(event, element) {
  if (!selectedChars.has(element)) {
    clearSelection();
    selectedChars.add(element);
    element.classList.add("selected");
  }
  draggingElements = Array.from(selectedChars);
  draggingElements.forEach((el) => el.classList.add("dragging"));
  event.dataTransfer.setData("text/plain", "");
  event.dataTransfer.effectAllowed = "move";
}

function drop(event, target) {
  event.preventDefault();
  const output = document.getElementById("output");

  if (draggingElements.includes(target)) return;

  if (draggingElements.length === 1) {
    const draggedElement = draggingElements[0];
    let placeholder = document.createElement("span");
    output.insertBefore(placeholder, target);
    output.insertBefore(target, draggedElement);
    placeholder.replaceWith(draggedElement);
  } else if (draggingElements.length > 1) {
    draggingElements.forEach((elem) => {
      if (elem.parentElement === output) {
        output.removeChild(elem);
      }
    });
    draggingElements.forEach((elem) => {
      output.insertBefore(elem, target);
    });
  }
  draggingElements.forEach((el) => el.classList.remove("dragging"));
  draggingElements = [];
}

const outputContainer = document.getElementById("output");
outputContainer.addEventListener("dragover", (event) => {
  event.preventDefault();
});
outputContainer.addEventListener("drop", (event) => {
  if (event.target.id === "output") {
    event.preventDefault();
    draggingElements.forEach((elem) => {
      outputContainer.appendChild(elem);
      elem.classList.remove("dragging");
    });
    draggingElements = [];
  }
});

function addSelectionBoxEvents() {
  outputContainer.addEventListener("mousedown", selectionMouseDown);
  outputContainer.addEventListener("mousemove", selectionMouseMove);
  document.addEventListener("mouseup", selectionMouseUp);
}

function selectionMouseDown(event) {
  if (event.target !== outputContainer) return;

  isSelecting = true;
  startX = event.clientX;
  startY = event.clientY;
  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  selectionBox.style.width = `0px`;
  selectionBox.style.height = `0px`;
  selectionBox.style.display = "block";

  clearSelection();
}

function selectionMouseMove(event) {
  if (!isSelecting) return;

  const currentX = event.clientX;
  const currentY = event.clientY;
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;

  const chars = document.querySelectorAll(".char");
  chars.forEach((char) => {
    const rect = char.getBoundingClientRect();
    if (
      rect.left >= left &&
      rect.right <= left + width &&
      rect.top >= top &&
      rect.bottom <= top + height
    ) {
      char.classList.add("selected");
      selectedChars.add(char);
    } else {
      char.classList.remove("selected");
      selectedChars.delete(char);
    }
  });
}

function selectionMouseUp() {
  if (isSelecting) {
    isSelecting = false;
    selectionBox.style.display = "none";
  }
}

addSelectionBoxEvents();
