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


  // CORE_V20_MERIT_FLAW_CATALOG_COMPLETE
  // Rules that alter persistent sheet ratings use effects above. The entries below
  // cover the remaining core V20 catalog so names, costs, prerequisites, conflicts,
  // and situational rules are still recognized by both Forge interfaces.
  Object.assign(meritFlawRules, {
    "acute sense": { name: "Acute Sense", kind: "merit", cost: 1, summary: "Choose one sense; tasks relying on it are substantially easier." },
    ambidextrous: { name: "Ambidextrous", kind: "merit", cost: 1, summary: "No off-hand difficulty penalty." },
    bruiser: { name: "Bruiser", kind: "merit", cost: 1, summary: "Intimidation is easier against those who have not established physical superiority." },
    "catlike balance": { name: "Catlike Balance", kind: "merit", cost: 1, summary: "Balance-related rolls are substantially easier." },
    "early riser": { name: "Early Riser", kind: "merit", cost: 1, summary: "Treat Humanity/Path as 10 when determining waking time.", conflicts: [{ type: "flaw", name: "Deep Sleeper", message: "Early Riser cannot be combined with Deep Sleeper." }] },
    "eat food": { name: "Eat Food", kind: "merit", cost: 1, summary: "The vampire can eat and taste mortal food, though it provides no nourishment." },
    "friendly face": { name: "Friendly Face", kind: "merit", cost: 1, summary: "Appropriate first-meeting Social rolls with strangers are easier." },
    "blush of health": { name: "Blush of Health", kind: "merit", cost: 2, summary: "The vampire retains a convincingly living complexion and warmth." },
    "enchanting voice": { name: "Enchanting Voice", kind: "merit", cost: 2, summary: "Voice-based persuasion, charm, and command rolls are substantially easier." },
    daredevil: { name: "Daredevil", kind: "merit", cost: 3, summary: "Exceptionally dangerous non-combat actions gain bonus dice and limited botch protection." },
    "coldly logical": { name: "Coldly Logical", kind: "merit", cost: 1, summary: "Reading facts through emotional distortion is easier." },
    "common sense": { name: "Common Sense", kind: "merit", cost: 1, summary: "The Storyteller may warn when a contemplated action clearly violates common sense." },
    concentration: { name: "Concentration", kind: "merit", cost: 1, summary: "Ignore penalties caused purely by distracting circumstances." },
    introspection: { name: "Introspection", kind: "merit", cost: 1, summary: "Gain bonus Perception dice when opposing someone who shares your Nature or Demeanor." },
    language: { name: "Language", kind: "merit", cost: 1, summary: "Know one additional language; may be purchased multiple times." },
    "time sense": { name: "Time Sense", kind: "merit", cost: 1, summary: "Accurately estimate elapsed time without a timepiece." },
    "useful knowledge": { name: "Useful Knowledge", kind: "merit", cost: 1, summary: "Specialized knowledge functions like a narrow, interest-based Mentor relationship." },
    "code of honor": { name: "Code of Honor", kind: "merit", cost: 2, summary: "Gain bonus Willpower/Virtue dice when acting according to or defending the code." },
    "computer aptitude": { name: "Computer Aptitude", kind: "merit", cost: 2, summary: "Computer-related rolls are substantially easier." },
    "eidetic memory": { name: "Eidetic Memory", kind: "merit", cost: 2, summary: "Recall seen and heard details with exceptional accuracy." },
    "light sleeper": { name: "Light Sleeper", kind: "merit", cost: 2, summary: "Awaken readily and ignore normal daytime dice restrictions from Humanity/Path." },
    "natural linguist": { name: "Natural Linguist", kind: "merit", cost: 2, summary: "Language rolls gain bonus dice; each Language Merit grants two languages." },
    "calm heart": { name: "Calm Heart", kind: "merit", cost: 3, summary: "Gain bonus dice to resist frenzy.", conflicts: [{ type: "clan", values: ["Brujah"], message: "Brujah cannot take Calm Heart." }] },
    "iron will": { name: "Iron Will", kind: "merit", cost: 3, summary: "Strong resistance against Dominate, Dementation, and similar mind-altering effects.", requirements: [{ type: "specialMin", special: "willpower", value: 8, message: "Iron Will requires Willpower 8 or higher." }] },
    precocious: { name: "Precocious", kind: "merit", cost: 3, summary: "A chosen Ability or set of Abilities is learned in half the time and for half XP, subject to Storyteller approval." },
    "elysium regular": { name: "Elysium Regular", kind: "merit", cost: 1, summary: "The character is a familiar regular among Elysium's social circles." },
    "former ghoul": { name: "Former Ghoul", kind: "merit", cost: 1, summary: "Social interaction with inexperienced vampires and vampiric-lore rolls are easier." },
    harmless: { name: "Harmless", kind: "merit", cost: 1, summary: "Others generally dismiss the character as beneath notice until given reason not to." },
    "natural leader": { name: "Natural Leader", kind: "merit", cost: 1, summary: "Leadership rolls gain bonus dice.", requirements: [{ type: "attributeMin", group: "attribute:Social", trait: "Charisma", value: 3, message: "Natural Leader requires Charisma 3 or higher." }] },
    "prestigious sire": { name: "Prestigious Sire", kind: "merit", cost: 1, summary: "The sire's reputation grants inherited social prestige, with possible complications." },
    protege: { name: "Protégé", kind: "merit", cost: 1, aliases: ["protege"], summary: "Those who heard the sire praise the character are more favorably disposed." },
    rep: { name: "Rep", kind: "merit", cost: 1, summary: "The character's reputation extends beyond the immediate Sect." },
    "sabbat survivor": { name: "Sabbat Survivor", kind: "merit", cost: 1, summary: "Perception concerning Sabbat threats and ambushes is easier." },
    boon: { name: "Boon", kind: "merit", cost: null, summary: "A vampire owes one favor; value ranges from 1 to 6 points with the debtor's importance." },
    bullyboy: { name: "Bullyboy", kind: "merit", cost: 2, summary: "The character is trusted as enforcement muscle by local authority." },
    "old pal": { name: "Old Pal", kind: "merit", cost: 2, summary: "A long-standing vampire friend functions as a particularly loyal Ally." },
    "lawmans friend": { name: "Lawman's Friend", kind: "merit", cost: 2, aliases: ["lawman’s friend", "lawman's friend"], summary: "A local Sheriff or Bishop is personally well-disposed toward the character." },
    "open road": { name: "Open Road", kind: "merit", cost: 2, summary: "Knowledge and haven contacts make inter-city travel unusually safe." },
    sanctity: { name: "Sanctity", kind: "merit", cost: 2, summary: "Others tend to perceive the character as innocent and trustworthy." },
    "scholar of enemies": { name: "Scholar of Enemies", kind: "merit", cost: 2, summary: "Non-combat rolls about one chosen enemy group are easier, at the cost of narrower focus." },
    "scholar of others": { name: "Scholar of Others", kind: "merit", cost: 2, summary: "As Scholar of Enemies, but focused on a non-hostile group." },
    "friend of the underground": { name: "Friend of the Underground", kind: "merit", cost: 3, summary: "Subterranean navigation and dealings are easier and safer.", conflicts: [{ type: "clan", values: ["Nosferatu"], message: "Nosferatu cannot take Friend of the Underground." }] },
    mole: { name: "Mole", kind: "merit", cost: 3, summary: "An informer inside an enemy organization supplies intelligence." },
    "rising star": { name: "Rising Star", kind: "merit", cost: 3, summary: "Friendly Social rolls with non-opposed members of the character's Sect are easier." },
    "broken bond": { name: "Broken Bond", kind: "merit", cost: 4, summary: "A former blood bond has secretly broken.", conflicts: [{ type: "sect", value: "Sabbat", message: "Sabbat vampires cannot take Broken Bond." }] },
    "clan friendship": { name: "Clan Friendship", kind: "merit", cost: 4, summary: "Friendly Social interaction with one other Clan is substantially easier." },
    "primogen bishop friendship": { name: "Primogen/Bishop Friendship", kind: "merit", cost: 4, summary: "Local ruling vampires value the character's opinions and consultation." },
    "deceptive aura": { name: "Deceptive Aura", kind: "merit", cost: 1, summary: "Aura-reading attempts register the vampire as mortal." },
    "healing touch": { name: "Healing Touch", kind: "merit", cost: 1, summary: "Feeding punctures can be closed by touch instead of licking." },
    "inoffensive to animals": { name: "Inoffensive to Animals", kind: "merit", cost: 1, summary: "Animals do not instinctively flee or attack solely because the character is a vampire." },
    medium: { name: "Medium", kind: "merit", cost: 2, summary: "Sense and communicate with ghosts; Awareness involving the dead is easier." },
    "hidden diablerie": { name: "Hidden Diablerie", kind: "merit", cost: 3, summary: "Diablerie does not produce the usual telltale aura marks." },
    lucky: { name: "Lucky", kind: "merit", cost: 3, summary: "Three failed rolls per story may be rerolled once each." },
    "oracular ability": { name: "Oracular Ability", kind: "merit", cost: 3, summary: "The character can perceive and interpret meaningful omens." },
    "spirit mentor": { name: "Spirit Mentor", kind: "merit", cost: 3, summary: "A ghostly companion can provide guidance and occasional aid." },
    "true love": { name: "True Love", kind: "merit", cost: 4, summary: "Gain one automatic success on Willpower rolls when sustained by thoughts of the mortal true love." },
    "nine lives": { name: "Nine Lives", kind: "merit", cost: 6, summary: "Fatal outcomes may be rerolled until survival occurs or the limited reserve of lives is exhausted." },

    "hard of hearing": { name: "Hard of Hearing", kind: "flaw", cost: 1, summary: "Hearing-dependent rolls are substantially harder." },
    "smell of the grave": { name: "Smell of the Grave", kind: "flaw", cost: 1, summary: "Social rolls affecting nearby mortals are harder because of the corpse-like odor." },
    "tic twitch": { name: "Tic/Twitch", kind: "flaw", cost: 1, summary: "Suppressing the stress tic costs Willpower." },
    "bad sight": { name: "Bad Sight", kind: "flaw", cost: null, summary: "Sight-based rolls are harder; the 1-point version is correctable, the 3-point version is not." },
    "dulled bite": { name: "Dulled Bite", kind: "flaw", cost: 2, summary: "The character lacks effective fangs and needs another method or extra successes to draw blood." },
    "infectious bite": { name: "Infectious Bite", kind: "flaw", cost: 2, summary: "Feeding wounds cannot be sealed automatically and may become infected." },
    "one eye": { name: "One Eye", kind: "flaw", cost: 2, summary: "Sight Perception and depth-perception tasks are harder." },
    "vulnerability to silver": { name: "Vulnerability to Silver", kind: "flaw", cost: 2, summary: "Silver weapons inflict aggravated damage and contact is painful." },
    addiction: { name: "Addiction", kind: "flaw", cost: 3, summary: "A chosen substance must be present in consumed blood or frenzy follows." },
    deformity: { name: "Deformity", kind: "flaw", cost: 3, summary: "A chosen deformity imposes Storyteller-defined physical and/or social penalties." },
    "glowing eyes": { name: "Glowing Eyes", kind: "flaw", cost: 3, summary: "Intimidation of mortals is easier, but sight and dark Stealth are harder and the eyes expose the character." },
    lazy: { name: "Lazy", kind: "flaw", cost: 3, summary: "Spontaneous Physical actions are harder because the character habitually fails to prepare." },
    mute: { name: "Mute", kind: "flaw", cost: 4, summary: "The character cannot speak and needs another communication method." },
    "flesh of the corpse": { name: "Flesh of the Corpse", kind: "flaw", cost: 5, summary: "Healed injuries leave visible damage that can progressively reduce Appearance." },
    "infertile vitae": { name: "Infertile Vitae", kind: "flaw", cost: 5, summary: "Attempts to Embrace mortals always fail; other uses of vitae remain possible." },
    "deep sleeper": { name: "Deep Sleeper", kind: "flaw", cost: 1, summary: "Waking during the day is substantially harder.", conflicts: [{ type: "merit", name: "Early Riser", message: "Deep Sleeper cannot be combined with Early Riser." }] },
    impatient: { name: "Impatient", kind: "flaw", cost: 1, summary: "Forced waiting may require Self-Control to avoid acting alone." },
    nightmares: { name: "Nightmares", kind: "flaw", cost: 1, summary: "A failed Willpower roll after waking imposes a one-die penalty for the night." },
    "prey exclusion": { name: "Prey Exclusion", kind: "flaw", cost: 1, summary: "Feeding on the excluded prey class provokes frenzy and possible degeneration.", conflicts: [{ type: "clan", values: ["Ventrue"], message: "Ventrue cannot take Prey Exclusion." }] },
    shy: { name: "Shy", kind: "flaw", cost: 1, summary: "Social interaction with strangers and being the center of attention are harder." },
    "soft hearted": { name: "Soft-Hearted", kind: "flaw", cost: 1, aliases: ["soft hearted"], summary: "Causing or witnessing suffering is difficult; normally requires Humanity 7+.", requirements: [{ type: "humanityMin", value: 7, message: "Soft-Hearted normally requires Humanity 7 or higher; Paths require Storyteller approval." }] },
    "speech impediment": { name: "Speech Impediment", kind: "flaw", cost: 1, summary: "Verbal communication rolls are substantially harder." },
    unconvinced: { name: "Unconvinced", kind: "flaw", cost: 1, summary: "Open doubt about Sect or Clan ideology creates political suspicion." },
    amnesia: { name: "Amnesia", kind: "flaw", cost: 2, summary: "The character remembers nothing of their past; details are controlled by the Storyteller." },
    lunacy: { name: "Lunacy", kind: "flaw", cost: 2, summary: "Frenzy resistance becomes harder as the moon approaches full." },
    phobia: { name: "Phobia", kind: "flaw", cost: 2, summary: "Encountering the chosen fear requires Courage or retreat." },
    "short fuse": { name: "Short Fuse", kind: "flaw", cost: 2, summary: "Frenzy resistance is substantially harder.", conflicts: [{ type: "clan", values: ["Brujah"], message: "Brujah cannot take Short Fuse." }] },
    stereotype: { name: "Stereotype", kind: "flaw", cost: 2, summary: "Cartoonish vampire behavior makes Social interaction with other Kindred harder and attracts hunters." },
    territorial: { name: "Territorial", kind: "flaw", cost: 2, summary: "Uninvited vampires entering the claimed territory can provoke frenzy." },
    "thirst for innocence": { name: "Thirst for Innocence", kind: "flaw", cost: 2, summary: "Innocence can trigger a feeding frenzy unless Self-Control/Instinct succeeds." },
    vengeful: { name: "Vengeful", kind: "flaw", cost: 2, summary: "The character is driven to pursue a specific revenge and must spend Willpower to resist." },
    "victim of the masquerade": { name: "Victim of the Masquerade", kind: "flaw", cost: 2, summary: "The character refuses to accept vampirism and must consistently roleplay that denial." },
    flashbacks: { name: "Flashbacks", kind: "flaw", cost: 6, summary: "At each story start, failed Willpower can reduce Willpower to 1 for the session." },
    "botched presentation": { name: "Botched Presentation", kind: "flaw", cost: 1, summary: "Facing the Prince or representatives requires Willpower to remain composed.", requirements: [{ type: "sect", value: "Camarilla", message: "Botched Presentation can only be taken by Camarilla vampires." }] },
    "dark secret": { name: "Dark Secret", kind: "flaw", cost: 1, summary: "Exposure of a major hidden truth would make the character a local pariah." },
    expendable: { name: "Expendable", kind: "flaw", cost: 1, summary: "A powerful figure deliberately assigns the character dangerous duties." },
    "incomplete understanding": { name: "Incomplete Understanding", kind: "flaw", cost: 1, summary: "The character has an unreliable grasp of Sect rules and customs." },
    "infamous sire": { name: "Infamous Sire", kind: "flaw", cost: 1, summary: "The sire's bad reputation causes others to distrust the character." },
    "mistaken identity": { name: "Mistaken Identity", kind: "flaw", cost: 1, summary: "The character is repeatedly confused with another vampire." },
    "new arrival": { name: "New Arrival", kind: "flaw", cost: 1, summary: "The character has no established local network or political knowledge." },
    "new kid": { name: "New Kid", kind: "flaw", cost: 1, summary: "Social rolls with other neonates are harder because the character is unproven." },
    "recruitment target": { name: "Recruitment Target", kind: "flaw", cost: 1, summary: "An enemy organization actively tries to recruit or abduct the character." },
    "sires resentment": { name: "Sire's Resentment", kind: "flaw", cost: 1, aliases: ["sire’s resentment", "sire's resentment"], summary: "The sire and allies actively work against the character." },
    "special responsibility": { name: "Special Responsibility", kind: "flaw", cost: 1, summary: "An ongoing volunteered duty is socially costly to abandon." },
    sympathizer: { name: "Sympathizer", kind: "flaw", cost: 1, summary: "Public sympathy for Sect enemies creates suspicion of disloyalty." },
    enemy: { name: "Enemy", kind: "flaw", cost: null, summary: "A hostile individual or group pursues the character; value ranges from 1 to 5." },
    bound: { name: "Bound", kind: "flaw", cost: 2, summary: "The character is blood bound to another vampire.", conflicts: [{ type: "sect", value: "Sabbat", message: "Sabbat vampires cannot take Bound." }] },
    catspaw: { name: "Catspaw", kind: "flaw", cost: 2, summary: "A former patron treats the character as a dangerous liability after using them for dirty work." },
    "escaped target": { name: "Escaped Target", kind: "flaw", cost: 2, summary: "Seeing a stolen prospective childe makes frenzy harder to resist and damages Charisma-based reputation." },
    failure: { name: "Failure", kind: "flaw", cost: 2, summary: "A catastrophic past failure excludes the character from trusted positions." },
    "masquerade breaker": { name: "Masquerade Breaker", kind: "flaw", cost: 2, summary: "A prior Masquerade breach leaves the character indebted and vulnerable to exposure." },
    hunted: { name: "Hunted", kind: "flaw", cost: 4, summary: "A fanatical hunter pursues the character and associates." },
    "old flame": { name: "Old Flame", kind: "flaw", cost: 2, summary: "An enemy from a past relationship can inhibit action against them." },
    "rival sires": { name: "Rival Sires", kind: "flaw", cost: 2, summary: "A vampire who failed to Embrace the character now persecutes them and their sire." },
    uppity: { name: "Uppity", kind: "flaw", cost: 2, summary: "Boastful behavior creates enemies and makes Social rolls against them harder." },
    "disgrace to the blood": { name: "Disgrace to the Blood", kind: "flaw", cost: 3, summary: "The sire publicly treats the Embrace as a mistake, damaging the character's standing." },
    "former prince": { name: "Former Prince", kind: "flaw", cost: 3, summary: "A local Prince distrusts the character because of prior rulership.", requirements: [{ type: "sect", value: "Camarilla", message: "Former Prince can only be taken by Camarilla vampires." }] },
    "hunted like a dog": { name: "Hunted Like a Dog", kind: "flaw", cost: 3, summary: "An enemy Sect or vampire group relentlessly seeks the character's destruction." },
    narc: { name: "Narc", kind: "flaw", cost: 3, summary: "A reputation as an informer makes many Social rolls harder." },
    "sleeping with the enemy": { name: "Sleeping With the Enemy", kind: "flaw", cost: 3, summary: "A secret intimate relationship with an enemy can be treated as treason." },
    "clan enmity": { name: "Clan Enmity", kind: "flaw", cost: 4, summary: "One entire Clan is hostile; Social rolls involving its members are substantially harder." },
    "loathsome regnant": { name: "Loathsome Regnant", kind: "flaw", cost: 4, summary: "The character is blood bound to an abusive regnant.", conflicts: [{ type: "sect", value: "Sabbat", message: "Sabbat vampires cannot take Loathsome Regnant." }] },
    overextended: { name: "Overextended", kind: "flaw", cost: 4, summary: "Existing influence, retainers, or ghouls have provoked enemies who block expansion." },
    "probationary sect member": { name: "Probationary Sect Member", kind: "flaw", cost: 4, summary: "A recent defector is distrusted by the new Sect." },
    "blood hunted": { name: "Blood Hunted", kind: "flaw", cost: null, summary: "The character is under a Camarilla blood hunt; value is 4 or 6 depending on scope.", requirements: [{ type: "sect", value: "Camarilla", message: "Blood Hunted can only be taken by Camarilla vampires." }] },
    laughingstock: { name: "Laughingstock", kind: "flaw", cost: 5, summary: "Harpies' ridicule makes Social, Intimidation, and some Dominate use harder.", requirements: [{ type: "sect", value: "Camarilla", message: "Laughingstock can only be taken by Camarilla vampires." }] },
    "red list": { name: "Red List", kind: "flaw", cost: 7, summary: "The Camarilla considers the character a priority target for destruction." },
    "cast no reflection": { name: "Cast No Reflection", kind: "flaw", cost: 1, summary: "The vampire has no reflection.", conflicts: [{ type: "clan", values: ["Lasombra"], message: "Lasombra already suffer Cast No Reflection and cannot gain extra Flaw points for it." }] },
    "cold breeze": { name: "Cold Breeze", kind: "flaw", cost: 1, summary: "A supernatural chill follows the character, unsettling mortals and hindering some Social rolls." },
    "repulsed by garlic": { name: "Repulsed by Garlic", kind: "flaw", cost: 1, summary: "Garlic can force the character to flee unless Willpower succeeds." },
    "touch of frost": { name: "Touch of Frost", kind: "flaw", cost: 1, summary: "Plants wither and living beings feel unnatural cold at the character's touch." },
    cursed: { name: "Cursed", kind: "flaw", cost: null, summary: "A supernatural curse imposes a Storyteller-defined effect worth 1 to 5 points." },
    "beacon of the unholy": { name: "Beacon of the Unholy", kind: "flaw", cost: 2, summary: "Clergy and devout mortals instinctively recognize something profoundly wrong." },
    deathsight: { name: "Deathsight", kind: "flaw", cost: 2, summary: "Perception and Social rolls are harder, while resisting Appearance-based influence is easier." },
    "eerie presence": { name: "Eerie Presence", kind: "flaw", cost: 2, summary: "Mortals instinctively sense undeath; Social interaction with them is substantially harder." },
    "lord of the flies": { name: "Lord of the Flies", kind: "flaw", cost: 2, summary: "A swarm of flies hinders Social interaction and makes Stealth substantially harder." },
    "cant cross running water": { name: "Can't Cross Running Water", kind: "flaw", cost: 3, aliases: ["can’t cross running water"], summary: "The character cannot cross running water except from sufficient height." },
    haunted: { name: "Haunted", kind: "flaw", cost: 3, summary: "An angry spirit actively interferes with the character." },
    "repelled by crosses": { name: "Repelled by Crosses", kind: "flaw", cost: 3, summary: "Crosses can force flight and, on a botch, inflict aggravated harm by touch." },
    "dark fate": { name: "Dark Fate", kind: "flaw", cost: 5, summary: "The character is doomed to a terrible fate and visions can impose nightly penalties." }
  });

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
