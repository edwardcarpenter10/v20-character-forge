(() => {
  "use strict";

  const clans = {
    Assamite: { disciplines: ["Celerity", "Obfuscate", "Quietus"], summary: "Secretive judges and assassins shaped by martial precision, occult tradition, and blood.", weakness: "Kindred vitae is toxic because of the Tremere curse; drinking vampire blood causes severe harm." },
    Brujah: { disciplines: ["Celerity", "Potence", "Presence"], summary: "Passionate rebels, philosophers, and insurgents with formidable physical power.", weakness: "Frenzy is harder to resist and control." },
    "Followers of Set": { disciplines: ["Obfuscate", "Presence", "Serpentis"], summary: "Tempters and guardians of forbidden mysteries who undermine restraint through secrets and dependency.", weakness: "Sunlight is especially destructive, and bright artificial light is debilitating." },
    Gangrel: { disciplines: ["Animalism", "Fortitude", "Protean"], summary: "Feral wanderers bound to animals, wilderness, and the predatory Beast.", weakness: "Each frenzy produces an animalistic physical or behavioral feature." },
    Giovanni: { disciplines: ["Dominate", "Necromancy", "Potence"], summary: "An insular necromantic dynasty treating blood, wealth, family, and the dead as instruments of power.", weakness: "The Giovanni Kiss is agonizing and feeding inflicts excessive injury on mortal vessels." },
    Lasombra: { disciplines: ["Dominate", "Obtenebration", "Potence"], summary: "Ruthless aristocrats who cultivate dominance and command the substance of shadow.", weakness: "Lasombra cast no reflection and do not appear properly in reflective recording media." },
    Malkavian: { disciplines: ["Auspex", "Dementation", "Obfuscate"], summary: "Oracular vampires whose fractured perceptions can expose otherwise invisible truths.", weakness: "Every Malkavian has a permanent, incurable derangement." },
    Nosferatu: { disciplines: ["Animalism", "Obfuscate", "Potence"], summary: "Monstrous information brokers who survive through secrecy and hidden communities.", weakness: "Appearance is permanently 0 and cannot be improved." },
    Ravnos: { disciplines: ["Animalism", "Chimerstry", "Fortitude"], summary: "Independent illusionists and wanderers whose adaptability is undermined by a consuming vice.", weakness: "The vampire must resist a chosen vice when a clear opportunity to indulge appears." },
    Toreador: { disciplines: ["Auspex", "Celerity", "Presence"], summary: "Sensual aesthetes, artists, patrons, and social predators captivated by beauty and intensity.", weakness: "Remarkable beauty or performance can entrance and immobilize the vampire." },
    Tremere: { disciplines: ["Auspex", "Dominate", "Thaumaturgy"], summary: "Hierarchical blood sorcerers whose power is reinforced by discipline, secrecy, and loyalty.", weakness: "Tremere form blood bonds unusually quickly." },
    Tzimisce: { disciplines: ["Animalism", "Auspex", "Vicissitude"], summary: "Territorial Fiends who reshape flesh, bone, and identity according to ancient notions of ownership.", weakness: "The vampire must sleep near personally significant native soil." },
    Ventrue: { disciplines: ["Dominate", "Fortitude", "Presence"], summary: "Commanding aristocrats who claim responsibility for Kindred order and tradition.", weakness: "Only one specific class of mortal blood provides nourishment." },
    Caitiff: { disciplines: [], summary: "Clanless vampires without a consistent lineage, inherited Discipline set, or common weakness.", weakness: "No shared clan weakness, but Caitiff face severe social stigma and advance Disciplines differently." },
    "Bloodline / Other": { disciplines: [], summary: "A custom bloodline, rare lineage, antitribu variant, or chronicle-specific inheritance. Record its inherited Disciplines and defining traits in the lineage and Discipline notes.", weakness: "Record the bloodline or lineage weakness in Weakness details." }
  };

  const creationPackages = {
    standard: { id: "standard", label: "Standard V20", disciplines: 3, backgrounds: 5, virtues: 7, freebies: 15, flawCap: 7 },
    moreInhuman: { id: "moreInhuman", label: "More Inhuman Vampires", disciplines: 4, backgrounds: 0, virtues: 7, freebies: 15, flawCap: 7 }
  };

  const meritFlawRules = {
    monstrous: {
      name: "Monstrous", kind: "flaw", cost: 3, aliases: ["monsterous"],
      summary: "Appearance is 0.",
      effects: [{ type: "traitCap", group: "attribute:Social", trait: "Appearance", cap: 0 }],
      conflicts: [{ type: "clan", values: ["Nosferatu"], message: "Monstrous cannot be taken by a lineage that already has Appearance 0." }]
    },
    "permanent fangs": {
      name: "Permanent Fangs", kind: "flaw", cost: 3,
      summary: "Appearance cannot exceed 3.",
      effects: [{ type: "traitCap", group: "attribute:Social", trait: "Appearance", cap: 3 }]
    },
    disfigured: {
      name: "Disfigured", kind: "flaw", cost: 2,
      summary: "Appearance cannot exceed 2.",
      effects: [{ type: "traitCap", group: "attribute:Social", trait: "Appearance", cap: 2 }]
    },
    child: {
      name: "Child", kind: "flaw", cost: 3,
      summary: "At character creation, Strength and Stamina cannot exceed 2; the character should also take Short.",
      effects: [
        { type: "creationTraitCap", group: "attribute:Physical", trait: "Strength", cap: 2 },
        { type: "creationTraitCap", group: "attribute:Physical", trait: "Stamina", cap: 2 }
      ],
      recommendations: [{ kind: "flaw", name: "Short", message: "Child normally also takes the Short Flaw." }]
    },
    "weak willed": {
      name: "Weak-Willed", kind: "flaw", cost: 3, aliases: ["weak willed"],
      summary: "Willpower cannot exceed 4.",
      effects: [{ type: "specialCap", special: "willpower", cap: 4 }]
    },
    "fourteenth generation": {
      name: "Fourteenth Generation", kind: "flaw", cost: 2, aliases: ["14th generation"],
      summary: "Generation is 14th; Disciplines cap at 4; no Generation Background or starting Status.",
      effects: [
        { type: "identitySet", key: "generation", value: "14th" },
        { type: "disciplineCap", cap: 4 },
        { type: "traitCap", group: "backgrounds", trait: "Generation", cap: 0 },
        { type: "creationTraitCap", group: "backgrounds", trait: "Status", cap: 0 }
      ]
    },
    "fifteenth generation": {
      name: "Fifteenth Generation", kind: "flaw", cost: 4, aliases: ["15th generation"],
      summary: "Generation is 15th; Disciplines cap at 3; the Generation Background cannot be taken.",
      effects: [
        { type: "identitySet", key: "generation", value: "15th" },
        { type: "disciplineCap", cap: 3 },
        { type: "traitCap", group: "backgrounds", trait: "Generation", cap: 0 }
      ]
    },
    "magic resistance": {
      name: "Magic Resistance", kind: "merit", cost: 2,
      summary: "Thaumaturgy and Necromancy cannot be learned.",
      effects: [{ type: "forbidTraits", group: "disciplines", traits: ["Thaumaturgy", "Necromancy"] }]
    },
    "additional discipline": {
      name: "Additional Discipline", kind: "merit", cost: 5,
      summary: "One named Discipline is treated as in-clan for advancement. Enter it as “Additional Discipline: Discipline Name”.",
      effects: [{ type: "additionalInClanDiscipline" }],
      conflicts: [{ type: "clan", values: ["Caitiff"], message: "Caitiff cannot take Additional Discipline." }]
    },
    unbondable: {
      name: "Unbondable", kind: "merit", cost: 5,
      summary: "The character cannot be blood bound.",
      conflicts: [{ type: "clan", values: ["Tremere"], message: "Tremere cannot take Unbondable." }]
    },
    "true faith": {
      name: "True Faith", kind: "merit", cost: 7,
      summary: "Requires Humanity 9+ and begins with True Faith 1.",
      requirements: [{ type: "humanityMin", value: 9, message: "True Faith requires Humanity 9 or higher." }]
    },
    "conspicuous consumption": {
      name: "Conspicuous Consumption", kind: "flaw", cost: 4,
      summary: "Requires the Eat Food Merit.",
      requirements: [{ type: "merit", name: "Eat Food", message: "Conspicuous Consumption requires the Eat Food Merit." }]
    },
    "guilt wracked": {
      name: "Guilt-Wracked", kind: "flaw", cost: 4, aliases: ["guilt wracked"],
      summary: "Cannot be taken with Conviction.",
      conflicts: [{ type: "virtueEthics", value: "conviction", message: "Guilt-Wracked cannot be taken by a character using Conviction." }]
    },
    "grip of the damned": {
      name: "Grip of the Damned", kind: "flaw", cost: 4,
      summary: "Giovanni cannot take this Flaw.",
      conflicts: [{ type: "clan", values: ["Giovanni"], message: "Giovanni cannot take Grip of the Damned." }]
    },
    "light sensitive": {
      name: "Light-Sensitive", kind: "flaw", cost: 5, aliases: ["light sensitive"],
      summary: "Followers of Set and related lineages cannot take this Flaw.",
      conflicts: [{ type: "clan", values: ["Followers of Set"], message: "Followers of Set cannot take Light-Sensitive." }]
    },
    "huge size": { name: "Huge Size", kind: "merit", cost: 4, summary: "Adds one Bruised health level." },
    "efficient digestion": { name: "Efficient Digestion", kind: "merit", cost: 3, summary: "Feeding yields one extra blood point for every two consumed, without exceeding the blood-pool maximum." },
    short: { name: "Short", kind: "flaw", cost: 1, summary: "Running speed is halved." },
    lame: { name: "Lame", kind: "flaw", cost: 3, summary: "Walking speed is one quarter normal and running is impossible." },
    "permanent wound": { name: "Permanent Wound", kind: "flaw", cost: 3, summary: "The character rises each night at the Wounded health level until healed." },
    "open wound": { name: "Open Wound", kind: "flaw", cost: null, summary: "Costs an extra blood point each evening; the 4-point version also includes Permanent Wound." },
    "slow healing": { name: "Slow Healing", kind: "flaw", cost: 3, summary: "Healing bashing or lethal damage costs two blood points per health level; aggravated healing is slower." },
    "disease carrier": { name: "Disease Carrier", kind: "flaw", cost: 4, summary: "Requires an extra blood point on awakening to suppress symptoms." },
    blind: { name: "Blind", kind: "flaw", cost: 6, summary: "Visual information is unavailable and Dexterity-based rolls are harder." },
    deaf: { name: "Deaf", kind: "flaw", cost: 4, summary: "Hearing is unavailable and many Perception rolls are harder." },
    "thin blood": { name: "Thin Blood", kind: "flaw", cost: 4, summary: "Most blood-point costs are doubled; blood bonds cannot be created and Embraces rarely succeed." }
  };

  const normalizeMeritFlawName = value => String(value || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\([^)]*\)\s*$/, "")
    .split(":")[0]
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const meritFlawAliases = {};
  Object.entries(meritFlawRules).forEach(([key, rule]) => {
    meritFlawAliases[normalizeMeritFlawName(key)] = key;
    meritFlawAliases[normalizeMeritFlawName(rule.name)] = key;
    (rule.aliases || []).forEach(alias => { meritFlawAliases[normalizeMeritFlawName(alias)] = key; });
  });

  const resolveMeritFlawRule = (name, kind = "") => {
    const key = meritFlawAliases[normalizeMeritFlawName(name)];
    const rule = key ? meritFlawRules[key] : null;
    return rule && (!kind || rule.kind === kind) ? rule : null;
  };

  const meritFlawDetail = name => {
    const text = String(name || "").trim();
    const colon = text.indexOf(":");
    if (colon >= 0) return text.slice(colon + 1).trim();
    const match = text.match(/\(([^)]+)\)\s*$/);
    return match ? match[1].trim() : "";
  };

  window.V20_SHARED = {
    schemaVersion: 2,
    clans,
    clanOptions: Object.keys(clans),
    sects: ["Camarilla", "Sabbat", "Anarch Movement", "Independent / Autarkis", "Other / Chronicle-specific"],
    archetypes: "Architect.Autocrat.Bon Vivant.Bravo.Capitalist.Caregiver.Celebrant.Chameleon.Child.Competitor.Conformist.Conniver.Creep Show.Curmudgeon.Dabbler.Deviant.Director.Enigma.Eye of the Storm.Fanatic.Gallant.Guru.Idealist.Judge.Loner.Martyr.Masochist.Monster.Pedagogue.Penitent.Perfectionist.Rebel.Rogue.Sadist.Scientist.Sociopath.Soldier.Survivor.Thrill-Seeker.Traditionalist.Trickster.Visionary".split("."),
    disciplines: ["Animalism", "Auspex", "Celerity", "Chimerstry", "Dementation", "Dominate", "Fortitude", "Necromancy", "Obfuscate", "Obtenebration", "Potence", "Presence", "Protean", "Quietus", "Serpentis", "Thaumaturgy", "Vicissitude"],
    backgrounds: ["Allies", "Alternate Identity", "Black Hand Membership", "Contacts", "Domain", "Fame", "Generation", "Herd", "Influence", "Mentor", "Resources", "Retainers", "Rituals", "Status"],
    generationOptions: ["15th", "14th", "13th+", "12th", "11th", "10th", "9th", "8th", "7th", "6th", "5th", "4th", "3rd", "Storyteller-defined"],
    generationTable: {
      "15th": { max: 5, blood: "10 (6 usable for vampiric effects)", perTurn: "special" },
      "14th": { max: 5, blood: "10 (8 usable for vampiric effects)", perTurn: "1" },
      "13th+": { max: 5, blood: "10", perTurn: "1" },
      "12th": { max: 5, blood: "11", perTurn: "1" },
      "11th": { max: 5, blood: "12", perTurn: "1" },
      "10th": { max: 5, blood: "13", perTurn: "1" },
      "9th": { max: 5, blood: "14", perTurn: "2" },
      "8th": { max: 5, blood: "15", perTurn: "3" },
      "7th": { max: 6, blood: "20", perTurn: "4" },
      "6th": { max: 7, blood: "30", perTurn: "6" },
      "5th": { max: 8, blood: "40", perTurn: "8" },
      "4th": { max: 9, blood: "50", perTurn: "10" },
      "3rd": { max: 10, blood: "Storyteller", perTurn: "Storyteller" }
    },
    creationPackages,
    virtueAxes: {
      ethics: { standard: { id: "conscience", label: "Conscience", freeDots: 1 }, alternate: { id: "conviction", label: "Conviction", freeDots: 0 } },
      control: { standard: { id: "selfControl", label: "Self-Control", freeDots: 1 }, alternate: { id: "instinct", label: "Instinct", freeDots: 0 } },
      courage: { id: "courage", label: "Courage", freeDots: 1 }
    },
    meritFlawRules,
    normalizeMeritFlawName,
    resolveMeritFlawRule,
    meritFlawDetail
  };
})();
