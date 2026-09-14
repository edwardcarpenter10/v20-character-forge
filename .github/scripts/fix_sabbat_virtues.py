from pathlib import Path

p = Path("app.js")
text = p.read_text(encoding="utf-8")
text = text.replace('      if (g.id === "virtues") return 5;\n', '')
p.write_text(text, encoding="utf-8")

p = Path("config.js")
text = p.read_text(encoding="utf-8")
text = text.replace(
    'Sabbat creation uses four Discipline dots, zero free Background dots, five Virtue dots, and 15 freebies.',
    'Sabbat creation uses four Discipline dots, zero free Background dots, seven Virtue dots, and 15 freebies.',
)
text = text.replace(
    'Sabbat characters allocate five Virtue dots; other vampires allocate seven.',
    'All vampires allocate seven Virtue dots after their automatic starting dots.',
)
p.write_text(text, encoding="utf-8")
