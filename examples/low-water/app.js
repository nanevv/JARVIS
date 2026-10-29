"use strict";

// Simplified semi-diurnal tide: demo data only, never for real navigation.
const PERIOD_MIN = 12.42 * 60;
const MEAN = 2.2;       // metres
const RANGE = 1.7;      // metres, half the tidal range
const OPEN_BELOW = 1.0; // flats are walkable under this level
const EPOCH = Date.UTC(2024, 0, 1, 3, 10); // an arbitrary low water

const SVG_NS = "http://www.w3.org/2000/svg";
const W = 1200, H = 360, PAD_TOP = 20, PAD_BOTTOM = 36;

const level = (ms) => MEAN - RANGE * Math.cos((2 * Math.PI * (ms - EPOCH)) / (PERIOD_MIN * 60000));
const pad = (n) => String(n).padStart(2, "0");
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const yOf = (m) => PAD_TOP + (1 - (m - (MEAN - RANGE)) / (2 * RANGE)) * (H - PAD_TOP - PAD_BOTTOM);
const xOf = (min) => (min / 1440) * W;

const dayStart = new Date();
dayStart.setHours(0, 0, 0, 0);
const at = (min) => dayStart.getTime() + min * 60000;

function el(name, attrs, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function drawChart(svg) {
  const pts = [];
  for (let m = 0; m <= 1440; m += 5) pts.push([xOf(m), yOf(level(at(m)))]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

  // Walkable windows as bands behind the water.
  let start = null;
  for (let m = 0; m <= 1440; m += 5) {
    const open = level(at(m)) < OPEN_BELOW;
    if (open && start === null) start = m;
    if ((!open || m === 1440) && start !== null) {
      svg.append(el("rect", { class: "window", x: xOf(start), y: 0, width: xOf(m) - xOf(start), height: H - PAD_BOTTOM }));
      const x0 = xOf(start), x1 = xOf(m);
      if (x1 - x0 < 110) { start = null; continue; }
      const anchor = start === 0 ? "start" : m === 1440 ? "end" : "middle";
      const x = anchor === "start" ? x0 + 12 : anchor === "end" ? x1 - 12 : (x0 + x1) / 2;
      svg.append(el("text", { class: "band", x, y: 40, "text-anchor": anchor }, "Flats open"));
      start = null;
    }
  }

  svg.append(el("path", { class: "water", d: `${line}L${W} ${H - PAD_BOTTOM}L0 ${H - PAD_BOTTOM}Z` }));
  svg.append(el("path", { class: "line", d: line }));
  svg.append(el("line", { class: "axis", x1: 0, x2: W, y1: H - PAD_BOTTOM, y2: H - PAD_BOTTOM }));
  for (let h = 0; h <= 24; h += 3) {
    svg.append(el("text", { class: h % 6 ? "tick minor" : "tick", x: xOf(h * 60), y: H - 10, "text-anchor": h === 0 ? "start" : h === 24 ? "end" : "middle" }, `${pad(h % 24)}:00`));
  }

  const marker = el("g", { class: "marker" });
  marker.append(el("line", { x1: 0, x2: 0, y1: 0, y2: H - PAD_BOTTOM }), el("circle", { r: 9, cx: 0, cy: 0 }));
  svg.append(marker);
  return marker;
}

function minutesUntilChange(startMs, wantOpen) {
  for (let m = 0; m <= 720; m += 1) {
    if ((level(startMs + m * 60000) < OPEN_BELOW) === wantOpen) return m;
  }
  return null;
}

function span(mins) {
  if (mins === null) return "a long while";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

function update(min, ui) {
  const ms = at(min);
  const lvl = level(ms);
  const open = lvl < OPEN_BELOW;
  ui.marker.setAttribute("transform", `translate(${xOf(min)} ${yOf(lvl)})`);
  ui.marker.querySelector("line").setAttribute("y1", -yOf(lvl));
  ui.marker.querySelector("line").setAttribute("y2", H - PAD_BOTTOM - yOf(lvl));
  ui.status.textContent = open ? "Flats open" : "Sea is in";
  ui.status.dataset.open = String(open);
  const wait = minutesUntilChange(ms, !open);
  ui.detail.textContent = open ? `The water returns in ${span(wait)}.` : `The flats open in ${span(wait)}.`;
  ui.time.textContent = clock(new Date(ms));
  ui.level.textContent = `${lvl.toFixed(2)} m`;
  ui.input.setAttribute("aria-valuetext", `${clock(new Date(ms))}, ${lvl.toFixed(1)} metres, ${open ? "flats open" : "sea is in"}`);
}

function nextLows(count) {
  const now = Date.now();
  const k0 = Math.ceil((now - EPOCH) / (PERIOD_MIN * 60000));
  return Array.from({ length: count }, (_, i) => new Date(EPOCH + (k0 + i) * PERIOD_MIN * 60000));
}

function buildTable(tbody, heldLine) {
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
  let pressed = null;
  for (const low of nextLows(6)) {
    const tr = document.createElement("tr");
    const meet = new Date(low.getTime() - 90 * 60000);
    const cells = [
      [fmt.format(low), ""],
      [clock(low), "big"],
      [clock(meet), ""],
    ];
    for (const [text, cls] of cells) {
      const td = document.createElement("td");
      td.textContent = text;
      if (cls) td.className = cls;
      tr.append(td);
    }
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Hold this tide";
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      if (pressed && pressed !== btn) {
        pressed.setAttribute("aria-pressed", "false");
        pressed.textContent = "Hold this tide";
      }
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Held" : "Hold this tide";
      pressed = on ? btn : null;
      heldLine.textContent = on
        ? `Held: ${fmt.format(low)}, meet at ${clock(meet)}. Nothing is sent anywhere in this demo.`
        : "No walk held yet.";
    });
    td.append(btn);
    tr.append(td);
    tbody.append(tr);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("chart");
  const input = document.getElementById("t");
  const ui = {
    marker: drawChart(svg),
    input,
    status: document.getElementById("status"),
    detail: document.getElementById("detail"),
    time: document.getElementById("r-time"),
    level: document.getElementById("r-level"),
  };
  const now = new Date();
  input.value = String(Math.round((now.getHours() * 60 + now.getMinutes()) / 5) * 5);
  update(Number(input.value), ui);
  input.addEventListener("input", () => update(Number(input.value), ui));
  buildTable(document.getElementById("lows"), document.getElementById("held"));
});
