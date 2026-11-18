import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createWorld, resizeWorld, startGame, updateWorld, setMode, applyUpgrade } from './world.js';
import { renderWorld } from './render.js';
import { createShotScene } from './shots.js';
import { mulberry32 } from './random.js';

const canvas = document.querySelector('#game');
const context = canvas.getContext('2d', { alpha: false });
const input = createInput(canvas);
const audio = createAudio();
const parameters = new URLSearchParams(window.location.search);
const shotName = parameters.get('shot');
const shotSeed = Number.parseInt(parameters.get('seed') || '1', 10) || 1;
let world = createWorld();
let previousTime = 0;
let animationFrame = 0;

function resize() {
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  resizeWorld(world, width, height);
  if (shotName) {
    world = createShotScene(shotName, shotSeed, width, height);
    renderShot();
  }
}

function renderShot() {
  renderWorld(context, world);
  document.title = 'shot-ready';
}

function frame(timestamp) {
  const rawDelta = previousTime === 0 ? 0 : (timestamp - previousTime) / 1000;
  const delta = Math.min(0.033, Math.max(0, rawDelta));
  previousTime = timestamp;
  handleControls();
  updateWorld(world, input, delta, audio);
  renderWorld(context, world);
  input.finishFrame();
  animationFrame = window.requestAnimationFrame(frame);
}

function handleControls() {
  if (input.wasPressed('KeyM')) {
    audio.toggleMute();
  }
  if (world.mode === 'title') {
    if (input.wasPressed('Enter') || input.mousePressed) {
      audio.unlock();
      startGame(world, audio);
      previousTime = 0;
    }
    return;
  }
  if (world.mode === 'gameover') {
    if (input.wasPressed('KeyR') || input.wasPressed('Enter')) {
      audio.unlock();
      startGame(world, audio);
      previousTime = 0;
    }
    return;
  }
  if (world.mode === 'levelup') {
    if (input.wasPressed('Digit1')) applyUpgrade(world, 0);
    if (input.wasPressed('Digit2')) applyUpgrade(world, 1);
    if (input.wasPressed('Digit3')) applyUpgrade(world, 2);
    if (input.mousePressed) {
      const cardWidth = 270;
      const gap = 22;
      const startX = (world.width - (cardWidth * 3 + gap * 2)) / 2;
      const cardIndex = Math.floor((input.mouse.x - startX) / (cardWidth + gap));
      if (cardIndex >= 0 && cardIndex < 3) applyUpgrade(world, cardIndex);
    }
    return;
  }
  if (input.wasPressed('KeyP') || input.wasPressed('Escape')) {
    setMode(world, world.mode === 'paused' ? 'playing' : 'paused');
  }
}

window.addEventListener('resize', resize);
resize();
if (shotName) {
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
  renderShot();
} else {
  animationFrame = window.requestAnimationFrame(frame);
}
