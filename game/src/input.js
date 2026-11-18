// Track held keys and pointer state without coupling input to game behavior.
export function createInput(canvas) {
  const input = {
    keys: new Set(),
    previousKeys: new Set(),
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    mouseDown: false,
    mousePressed: false,
    mouseReleased: false,
    pointerStarted: false,
  };

  window.addEventListener('keydown', (event) => {
    input.keys.add(event.code);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.code);
  });

  canvas.addEventListener('pointermove', (event) => {
    const bounds = canvas.getBoundingClientRect();
    input.mouse.x = event.clientX - bounds.left;
    input.mouse.y = event.clientY - bounds.top;
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }
    input.pointerStarted = true;
    input.mousePressed = !input.mouseDown;
    input.mouseDown = true;
    canvas.setPointerCapture(event.pointerId);
  });

  window.addEventListener('pointerup', (event) => {
    if (event.button !== 0 || !input.mouseDown) {
      return;
    }
    input.mouseDown = false;
    input.mouseReleased = true;
  });

  input.isDown = (code) => input.keys.has(code);
  input.wasPressed = (code) => input.keys.has(code) && !input.previousKeys.has(code);
  input.finishFrame = () => {
    input.previousKeys = new Set(input.keys);
    input.mousePressed = false;
    input.mouseReleased = false;
  };

  return input;
}
