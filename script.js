let powerOn = true;
let currentReversed = false;

let autoMove = false;
let autoDirection = 1;
let lastMagnetPosition = 20;

/* =========================
   ELEMENTOS LAB 1
========================= */

const currentInput = document.getElementById("currentInput");
const currentValue = document.getElementById("currentValue");
const currentDisplay = document.getElementById("currentDisplay");

const wireHeight = document.getElementById("wireHeight");
const heightValue = document.getElementById("heightValue");

const mainWire = document.getElementById("mainWire");
const currentArrow = document.getElementById("currentArrow");
const compassNeedle = document.getElementById("compassNeedle");
const fieldRings = document.getElementById("fieldRings");

const switchBox = document.getElementById("switchBox");
const switchText = document.getElementById("switchText");

const togglePower = document.getElementById("togglePower");
const reverseCurrent = document.getElementById("reverseCurrent");

const fieldValue = document.getElementById("fieldValue");
const directionValue = document.getElementById("directionValue");
const oerstedExplanation = document.getElementById("oerstedExplanation");

/* =========================
   LAB 1: OERSTED
========================= */

function updateOersted() {
  const current = powerOn ? Number(currentInput.value) : 0;
  const height = Number(wireHeight.value);

  currentValue.textContent = `${current.toFixed(1)} A`;
  currentDisplay.textContent = current.toFixed(1);

  const topPosition = 105 + height * 1.25;
  mainWire.style.top = `${topPosition}px`;
  currentArrow.style.top = `${topPosition + 20}px`;

  const distanceFactor = 1 - height / 120;
  let angle = current * 16 * distanceFactor;

  if (currentReversed) {
    angle *= -1;
  }

  compassNeedle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

  currentArrow.textContent = currentReversed ? "I ←" : "I →";

  fieldRings.classList.toggle("reverse", currentReversed);
  fieldRings.style.opacity = powerOn && current > 0 ? "1" : "0.15";

  const field = current * distanceFactor / 10;

  fieldValue.textContent = `${field.toFixed(2)} T`;
  directionValue.textContent = currentReversed ? "Horario" : "Antihorario";

  heightValue.textContent = `${(height / 20).toFixed(1)} cm`;

  if (powerOn && current > 0) {
    switchBox.classList.remove("off");
    switchText.textContent = "ON";

    oerstedExplanation.textContent =
      "Al circular corriente por el conductor, se genera un campo magnético circular alrededor del cable. Cuando el cable está más cerca de la brújula, la desviación de la aguja es mayor.";
  } else {
    switchBox.classList.add("off");
    switchText.textContent = "OFF";

    oerstedExplanation.textContent =
      "El circuito está apagado o la corriente es cero. Sin corriente eléctrica, el conductor no genera un campo magnético apreciable.";
  }
}

currentInput.addEventListener("input", updateOersted);
wireHeight.addEventListener("input", updateOersted);

togglePower.addEventListener("click", () => {
  powerOn = !powerOn;
  updateOersted();
});

reverseCurrent.addEventListener("click", () => {
  currentReversed = !currentReversed;
  updateOersted();
});

/* =========================
   ELEMENTOS LAB 2
========================= */

const magnetPosition = document.getElementById("magnetPosition");
const magnetSpeed = document.getElementById("magnetSpeed");
const movingMagnet = document.getElementById("movingMagnet");

const gNeedle = document.getElementById("gNeedle");
const gValue = document.getElementById("gValue");

const speedValue = document.getElementById("speedValue");
const inducedVoltage = document.getElementById("inducedVoltage");
const inducedDirection = document.getElementById("inducedDirection");
const faradayExplanation = document.getElementById("faradayExplanation");

const autoMoveBtn = document.getElementById("autoMove");
const resetFaraday = document.getElementById("resetFaraday");

/* =========================
   LAB 2: FARADAY
========================= */

function updateFaraday() {
  const position = Number(magnetPosition.value);
  const speed = Number(magnetSpeed.value);

  speedValue.textContent = speed;

  movingMagnet.style.left = `${80 + position * 3.2}px`;

  const change = position - lastMagnetPosition;
  const voltage = change * speed * 0.08;

  let angle = voltage * 20;
  angle = Math.max(-65, Math.min(65, angle));

  gNeedle.style.transform = `rotate(${angle}deg)`;

  gValue.textContent = `${voltage.toFixed(2)} mV`;
  inducedVoltage.textContent = `${voltage.toFixed(2)} mV`;

  if (Math.abs(voltage) < 0.05) {
    inducedDirection.textContent = "Sin corriente";

    faradayExplanation.textContent =
      "Cuando el imán está quieto o se mueve muy poco, el flujo magnético casi no cambia. Por eso el galvanómetro vuelve a cero.";
  } else if (voltage > 0) {
    inducedDirection.textContent = "Hacia un sentido";

    faradayExplanation.textContent =
      "Al introducir el imán en la bobina, cambia el flujo magnético y se induce corriente eléctrica. La aguja del galvanómetro se desvía hacia un lado.";
  } else {
    inducedDirection.textContent = "Sentido contrario";

    faradayExplanation.textContent =
      "Al sacar el imán de la bobina, el cambio del flujo magnético es opuesto. Por eso la aguja del galvanómetro se desvía hacia el lado contrario.";
  }

  lastMagnetPosition = position;
}

magnetPosition.addEventListener("input", updateFaraday);
magnetSpeed.addEventListener("input", updateFaraday);

autoMoveBtn.addEventListener("click", () => {
  autoMove = !autoMove;
  autoMoveBtn.textContent = autoMove ? "Detener movimiento" : "Movimiento automático";
});

resetFaraday.addEventListener("click", () => {
  autoMove = false;
  autoMoveBtn.textContent = "Movimiento automático";

  magnetPosition.value = 20;
  lastMagnetPosition = 20;

  updateFaraday();
});

function animateFaraday() {
  if (autoMove) {
    let position = Number(magnetPosition.value);
    const speed = Number(magnetSpeed.value);

    position += autoDirection * speed * 0.25;

    if (position >= 100) {
      position = 100;
      autoDirection = -1;
    }

    if (position <= 0) {
      position = 0;
      autoDirection = 1;
    }

    magnetPosition.value = position;
    updateFaraday();
  }

  requestAnimationFrame(animateFaraday);
}

/* =========================
   INICIO
========================= */

updateOersted();
updateFaraday();
animateFaraday();