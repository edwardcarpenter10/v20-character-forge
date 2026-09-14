from pathlib import Path

path = Path('legacy.html')
text = path.read_text(encoding='utf-8')

replacements = [
    (
        '},Caitiff:{disciplines:[],summary:`Clanless vampires without a consistent lineage, inherited Discipline set, or common weakness.`,weakness:`No shared clan weakness, but Caitiff face severe social stigma and advance Disciplines differently.`}}',
        '},"Bloodline / Other":{disciplines:[],summary:`A custom bloodline, rare lineage, antitribu variant, or chronicle-specific inheritance. Record its inherited Disciplines and defining traits in the lineage and Discipline notes.`,weakness:`Record the bloodline or lineage weakness in Weakness details.`},Caitiff:{disciplines:[],summary:`Clanless vampires without a consistent lineage, inherited Discipline set, or common weakness.`,weakness:`No shared clan weakness, but Caitiff face severe social stigma and advance Disciplines differently.`}}'
    ),
    (
        'clan:``,bloodline:``,sect:`Camarilla`',
        'clan:``,bloodline:``,coterie:``,sect:`Camarilla`'
    ),
    (
        '(0,p.jsx)(O,{label:`Bloodline`,value:e.identity.bloodline,onChange:e=>He(`bloodline`,e)})]})',
        '(0,p.jsx)(O,{label:`Bloodline`,value:e.identity.bloodline,onChange:e=>He(`bloodline`,e)}),(0,p.jsx)(O,{label:`Coterie / Pack`,value:e.identity.coterie,onChange:e=>He(`coterie`,e),placeholder:`Group, pack, or role`})]})'
    ),
    (
        '(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`b`,{children:be.clanLabel}),[e.identity.clan,e.identity.bloodline].filter(Boolean).join(` · `)||`—`]}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`b`,{children:be.sireLabel}),e.identity.sire||`—`]})',
        '(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`b`,{children:be.clanLabel}),[e.identity.clan,e.identity.bloodline].filter(Boolean).join(` · `)||`—`]}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`b`,{children:`Coterie / Pack`}),e.identity.coterie||`—`]}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`b`,{children:be.sireLabel}),e.identity.sire||`—`]})'
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Expected Advanced identity fragment not found: {old[:100]}')
    text = text.replace(old, new, 1)

path.write_text(text, encoding='utf-8')
