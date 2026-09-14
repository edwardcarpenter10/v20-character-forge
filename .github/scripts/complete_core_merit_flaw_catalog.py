from pathlib import Path

p = Path('shared-v20.js')
text = p.read_text(encoding='utf-8')
marker = '\n  const normalizeMeritFlawName = value => String(value || "")\n'
if 'CORE_V20_MERIT_FLAW_CATALOG_COMPLETE' in text:
    raise SystemExit(0)
if marker not in text:
    raise SystemExit('catalog insertion point missing')

block = r'''

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
'''

text = text.replace(marker, block + marker, 1)
p.write_text(text, encoding='utf-8')

# Extend Guided validation to understand core prerequisites/conflicts.
p = Path('app.js')
text = p.read_text(encoding='utf-8')
old = '''        if (conflict.type === "clan" && (conflict.values || []).includes(state.identity.clan)) warnings.push({ type: "bad", text: conflict.message });
        if (conflict.type === "virtueEthics" && state.virtueTypes?.ethics === conflict.value) warnings.push({ type: "bad", text: conflict.message });
'''
new = '''        if (conflict.type === "clan" && (conflict.values || []).includes(state.identity.clan)) warnings.push({ type: "bad", text: conflict.message });
        if (conflict.type === "virtueEthics" && state.virtueTypes?.ethics === conflict.value) warnings.push({ type: "bad", text: conflict.message });
        if (conflict.type === "sect" && state.identity.sect === conflict.value) warnings.push({ type: "bad", text: conflict.message });
        if (conflict.type === "merit" && hasNamed("merit", conflict.name)) warnings.push({ type: "bad", text: conflict.message });
        if (conflict.type === "flaw" && hasNamed("flaw", conflict.name)) warnings.push({ type: "bad", text: conflict.message });
'''
if old not in text and new not in text: raise SystemExit('guided conflict anchor missing')
text = text.replace(old,new,1)
old = '''        if (req.type === "humanityMin") {
          const moralityName = String(state.identity.moralityName || "Humanity").toLowerCase();
          if (!moralityName.includes("humanity") || Number(state.specialBase.morality || 0) + Number(state.specialXp.morality || 0) < Number(req.value)) warnings.push({ type: "bad", text: req.message });
        }
'''
new = '''        if (req.type === "humanityMin") {
          const moralityName = String(state.identity.moralityName || "Humanity").toLowerCase();
          if (!moralityName.includes("humanity") || Number(state.specialBase.morality || 0) + Number(state.specialXp.morality || 0) < Number(req.value)) warnings.push({ type: "bad", text: req.message });
        }
        if (req.type === "specialMin" && Number(state.specialBase[req.special] || 0) + Number(state.specialXp[req.special] || 0) < Number(req.value)) warnings.push({ type: "bad", text: req.message });
        if (req.type === "attributeMin" && current(req.group, req.trait) < Number(req.value)) warnings.push({ type: "bad", text: req.message });
        if (req.type === "sect" && state.identity.sect !== req.value) warnings.push({ type: "bad", text: req.message });
'''
if old not in text and new not in text: raise SystemExit('guided requirement anchor missing')
text = text.replace(old,new,1)
p.write_text(text, encoding='utf-8')

# Extend Advanced validation for the same prerequisites/conflicts.
p = Path('legacy.html')
text = p.read_text(encoding='utf-8')
old = 'c.type===`clan`&&(c.values||[]).includes(e.identity.clan)&&t.push(c.message),c.type===`virtueEthics`&&e.ethicsVirtue===c.value&&t.push(c.message)'
new = 'c.type===`clan`&&(c.values||[]).includes(e.identity.clan)&&t.push(c.message),c.type===`virtueEthics`&&e.ethicsVirtue===c.value&&t.push(c.message),c.type===`sect`&&e.identity.sect===c.value&&t.push(c.message),c.type===`merit`&&mfr.some(z=>z.kind===`merit`&&V20.normalizeMeritFlawName(z.rule?.name||z.name)===V20.normalizeMeritFlawName(c.name))&&t.push(c.message),c.type===`flaw`&&mfr.some(z=>z.kind===`flaw`&&V20.normalizeMeritFlawName(z.rule?.name||z.name)===V20.normalizeMeritFlawName(c.name))&&t.push(c.message)'
if old not in text and new not in text: raise SystemExit('advanced conflict anchor missing')
text = text.replace(old,new,1)
old = 'if(req.type===`humanityMin`&&(!String(e.moralityName||`Humanity`).toLowerCase().includes(`humanity`)||e.morality<Number(req.value)))t.push(req.message)'
new = 'if(req.type===`humanityMin`&&(!String(e.moralityName||`Humanity`).toLowerCase().includes(`humanity`)||e.morality<Number(req.value)))t.push(req.message);if(req.type===`specialMin`&&req.special===`willpower`&&e.willpower<Number(req.value))t.push(req.message);if(req.type===`attributeMin`&&(e.attributes[req.trait]??0)<Number(req.value))t.push(req.message);if(req.type===`sect`&&e.identity.sect!==req.value)t.push(req.message)'
if old not in text and new not in text: raise SystemExit('advanced requirement anchor missing')
text = text.replace(old,new,1)
p.write_text(text, encoding='utf-8')
