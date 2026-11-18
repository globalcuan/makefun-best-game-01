export function createInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false };
  let pressed = new Set();
  window.addEventListener('keydown', e => { const k=e.key.toLowerCase(); if(!keys.has(k)) pressed.add(k); keys.add(k); if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault(); });
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => { keys.clear(); mouse.down=false; });
  canvas.addEventListener('pointermove', e => { const r=canvas.getBoundingClientRect(); mouse.x=(e.clientX-r.left)*canvas.width/r.width; mouse.y=(e.clientY-r.top)*canvas.height/r.height; });
  canvas.addEventListener('pointerdown', e => { mouse.down=true; canvas.setPointerCapture?.(e.pointerId); });
  window.addEventListener('pointerup', () => mouse.down=false);
  return { keys, mouse, justPressed:k=>pressed.has(k), consume:()=>{pressed.clear();} };
}
