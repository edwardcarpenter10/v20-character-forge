from pathlib import Path


def replace_once(text, old, new, label):
    if new in text:
        print(f"already: {label}")
        return text
    if old not in text:
        raise SystemExit(f"missing source for {label}")
    print(f"patching: {label}")
    return text.replace(old, new, 1)


# Guided Forge
p = Path("app.js")
text = p.read_text(encoding="utf-8")

text = replace_once(
    text,
    '      buildMode: "standard",\n      virtueTypes: { ethics: "conscience", control: "selfControl" },',
    '      buildMode: "standard",\n      moreInhumanVampires: false,\n      virtueTypes: { ethics: "conscience", control: "selfControl" },',
    "guided state flag",
)

text = replace_once(
    text,
    '    if (p.id === "vampire" && sourceState.identity?.sect === "Sabbat") {\n      if (g.id === "disciplines") return 4;\n      if (g.id === "backgrounds") return 0;\n    }',
    '    if (p.id === "vampire" && sourceState.moreInhumanVampires) {\n      if (g.id === "disciplines") return 4;\n      if (g.id === "backgrounds") return 0;\n    }',
    "decouple alternate package from Sabbat",
)

old = '''      </select><small>Experience purchases never alter or consume the creation freebie ledger.</small></label></div></div>
'''
new = '''      </select><small>Experience purchases never alter or consume the creation freebie ledger.</small></label>
      ${p.id === "vampire" ? `<div class="terminology-panel"><header><div><span class="eyebrow">Optional rule</span><h3>More Inhuman Vampires</h3></div><p>This creation package is independent of Sect. It trades all five starting Background dots for one additional starting Discipline dot.</p></header><div class="terminology-options" role="group" aria-label="More Inhuman Vampires"><button type="button" data-action="more-inhuman" data-value="off" class="${state.moreInhumanVampires ? "" : "selected"}" aria-pressed="${!state.moreInhumanVampires}"><b>Off · Standard V20</b><span>3 Discipline dots · 5 Background dots</span></button><button type="button" data-action="more-inhuman" data-value="on" class="${state.moreInhumanVampires ? "selected" : ""}" aria-pressed="${state.moreInhumanVampires}"><b>On · More Inhuman Vampires</b><span>4 Discipline dots · 0 Background dots</span></button></div></div>` : ""}</div></div>
'''
text = replace_once(text, old, new, "guided creation-package toggle UI")

needle = '    if (action === "virtue-type") {\n'
handler = '''    if (action === "more-inhuman") {
      if (profile().id !== "vampire") return;
      state.moreInhumanVampires = button.dataset.value === "on";
      return commit();
    }
'''
if handler not in text:
    if needle not in text:
        raise SystemExit("missing source for guided toggle handler")
    text = text.replace(needle, handler + needle, 1)
    print("patching: guided toggle handler")

p.write_text(text, encoding="utf-8")

# Guided config wording
p = Path("config.js")
text = p.read_text(encoding="utf-8")
old = 'rulesNote: "Standard V20 creation uses 7/5/3 Attributes, 13/9/5 Abilities, three Discipline dots, five Background dots, seven Virtue dots, and 15 freebies. Sabbat creation uses four Discipline dots, zero free Background dots, seven Virtue dots, and 15 freebies. Conscience/Conviction and Self-Control/Instinct can be chosen independently; Conviction and Instinct begin at zero. Humanity/Path and Willpower derive automatically from Virtues.",'
new = 'rulesNote: "Standard V20 creation uses 7/5/3 Attributes, 13/9/5 Abilities, three Discipline dots, five Background dots, seven Virtue dots, and 15 freebies. The optional More Inhuman Vampires toggle instead uses four Discipline dots and zero starting Background dots; it is independent of Sect. Conscience/Conviction and Self-Control/Instinct can be chosen independently; Conviction and Instinct begin at zero. Humanity/Path and Willpower derive automatically from Virtues.",'
text = replace_once(text, old, new, "guided rules note")
p.write_text(text, encoding="utf-8")

# Advanced Vampire workspace
p = Path("legacy.html")
text = p.read_text(encoding="utf-8")

text = replace_once(
    text,
    'return{creationMode:`standard`,bonusFreebies:0,useSectTerminology:!0,identity:',
    'return{creationMode:`standard`,bonusFreebies:0,moreInhumanVampires:!1,useSectTerminology:!0,identity:',
    "advanced state flag",
)

# All rules-package checks were previously incorrectly tied to Sabbat. Sect-specific vocabulary uses a different expression and is untouched.
count = text.count('e.identity.sect===`Sabbat`')
if count:
    text = text.replace('e.identity.sect===`Sabbat`', 'e.moreInhumanVampires')
    print(f"patching: advanced package checks ({count})")

marker = '(0,p.jsxs)(`section`,{className:`terminology-panel`,children:'
toggle = '''(0,p.jsxs)(`label`,{className:`terminology-toggle`,children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:e.moreInhumanVampires,onChange:n=>t(e=>({...e,moreInhumanVampires:n.target.checked}))}),(0,p.jsx)(`i`,{"aria-hidden":`true`,children:(0,p.jsx)(`b`,{})}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`b`,{children:`More Inhuman Vampires`}),(0,p.jsx)(`small`,{children:`Optional V20 package: 4 starting Discipline dots and 0 starting Background dots. Independent of Sect.`})]})]}),'''
if toggle not in text:
    if marker not in text:
        raise SystemExit("missing source for advanced toggle UI")
    text = text.replace(marker, toggle + marker, 1)
    print("patching: advanced toggle UI")

p.write_text(text, encoding="utf-8")
