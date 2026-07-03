const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("startBtn").onclick = () => showScreen("menuScreen");

document.querySelectorAll(".openLab").forEach(btn => {
  btn.onclick = () => showScreen(btn.dataset.target);
});

document.querySelectorAll(".backBtn").forEach(btn => {
  btn.onclick = () => showScreen("menuScreen");
});

let seriesOn = false;
let parallelOn = false;

let seriesResistors = [10, 20, 30];
let parallelResistors = [10, 20, 30];

function getBrightnessPercent(current) {
  if (current <= 0) return 0;
  let percent = current * 70;
  return Math.round(Math.max(8, Math.min(100, percent)));
}

function updateNeedle(id, value, maxValue) {
  const needle = document.getElementById(id);
  if (!needle) return;

  const percent = Math.min(value / maxValue, 1);
  const angle = -70 + percent * 140;
  needle.style.transform = `rotate(${angle}deg)`;
}

function paintBulb(id, percent) {
  const bulb = document.getElementById(id);
  const box = document.getElementById(id + "Box");
  const text = document.getElementById(id + "Text");
  const fill = document.getElementById(id + "Fill");

  if (!bulb || !box || !text || !fill) return;

  if (percent > 0) {
    bulb.classList.add("on");
    box.style.background = `rgba(250, 204, 21, ${percent / 170})`;
    box.style.boxShadow = `0 0 ${percent / 2}px rgba(250, 204, 21, 0.9)`;
    text.textContent = `Brillo: ${percent}%`;
    fill.style.width = percent + "%";
  } else {
    bulb.classList.remove("on");
    box.style.background = "rgba(2,6,23,0.9)";
    box.style.boxShadow = "none";
    text.textContent = "Brillo: 0%";
    fill.style.width = "0%";
  }
}

function paintSeriesBulb(percent) {
  const bulb = document.getElementById("seriesBulb");
  const box = document.getElementById("seriesBulbBox");
  const text = document.getElementById("seriesBrightness");
  const fill = document.getElementById("seriesFill");

  if (percent > 0) {
    bulb.classList.add("on");
    box.style.background = `rgba(250, 204, 21, ${percent / 170})`;
    box.style.boxShadow = `0 0 ${percent / 2}px rgba(250, 204, 21, 0.9)`;
    text.textContent = `Brillo: ${percent}%`;
    fill.style.width = percent + "%";
  } else {
    bulb.classList.remove("on");
    box.style.background = "rgba(2,6,23,0.9)";
    box.style.boxShadow = "none";
    text.textContent = "Brillo: 0%";
    fill.style.width = "0%";
  }
}

function createResistor(label, value, index, type) {
  return `
    <div class="resistor">
      <div class="res-wire"></div>

      <div class="resistor-symbol">/\/\/\\</div>

      <div class="resistor-label">
        ${label} =
        <input
          class="resistor-input"
          type="number"
          min="1"
          value="${value}"
          onchange="changeResistance('${type}', ${index}, this.value)"
        > Ω
      </div>

      <div class="res-wire"></div>
    </div>
  `;
}

function changeResistance(type, index, value) {
  const newValue = Math.max(1, Number(value));

  if (type === "series") {
    seriesResistors[index] = newValue;
    renderSeries();
  }

  if (type === "parallel") {
    parallelResistors[index] = newValue;
    renderParallel();
  }
}

/* SERIE */

function renderSeries() {
  const container = document.getElementById("seriesComponents");
  container.innerHTML = "";

  seriesResistors.forEach((r, i) => {
    container.innerHTML += createResistor(`R${i + 1}`, r, i, "series");
  });

  updateSeries();
}

function updateSeries() {
  const voltage = Number(document.getElementById("seriesVoltage").value);

  const req = seriesResistors.reduce((sum, r) => sum + r, 0);
  const current = seriesOn && req > 0 ? voltage / req : 0;
  const power = seriesOn ? voltage * current : 0;

  document.getElementById("seriesReq").textContent = req.toFixed(2) + " Ω";
  document.getElementById("seriesCurrent").textContent = current.toFixed(3) + " A";
  document.getElementById("seriesPower").textContent = power.toFixed(2) + " W";

  document.getElementById("seriesAmpText").textContent = current.toFixed(3) + " A";
  document.getElementById("seriesVoltText").textContent = seriesOn
    ? voltage.toFixed(2) + " V"
    : "0.00 V";

  updateNeedle("seriesAmpNeedle", current, 2);
  updateNeedle("seriesVoltNeedle", seriesOn ? voltage : 0, 24);

  paintSeriesBulb(getBrightnessPercent(current));

  const sw = document.getElementById("seriesSwitch");
  sw.textContent = seriesOn ? "ON" : "OFF";
  sw.classList.toggle("on", seriesOn);
}

document.getElementById("addSeries").onclick = () => {
  const value = Number(document.getElementById("seriesNewValue").value);
  if (value > 0) {
    seriesResistors.push(value);
    renderSeries();
  }
};

document.getElementById("clearSeries").onclick = () => {
  seriesResistors = [];
  seriesOn = false;
  renderSeries();
};

document.getElementById("seriesSwitch").onclick = () => {
  seriesOn = !seriesOn;
  updateSeries();
};

document.getElementById("seriesVoltage").oninput = updateSeries;

/* PARALELO */

function renderParallel() {
  const container = document.getElementById("parallelBranches");
  container.innerHTML = "";

  parallelResistors.forEach((r, i) => {
    container.innerHTML += `
      <div class="branch">
        <div class="branch-wire"></div>

        ${createResistor(`R${i + 1}`, r, i, "parallel")}

        <div class="bulb-box" id="pBulb${i}Box">
          <div class="bulb" id="pBulb${i}">💡</div>
          <div class="brightness-text" id="pBulb${i}Text">Brillo: 0%</div>
          <div class="brightness-bar">
            <div class="brightness-fill" id="pBulb${i}Fill"></div>
          </div>
        </div>
      </div>
    `;
  });

  updateParallel();
}

function updateParallel() {
  const voltage = Number(document.getElementById("parallelVoltage").value);

  let req = 0;

  if (parallelResistors.length > 0) {
    const reciprocal = parallelResistors.reduce((sum, r) => sum + 1 / r, 0);
    req = 1 / reciprocal;
  }

  const totalCurrent = parallelOn && req > 0 ? voltage / req : 0;
  const totalPower = parallelOn ? voltage * totalCurrent : 0;

  document.getElementById("parallelReq").textContent = req.toFixed(2) + " Ω";
  document.getElementById("parallelCurrent").textContent = totalCurrent.toFixed(3) + " A";
  document.getElementById("parallelPower").textContent = totalPower.toFixed(2) + " W";

  document.getElementById("parallelAmpText").textContent = totalCurrent.toFixed(3) + " A";
  document.getElementById("parallelVoltText").textContent = parallelOn
    ? voltage.toFixed(2) + " V"
    : "0.00 V";

  updateNeedle("parallelAmpNeedle", totalCurrent, 4);
  updateNeedle("parallelVoltNeedle", parallelOn ? voltage : 0, 24);

  parallelResistors.forEach((r, i) => {
    const branchCurrent = parallelOn ? voltage / r : 0;
    paintBulb("pBulb" + i, getBrightnessPercent(branchCurrent));
  });

  const sw = document.getElementById("parallelSwitch");
  sw.textContent = parallelOn ? "ON" : "OFF";
  sw.classList.toggle("on", parallelOn);
}

document.getElementById("addParallel").onclick = () => {
  const value = Number(document.getElementById("parallelNewValue").value);
  if (value > 0) {
    parallelResistors.push(value);
    renderParallel();
  }
};

document.getElementById("clearParallel").onclick = () => {
  parallelResistors = [];
  parallelOn = false;
  renderParallel();
};

document.getElementById("parallelSwitch").onclick = () => {
  parallelOn = !parallelOn;
  updateParallel();
};

document.getElementById("parallelVoltage").oninput = updateParallel;

/* INICIO */

renderSeries();
renderParallel();