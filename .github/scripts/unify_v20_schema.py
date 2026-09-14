from pathlib import Path
import re


def replace_once(text, old, new, label):
    if new in text:
        print(f"already: {label}")
        return text
    if old not in text:
        raise SystemExit(f"missing source for {label}: {old[:120]}")
    print(f"patching: {label}")
    return text.replace(old, new, 1)


# Guided page must load the shared schema before config/app.
p = Path("index.html")
text = p.read_text(encoding="utf-8")
text = replace_once(
    text,
    '  <script src="config.js"></script>',
    '  <script src="shared-v20.js"></script>\n  <script src="config.js"></script>',
    "guided shared-schema loader",
)
p.write_text(text, encoding="utf-8")


# Guided config consumes the shared schema rather than duplicating Vampire options.
p = Path("config.js")
text = p.read_text(encoding="utf-8")
text = replace_once(
    text,
    'window.FORGE_CONFIG = {',
    'const V20_SHARED = window.V20_SHARED;\nif (!V20_SHARED) throw new Error("Shared V20 schema was not loaded.");\n\nwindow.FORGE_CONFIG = {\n  sharedRules: V20_SHARED,',
    "guided shared-schema binding",
)

text = replace_once(
    text,
    'pools: { attributes: [7, 5, 3], abilities: [13, 9, 5], freebies: 15 },\n      flawCap: 7,',
    'pools: { attributes: [7, 5, 3], abilities: [13, 9, 5], freebies: V20_SHARED.creationPackages.standard.freebies },\n      flawCap: V20_SHARED.creationPackages.standard.flawCap,',
    "guided creation package budget",
)

text = replace_once(
    text,
    '{ key: "clan", label: "Clan / Bloodline", type: "select", options: ["Assamite", "Brujah", "Followers of Set", "Gangrel", "Giovanni", "Lasombra", "Malkavian", "Nosferatu", "Ravnos", "Toreador", "Tremere", "Tzimisce", "Ventrue", "Caitiff", "Bloodline / Other"] },',
    '{ key: "clan", label: "Clan / Bloodline", type: "select", options: V20_SHARED.clanOptions },',
    "guided clan options",
)
text = replace_once(
    text,
    '{ key: "sect", label: "Sect", type: "select", options: ["Camarilla", "Sabbat", "Anarch Movement", "Independent / Autarkis", "Other / Chronicle-specific"] },',
    '{ key: "sect", label: "Sect", type: "select", options: V20_SHARED.sects },',
    "guided sect options",
)
text = replace_once(
    text,
    '{ key: "generation", label: "Generation", type: "select", options: ["13th+", "12th", "11th", "10th", "9th", "8th", "7th", "6th", "5th", "4th", "3rd", "Storyteller-defined"] },',
    '{ key: "generation", label: "Generation", type: "select", options: V20_SHARED.generationOptions },',
    "guided generation options",
)

old_disciplines = '["Animalism", "Auspex", "Celerity", "Chimerstry", "Dementation", "Dominate", "Fortitude", "Necromancy", "Obfuscate", "Obtenebration", "Potence", "Presence", "Protean", "Quietus", "Serpentis", "Thaumaturgy", "Vicissitude"]'
if old_disciplines in text:
    count = text.count(old_disciplines)
    text = text.replace(old_disciplines, 'V20_SHARED.disciplines')
    print(f"patching: guided Discipline lists ({count})")

text = replace_once(
    text,
    '{ id: "disciplines", kind: "discipline", label: "Disciplines", pool: 3, freebieCost: 7, xpNew: 10, xpMult: 5, traits: V20_SHARED.disciplines,',
    '{ id: "disciplines", kind: "discipline", label: "Disciplines", pool: V20_SHARED.creationPackages.standard.disciplines, freebieCost: 7, xpNew: 10, xpMult: 5, traits: V20_SHARED.disciplines,',
    "guided standard Discipline pool",
)
text = replace_once(
    text,
    '{ id: "backgrounds", kind: "background", label: "Backgrounds", pool: 5, freebieCost: 1, xp: false, traits: ["Allies", "Alternate Identity", "Black Hand Membership", "Contacts", "Domain", "Fame", "Generation", "Herd", "Influence", "Mentor", "Resources", "Retainers", "Rituals", "Status"] },',
    '{ id: "backgrounds", kind: "background", label: "Backgrounds", pool: V20_SHARED.creationPackages.standard.backgrounds, freebieCost: 1, xp: false, traits: V20_SHARED.backgrounds },',
    "guided standard Background pool",
)
text = replace_once(
    text,
    '{ id: "virtues", kind: "virtue", label: "Virtues", pool: 7, freebieCost: 2, xpMult: 2, min: 0,',
    '{ id: "virtues", kind: "virtue", label: "Virtues", pool: V20_SHARED.creationPackages.standard.virtues, freebieCost: 2, xpMult: 2, min: 0,',
    "guided standard Virtue pool",
)
p.write_text(text, encoding="utf-8")


# Guided runtime uses creation-package values from the shared schema.
p = Path("app.js")
text = p.read_text(encoding="utf-8")
old = '''  function groupAllowance(g, p = profile(), sourceState = state) {
    if (p.id === "vampire" && sourceState.moreInhumanVampires) {
      if (g.id === "disciplines") return 4;
      if (g.id === "backgrounds") return 0;
    }
    return Number(g.pool || 0);
  }'''
new = '''  function groupAllowance(g, p = profile(), sourceState = state) {
    if (p.id === "vampire") {
      const packages = C.sharedRules?.creationPackages;
      const selected = sourceState.moreInhumanVampires ? packages?.moreInhuman : packages?.standard;
      if (selected && g.id === "disciplines") return Number(selected.disciplines);
      if (selected && g.id === "backgrounds") return Number(selected.backgrounds);
      if (selected && g.id === "virtues") return Number(selected.virtues);
    }
    return Number(g.pool || 0);
  }'''
text = replace_once(text, old, new, "guided package allowance")

old = '''  function renderFoundation() {
    const p = profile();
    const fields = [...(C.identityFields || []), ...(p.identityFields || [])];'''
new = '''  function renderFoundation() {
    const p = profile();
    const fields = [...(C.identityFields || []), ...(p.identityFields || [])];
    const standardPackage = C.sharedRules?.creationPackages?.standard;
    const moreInhumanPackage = C.sharedRules?.creationPackages?.moreInhuman;'''
text = replace_once(text, old, new, "guided package UI bindings")

text = text.replace(
    '<b>Off · Standard V20</b><span>3 Discipline dots · 5 Background dots</span>',
    '<b>Off · ${esc(standardPackage?.label || "Standard V20")}</b><span>${standardPackage?.disciplines ?? 3} Discipline dots · ${standardPackage?.backgrounds ?? 5} Background dots</span>'
)
text = text.replace(
    '<b>On · More Inhuman Vampires</b><span>4 Discipline dots · 0 Background dots</span>',
    '<b>On · ${esc(moreInhumanPackage?.label || "More Inhuman Vampires")}</b><span>${moreInhumanPackage?.disciplines ?? 4} Discipline dots · ${moreInhumanPackage?.backgrounds ?? 0} Background dots</span>'
)
p.write_text(text, encoding="utf-8")


# Advanced compiled workspace loads and consumes the same schema.
p = Path("legacy.html")
text = p.read_text(encoding="utf-8")
text = replace_once(
    text,
    '    <script type="module">',
    '    <script src="shared-v20.js"></script>\n    <script type="module">const V20=window.V20_SHARED;if(!V20)throw new Error("Shared V20 schema was not loaded.");',
    "advanced shared-schema loader",
)

# Replace the Advanced app's duplicated Discipline, Background, archetype, and Sect constants.
pattern = re.compile(
    r'g=\[`Animalism`.*?`Vicissitude`\],_=\[`Allies`.*?`Status`\],v=`Architect\..*?\.Visionary`\.split\(`\.`\),y=\[`Camarilla`,`Sabbat`,`Anarch Movement`,`Independent / Autarkis`,`Other / Chronicle-specific`\]',
    re.S,
)
replacement = 'g=V20.disciplines,_=V20.backgrounds,v=V20.archetypes,y=V20.sects'
if replacement not in text:
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"advanced shared option block replacement count: {count}")
    print("patching: advanced shared option lists")

# Replace duplicated clan/bloodline rules and Generation table.
pattern = re.compile(r'ee=\{Assamite:.*?Caitiff:\{disciplines:\[\],summary:.*?\}\},te=\{.*?\},S=', re.S)
replacement = 'ee=V20.clans,te=V20.generationTable,S='
if replacement not in text:
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"advanced clan/generation replacement count: {count}")
    print("patching: advanced clans and Generation table")

# Package math reads the same shared rule object.
text = text.replace(
    'e.moreInhumanVampires?4:3',
    'e.moreInhumanVampires?V20.creationPackages.moreInhuman.disciplines:V20.creationPackages.standard.disciplines'
)
text = text.replace(
    'e.moreInhumanVampires?0:5',
    'e.moreInhumanVampires?V20.creationPackages.moreInhuman.backgrounds:V20.creationPackages.standard.backgrounds'
)
text = text.replace('d=Math.min(7,u)', 'd=Math.min(V20.creationPackages.standard.flawCap,u)')
text = text.replace('p=15+d+f', 'p=V20.creationPackages.standard.freebies+d+f')
text = text.replace('Le-7', 'Le-V20.creationPackages.standard.virtues')
text = text.replace('Le<7', 'Le<V20.creationPackages.standard.virtues')
text = text.replace('7-Le', 'V20.creationPackages.standard.virtues-Le')

p.write_text(text, encoding="utf-8")

print("Shared V20 schema migration complete.")
