from pathlib import Path

p = Path('app.js')
text = p.read_text(encoding='utf-8')

def replace_once(old, new, label):
    global text
    if new in text:
        print('already', label)
        return
    if old not in text:
        raise SystemExit(f'missing {label}')
    text = text.replace(old, new, 1)
    print('patched', label)

replace_once(
'''      merits: [],
      flaws: [],
      notes: {},''',
'''      merits: [],
      flaws: [],
      effectMemory: {},
      notes: {},''',
'guided effect memory state')

replace_once(
'''    merged.items = { ...base.items, ...(raw.items || {}) };
    merged.notes = { ...base.notes, ...(raw.notes || {}) };''',
'''    merged.items = { ...base.items, ...(raw.items || {}) };
    merged.effectMemory = { ...base.effectMemory, ...(raw.effectMemory || {}) };
    merged.notes = { ...base.notes, ...(raw.notes || {}) };''',
'guided effect memory normalization')

anchor = '''  function preserveDerivedPurchases(beforeStarts) {
    const afterStarts = derivedSpecialStarts(state);
    Object.entries(afterStarts).forEach(([id, nextBase]) => {
      const previousBase = Number(beforeStarts[id] ?? nextBase);
      const currentValue = Number(state.specialBase[id] ?? previousBase);
      state.specialBase[id] = Math.max(nextBase, currentValue + (nextBase - previousBase));
    });
  }
'''
helpers = anchor + '''

  function meritFlawEntries(sourceState = state) {
    return [
      ...(sourceState.merits || []).map(row => ({ ...row, kind: "merit", rule: C.sharedRules?.resolveMeritFlawRule?.(row.name, "merit") })),
      ...(sourceState.flaws || []).map(row => ({ ...row, kind: "flaw", rule: C.sharedRules?.resolveMeritFlawRule?.(row.name, "flaw") }))
    ];
  }

  function meritFlawEffects(sourceState = state) {
    return meritFlawEntries(sourceState).flatMap(entry => (entry.rule?.effects || []).map(effect => ({ ...effect, entry })));
  }

  function syncMeritFlawEffects() {
    if (state.profileId !== "vampire" || !C.sharedRules?.resolveMeritFlawRule) return;
    state.effectMemory ||= {};
    const effects = meritFlawEffects();
    const caps = new Map();
    const creationCaps = new Map();
    let disciplineCap = null;
    const forbidden = new Map();
    const identitySets = new Map();
    let specialWillpowerCap = null;

    const tighten = (map, key, cap) => map.set(key, map.has(key) ? Math.min(map.get(key), Number(cap)) : Number(cap));
    effects.forEach(effect => {
      if (effect.type === "traitCap") tighten(caps, `${effect.group}::${effect.trait}`, effect.cap);
      if (effect.type === "creationTraitCap") tighten(creationCaps, `${effect.group}::${effect.trait}`, effect.cap);
      if (effect.type === "disciplineCap") disciplineCap = disciplineCap == null ? Number(effect.cap) : Math.min(disciplineCap, Number(effect.cap));
      if (effect.type === "forbidTraits") (effect.traits || []).forEach(trait => tighten(forbidden, `${effect.group}::${trait}`, 0));
      if (effect.type === "identitySet") identitySets.set(effect.key, effect.value);
      if (effect.type === "specialCap" && effect.special === "willpower") specialWillpowerCap = specialWillpowerCap == null ? Number(effect.cap) : Math.min(specialWillpowerCap, Number(effect.cap));
    });

    const ratingKeys = new Set([...caps.keys(), ...creationCaps.keys(), ...forbidden.keys()]);
    if (disciplineCap != null) {
      const group = allGroups().find(g => g.id === "disciplines");
      (group?.traits || []).forEach(trait => ratingKeys.add(`disciplines::${trait}`));
    }
    Object.keys(state.effectMemory).filter(k => k.startsWith("rating::")).forEach(k => ratingKeys.add(k.slice(8)));

    ratingKeys.forEach(key => {
      const [group, trait] = key.split("::");
      const row = state.ratings[group]?.[trait];
      if (!row) return;
      let cap = null;
      if (caps.has(key)) cap = caps.get(key);
      if (forbidden.has(key)) cap = Math.min(cap ?? Infinity, 0);
      if (creationCaps.has(key)) cap = Math.min(cap ?? Infinity, creationCaps.get(key));
      if (group === "disciplines" && disciplineCap != null) cap = Math.min(cap ?? Infinity, disciplineCap);
      const memoryKey = `rating::${key}`;
      if (cap != null && Number.isFinite(cap)) {
        const total = Number(row.base || 0) + Number(row.xp || 0);
        if (total > cap && !state.effectMemory[memoryKey]) state.effectMemory[memoryKey] = clone(row);
        if (total > cap) {
          row.base = Math.min(Number(row.base || 0), cap);
          row.xp = Math.max(0, Math.min(Number(row.xp || 0), cap - Number(row.base || 0)));
        }
      } else if (state.effectMemory[memoryKey]) {
        state.ratings[group][trait] = clone(state.effectMemory[memoryKey]);
        delete state.effectMemory[memoryKey];
      }
    });

    const wpKey = "special::willpower";
    if (specialWillpowerCap != null) {
      const value = Number(state.specialBase.willpower || 0) + Number(state.specialXp.willpower || 0);
      if (value > specialWillpowerCap && !state.effectMemory[wpKey]) state.effectMemory[wpKey] = { base: state.specialBase.willpower, xp: state.specialXp.willpower };
      if (value > specialWillpowerCap) {
        state.specialBase.willpower = Math.min(Number(state.specialBase.willpower || 0), specialWillpowerCap);
        state.specialXp.willpower = Math.max(0, Math.min(Number(state.specialXp.willpower || 0), specialWillpowerCap - Number(state.specialBase.willpower || 0)));
      }
    } else if (state.effectMemory[wpKey]) {
      state.specialBase.willpower = Number(state.effectMemory[wpKey].base || 0);
      state.specialXp.willpower = Number(state.effectMemory[wpKey].xp || 0);
      delete state.effectMemory[wpKey];
    }

    const identityKeys = new Set([...identitySets.keys(), ...Object.keys(state.effectMemory).filter(k => k.startsWith("identity::")).map(k => k.slice(10))]);
    identityKeys.forEach(key => {
      const memoryKey = `identity::${key}`;
      if (identitySets.has(key)) {
        if (!state.effectMemory[memoryKey]) state.effectMemory[memoryKey] = state.identity[key] ?? "";
        state.identity[key] = identitySets.get(key);
      } else if (memoryKey in state.effectMemory) {
        state.identity[key] = state.effectMemory[memoryKey];
        delete state.effectMemory[memoryKey];
      }
    });
  }

  function meritFlawRuleWarnings() {
    if (state.profileId !== "vampire" || !C.sharedRules?.resolveMeritFlawRule) return [];
    const entries = meritFlawEntries();
    const hasNamed = (kind, name) => entries.some(entry => entry.kind === kind && C.sharedRules.normalizeMeritFlawName(entry.rule?.name || entry.name) === C.sharedRules.normalizeMeritFlawName(name));
    const warnings = [];
    entries.forEach(entry => {
      const rule = entry.rule;
      if (!rule) return;
      if (rule.cost != null && Number(entry.cost || 0) !== Number(rule.cost)) warnings.push({ type: "warn", text: `${rule.name} is normally ${rule.cost} point${rule.cost === 1 ? "" : "s"}.` });
      if (rule.summary) warnings.push({ type: "info", text: `${rule.name}: ${rule.summary}` });
      (rule.conflicts || []).forEach(conflict => {
        if (conflict.type === "clan" && (conflict.values || []).includes(state.identity.clan)) warnings.push({ type: "bad", text: conflict.message });
        if (conflict.type === "virtueEthics" && state.virtueTypes?.ethics === conflict.value) warnings.push({ type: "bad", text: conflict.message });
      });
      (rule.requirements || []).forEach(req => {
        if (req.type === "merit" && !hasNamed("merit", req.name)) warnings.push({ type: "bad", text: req.message });
        if (req.type === "humanityMin") {
          const moralityName = String(state.identity.moralityName || "Humanity").toLowerCase();
          if (!moralityName.includes("humanity") || Number(state.specialBase.morality || 0) + Number(state.specialXp.morality || 0) < Number(req.value)) warnings.push({ type: "bad", text: req.message });
        }
      });
      (rule.recommendations || []).forEach(rec => {
        if (!hasNamed(rec.kind, rec.name)) warnings.push({ type: "warn", text: rec.message });
      });
      (rule.effects || []).forEach(effect => {
        if (effect.type === "additionalInClanDiscipline") {
          const detail = C.sharedRules.meritFlawDetail(entry.name);
          if (!detail || !C.sharedRules.disciplines.includes(detail)) warnings.push({ type: "warn", text: "Additional Discipline needs a Discipline name after a colon, for example “Additional Discipline: Protean”." });
        }
      });
    });
    return warnings;
  }
'''
if helpers not in text:
    if anchor not in text: raise SystemExit('missing helper anchor')
    text = text.replace(anchor, helpers, 1)

replace_once(
'''  function commit({ step = activeStep, focus = "", scroll = false } = {}) {
    activeStep = Math.max(0, Math.min(STEPS.length - 1, step));
    save();''',
'''  function commit({ step = activeStep, focus = "", scroll = false } = {}) {
    activeStep = Math.max(0, Math.min(STEPS.length - 1, step));
    syncMeritFlawEffects();
    save();''',
'guided commit effect sync')

replace_once(
'''    (p.customValidation ? p.customValidation(state, { current, specialDefault }) : []).forEach(w => warnings.push(w));
    if (!warnings.some(w => w.type === "bad"))''',
'''    (p.customValidation ? p.customValidation(state, { current, specialDefault }) : []).forEach(w => warnings.push(w));
    meritFlawRuleWarnings().forEach(w => warnings.push(w));
    if (!warnings.some(w => w.type === "bad"))''',
'guided merit flaw warnings')

replace_once(
'''      if (row) row[field] = el.type === "number" ? Number(el.value) : el.value;
    } else return;
    save();''',
'''      if (row) {
        row[field] = el.type === "number" ? Number(el.value) : el.value;
        if (field === "name") {
          const rule = C.sharedRules?.resolveMeritFlawRule?.(row.name, kind === "merits" ? "merit" : "flaw");
          if (rule?.cost != null) row.cost = Number(rule.cost);
        }
      }
    } else return;
    save();''',
'guided canonical merit flaw cost')

# Apply loaded effects once after state is loaded.
replace_once(
'''  let state = load();

  function save() {''',
'''  let state = load();

  function save() {''',
'noop state anchor')

# Insert initial sync immediately before first render invocation at file end if available.
if '  syncMeritFlawEffects();\n  render();' not in text:
    marker = '  render();\n})();\n'
    if marker not in text: raise SystemExit('missing final render marker')
    text = text.replace(marker, '  syncMeritFlawEffects();\n  render();\n})();\n', 1)

p.write_text(text, encoding='utf-8')
