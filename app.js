(() => {
  "use strict";

  const C = window.FORGE_CONFIG;
  if (!C) throw new Error("Forge configuration was not loaded.");

  const ATTRIBUTES = {
    Physical: ["Strength", "Dexterity", "Stamina"],
    Social: ["Charisma", "Manipulation", "Appearance"],
    Mental: ["Perception", "Intelligence", "Wits"]
  };
  const STEPS = [
    ["Foundation", "Template and identity"],
    ["Attributes", "Natural aptitudes"],
    ["Abilities", "Learned capabilities"],
    ["Advantages", "Powers and ties"],
    ["Story", "Merits, flaws, and history"],
    ["Advancement", "Experience purchases"],
    ["Finish", "Review, export, and print"]
  ];
  const PRIORITY_NAMES = ["primary", "secondary", "tertiary"];
  const app = document.getElementById("app");
  let activeStep = 0;
  let saveMessage = "Saved locally";

  document.title = C.title;
  document.querySelector('meta[name="description"]').content = C.description;
  document.querySelector('meta[name="theme-color"]').content = C.theme.bgDeep;
  document.documentElement.dataset.splat = C.logo?.kind || C.code;
  const themeProperties = {
    accent: "--accent",
    accent2: "--accent-2",
    bg: "--bg",
    bgDeep: "--bg-deep",
    panel: "--panel",
    panel2: "--panel-2",
    paper: "--paper",
    paper2: "--paper-2",
    ink: "--ink",
    muted: "--muted",
    line: "--line",
    paperMuted: "--paper-muted",
    paperLine: "--paper-line"
  };
  Object.entries(themeProperties).forEach(([key, property]) => {
    if (C.theme[key]) document.documentElement.style.setProperty(property, C.theme[key]);
  });

  const SIGIL_GLYPHS = {
    mage: '<path d="M32 15l3.8 12.2L49 32l-13.2 4.8L32 49l-3.8-12.2L15 32l13.2-4.8Z"/><circle cx="32" cy="32" r="3.4"/>',
    vampire: '<path d="M32 14c-4.2 8.1-11 14.2-11 22.1a11 11 0 0 0 22 0C43 28.2 36.2 22.1 32 14Z"/><path d="m26.5 33.5 5.5 11 5.5-11"/>',
    werewolf: '<path d="M39.5 17.5A16.5 16.5 0 1 0 47 43a14.5 14.5 0 1 1-7.5-25.5Z"/><path d="m35 27 9-6m-7 13 11-7m-10 14 9-6"/>',
    wraith: '<path d="M42 20a16 16 0 0 0-21 3m-3 6a16 16 0 0 0 24 16m4-7a16 16 0 0 0-1-12"/><path d="M32 18v19l-5 9m5-9 5 9"/>',
    changeling: '<path d="M32 32C25 18 17 18 17 27c0 7 7 9 15 5Zm0 0c7-14 15-14 15-5 0 7-7 9-15 5Zm0 0c-7 14-15 14-15 5 0-7 7-9 15-5Zm0 0c7 14 15 14 15 5 0-7-7-9-15-5Z"/><circle cx="32" cy="32" r="2.6"/>'
  };

  function renderSigil(className = "") {
    const kind = C.logo?.kind || C.code;
    const glyph = SIGIL_GLYPHS[kind] || SIGIL_GLYPHS.mage;
    return `<svg class="forge-sigil ${attr(className)}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="sigil-frame" d="M32 3 51 11 61 32 53 52 32 61 12 53 3 32 11 12Z"/>
      <circle class="sigil-ring" cx="32" cy="32" r="21"/>
      <path class="sigil-ticks" d="M32 7v5m25 20h-5M32 57v-5M7 32h5"/>
      <g class="sigil-glyph">${glyph}</g>
    </svg>`;
  }

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const attr = value => esc(value).replace(/\n/g, " ");
  const optionList = (items, selected) => items.map(item => {
    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;
    return `<option value="${attr(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`;
  }).join("");
  const dotsText = (value, max = 5) => `${"●".repeat(Math.max(0, value))}${"○".repeat(Math.max(0, max - value))}`;
  const profile = () => C.profiles.find(p => p.id === state.profileId) || C.profiles[0];
  const groupId = (kind, name) => `${kind}:${name}`;
  const terminology = () => (C.terminologySets || []).find(set => set.id === state.terminologyId) || (C.terminologySets || [])[0] || { terms: {} };
  const fieldLabel = field => terminology().terms?.fields?.[field.key] || field.label;
  const groupLabel = group => terminology().terms?.groups?.[group.id] || group.label;
  const specialLabel = special => terminology().terms?.specials?.[special.id] || special.label;
  const uiTerm = (key, fallback) => terminology().terms?.ui?.[key] || fallback;

  function allGroups(p = profile()) {
    const groups = [];
    Object.entries(ATTRIBUTES).forEach(([name, traits]) => groups.push({
      id: groupId("attribute", name), kind: "attribute", label: name, traits, min: 1, max: 5,
      freebieCost: 5, xpMult: 4, poolKind: "attributes", category: name
    }));
    Object.entries(C.abilities).forEach(([name, traits]) => groups.push({
      id: groupId("ability", name), kind: "ability", label: name, traits, min: 0, max: 5,
      freebieCost: 2, xpMult: 2, xpNew: 3, poolKind: "abilities", category: name, creationCap: 3
    }));
    (p.groups || []).forEach(g => groups.push({ min: 0, max: 5, ...g }));
    return groups;
  }

  function specialDefault(s, identity = state.identity) {
    if (!s.fromIdentity) return Number(s.default || 0);
    const chosen = identity[s.fromIdentity.key];
    const mapped = s.fromIdentity.map[chosen];
    return Number(mapped ?? s.default ?? 0);
  }

  function freshState(profileId = C.profiles[0].id) {
    const p = C.profiles.find(x => x.id === profileId) || C.profiles[0];
    const base = {
      schema: 2,
      forge: C.code,
      profileId: p.id,
      terminologyId: C.terminologySets?.[0]?.id || "default",
      buildMode: "standard",
      identity: { name: "", player: "", chronicle: "", concept: "", nature: "", demeanor: "" },
      priorities: {
        attributes: Object.fromEntries(Object.keys(ATTRIBUTES).map((name, i) => [name, PRIORITY_NAMES[i]])),
        abilities: Object.fromEntries(Object.keys(C.abilities).map((name, i) => [name, PRIORITY_NAMES[i]]))
      },
      ratings: {},
      customRatings: {},
      specialBase: {},
      specialXp: {},
      items: {},
      merits: [],
      flaws: [],
      notes: {},
      xp: { available: 0, awarded: 0, spent: 0, history: [] },
      ui: { xpGroup: "", xpTrait: "", award: 1, customNames: {}, itemGroup: "", itemName: "", itemLevel: 1, itemSource: "" },
      updatedAt: Date.now()
    };
    (C.identityFields || []).concat(p.identityFields || []).forEach(f => {
      if (!(f.key in base.identity)) base.identity[f.key] = f.default ?? "";
      else if (f.default != null) base.identity[f.key] = f.default;
    });
    allGroups(p).forEach(g => {
      base.ratings[g.id] = {};
      base.customRatings[g.id] = [];
      g.traits.forEach(trait => {
        const free = Number((g.freeDots || {})[trait] || 0);
        base.ratings[g.id][trait] = { base: Math.max(g.min, free), xp: 0 };
      });
    });
    (p.specials || []).forEach(s => {
      base.specialBase[s.id] = specialDefault(s, base.identity);
      base.specialXp[s.id] = 0;
    });
    (p.itemGroups || []).forEach(g => { base.items[g.id] = []; });
    (p.noteFields || []).forEach(f => { base.notes[f.key] = ""; });
    return base;
  }

  function normalize(raw) {
    if (!raw || raw.forge !== C.code || !C.profiles.some(p => p.id === raw.profileId)) return freshState();
    const base = freshState(raw.profileId);
    const merged = { ...base, ...raw };
    merged.identity = { ...base.identity, ...(raw.identity || {}) };
    merged.priorities = {
      attributes: { ...base.priorities.attributes, ...(raw.priorities?.attributes || {}) },
      abilities: { ...base.priorities.abilities, ...(raw.priorities?.abilities || {}) }
    };
    merged.ratings = { ...base.ratings, ...(raw.ratings || {}) };
    allGroups(C.profiles.find(p => p.id === merged.profileId)).forEach(g => {
      merged.ratings[g.id] ||= {};
      g.traits.forEach(t => {
        const existing = merged.ratings[g.id][t];
        merged.ratings[g.id][t] = { base: Number(existing?.base ?? g.min), xp: Number(existing?.xp || 0) };
      });
    });
    merged.customRatings = { ...base.customRatings, ...(raw.customRatings || {}) };
    merged.specialBase = { ...base.specialBase, ...(raw.specialBase || {}) };
    merged.specialXp = { ...base.specialXp, ...(raw.specialXp || {}) };
    merged.items = { ...base.items, ...(raw.items || {}) };
    merged.notes = { ...base.notes, ...(raw.notes || {}) };
    merged.xp = { ...base.xp, ...(raw.xp || {}) };
    merged.ui = { ...base.ui, ...(raw.ui || {}), customNames: { ...base.ui.customNames, ...(raw.ui?.customNames || {}) } };
    return merged;
  }

  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(C.storageKey))); }
    catch { return freshState(); }
  }
  let state = load();

  function save() {
    state.updatedAt = Date.now();
    localStorage.setItem(C.storageKey, JSON.stringify(state));
    saveMessage = `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  function commit({ step = activeStep, focus = "" } = {}) {
    activeStep = Math.max(0, Math.min(STEPS.length - 1, step));
    save();
    render();
    if (focus) document.querySelector(focus)?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function current(group, trait) {
    const fixed = state.ratings[group]?.[trait];
    if (fixed) return Number(fixed.base || 0) + Number(fixed.xp || 0);
    const custom = (state.customRatings[group] || []).find(x => x.name === trait || x.id === trait);
    return custom ? Number(custom.base || 0) + Number(custom.xp || 0) : 0;
  }
  function baseRating(group, trait) {
    const fixed = state.ratings[group]?.[trait];
    if (fixed) return Number(fixed.base || 0);
    const custom = (state.customRatings[group] || []).find(x => x.name === trait || x.id === trait);
    return Number(custom?.base || 0);
  }
  function xpRating(group, trait) {
    const fixed = state.ratings[group]?.[trait];
    if (fixed) return Number(fixed.xp || 0);
    const custom = (state.customRatings[group] || []).find(x => x.name === trait || x.id === trait);
    return Number(custom?.xp || 0);
  }

  function poolFor(kind, category, p = profile()) {
    const priorities = state.priorities[kind];
    const order = priorities[category];
    const index = PRIORITY_NAMES.indexOf(order);
    return Number((p.pools[kind] || [0, 0, 0])[Math.max(0, index)] || 0);
  }

  function groupSpend(g) {
    const entries = [
      ...g.traits.map(name => ({ name, base: baseRating(g.id, name), free: Number((g.freeDots || {})[name] || 0) })),
      ...(state.customRatings[g.id] || []).map(x => ({ name: x.name, base: Number(x.base || 0), free: 0 }))
    ];
    if (g.kind === "attribute") return entries.reduce((sum, x) => sum + Math.max(0, x.base - g.min), 0);
    return entries.reduce((sum, x) => sum + Math.max(0, x.base - x.free), 0);
  }

  function ledger() {
    const p = profile();
    const lines = [];
    const warnings = [];
    let freebieSpent = 0;
    const secondaryPools = Object.fromEntries((p.secondaryPools || []).map(pool => [pool.id, { ...pool, spent: 0 }]));
    const charge = (budget, cost) => {
      if (budget && secondaryPools[budget]) secondaryPools[budget].spent += cost;
      else freebieSpent += cost;
    };
    for (const kind of ["attributes", "abilities"]) {
      const priorities = Object.values(state.priorities[kind]);
      if (new Set(priorities).size !== priorities.length) warnings.push({ type: "bad", text: `${kind === "attributes" ? "Attribute" : "Ability"} priorities must each be used once.` });
    }
    allGroups(p).forEach(g => {
      const spent = groupSpend(g);
      let allowance = 0;
      let initialSpend = spent;
      let extra = 0;
      if (g.poolKind === "attributes" || g.poolKind === "abilities") {
        allowance = poolFor(g.poolKind, g.category, p);
        if (g.creationCap) {
          const capped = [
            ...g.traits.map(t => Math.max(0, Math.min(baseRating(g.id, t), g.creationCap) - g.min)),
            ...(state.customRatings[g.id] || []).map(x => Math.max(0, Math.min(Number(x.base || 0), g.creationCap)))
          ].reduce((a, b) => a + b, 0);
          const aboveCap = [
            ...g.traits.map(t => Math.max(0, baseRating(g.id, t) - g.creationCap)),
            ...(state.customRatings[g.id] || []).map(x => Math.max(0, Number(x.base || 0) - g.creationCap))
          ].reduce((a, b) => a + b, 0);
          initialSpend = Math.min(capped, allowance);
          extra = Math.max(0, capped - allowance) + aboveCap;
        } else {
          initialSpend = Math.min(spent, allowance);
          extra = Math.max(0, spent - allowance);
        }
      } else {
        allowance = Number(g.pool || 0);
        initialSpend = Math.min(spent, allowance);
        extra = Math.max(0, spent - allowance);
      }
      const cost = extra * Number(g.freebieCost || 0);
      charge(g.budget, cost);
      lines.push({ label: groupLabel(g), spent, allowance, extra, cost, budget: g.budget });
      if (spent < allowance && state.buildMode !== "open") warnings.push({ type: "bad", text: `${groupLabel(g)}: spend ${allowance - spent} more creation dot${allowance - spent === 1 ? "" : "s"}.` });
      if (g.creationCap) {
        const over = g.traits.filter(t => baseRating(g.id, t) > g.creationCap).concat((state.customRatings[g.id] || []).filter(x => Number(x.base || 0) > g.creationCap).map(x => x.name));
        if (over.length) warnings.push({ type: "warn", text: `${groupLabel(g)}: ratings above ${g.creationCap} are correctly charged as freebies (${over.join(", ")}).` });
      }
    });
    (p.itemGroups || []).forEach(g => {
      const creationItems = (state.items[g.id] || []).filter(x => x.origin !== "xp");
      const spent = creationItems.reduce((sum, x) => sum + Number(x.rating || x.level || 1), 0);
      const allowance = Number(g.pool || 0);
      const extra = Math.max(0, spent - allowance);
      const cost = extra * Number(g.freebieCost || 0);
      charge(g.budget, cost);
      lines.push({ label: groupLabel(g), spent, allowance, extra, cost, budget: g.budget });
      if (spent < allowance && g.exact !== false && state.buildMode !== "open") warnings.push({ type: "bad", text: `${groupLabel(g)}: allocate ${allowance - spent} more point${allowance - spent === 1 ? "" : "s"}.` });
      if (g.maxCreationRating) creationItems.filter(x => Number(x.rating || x.level || 1) > g.maxCreationRating).forEach(x => warnings.push({ type: "bad", text: `${x.name || g.itemLabel} exceeds the standard starting limit of ${g.maxCreationRating}.` }));
    });
    (p.specials || []).forEach(s => {
      const start = specialDefault(s);
      const value = Number(state.specialBase[s.id] ?? start);
      const extra = Math.max(0, value - start);
      const cost = extra * Number(s.freebieCost || 0);
      charge(s.budget, cost);
      if (cost) lines.push({ label: specialLabel(s), spent: value, allowance: start, extra, cost, budget: s.budget });
      if (value < Number(s.min ?? 0) || value > Number(s.max ?? 10)) warnings.push({ type: "bad", text: `${specialLabel(s)} must be between ${s.min ?? 0} and ${s.max ?? 10}.` });
    });
    const meritCost = state.merits.reduce((sum, x) => sum + Number(x.cost || 0), 0);
    const flawTotal = state.flaws.reduce((sum, x) => sum + Number(x.cost || 0), 0);
    const flawCredit = Math.min(Number(p.flawCap ?? 7), flawTotal);
    freebieSpent += meritCost - flawCredit;
    if (meritCost) lines.push({ label: "Merits", spent: meritCost, allowance: 0, extra: meritCost, cost: meritCost });
    if (flawCredit) lines.push({ label: "Flaw credit", spent: flawTotal, allowance: Number(p.flawCap ?? 7), extra: 0, cost: -flawCredit });
    if (flawTotal > Number(p.flawCap ?? 7)) warnings.push({ type: "warn", text: `Only ${p.flawCap ?? 7} points of Flaws contribute to the freebie budget.` });
    const freebiePool = Number(p.pools.freebies || 0);
    const remaining = freebiePool - freebieSpent;
    if (remaining < 0 && state.buildMode !== "open") warnings.push({ type: "bad", text: `Freebie budget is overspent by ${Math.abs(remaining)}.` });
    if (remaining > 0 && state.buildMode !== "open") warnings.push({ type: "warn", text: `${remaining} freebie point${remaining === 1 ? "" : "s"} remain.` });
    Object.values(secondaryPools).forEach(pool => {
      pool.remaining = Number(pool.amount || 0) - pool.spent;
      if (pool.remaining < 0 && state.buildMode !== "open") warnings.push({ type: "bad", text: `${pool.label} are overspent by ${Math.abs(pool.remaining)}.` });
      if (pool.remaining > 0 && state.buildMode !== "open") warnings.push({ type: "warn", text: `${pool.remaining} ${pool.label.toLowerCase()} remain.` });
    });
    if (!state.identity.name.trim()) warnings.push({ type: "warn", text: "The character still needs a name." });
    (p.requiredIdentity || []).forEach(key => {
      const field = [...(C.identityFields || []), ...(p.identityFields || [])].find(f => f.key === key);
      if (!String(state.identity[key] || "").trim()) warnings.push({ type: "bad", text: `Choose ${field?.label || key}.` });
    });
    (p.customValidation ? p.customValidation(state, { current, specialDefault }) : []).forEach(w => warnings.push(w));
    if (!warnings.some(w => w.type === "bad")) warnings.unshift({ type: "good", text: state.buildMode === "open" ? "Open build: budgets are guidance, not blockers." : "No blocking creation conflicts found." });
    return { lines, warnings, freebiePool, freebieSpent, remaining, secondaryPools };
  }

  function renderDots(g, trait, editable = true) {
    const base = baseRating(g.id, trait);
    const xp = xpRating(g.id, trait);
    const total = base + xp;
    let html = '<span class="dots" role="group" aria-label="' + attr(trait) + ' rating">';
    for (let i = 1; i <= Number(g.max || 5); i++) {
      const cls = i <= base ? "filled" : i <= total ? "filled xp" : "";
      html += `<button class="dot ${cls}" type="button" data-action="rating" data-group="${attr(g.id)}" data-trait="${attr(trait)}" data-value="${i}" aria-label="Set ${attr(trait)} creation rating to ${i}" ${editable ? "" : "disabled"}></button>`;
    }
    return html + "</span>";
  }

  function renderTop() {
    return `<header class="topbar">
      <div class="brand"><div class="brand-mark">${renderSigil()}</div><div class="brand-copy"><strong>${esc(C.title)}</strong><small>Lantern &amp; Lever · World of Darkness character forge</small></div></div>
      <div class="top-actions"><span class="save-state">${esc(saveMessage)}</span>
        ${C.advancedTool ? `<a class="secondary-action tool-link" href="${attr(C.advancedTool.href)}">${esc(C.advancedTool.label)}</a>` : ""}
        <button type="button" class="secondary-action" data-action="import">Import</button>
        <button type="button" class="secondary-action" data-action="export">Export</button>
        <button type="button" data-action="print">Print / PDF</button>
        <button type="button" class="danger" data-action="reset">New</button>
        <input id="import-file" class="screen-reader-only" type="file" accept=".json,application/json">
      </div>
    </header>`;
  }

  function renderRail() {
    return `<aside class="rail"><div class="rail-character"><small>${esc(profile().label)}</small><h1>${esc(state.identity.name || "Unnamed character")}</h1><p>${esc(state.identity.concept || C.shortGame)}</p></div>
      <nav aria-label="Character creation steps">${STEPS.map((s, i) => `<button type="button" data-action="step" data-step="${i}" class="${i === activeStep ? "active" : ""}"><span class="step-number"><span>${i + 1}</span></span><span><b>${s[0]}</b><small>${s[1]}</small></span></button>`).join("")}</nav></aside>`;
  }

  function identityField(field) {
    const value = state.identity[field.key] ?? "";
    const help = field.help ? `<small>${esc(field.help)}</small>` : "";
    const label = fieldLabel(field);
    if (field.type === "select") return `<label class="field"><span>${esc(label)}</span><select data-bind="identity.${attr(field.key)}"><option value="">Choose…</option>${optionList(field.options || [], value)}</select>${help}</label>`;
    if (field.type === "textarea") return `<label class="field"><span>${esc(label)}</span><textarea data-bind="identity.${attr(field.key)}" placeholder="${attr(field.placeholder || "")}">${esc(value)}</textarea>${help}</label>`;
    return `<label class="field"><span>${esc(label)}</span><input data-bind="identity.${attr(field.key)}" value="${attr(value)}" placeholder="${attr(field.placeholder || "")}">${help}</label>`;
  }

  function renderTerminology() {
    const sets = C.terminologySets || [];
    if (!sets.length) return "";
    return `<section class="terminology-panel"><header><div><span class="eyebrow">Language</span><h3>Terminology set</h3></div><p>Choose the faction or sect vocabulary used on screen and on the printed sheet. This changes labels only—not rules, costs, or saved ratings.</p></header><div class="terminology-options" role="group" aria-label="Terminology set">${sets.map(set => `<button type="button" data-action="terminology" data-terminology="${attr(set.id)}" class="${set.id === state.terminologyId ? "selected" : ""}" aria-pressed="${set.id === state.terminologyId}"><b>${esc(set.label)}</b><span>${esc(set.description)}</span></button>`).join("")}</div></section>`;
  }

  function renderFoundation() {
    const p = profile();
    const fields = [...(C.identityFields || []), ...(p.identityFields || [])];
    return `<div class="step-heading"><div><span class="eyebrow">Step 1</span><h2>Choose the kind of character</h2></div><p>Each template carries its own starting pools and relevant supernatural traits. Storyteller Open keeps the rules visible without enforcing budgets.</p></div>
      <div class="mode-grid">${C.profiles.map(x => `<button class="mode-card ${x.id === p.id ? "selected" : ""}" type="button" data-action="profile" data-profile="${attr(x.id)}"><b>${esc(x.label)}</b><span>${esc(x.description)}</span><em>${esc(x.category)}</em></button>`).join("")}</div>
      ${renderTerminology()}
      <div class="section-card"><header><div><h3>Build method</h3><p>Choose how strictly the creation ledger should interpret the starting package.</p></div></header><div class="section-body"><label class="field"><span>Creation mode</span><select data-bind="buildMode">
        <option value="standard" ${state.buildMode === "standard" ? "selected" : ""}>Standard starting character</option>
        <option value="experienced" ${state.buildMode === "experienced" ? "selected" : ""}>Experienced character (standard creation + XP)</option>
        <option value="open" ${state.buildMode === "open" ? "selected" : ""}>Storyteller Open build</option>
      </select><small>Experience purchases never alter or consume the creation freebie ledger.</small></label></div></div>
      <div class="section-card"><header><div><h3>Identity</h3><p>Record the character first; the numbers should serve the concept.</p></div></header><div class="section-body"><div class="field-grid three">${fields.map(identityField).join("")}</div></div></div>
      <p class="rule-note"><strong>${esc(p.label)}:</strong> ${esc(p.rulesNote)}</p>`;
  }

  function renderPriority(kind, categories) {
    return `<div class="priority-bar">${categories.map(category => `<label class="priority-chip"><span>${esc(category)}</span><select data-priority-kind="${kind}" data-priority-category="${attr(category)}">${PRIORITY_NAMES.map((name, i) => `<option value="${name}" ${state.priorities[kind][category] === name ? "selected" : ""}>${name[0].toUpperCase() + name.slice(1)} · ${profile().pools[kind][i]} dots</option>`).join("")}</select></label>`).join("")}</div>`;
  }

  function renderTraitColumn(g) {
    const spent = groupSpend(g);
    const allowance = g.poolKind ? poolFor(g.poolKind, g.category) : Number(g.pool || 0);
    const budgetClass = spent > allowance ? "over" : spent === allowance ? "ok" : "";
    const fixed = g.traits.map(trait => `<div class="trait-row"><span>${esc(trait)}</span>${renderDots(g, trait)}</div>`).join("");
    const custom = (state.customRatings[g.id] || []).map(row => `<div class="trait-row"><span>${esc(row.name)}<small>Custom</small></span>${renderDots(g, row.id)}<button class="icon-button" type="button" data-action="remove-custom" data-group="${attr(g.id)}" data-id="${row.id}" aria-label="Remove ${attr(row.name)}">×</button></div>`).join("");
    return `<section class="trait-column"><header><h3>${esc(groupLabel(g))}</h3><span class="budget-label ${budgetClass}">${spent} / ${allowance}</span></header>${fixed}${custom}
      <div class="field-grid two"><label class="field"><span>Custom trait</span><input data-ui-custom="${attr(g.id)}" value="${attr(state.ui.customNames[g.id] || "")}" placeholder="Name"></label><button class="button light add-row" type="button" data-action="add-custom" data-group="${attr(g.id)}">Add</button></div>
    </section>`;
  }

  function renderAttributes() {
    const groups = allGroups().filter(g => g.kind === "attribute");
    return `<div class="step-heading"><div><span class="eyebrow">Step 2</span><h2>Attributes</h2></div><p>Every Attribute begins at one dot. Assign 7 / 5 / 3 for full supernatural characters, or the template’s displayed mortal-scale package.</p></div>
      ${renderPriority("attributes", groups.map(g => g.category))}
      <div class="trait-columns">${groups.map(renderTraitColumn).join("")}</div>`;
  }

  function renderAbilities() {
    const groups = allGroups().filter(g => g.kind === "ability");
    return `<div class="step-heading"><div><span class="eyebrow">Step 3</span><h2>Abilities</h2></div><p>Assign the category pools shown below. Standard creation ratings above three are separated and charged as freebies.</p></div>
      ${renderPriority("abilities", groups.map(g => g.category))}
      <div class="trait-columns">${groups.map(renderTraitColumn).join("")}</div>`;
  }

  function renderRatedGroup(g) {
    const spent = groupSpend(g);
    return `<section class="rated-list"><header><h3>${esc(groupLabel(g))}</h3><span class="budget-label ${spent > Number(g.pool || 0) ? "over" : spent === Number(g.pool || 0) ? "ok" : ""}">${spent} / ${Number(g.pool || 0)}</span></header>
      ${g.traits.map(trait => `<div class="trait-row"><span>${esc(trait)}</span>${renderDots(g, trait)}</div>`).join("")}
      ${(state.customRatings[g.id] || []).map(row => `<div class="trait-row"><span>${esc(row.name)}<small>Custom</small></span>${renderDots(g, row.id)}<button class="icon-button" type="button" data-action="remove-custom" data-group="${attr(g.id)}" data-id="${row.id}" aria-label="Remove ${attr(row.name)}">×</button></div>`).join("")}
      <div class="field-grid two"><label class="field"><span>Custom trait</span><input data-ui-custom="${attr(g.id)}" value="${attr(state.ui.customNames[g.id] || "")}" placeholder="Name"></label><button class="button light add-row" type="button" data-action="add-custom" data-group="${attr(g.id)}">Add</button></div>
      ${g.note ? `<p class="rule-note">${esc(g.note)}</p>` : ""}
    </section>`;
  }

  function renderItemGroup(g) {
    const items = state.items[g.id] || [];
    const spent = items.filter(x => x.origin !== "xp").reduce((sum, x) => sum + Number(x.rating || x.level || 1), 0);
    return `<section class="rated-list"><header><h3>${esc(groupLabel(g))}</h3><span class="budget-label ${spent > Number(g.pool || 0) ? "over" : spent === Number(g.pool || 0) ? "ok" : ""}">${spent} / ${Number(g.pool || 0)}</span></header>
      <div class="list-table">${items.map(row => `<div class="list-row"><input data-item-field="name" data-item-group="${attr(g.id)}" data-id="${row.id}" value="${attr(row.name)}" aria-label="${attr(g.itemLabel || "Trait")} name"><select data-item-field="source" data-item-group="${attr(g.id)}" data-id="${row.id}" aria-label="Source">${optionList(g.sources || ["Core", "Custom"], row.source)}</select><input type="number" min="1" max="${g.max || 10}" data-item-field="rating" data-item-group="${attr(g.id)}" data-id="${row.id}" value="${Number(row.rating || row.level || 1)}" aria-label="Rating"><button class="icon-button" type="button" data-action="remove-item" data-group="${attr(g.id)}" data-id="${row.id}" aria-label="Remove">×</button></div>`).join("")}</div>
      <button class="button light small add-row" type="button" data-action="add-item" data-group="${attr(g.id)}">Add ${esc(g.itemLabel || "entry")}</button>
      ${g.note ? `<p class="rule-note">${esc(g.note)}</p>` : ""}
    </section>`;
  }

  function renderAdvantages() {
    const p = profile();
    const groups = allGroups().filter(g => !["attribute", "ability"].includes(g.kind));
    return `<div class="step-heading"><div><span class="eyebrow">Step 4</span><h2>${esc(uiTerm("advantagesHeading", "Advantages and supernatural traits"))}</h2></div><p>The selected template determines which powers, relationships, and pools belong here. Custom entries keep supplement and chronicle material usable.</p></div>
      <div class="advantages-grid">${groups.map(renderRatedGroup).join("")}${(p.itemGroups || []).map(renderItemGroup).join("")}</div>
      ${(p.specials || []).length ? `<div class="section-card"><header><div><h3>Core ratings</h3><p>Starting values come from the template and selected lineage, role, or affiliation.</p></div></header><div class="section-body"><div class="special-grid">${p.specials.map(s => {
        const total = Number(state.specialBase[s.id] || 0) + Number(state.specialXp[s.id] || 0);
        return `<div class="special-card"><label for="special-${attr(s.id)}">${esc(specialLabel(s))}</label><strong>${total}${state.specialXp[s.id] ? ` <small>(+${state.specialXp[s.id]} XP)</small>` : ""}</strong><input id="special-${attr(s.id)}" type="number" min="${s.min ?? 0}" max="${s.max ?? 10}" data-special="${attr(s.id)}" value="${Number(state.specialBase[s.id] ?? specialDefault(s))}"><small>${esc(s.help || `Standard start: ${specialDefault(s)}`)}</small></div>`;
      }).join("")}</div></div></div>` : ""}
      ${p.advantageNote ? `<p class="rule-note">${esc(p.advantageNote)}</p>` : ""}`;
  }

  function renderMeritList(kind) {
    const rows = state[kind];
    const singular = kind === "merits" ? "Merit" : "Flaw";
    return `<section class="rated-list"><header><h3>${singular}s</h3><span class="budget-label">${rows.reduce((s, x) => s + Number(x.cost || 0), 0)} points</span></header><div class="list-table">
      ${rows.map(row => `<div class="list-row three"><input data-${kind}-field="name" data-id="${row.id}" value="${attr(row.name)}" placeholder="${singular} name"><input type="number" min="1" max="10" data-${kind}-field="cost" data-id="${row.id}" value="${Number(row.cost || 1)}"><button class="icon-button" type="button" data-action="remove-${kind}" data-id="${row.id}" aria-label="Remove">×</button></div>`).join("")}</div>
      <button class="button light small add-row" type="button" data-action="add-${kind}">Add ${singular}</button></section>`;
  }

  function renderStory() {
    const p = profile();
    return `<div class="step-heading"><div><span class="eyebrow">Step 5</span><h2>Story and defining details</h2></div><p>Record only the rule names and character-specific facts the table needs. The Forge remains a character aid, not a replacement for the books.</p></div>
      <div class="merit-grid">${renderMeritList("merits")}${renderMeritList("flaws")}</div>
      <div class="section-card"><header><div><h3>Character record</h3><p>These notes remain in local saves, exports, and the printed record.</p></div></header><div class="section-body"><div class="field-grid two">${(p.noteFields || []).map(identityFieldFromNotes).join("")}</div></div></div>`;
  }
  function identityFieldFromNotes(field) {
    const value = state.notes[field.key] || "";
    return `<label class="field"><span>${esc(fieldLabel(field))}</span><textarea data-bind="notes.${attr(field.key)}" placeholder="${attr(field.placeholder || "")}">${esc(value)}</textarea>${field.help ? `<small>${esc(field.help)}</small>` : ""}</label>`;
  }

  function xpOptions() {
    const p = profile();
    const rows = [];
    allGroups(p).forEach(g => {
      if (g.xp === false) return;
      g.traits.forEach(t => rows.push({ group: g.id, trait: t, label: `${groupLabel(g)} · ${t}` }));
      (state.customRatings[g.id] || []).forEach(t => rows.push({ group: g.id, trait: t.id, label: `${groupLabel(g)} · ${t.name}` }));
    });
    (p.specials || []).filter(s => s.xp !== false).forEach(s => rows.push({ group: `special:${s.id}`, trait: s.id, label: specialLabel(s) }));
    return rows;
  }
  function xpCost(groupIdValue, traitValue) {
    const p = profile();
    if (groupIdValue.startsWith("special:")) {
      const id = groupIdValue.slice(8);
      const s = (p.specials || []).find(x => x.id === id);
      const rating = Number(state.specialBase[id] || 0) + Number(state.specialXp[id] || 0);
      return Math.max(1, rating * Number(s?.xpMult || 1));
    }
    const g = allGroups(p).find(x => x.id === groupIdValue);
    if (!g) return 0;
    const rating = current(groupIdValue, traitValue);
    if (rating === 0 && g.xpNew != null) return Number(g.xpNew);
    let mult = Number(g.xpMult || 1);
    if (g.affinityField && state.identity[g.affinityField] === traitValue && g.xpAffinityMult) mult = Number(g.xpAffinityMult);
    return Math.max(1, rating * mult);
  }
  function chosenXpOption() {
    const options = xpOptions();
    let selected = options.find(x => x.group === state.ui.xpGroup && x.trait === state.ui.xpTrait);
    if (!selected) selected = options[0];
    return selected;
  }
  function itemPurchaseCost(g) {
    const level = Math.max(1, Number(state.ui.itemLevel || 1));
    const source = state.ui.itemSource || g.xpSources?.[0]?.value || "";
    const entry = (g.xpSources || []).find(x => x.value === source);
    return level * Number(entry?.mult || g.xpMult || 3);
  }

  function renderAdvancement() {
    const p = profile();
    const options = xpOptions();
    const selected = chosenXpOption();
    if (selected && (!state.ui.xpGroup || !state.ui.xpTrait)) { state.ui.xpGroup = selected.group; state.ui.xpTrait = selected.trait; }
    const cost = selected ? xpCost(selected.group, selected.trait) : 0;
    const xpItemGroups = (p.itemGroups || []).filter(g => g.xpPurchasable);
    const selectedItemGroup = xpItemGroups.find(g => g.id === state.ui.itemGroup) || xpItemGroups[0];
    return `<div class="step-heading"><div><span class="eyebrow">Step 6</span><h2>Advancement</h2></div><p>XP purchases are stored as separate advancement dots. They never alter the creation freebie calculation.</p></div>
      <div class="xp-bank"><div><span>Awarded</span><b>${state.xp.awarded}</b></div><div><span>Spent</span><b>${state.xp.spent}</b></div><div><span>Available</span><b>${state.xp.available}</b></div></div>
      <div class="xp-layout"><div>
        <section class="section-card"><header><div><h3>Award experience</h3><p>Add XP granted by the Storyteller.</p></div></header><div class="section-body"><div class="field-grid two"><label class="field"><span>XP to add</span><input type="number" min="1" data-ui="award" value="${Number(state.ui.award || 1)}"></label><button class="button primary add-row" type="button" data-action="award-xp">Add XP</button></div></div></section>
        <section class="section-card"><header><div><h3>Purchase a rating</h3><p>The next-dot cost uses the current total rating.</p></div></header><div class="section-body">
          <label class="field"><span>Trait</span><select data-ui="xpChoice">${options.map(x => `<option value="${attr(x.group)}||${attr(x.trait)}" ${selected && x.group === selected.group && x.trait === selected.trait ? "selected" : ""}>${esc(x.label)} · current ${current(x.group, x.trait)}</option>`).join("")}</select></label>
          <div class="purchase-preview">Next dot costs <b>${cost} XP</b>. ${state.xp.available >= cost ? "The purchase is available." : `You need ${Math.max(0, cost - state.xp.available)} more XP.`}</div>
          <button class="button primary" type="button" data-action="buy-xp" ${!selected || state.xp.available < cost ? "disabled" : ""}>Purchase next dot</button>
        </div></section>
        ${selectedItemGroup ? `<section class="section-card"><header><div><h3>Learn a new ${esc(selectedItemGroup.itemLabel || "power")}</h3><p>Item-based powers use level and source multipliers.</p></div></header><div class="section-body">
          <div class="field-grid two"><label class="field"><span>Type</span><select data-ui="itemGroup">${optionList(xpItemGroups.map(g => ({ value: g.id, label: groupLabel(g) })), selectedItemGroup.id)}</select></label><label class="field"><span>Name</span><input data-ui="itemName" value="${attr(state.ui.itemName)}"></label><label class="field"><span>Level</span><input type="number" min="1" max="5" data-ui="itemLevel" value="${Number(state.ui.itemLevel || 1)}"></label><label class="field"><span>Source</span><select data-ui="itemSource">${optionList((selectedItemGroup.xpSources || []).map(x => ({ value: x.value, label: x.label })), state.ui.itemSource || selectedItemGroup.xpSources?.[0]?.value)}</select></label></div>
          <div class="purchase-preview">This purchase costs <b>${itemPurchaseCost(selectedItemGroup)} XP</b>.</div>
          <button class="button primary" type="button" data-action="buy-item-xp" ${!state.ui.itemName.trim() || state.xp.available < itemPurchaseCost(selectedItemGroup) ? "disabled" : ""}>Record purchase</button>
        </div></section>` : ""}
      </div><section class="rated-list history"><header><h3>Purchase history</h3><button class="button light small" type="button" data-action="undo-xp" ${!state.xp.history.length ? "disabled" : ""}>Undo last purchase</button></header>
        ${state.xp.history.length ? state.xp.history.slice().reverse().map(x => `<div class="history-item"><b>${esc(x.label)}</b><span>${esc(x.detail)} · ${x.cost} XP</span></div>`).join("") : '<p class="rule-note">No XP purchases yet.</p>'}
      </section>`;
  }

  function reviewRows(g) {
    const rows = [];
    g.traits.forEach(t => { const value = current(g.id, t); if (value > g.min) rows.push([t, value]); });
    (state.customRatings[g.id] || []).forEach(t => { const value = Number(t.base || 0) + Number(t.xp || 0); if (value) rows.push([t.name, value]); });
    return rows;
  }
  function renderFinish() {
    const p = profile();
    const l = ledger();
    const groups = allGroups(p);
    return `<div class="step-heading"><div><span class="eyebrow">Step 7</span><h2>Review and take the character with you</h2></div><p>Resolve any blocking creation conflicts, then export an editable draft or print a clean record.</p></div>
      <div class="review-grid">
        <section class="review-block"><h3>Identity</h3>${[...(C.identityFields || []), ...(p.identityFields || [])].map(f => state.identity[f.key] ? `<div class="review-trait"><span>${esc(fieldLabel(f))}</span><b>${esc(state.identity[f.key])}</b></div>` : "").join("")}</section>
        <section class="review-block"><h3>Creation ledger</h3><div class="review-trait"><span>Freebies</span><b>${l.freebieSpent} / ${l.freebiePool}</b></div>${Object.values(l.secondaryPools).map(pool => `<div class="review-trait"><span>${esc(pool.label)}</span><b>${pool.spent} / ${pool.amount}</b></div>`).join("")}<div class="review-trait"><span>XP available</span><b>${state.xp.available}</b></div>${l.warnings.map(w => `<p>${w.type === "bad" ? "⚠ " : ""}${esc(w.text)}</p>`).join("")}</section>
        ${groups.map(g => { const rows = reviewRows(g); return rows.length ? `<section class="review-block"><h3>${esc(groupLabel(g))}</h3>${rows.map(([name, value]) => `<div class="review-trait"><span>${esc(name)}</span><b>${dotsText(value, Math.max(5, value))}</b></div>`).join("")}</section>` : ""; }).join("")}
        ${(p.itemGroups || []).map(g => (state.items[g.id] || []).length ? `<section class="review-block"><h3>${esc(groupLabel(g))}</h3>${state.items[g.id].map(x => `<div class="review-trait"><span>${esc(x.name || "Unnamed")}</span><b>${esc(x.source || "")} · ${Number(x.rating || 1)}</b></div>`).join("")}</section>` : "").join("")}
        <section class="review-block"><h3>Merits and Flaws</h3>${state.merits.concat(state.flaws).map(x => `<div class="review-trait"><span>${esc(x.name || "Unnamed")}</span><b>${x.cost}</b></div>`).join("") || "<p>None recorded.</p>"}</section>
        <section class="review-block"><h3>Notes</h3>${Object.entries(state.notes).filter(([,v]) => v).map(([k,v]) => `<p><b>${esc((p.noteFields || []).find(f => f.key === k)?.label || k)}:</b> ${esc(v)}</p>`).join("") || "<p>No notes recorded.</p>"}</section>
      </div><div class="step-actions"><button class="button light" type="button" data-action="export">Export editable character</button><button class="button primary" type="button" data-action="print">Print / Save PDF</button></div>`;
  }

  function renderStep() {
    return [renderFoundation, renderAttributes, renderAbilities, renderAdvantages, renderStory, renderAdvancement, renderFinish][activeStep]();
  }

  function renderLedger() {
    const l = ledger();
    return `<aside class="ledger"><h2>Creation ledger</h2><div>${l.lines.map(x => `<div class="ledger-line"><span>${esc(x.label)}${x.extra ? ` · ${x.extra} freebie` : ""}${x.budget ? ` · ${esc(l.secondaryPools[x.budget]?.shortLabel || l.secondaryPools[x.budget]?.label || x.budget)}` : ""}</span><b>${x.spent} / ${x.allowance}${x.cost ? ` · ${x.cost > 0 ? "+" : ""}${x.cost} FP` : ""}</b></div>`).join("")}</div>
      <div class="ledger-total"><strong><span>Freebies remaining</span><span>${l.remaining}</span></strong><small>${state.buildMode === "open" ? "Storyteller Open shows budgets as reference only." : `${l.freebieSpent} spent from ${l.freebiePool}, after eligible Flaw credit.`}</small></div>
      ${Object.values(l.secondaryPools).map(pool => `<div class="ledger-total secondary"><strong><span>${esc(pool.label)} remaining</span><span>${pool.remaining}</span></strong><small>${pool.spent} spent from ${pool.amount}.</small></div>`).join("")}
      <ul class="validation">${l.warnings.slice(0, 8).map(w => `<li class="${w.type}">${esc(w.text)}</li>`).join("")}</ul></aside>`;
  }

  function renderFooter() {
    return `<footer class="fan-footer"><img src="darkpack-logo.png" alt="World of Darkness Dark Pack logo"><div><p><strong>Unofficial fan material.</strong> This is not official World of Darkness material and is not endorsed by Paradox Interactive.</p><p>Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved. For more information please visit worldofdarkness.com.</p><p>Created under the World of Darkness Dark Pack Agreement. This free tool records trait names and player-entered data; it does not reproduce powers or rulebook text.</p></div></footer>`;
  }

  function printBlock(title, rows) {
    if (!rows.length) return "";
    return `<section class="print-block"><h3>${esc(title)}</h3>${rows.map(([name, value, max]) => `<div class="print-row"><span>${esc(name)}</span><b class="print-dots">${typeof value === "number" ? dotsText(value, max || Math.max(5, value)) : esc(value)}</b></div>`).join("")}</section>`;
  }
  function renderPrint() {
    const p = profile();
    const identity = [...(C.identityFields || []), ...(p.identityFields || [])].map(f => [fieldLabel(f), state.identity[f.key]]).filter(([,v]) => v);
    const groups = allGroups(p);
    const specials = (p.specials || []).map(s => [specialLabel(s), Number(state.specialBase[s.id] || 0) + Number(state.specialXp[s.id] || 0)]);
    const items = (p.itemGroups || []).flatMap(g => (state.items[g.id] || []).map(x => [`${groupLabel(g)}: ${x.name || "Unnamed"}`, `${x.source || ""} ${x.rating || 1}`.trim()]));
    return `<article class="print-sheet"><header class="print-head"><div class="print-sigil">${renderSigil()}</div><div><h1>${esc(state.identity.name || "Unnamed Character")}</h1><p>${esc(C.title)} · ${esc(p.label)} · ${esc(terminology().label || "Core terminology")}</p></div><aside><b>${esc(C.code.toUpperCase())}</b><span>${esc(state.identity.chronicle || "Character record")}</span></aside></header>
      <section class="print-identity">${identity.slice(0, 9).map(([label, value]) => `<div><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("")}</section>
      <div class="print-title">Attributes</div><div class="print-columns">${groups.filter(g => g.kind === "attribute").map(g => printBlock(groupLabel(g), g.traits.map(t => [t, current(g.id, t)]).concat((state.customRatings[g.id] || []).map(x => [x.name, Number(x.base || 0) + Number(x.xp || 0)])))).join("")}</div>
      <div class="print-title">Abilities</div><div class="print-columns">${groups.filter(g => g.kind === "ability").map(g => printBlock(groupLabel(g), g.traits.map(t => [t, current(g.id, t)]).concat((state.customRatings[g.id] || []).map(x => [x.name, Number(x.base || 0) + Number(x.xp || 0)])))).join("")}</div>
      <div class="print-title">${esc(uiTerm("advantagesPrintTitle", "Advantages"))}</div><div class="print-columns two">${groups.filter(g => !["attribute","ability"].includes(g.kind)).map(g => printBlock(groupLabel(g), reviewRows(g))).join("")}${printBlock(uiTerm("coreRatings", "Core ratings"), specials)}${printBlock("Named traits", items)}</div>
      <div class="print-title page-break">Character and chronicle record</div><div class="print-columns two">${printBlock("Merits", state.merits.map(x => [x.name, String(x.cost)]))}${printBlock("Flaws", state.flaws.map(x => [x.name, String(x.cost)]))}</div>
      <div class="print-columns two" style="margin-top:9px">${Object.entries(state.notes).filter(([,v]) => v).map(([key,value]) => `<section class="print-prose"><h3>${esc((p.noteFields || []).find(f => f.key === key)?.label || key)}</h3><p>${esc(value)}</p></section>`).join("")}</div>
      <div class="print-title">Advancement history</div>${state.xp.history.length ? state.xp.history.map(x => `<div class="print-row"><span>${esc(x.label)} · ${esc(x.detail)}</span><b>${x.cost} XP</b></div>`).join("") : '<div class="print-row"><span>No purchases recorded.</span></div>'}
      <footer class="print-footer"><span>Generated with ${esc(C.title)}</span><span>Unofficial Dark Pack fan material · Lantern and Lever</span></footer></article>`;
  }

  function render() {
    app.innerHTML = `<div class="shell">${renderTop()}<div class="workspace">${renderRail()}<main class="paper"><header class="masthead"><div class="masthead-sigil">${renderSigil()}</div><span class="eyebrow">${esc(C.game)}</span><h2>${esc(profile().label)}</h2><p>${esc(profile().description)}</p></header>${renderStep()}${renderFooter()}</main>${renderLedger()}</div></div>${renderPrint()}`;
    bindImport();
  }

  function setPath(path, value) {
    const parts = path.split(".");
    let target = state;
    for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]];
    target[parts.at(-1)] = value;
  }
  function changeIdentity(key, value) {
    const p = profile();
    const relevant = (p.specials || []).filter(s => s.fromIdentity?.key === key);
    const beforeIdentity = { ...state.identity };
    relevant.forEach(s => {
      const oldDefault = specialDefault(s, beforeIdentity);
      state.identity[key] = value;
      const newDefault = specialDefault(s, state.identity);
      if (Number(state.specialBase[s.id]) === oldDefault) state.specialBase[s.id] = newDefault;
      state.identity[key] = beforeIdentity[key];
    });
    state.identity[key] = value;
  }
  function findCustom(group, id) { return (state.customRatings[group] || []).find(x => x.id === id || x.name === id); }

  app.addEventListener("input", event => {
    const el = event.target;
    if (el.dataset.bind) {
      const path = el.dataset.bind;
      const value = el.type === "number" ? Number(el.value) : el.value;
      if (path.startsWith("identity.")) changeIdentity(path.slice(9), value); else setPath(path, value);
    } else if (el.dataset.uiCustom) {
      state.ui.customNames[el.dataset.uiCustom] = el.value;
    } else if (el.dataset.special) {
      state.specialBase[el.dataset.special] = Number(el.value);
    } else if (el.dataset.ui) {
      if (el.dataset.ui === "xpChoice") {
        const [group, trait] = el.value.split("||");
        state.ui.xpGroup = group; state.ui.xpTrait = trait;
      } else state.ui[el.dataset.ui] = el.type === "number" ? Number(el.value) : el.value;
    } else if (el.dataset.itemField) {
      const row = (state.items[el.dataset.itemGroup] || []).find(x => x.id === el.dataset.id);
      if (row) row[el.dataset.itemField] = el.type === "number" ? Number(el.value) : el.value;
    } else if (el.dataset.meritsField || el.dataset.flawsField) {
      const kind = el.dataset.meritsField ? "merits" : "flaws";
      const field = el.dataset.meritsField || el.dataset.flawsField;
      const row = state[kind].find(x => x.id === el.dataset.id);
      if (row) row[field] = el.type === "number" ? Number(el.value) : el.value;
    } else return;
    save();
  });
  app.addEventListener("change", event => {
    const el = event.target;
    if (el.dataset.priorityKind) {
      state.priorities[el.dataset.priorityKind][el.dataset.priorityCategory] = el.value;
      commit();
    } else if (el.dataset.bind || el.dataset.ui || el.dataset.itemField || el.dataset.special) commit();
  });

  app.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "step") return commit({ step: Number(button.dataset.step) });
    if (action === "terminology") {
      if (!(C.terminologySets || []).some(set => set.id === button.dataset.terminology)) return;
      state.terminologyId = button.dataset.terminology;
      return commit({ step: activeStep });
    }
    if (action === "profile") {
      if (button.dataset.profile === state.profileId) return;
      const hasWork = state.identity.name || state.merits.length || state.flaws.length || state.xp.history.length || allGroups().some(g => groupSpend(g) > (g.kind === "attribute" ? 0 : 0));
      if (hasWork && !confirm("Switching templates starts a new character. Export this draft first if you want to keep it. Continue?")) return;
      const terminologyId = state.terminologyId;
      state = freshState(button.dataset.profile);
      state.terminologyId = terminologyId;
      return commit({ step: 0 });
    }
    if (action === "rating") {
      const g = allGroups().find(x => x.id === button.dataset.group);
      if (!g) return;
      const custom = findCustom(g.id, button.dataset.trait);
      const value = Number(button.dataset.value);
      if (custom) custom.base = custom.base === value ? Math.max(g.min, value - 1) : value;
      else {
        const row = state.ratings[g.id][button.dataset.trait];
        row.base = row.base === value ? Math.max(g.min, value - 1) : value;
      }
      return commit();
    }
    if (action === "add-custom") {
      const g = allGroups().find(x => x.id === button.dataset.group);
      const name = (state.ui.customNames[g.id] || "").trim();
      if (!name) return;
      if (g.traits.includes(name) || (state.customRatings[g.id] || []).some(x => x.name.toLowerCase() === name.toLowerCase())) return alert("That trait is already present.");
      state.customRatings[g.id].push({ id: uid(), name, base: g.min || 0, xp: 0 });
      state.ui.customNames[g.id] = "";
      return commit();
    }
    if (action === "remove-custom") {
      state.customRatings[button.dataset.group] = (state.customRatings[button.dataset.group] || []).filter(x => x.id !== button.dataset.id);
      return commit();
    }
    if (action === "add-item") {
      const g = (profile().itemGroups || []).find(x => x.id === button.dataset.group);
      state.items[g.id].push({ id: uid(), name: "", source: g.sources?.[0] || "Core", rating: 1, origin: "creation" });
      return commit();
    }
    if (action === "remove-item") {
      state.items[button.dataset.group] = state.items[button.dataset.group].filter(x => x.id !== button.dataset.id);
      return commit();
    }
    if (action === "add-merits" || action === "add-flaws") {
      const kind = action.slice(4);
      state[kind].push({ id: uid(), name: "", cost: 1 });
      return commit();
    }
    if (action === "remove-merits" || action === "remove-flaws") {
      const kind = action.slice(7);
      state[kind] = state[kind].filter(x => x.id !== button.dataset.id);
      return commit();
    }
    if (action === "award-xp") {
      const amount = Math.max(1, Number(state.ui.award || 1));
      state.xp.available += amount; state.xp.awarded += amount;
      return commit();
    }
    if (action === "buy-xp") {
      const chosen = chosenXpOption();
      if (!chosen) return;
      const cost = xpCost(chosen.group, chosen.trait);
      if (cost > state.xp.available) return;
      const before = current(chosen.group, chosen.trait);
      if (chosen.group.startsWith("special:")) state.specialXp[chosen.trait] = Number(state.specialXp[chosen.trait] || 0) + 1;
      else {
        const fixed = state.ratings[chosen.group]?.[chosen.trait];
        if (fixed) fixed.xp = Number(fixed.xp || 0) + 1;
        else findCustom(chosen.group, chosen.trait).xp += 1;
      }
      state.xp.available -= cost; state.xp.spent += cost;
      state.xp.history.push({ id: uid(), type: "rating", group: chosen.group, trait: chosen.trait, label: chosen.label, detail: `${before} → ${before + 1}`, cost });
      return commit();
    }
    if (action === "buy-item-xp") {
      const groups = (profile().itemGroups || []).filter(g => g.xpPurchasable);
      const g = groups.find(x => x.id === state.ui.itemGroup) || groups[0];
      const cost = itemPurchaseCost(g);
      if (!g || !state.ui.itemName.trim() || cost > state.xp.available) return;
      const source = state.ui.itemSource || g.xpSources?.[0]?.value || "";
      const row = { id: uid(), name: state.ui.itemName.trim(), source, rating: Number(state.ui.itemLevel || 1), origin: "xp" };
      state.items[g.id].push(row);
      state.xp.available -= cost; state.xp.spent += cost;
      state.xp.history.push({ id: uid(), type: "item", itemGroup: g.id, itemId: row.id, label: `${g.itemLabel || "Trait"} · ${row.name}`, detail: `Level ${row.rating}, ${source}`, cost });
      state.ui.itemName = "";
      return commit();
    }
    if (action === "undo-xp") {
      const purchase = state.xp.history.pop();
      if (!purchase) return;
      if (purchase.type === "rating") {
        if (purchase.group.startsWith("special:")) state.specialXp[purchase.trait] = Math.max(0, Number(state.specialXp[purchase.trait] || 0) - 1);
        else {
          const fixed = state.ratings[purchase.group]?.[purchase.trait];
          if (fixed) fixed.xp = Math.max(0, Number(fixed.xp || 0) - 1);
          else {
            const row = findCustom(purchase.group, purchase.trait);
            if (row) row.xp = Math.max(0, Number(row.xp || 0) - 1);
          }
        }
      } else if (purchase.type === "item") state.items[purchase.itemGroup] = state.items[purchase.itemGroup].filter(x => x.id !== purchase.itemId);
      state.xp.available += purchase.cost; state.xp.spent -= purchase.cost;
      return commit();
    }
    if (action === "import") return document.getElementById("import-file").click();
    if (action === "export") return exportCharacter();
    if (action === "print") return window.print();
    if (action === "reset") {
      if (!confirm("Start a new character? Export first if you want to keep this draft.")) return;
      const terminologyId = state.terminologyId;
      state = freshState(state.profileId);
      state.terminologyId = terminologyId;
      return commit({ step: 0 });
    }
  });

  function exportCharacter() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const safeName = (state.identity.name || "character").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    link.download = `${safeName || "character"}-${C.code}-forge.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  }
  function bindImport() {
    const input = document.getElementById("import-file");
    input?.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        if (imported.forge !== C.code) throw new Error(`This file belongs to ${imported.forge || "another"} Forge.`);
        state = normalize(imported);
        commit({ step: 6 });
      } catch (error) { alert(`Could not import that character: ${error.message}`); }
    }, { once: true });
  }

  render();
})();
