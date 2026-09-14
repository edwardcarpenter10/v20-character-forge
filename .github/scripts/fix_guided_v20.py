from pathlib import Path


def replace_once(text, old, new, label):
    if new in text:
        print(f"already: {label}")
        return text
    if old not in text:
        print(f"missing: {label}")
        return text
    print(f"patching: {label}")
    return text.replace(old, new, 1)


p = Path("app.js")
text = p.read_text(encoding="utf-8")

text = replace_once(
    text,
    '      buildMode: "standard",\n      identity:',
    '      buildMode: "standard",\n      virtueTypes: { ethics: "conscience", control: "selfControl" },\n      identity:',
    "virtue type state",
)
text = replace_once(
    text,
    '    const merged = { ...base, ...raw };\n    merged.identity =',
    '    const merged = { ...base, ...raw };\n    merged.virtueTypes = { ...base.virtueTypes, ...(raw.virtueTypes || {}) };\n    merged.identity =',
    "virtue type normalization",
)

old = '''  function specialDefault(s, identity = state.identity) {
    if (!s.fromIdentity) return Number(s.default || 0);
    const chosen = identity[s.fromIdentity.key];
    const mapped = s.fromIdentity.map[chosen];
    return Number(mapped ?? s.default ?? 0);
  }
'''
new = '''  function isVirtueGroup(g) { return g?.id === "virtues"; }
  function traitLabel(g, trait, sourceState = state) {
    if (!isVirtueGroup(g)) return trait;
    if (trait === "Conscience / Conviction") return sourceState.virtueTypes?.ethics === "conviction" ? "Conviction" : "Conscience";
    if (trait === "Self-Control / Instinct") return sourceState.virtueTypes?.control === "instinct" ? "Instinct" : "Self-Control";
    return trait;
  }
  function groupFreeDot(g, trait, sourceState = state) {
    if (isVirtueGroup(g)) {
      if (trait === "Conscience / Conviction") return sourceState.virtueTypes?.ethics === "conviction" ? 0 : 1;
      if (trait === "Self-Control / Instinct") return sourceState.virtueTypes?.control === "instinct" ? 0 : 1;
      if (trait === "Courage") return 1;
    }
    return Number((g.freeDots || {})[trait] || 0);
  }
  function traitMin(g, trait, sourceState = state) {
    if (isVirtueGroup(g)) return groupFreeDot(g, trait, sourceState);
    return Number(g.min ?? 0);
  }
  function groupAllowance(g, p = profile(), sourceState = state) {
    if (p.id === "vampire" && sourceState.identity?.sect === "Sabbat") {
      if (g.id === "disciplines") return 4;
      if (g.id === "backgrounds") return 0;
      if (g.id === "virtues") return 5;
    }
    return Number(g.pool || 0);
  }
  function specialDefault(s, identity = state.identity, sourceState = state) {
    if (s.id === "morality" && sourceState.ratings?.virtues) {
      return Number(sourceState.ratings.virtues["Conscience / Conviction"]?.base || 0) +
        Number(sourceState.ratings.virtues["Self-Control / Instinct"]?.base || 0);
    }
    if (s.id === "willpower" && sourceState.ratings?.virtues) return Number(sourceState.ratings.virtues.Courage?.base || 1);
    if (!s.fromIdentity) return Number(s.default || 0);
    const chosen = identity[s.fromIdentity.key];
    const mapped = s.fromIdentity.map[chosen];
    return Number(mapped ?? s.default ?? 0);
  }
  function derivedSpecialStarts(sourceState = state) {
    const p = C.profiles.find(x => x.id === sourceState.profileId) || C.profiles[0];
    return Object.fromEntries((p.specials || [])
      .filter(s => s.id === "morality" || s.id === "willpower")
      .map(s => [s.id, specialDefault(s, sourceState.identity, sourceState)]));
  }
  function preserveDerivedPurchases(beforeStarts) {
    const afterStarts = derivedSpecialStarts(state);
    Object.entries(afterStarts).forEach(([id, nextBase]) => {
      const previousBase = Number(beforeStarts[id] ?? nextBase);
      const currentValue = Number(state.specialBase[id] ?? previousBase);
      state.specialBase[id] = Math.max(nextBase, currentValue + (nextBase - previousBase));
    });
  }
'''
text = replace_once(text, old, new, "V20 helper block")

text = replace_once(
    text,
    '        const free = Number((g.freeDots || {})[trait] || 0);\n        base.ratings[g.id][trait] = { base: Math.max(g.min, free), xp: 0 };',
    '        const free = groupFreeDot(g, trait, base);\n        base.ratings[g.id][trait] = { base: Math.max(traitMin(g, trait, base), free), xp: 0 };',
    "fresh virtue values",
)
text = replace_once(
    text,
    '      base.specialBase[s.id] = specialDefault(s, base.identity);',
    '      base.specialBase[s.id] = specialDefault(s, base.identity, base);',
    "fresh derived specials",
)
text = replace_once(
    text,
    '        merged.ratings[g.id][t] = { base: Number(existing?.base ?? g.min), xp: Number(existing?.xp || 0) };',
    '        merged.ratings[g.id][t] = { base: Math.max(traitMin(g, t, merged), Number(existing?.base ?? traitMin(g, t, merged))), xp: Number(existing?.xp || 0) };',
    "normalized trait floors",
)
text = replace_once(
    text,
    '    merged.specialBase = { ...base.specialBase, ...(raw.specialBase || {}) };\n    merged.specialXp =',
    '    merged.specialBase = { ...base.specialBase, ...(raw.specialBase || {}) };\n    (C.profiles.find(p => p.id === merged.profileId)?.specials || []).forEach(s => {\n      if (s.id === "morality" || s.id === "willpower") merged.specialBase[s.id] = Math.max(specialDefault(s, merged.identity, merged), Number(merged.specialBase[s.id] ?? 0));\n    });\n    merged.specialXp =',
    "existing save derived specials",
)

text = replace_once(
    text,
    '      ...g.traits.map(name => ({ name, base: baseRating(g.id, name), free: Number((g.freeDots || {})[name] || 0) })),',
    '      ...g.traits.map(name => ({ name, base: baseRating(g.id, name), free: groupFreeDot(g, name, state) })),',
    "dynamic free dots ledger",
)
text = replace_once(
    text,
    '        allowance = Number(g.pool || 0);',
    '        allowance = groupAllowance(g, p, state);',
    "Sabbat group allowances",
)
text = text.replace('      const start = specialDefault(s);', '      const start = specialDefault(s, state.identity, state);')

text = replace_once(
    text,
    '    let html = \'<span class="dots" role="group" aria-label="\' + attr(trait) + \' rating">\';',
    '    const shownTrait = traitLabel(g, trait, state);\n    let html = \'<span class="dots" role="group" aria-label="\' + attr(shownTrait) + \' rating">\';',
    "dot virtue labels",
)
text = text.replace('aria-label="Set ${attr(trait)} creation rating to ${i}"', 'aria-label="Set ${attr(shownTrait)} creation rating to ${i}"')

marker = '  function renderRatedGroup(g) {\n'
if 'function renderVirtueTypeToggles' not in text and marker in text:
    toggle_fn = '''  function renderVirtueTypeToggles(g) {
    if (!isVirtueGroup(g)) return "";
    const ethics = state.virtueTypes?.ethics || "conscience";
    const control = state.virtueTypes?.control || "selfControl";
    return `<div class="terminology-options" role="group" aria-label="Virtue types">
      <button type="button" data-action="virtue-type" data-axis="ethics" data-value="conscience" class="${ethics === "conscience" ? "selected" : ""}" aria-pressed="${ethics === "conscience"}"><b>Conscience</b><span>Automatic starting dot.</span></button>
      <button type="button" data-action="virtue-type" data-axis="ethics" data-value="conviction" class="${ethics === "conviction" ? "selected" : ""}" aria-pressed="${ethics === "conviction"}"><b>Conviction</b><span>Starts at zero.</span></button>
      <button type="button" data-action="virtue-type" data-axis="control" data-value="selfControl" class="${control === "selfControl" ? "selected" : ""}" aria-pressed="${control === "selfControl"}"><b>Self-Control</b><span>Automatic starting dot.</span></button>
      <button type="button" data-action="virtue-type" data-axis="control" data-value="instinct" class="${control === "instinct" ? "selected" : ""}" aria-pressed="${control === "instinct"}"><b>Instinct</b><span>Starts at zero.</span></button>
    </div>`;
  }

'''
    text = text.replace(marker, toggle_fn + marker, 1)
    print("patching: virtue toggle renderer")

old = '''  function renderRatedGroup(g) {
    const spent = groupSpend(g);
    return `<section class="rated-list"><header><h3>${esc(groupLabel(g))}</h3><span class="budget-label ${spent > Number(g.pool || 0) ? "over" : spent === Number(g.pool || 0) ? "ok" : ""}">${spent} / ${Number(g.pool || 0)}</span></header>
      ${g.traits.map(trait => `<div class="trait-row"><span>${esc(trait)}</span>${renderDots(g, trait)}</div>`).join("")}
'''
new = '''  function renderRatedGroup(g) {
    const spent = groupSpend(g);
    const allowance = groupAllowance(g, profile(), state);
    return `<section class="rated-list"><header><h3>${esc(groupLabel(g))}</h3><span class="budget-label ${spent > allowance ? "over" : spent === allowance ? "ok" : ""}">${spent} / ${allowance}</span></header>
      ${renderVirtueTypeToggles(g)}
      ${g.traits.map(trait => `<div class="trait-row"><span>${esc(traitLabel(g, trait, state))}</span>${renderDots(g, trait)}</div>`).join("")}
'''
text = replace_once(text, old, new, "rated group allowances and labels")

old = '''        const total = Number(state.specialBase[s.id] || 0) + Number(state.specialXp[s.id] || 0);
        return `<div class="special-card"><label for="special-${attr(s.id)}">${esc(specialLabel(s))}</label><strong>${total}${state.specialXp[s.id] ? ` <small>(+${state.specialXp[s.id]} XP)</small>` : ""}</strong><input id="special-${attr(s.id)}" type="number" min="${s.min ?? 0}" max="${s.max ?? 10}" data-special="${attr(s.id)}" value="${Number(state.specialBase[s.id] ?? specialDefault(s))}"><small>${esc(s.help || `Standard start: ${specialDefault(s)}`)}</small></div>`;
'''
new = '''        const start = specialDefault(s, state.identity, state);
        const total = Math.max(start, Number(state.specialBase[s.id] ?? start)) + Number(state.specialXp[s.id] || 0);
        return `<div class="special-card"><label for="special-${attr(s.id)}">${esc(specialLabel(s))}</label><strong>${total}${state.specialXp[s.id] ? ` <small>(+${state.specialXp[s.id]} XP)</small>` : ""}</strong><input id="special-${attr(s.id)}" type="number" min="${Math.max(Number(s.min ?? 0), start)}" max="${s.max ?? 10}" data-special="${attr(s.id)}" value="${Math.max(start, Number(state.specialBase[s.id] ?? start))}"><small>${esc(s.help || `Creation base: ${start}`)}</small></div>`;
'''
text = replace_once(text, old, new, "Core Ratings actual totals")

text = text.replace(
    '      g.traits.forEach(t => rows.push({ group: g.id, trait: t, label: `${groupLabel(g)} · ${t}` }));',
    '      g.traits.forEach(t => rows.push({ group: g.id, trait: t, label: `${groupLabel(g)} · ${traitLabel(g, t, state)}` }));',
)
text = text.replace(
    '    g.traits.forEach(t => { const value = current(g.id, t); if (value > g.min) rows.push([t, value]); });',
    '    g.traits.forEach(t => { const value = current(g.id, t); if (value > traitMin(g, t, state)) rows.push([traitLabel(g, t, state), value]); });',
)
text = text.replace(
    'g.traits.map(t => [t, current(g.id, t)])',
    'g.traits.map(t => [traitLabel(g, t, state), current(g.id, t)])',
)
text = replace_once(
    text,
    '    const specials = (p.specials || []).map(s => [specialLabel(s), Number(state.specialBase[s.id] || 0) + Number(state.specialXp[s.id] || 0)]);',
    '    const specials = (p.specials || []).map(s => { const start = specialDefault(s, state.identity, state); return [specialLabel(s), Math.max(start, Number(state.specialBase[s.id] ?? start)) + Number(state.specialXp[s.id] || 0)]; });',
    "printed core ratings",
)

text = replace_once(
    text,
    '      state.specialBase[el.dataset.special] = Number(el.value);',
    '      const s = (profile().specials || []).find(x => x.id === el.dataset.special);\n      const start = s ? specialDefault(s, state.identity, state) : 0;\n      state.specialBase[el.dataset.special] = Math.max(start, Number(el.value));',
    "Core Rating input floor",
)
text = replace_once(
    text,
    '    } else if (el.dataset.bind || el.dataset.ui || el.dataset.itemField || el.dataset.special) commit();',
    '    } else if (el.dataset.bind || el.dataset.ui || el.dataset.itemField || el.dataset.special || el.dataset.meritsField || el.dataset.flawsField) commit();',
    "Merit/Flaw ledger refresh",
)

old = '''      const custom = findCustom(g.id, button.dataset.trait);
      const value = Number(button.dataset.value);
      if (custom) custom.base = custom.base === value ? Math.max(g.min, value - 1) : value;
      else {
        const row = state.ratings[g.id][button.dataset.trait];
        row.base = row.base === value ? Math.max(g.min, value - 1) : value;
      }
      return commit();
'''
new = '''      const custom = findCustom(g.id, button.dataset.trait);
      const value = Number(button.dataset.value);
      const beforeStarts = isVirtueGroup(g) ? derivedSpecialStarts(state) : null;
      const minimum = traitMin(g, button.dataset.trait, state);
      if (custom) custom.base = custom.base === value ? Math.max(minimum, value - 1) : value;
      else {
        const row = state.ratings[g.id][button.dataset.trait];
        row.base = row.base === value ? Math.max(minimum, value - 1) : value;
      }
      if (beforeStarts) preserveDerivedPurchases(beforeStarts);
      return commit();
'''
text = replace_once(text, old, new, "Virtue-derived rating synchronization")

needle = '    if (action === "rating") {\n'
if 'action === "virtue-type"' not in text and needle in text:
    handler = '''    if (action === "virtue-type") {
      const g = allGroups().find(x => x.id === "virtues");
      if (!g) return;
      const axis = button.dataset.axis;
      const next = button.dataset.value;
      const currentType = state.virtueTypes?.[axis];
      if (!axis || !next || currentType === next) return;
      const beforeStarts = derivedSpecialStarts(state);
      const trait = axis === "ethics" ? "Conscience / Conviction" : "Self-Control / Instinct";
      const beforeFree = groupFreeDot(g, trait, state);
      state.virtueTypes[axis] = next;
      const afterFree = groupFreeDot(g, trait, state);
      const row = state.ratings.virtues?.[trait];
      if (row) row.base = Math.max(afterFree, Number(row.base || 0) + (afterFree - beforeFree));
      preserveDerivedPurchases(beforeStarts);
      if ((next === "conviction" || next === "instinct") && String(state.identity.moralityName || "").trim().toLowerCase() === "humanity") state.identity.moralityName = "Path of Enlightenment";
      return commit();
    }
'''
    text = text.replace(needle, handler + needle, 1)
    print("patching: virtue toggle actions")

p.write_text(text, encoding="utf-8")

p = Path("config.js")
text = p.read_text(encoding="utf-8")
text = text.replace(
    'rulesNote: "Standard V20 creation uses 7/5/3 Attributes, 13/9/5 Abilities, three Discipline dots, five Background dots, seven Virtue dots, and 15 freebies. Use the Advanced Vampire workspace for clan auto-fill, blood magic paths and rituals, Sect terminology, and detailed Generation limits.",',
    'rulesNote: "Standard V20 creation uses 7/5/3 Attributes, 13/9/5 Abilities, three Discipline dots, five Background dots, seven Virtue dots, and 15 freebies. Sabbat creation uses four Discipline dots, zero free Background dots, five Virtue dots, and 15 freebies. Conscience/Conviction and Self-Control/Instinct can be chosen independently; Conviction and Instinct begin at zero. Humanity/Path and Willpower derive automatically from Virtues.",',
)
text = text.replace(
    '{ id: "virtues", kind: "virtue", label: "Virtues", pool: 7, freebieCost: 2, xpMult: 2, min: 1, freeDots: { "Conscience / Conviction": 1, "Self-Control / Instinct": 1, Courage: 1 }, traits: ["Conscience / Conviction", "Self-Control / Instinct", "Courage"], note: "Allocate seven dots beyond the automatic one in each Virtue." }',
    '{ id: "virtues", kind: "virtue", label: "Virtues", pool: 7, freebieCost: 2, xpMult: 2, min: 0, traits: ["Conscience / Conviction", "Self-Control / Instinct", "Courage"], note: "Choose each Virtue pair independently. Conscience, Self-Control, and Courage begin with one automatic dot; Conviction and Instinct begin at zero. Sabbat characters allocate five Virtue dots; other vampires allocate seven." }',
)
text = text.replace(
    'help: "Normally begins at the sum of the two governing Virtues; adjust after allocating Virtues."',
    'help: "Automatically begins at the sum of the two governing Virtues; freebies purchase only increases above that base."',
)
text = text.replace(
    'help: "Normally begins at Courage; adjust after allocating Virtues."',
    'help: "Automatically begins at Courage; freebies purchase only increases above that base."',
)
text = text.replace(
    'const conscience = Number(virtues["Conscience / Conviction"]?.base || 1);',
    'const conscience = Number(virtues["Conscience / Conviction"]?.base ?? (state.virtueTypes?.ethics === "conviction" ? 0 : 1));',
)
text = text.replace(
    'const control = Number(virtues["Self-Control / Instinct"]?.base || 1);',
    'const control = Number(virtues["Self-Control / Instinct"]?.base ?? (state.virtueTypes?.control === "instinct" ? 0 : 1));',
)
p.write_text(text, encoding="utf-8")
