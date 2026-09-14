from pathlib import Path

index = Path("index.html").read_text(encoding="utf-8")
config = Path("config.js").read_text(encoding="utf-8")
app = Path("app.js").read_text(encoding="utf-8")
legacy = Path("legacy.html").read_text(encoding="utf-8")

required = {
    "guided loads shared schema": (index, '<script src="shared-v20.js"></script>'),
    "advanced loads shared schema": (legacy, '<script src="shared-v20.js"></script>'),
    "guided config binds shared schema": (config, "sharedRules: V20_SHARED"),
    "guided clan options are shared": (config, "options: V20_SHARED.clanOptions"),
    "guided sect options are shared": (config, "options: V20_SHARED.sects"),
    "guided generation options are shared": (config, "options: V20_SHARED.generationOptions"),
    "guided disciplines are shared": (config, "traits: V20_SHARED.disciplines"),
    "guided backgrounds are shared": (config, "traits: V20_SHARED.backgrounds"),
    "guided package runtime is shared": (app, "C.sharedRules?.creationPackages"),
    "advanced disciplines are shared": (legacy, "g=V20.disciplines"),
    "advanced backgrounds are shared": (legacy, "_=V20.backgrounds"),
    "advanced archetypes are shared": (legacy, "v=V20.archetypes"),
    "advanced sects are shared": (legacy, "y=V20.sects"),
    "advanced clans are shared": (legacy, "ee=V20.clans"),
    "advanced generations are shared": (legacy, "te=V20.generationTable"),
    "advanced discipline package math is shared": (legacy, "V20.creationPackages.moreInhuman.disciplines"),
    "advanced background package math is shared": (legacy, "V20.creationPackages.moreInhuman.backgrounds"),
}

for label, (text, needle) in required.items():
    if needle not in text:
        raise SystemExit(f"Shared V20 parity check failed: {label}")

forbidden = {
    "advanced duplicate Discipline list": (legacy, "g=[`Animalism`,`Auspex`,`Celerity`"),
    "advanced duplicate clan rule table": (legacy, "ee={Assamite:"),
    "advanced duplicate Generation table": (legacy, 'te={"13th+":'),
    "guided duplicate Vampire clan option list": (config, 'options: ["Assamite", "Brujah", "Followers of Set"'),
}

for label, (text, needle) in forbidden.items():
    if needle in text:
        raise SystemExit(f"Shared V20 parity check failed: {label}")

print("Shared V20 consumer/parity checks passed.")
