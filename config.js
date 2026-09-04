window.FORGE_CONFIG = {
  code: "v20",
  storageKey: "lantern-lever-v20-forge-v4",
  mark: "V20",
  title: "Vampire 20th Character Forge",
  game: "Vampire: The Masquerade 20th Anniversary Edition",
  shortGame: "a chronicle of hunger and consequence",
  description: "A free, local-first V20 character creator for vampires, ghouls, revenants, and mortal NPCs, with advancement, JSON saves, and printable records.",
  logo: { kind: "vampire" },
  theme: { accent: "#76111d", accent2: "#b08850", bg: "#171313", bgDeep: "#080606", panel: "#211719", panel2: "#2b2020", paper: "#e9e0d4", paper2: "#d0beb5", ink: "#211517", muted: "#b4a2a1", line: "#68484b", paperMuted: "#624e4e", paperLine: "#876b68" },
  terminologySets: [
    { id: "kindred", label: "Camarilla & Anarch", description: "Kindred, Clan, Sect, sire, Humanity or Path, and coterie.", terms: { fields: { clan: "Clan", sect: "Sect", sire: "Sire", moralityName: "Humanity / Path", coterie: "Coterie", domitor: "Regnant / Domitor" }, groups: { disciplines: "Disciplines", virtues: "Virtues" }, specials: { morality: "Humanity / Path", blood: "Blood Pool", vitae: "Vitae" }, ui: { advantagesHeading: "Advantages and Kindred traits" } } },
    { id: "sabbat", label: "Sabbat", description: "Cainite, Clan or bloodline, sire, Path of Enlightenment, and pack.", terms: { fields: { clan: "Clan / Bloodline", sect: "Sect", sire: "Sire", moralityName: "Path of Enlightenment", coterie: "Pack", domitor: "Domitor" }, groups: { disciplines: "Disciplines", virtues: "Virtues / Instincts" }, specials: { morality: "Path Rating", blood: "Blood Pool", vitae: "Vitae" }, ui: { advantagesHeading: "Advantages and Cainite traits" } } },
    { id: "neutral", label: "Independent & neutral", description: "Vampire, lineage, allegiance, creator, morality, and group.", terms: { fields: { clan: "Lineage", sect: "Allegiance", sire: "Creator", moralityName: "Morality", coterie: "Group", domitor: "Patron" }, groups: { disciplines: "Vampiric Powers", virtues: "Moral Traits" }, specials: { morality: "Morality Rating", blood: "Blood Reserve", vitae: "Vitae" }, ui: { advantagesHeading: "Advantages and vampiric traits" } } }
  ],
  advancedTool: { href: "advanced.html", label: "Advanced Vampire workspace" },
  identityFields: [
    { key: "name", label: "Name", placeholder: "Character name" },
    { key: "player", label: "Player", placeholder: "Player or Storyteller" },
    { key: "chronicle", label: "Chronicle", placeholder: "Chronicle name" },
    { key: "concept", label: "Concept", placeholder: "A few defining words" },
    { key: "nature", label: "Nature", placeholder: "Archetype" },
    { key: "demeanor", label: "Demeanor", placeholder: "Archetype" }
  ],
  abilities: {
    Talents: ["Alertness", "Athletics", "Awareness", "Brawl", "Empathy", "Expression", "Intimidation", "Leadership", "Streetwise", "Subterfuge"],
    Skills: ["Animal Ken", "Crafts", "Drive", "Etiquette", "Firearms", "Larceny", "Melee", "Performance", "Stealth", "Survival"],
    Knowledges: ["Academics", "Computer", "Finance", "Investigation", "Law", "Medicine", "Occult", "Politics", "Science", "Technology"]
  },
  profiles: [
    {
      id: "vampire",
      label: "Vampire",
      category: "Full supernatural",
      description: "One of the Kindred or Cainites, shaped by Clan, Sect, Generation, Disciplines, blood, morality, and the Beast.",
      rulesNote: "Standard V20 creation uses 7/5/3 Attributes, 13/9/5 Abilities, three Discipline dots, five Background dots, seven Virtue dots, and 15 freebies. Use the Advanced Vampire workspace for clan auto-fill, blood magic paths and rituals, Sect terminology, and detailed Generation limits.",
      pools: { attributes: [7, 5, 3], abilities: [13, 9, 5], freebies: 15 },
      flawCap: 7,
      identityFields: [
        { key: "clan", label: "Clan / Bloodline", type: "select", options: ["Assamite", "Brujah", "Followers of Set", "Gangrel", "Giovanni", "Lasombra", "Malkavian", "Nosferatu", "Ravnos", "Toreador", "Tremere", "Tzimisce", "Ventrue", "Caitiff", "Bloodline / Other"] },
        { key: "sect", label: "Sect", type: "select", options: ["Camarilla", "Sabbat", "Anarch Movement", "Independent / Autarkis", "Other / Chronicle-specific"] },
        { key: "sire", label: "Sire", placeholder: "Sire or creator" },
        { key: "generation", label: "Generation", type: "select", options: ["13th+", "12th", "11th", "10th", "9th", "8th", "7th", "6th", "5th", "4th", "3rd", "Storyteller-defined"] },
        { key: "moralityName", label: "Humanity / Path", placeholder: "Humanity or Path name", default: "Humanity" },
        { key: "coterie", label: "Coterie / Pack", placeholder: "Group and role" }
      ],
      requiredIdentity: ["clan", "sect", "generation", "moralityName"],
      groups: [
        { id: "disciplines", kind: "discipline", label: "Disciplines", pool: 3, freebieCost: 7, xpNew: 10, xpMult: 5, traits: ["Animalism", "Auspex", "Celerity", "Chimerstry", "Dementation", "Dominate", "Fortitude", "Necromancy", "Obfuscate", "Obtenebration", "Potence", "Presence", "Protean", "Quietus", "Serpentis", "Thaumaturgy", "Vicissitude"], note: "The displayed XP multiplier is the in-clan rate. Use the advanced workspace or record a manual note for out-of-clan, Caitiff, blood magic, and elder costs." },
        { id: "backgrounds", kind: "background", label: "Backgrounds", pool: 5, freebieCost: 1, xp: false, traits: ["Allies", "Alternate Identity", "Black Hand Membership", "Contacts", "Domain", "Fame", "Generation", "Herd", "Influence", "Mentor", "Resources", "Retainers", "Rituals", "Status"] },
        { id: "virtues", kind: "virtue", label: "Virtues", pool: 7, freebieCost: 2, xpMult: 2, min: 1, freeDots: { "Conscience / Conviction": 1, "Self-Control / Instinct": 1, Courage: 1 }, traits: ["Conscience / Conviction", "Self-Control / Instinct", "Courage"], note: "Allocate seven dots beyond the automatic one in each Virtue." }
      ],
      specials: [
        { id: "morality", label: "Humanity / Path", min: 0, max: 10, freebieCost: 1, xpMult: 2, default: 2, help: "Normally begins at the sum of the two governing Virtues; adjust after allocating Virtues." },
        { id: "willpower", label: "Willpower", min: 1, max: 10, freebieCost: 1, xpMult: 1, default: 1, help: "Normally begins at Courage; adjust after allocating Virtues." },
        { id: "blood", label: "Current Blood Pool", min: 0, max: 50, freebieCost: 0, xp: false, default: 10, help: "Set current blood and consult the Generation table for the maximum." }
      ],
      customValidation: (state) => {
        const virtues = state.ratings.virtues || {};
        const conscience = Number(virtues["Conscience / Conviction"]?.base || 1);
        const control = Number(virtues["Self-Control / Instinct"]?.base || 1);
        const courage = Number(virtues.Courage?.base || 1);
        const warnings = [];
        if (Number(state.specialBase.morality || 0) < conscience + control) warnings.push({ type: "warn", text: "Humanity or Path normally begins at the sum of its two governing Virtues." });
        if (Number(state.specialBase.willpower || 0) < courage) warnings.push({ type: "warn", text: "Willpower normally begins at Courage." });
        return warnings;
      },
      noteFields: [
        { key: "history", label: "Mortal Life and Embrace", placeholder: "Life, Embrace, Sire, lineage, and defining nights" },
        { key: "lineage", label: "Clan, Sect, and Status", placeholder: "Weakness, bloodline, coterie, boons, titles, rivals, and domain" },
        { key: "powers", label: "Discipline, Path, and Ritual Details", placeholder: "Power names, paths, rituals, combination Disciplines, and table reminders" },
        { key: "feeding", label: "Hunger, Herd, and Haven", placeholder: "Feeding habits, restrictions, prey, Herd, haven, and security" },
        { key: "equipment", label: "Equipment and Combat", placeholder: "Weapons, armor, vehicles, common pools, and blood-spend reminders" },
        { key: "story", label: "Story Hooks", placeholder: "Ambitions, Touchstones, enemies, debts, degeneration, and looming choices" }
      ]
    },
    {
      id: "ghoul",
      label: "Ghoul",
      category: "Vitae-bound mortal",
      description: "A living mortal sustained and empowered by vampire blood, whether loyal retainer, independent survivor, family member, or unwilling thrall.",
      rulesNote: "This V20 ghoul baseline uses 6/4/3 Attributes, 11/7/4 Abilities, five Background dots, seven Virtue dots, Potence 1, and 21 freebies. Storyteller Open supports independent ghouls, animal ghouls, unusual domitors, and alternate companion-book packages.",
      pools: { attributes: [6, 4, 3], abilities: [11, 7, 4], freebies: 21 },
      flawCap: 7,
      identityFields: [
        { key: "domitor", label: "Domitor", placeholder: "Vampire, lineage, or current source" },
        { key: "domitorClan", label: "Domitor's Clan", placeholder: "Clan, bloodline, or unknown" },
        { key: "ghoulType", label: "Ghoul Type", type: "select", options: ["Retainer", "Independent", "Unwilling", "Family / associate", "Animal ghoul", "Former ghoul", "Other"] },
        { key: "bond", label: "Blood Bond", type: "select", options: ["None", "One step", "Two steps", "Fully bound", "Storyteller-defined"] },
        { key: "moralityName", label: "Humanity / Path", placeholder: "Usually Humanity", default: "Humanity" },
        { key: "service", label: "Service / Role", placeholder: "Bodyguard, fixer, vessel, heir…" }
      ],
      requiredIdentity: ["ghoulType", "moralityName"],
      groups: [
        { id: "disciplines", kind: "discipline", label: "Disciplines", pool: 0, freebieCost: 10, xpNew: 20, xpMult: 10, freeDots: { Potence: 1 }, traits: ["Animalism", "Auspex", "Celerity", "Chimerstry", "Dementation", "Dominate", "Fortitude", "Necromancy", "Obfuscate", "Obtenebration", "Potence", "Presence", "Protean", "Quietus", "Serpentis", "Thaumaturgy", "Vicissitude"], note: "Potence 1 is the standard vitae-granted starting dot. Further access depends on domitor, age, Generation limits, training, and Storyteller approval." },
        { id: "backgrounds", kind: "background", label: "Backgrounds", pool: 5, freebieCost: 1, xp: false, traits: ["Allies", "Contacts", "Domitor", "Fame", "Influence", "Mentor", "Resources", "Retainers", "Status"] },
        { id: "virtues", kind: "virtue", label: "Virtues", pool: 7, freebieCost: 2, xpMult: 2, min: 1, freeDots: { "Conscience / Conviction": 1, "Self-Control / Instinct": 1, Courage: 1 }, traits: ["Conscience / Conviction", "Self-Control / Instinct", "Courage"] }
      ],
      specials: [
        { id: "morality", label: "Humanity / Path", min: 0, max: 10, freebieCost: 1, xpMult: 2, default: 2, help: "Normally begins at the sum of the governing Virtues." },
        { id: "willpower", label: "Willpower", min: 1, max: 10, freebieCost: 1, xpMult: 1, default: 1, help: "Normally begins at Courage." },
        { id: "vitae", label: "Stored Vitae", min: 0, max: 10, freebieCost: 0, xp: false, default: 1, help: "Record the current vitae available under the chronicle's ghoul rules." }
      ],
      noteFields: [
        { key: "history", label: "Mortal Life and First Drink", placeholder: "Life before vitae, recruitment, first drink, and years in service" },
        { key: "domitor", label: "Domitor and Bond", placeholder: "Relationship, treatment, bond state, orders, access, and escape plans" },
        { key: "vitae", label: "Vitae and Discipline Notes", placeholder: "Supply, withdrawal, healing, aging, powers, limits, and teaching" },
        { key: "service", label: "Duties and Network", placeholder: "Role, haven access, Herd duties, contacts, enemies, and Masquerade risks" },
        { key: "equipment", label: "Equipment and Combat", placeholder: "Weapons, armor, tools, vehicles, and common pools" },
        { key: "story", label: "Story Hooks", placeholder: "Loyalties, addiction, ambition, abuse, secrets, and freedom" }
      ]
    },
    {
      id: "revenant",
      label: "Revenant",
      category: "Vitae-bearing mortal lineage",
      description: "A mortal born into a family whose blood carries a slow supernatural inheritance and generations of service to the undead.",
      rulesNote: "Revenant families differ in Disciplines, weakness, culture, and starting options. This editable baseline uses 6/4/3 Attributes, 11/7/4 Abilities, one family Discipline dot, five Background dots, seven Virtue dots, and 21 freebies.",
      pools: { attributes: [6, 4, 3], abilities: [11, 7, 4], freebies: 21 },
      flawCap: 7,
      identityFields: [
        { key: "family", label: "Revenant Family", placeholder: "Family, lineage, or custom bloodline" },
        { key: "patron", label: "Patron Clan / Sect", placeholder: "Clan, bloodline, Sect, or cult" },
        { key: "familyRole", label: "Family Role", placeholder: "Heir, enforcer, occultist, exile…" },
        { key: "moralityName", label: "Humanity / Path", placeholder: "Humanity or Path", default: "Humanity" }
      ],
      requiredIdentity: ["family", "moralityName"],
      groups: [
        { id: "disciplines", kind: "discipline", label: "Family Disciplines", pool: 1, freebieCost: 10, xpNew: 20, xpMult: 10, traits: ["Animalism", "Auspex", "Celerity", "Chimerstry", "Dementation", "Dominate", "Fortitude", "Necromancy", "Obfuscate", "Obtenebration", "Potence", "Presence", "Protean", "Quietus", "Serpentis", "Thaumaturgy", "Vicissitude"], note: "Choose from the family Discipline spread approved by the Storyteller; use custom traits for bloodline-specific powers." },
        { id: "backgrounds", kind: "background", label: "Backgrounds", pool: 5, freebieCost: 1, xp: false, traits: ["Allies", "Contacts", "Family", "Fame", "Influence", "Mentor", "Resources", "Retainers", "Status"] },
        { id: "virtues", kind: "virtue", label: "Virtues", pool: 7, freebieCost: 2, xpMult: 2, min: 1, freeDots: { "Conscience / Conviction": 1, "Self-Control / Instinct": 1, Courage: 1 }, traits: ["Conscience / Conviction", "Self-Control / Instinct", "Courage"] }
      ],
      specials: [
        { id: "morality", label: "Humanity / Path", min: 0, max: 10, freebieCost: 1, xpMult: 2, default: 2 },
        { id: "willpower", label: "Willpower", min: 1, max: 10, freebieCost: 1, xpMult: 1, default: 1 },
        { id: "vitae", label: "Vitae Pool", min: 0, max: 10, freebieCost: 0, xp: false, default: 1 }
      ],
      noteFields: [
        { key: "history", label: "Family History", placeholder: "Upbringing, lineage, training, duties, and turning points" },
        { key: "family", label: "Family Traits", placeholder: "Discipline spread, weakness, culture, elders, allies, and rivals" },
        { key: "vitae", label: "Vitae and Discipline Notes", placeholder: "Natural vitae, regeneration, aging, powers, limits, and instruction" },
        { key: "patrons", label: "Vampire Patrons and Duties", placeholder: "Masters, Sect ties, ghoul networks, holdings, and obligations" },
        { key: "equipment", label: "Equipment and Combat", placeholder: "Weapons, armor, tools, vehicles, and common pools" },
        { key: "story", label: "Story Hooks", placeholder: "Ambition, family pressure, taboo, escape, rivalry, and inheritance" }
      ]
    },
    {
      id: "mortal",
      label: "Mortal NPC",
      category: "Non-supernatural",
      description: "An ordinary human ally, vessel, hunter, witness, rival, family member, authority, victim, or passerby.",
      rulesNote: "The mortal NPC baseline uses 6/4/3 Attributes, 11/7/4 Abilities, five Background dots, and 21 freebies. Storyteller Open is ideal for quick NPCs and intentionally uneven specialists.",
      pools: { attributes: [6, 4, 3], abilities: [11, 7, 4], freebies: 21 },
      flawCap: 7,
      identityFields: [
        { key: "role", label: "Chronicle Role", placeholder: "Vessel, hunter, witness, family…" },
        { key: "affiliation", label: "Affiliation", placeholder: "Workplace, family, agency, cult…" },
        { key: "awareness", label: "Awareness of Vampires", type: "select", options: ["None", "Suspicious", "Believer", "Hunter", "Indirect evidence", "Storyteller-defined"] }
      ],
      groups: [{ id: "backgrounds", kind: "background", label: "Backgrounds", pool: 5, freebieCost: 1, xp: false, traits: ["Allies", "Contacts", "Fame", "Influence", "Mentor", "Resources", "Retainers", "Status"] }],
      specials: [
        { id: "humanity", label: "Humanity", min: 0, max: 10, freebieCost: 1, xpMult: 2, default: 7 },
        { id: "willpower", label: "Willpower", min: 1, max: 10, freebieCost: 1, xpMult: 1, default: 3 }
      ],
      noteFields: [
        { key: "motivation", label: "Motivation and Tactics", placeholder: "What they want, how they act, and when they retreat" },
        { key: "connections", label: "Connections", placeholder: "Who they know and which undead lives they touch" },
        { key: "equipment", label: "Equipment", placeholder: "Weapons, armor, tools, vehicles, and valuables" },
        { key: "appearance", label: "Appearance and Voice", placeholder: "Fast portrayal notes" },
        { key: "secrets", label: "Secrets and Clues", placeholder: "What they know and what can be discovered" },
        { key: "health", label: "Health and Combat Notes", placeholder: "Damage, armor, pools, and situational modifiers" }
      ]
    }
  ]
};
