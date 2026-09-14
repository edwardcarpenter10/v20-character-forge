(() => {
  "use strict";

  const clans = {
    Assamite: {
      disciplines: ["Celerity", "Obfuscate", "Quietus"],
      summary: "Secretive judges and assassins shaped by martial precision, occult tradition, and blood.",
      weakness: "Kindred vitae is toxic because of the Tremere curse; drinking vampire blood causes severe harm."
    },
    Brujah: {
      disciplines: ["Celerity", "Potence", "Presence"],
      summary: "Passionate rebels, philosophers, and insurgents with formidable physical power.",
      weakness: "Frenzy is harder to resist and control."
    },
    "Followers of Set": {
      disciplines: ["Obfuscate", "Presence", "Serpentis"],
      summary: "Tempters and guardians of forbidden mysteries who undermine restraint through secrets and dependency.",
      weakness: "Sunlight is especially destructive, and bright artificial light is debilitating."
    },
    Gangrel: {
      disciplines: ["Animalism", "Fortitude", "Protean"],
      summary: "Feral wanderers bound to animals, wilderness, and the predatory Beast.",
      weakness: "Each frenzy produces an animalistic physical or behavioral feature."
    },
    Giovanni: {
      disciplines: ["Dominate", "Necromancy", "Potence"],
      summary: "An insular necromantic dynasty treating blood, wealth, family, and the dead as instruments of power.",
      weakness: "The Giovanni Kiss is agonizing and feeding inflicts excessive injury on mortal vessels."
    },
    Lasombra: {
      disciplines: ["Dominate", "Obtenebration", "Potence"],
      summary: "Ruthless aristocrats who cultivate dominance and command the substance of shadow.",
      weakness: "Lasombra cast no reflection and do not appear properly in reflective recording media."
    },
    Malkavian: {
      disciplines: ["Auspex", "Dementation", "Obfuscate"],
      summary: "Oracular vampires whose fractured perceptions can expose otherwise invisible truths.",
      weakness: "Every Malkavian has a permanent, incurable derangement."
    },
    Nosferatu: {
      disciplines: ["Animalism", "Obfuscate", "Potence"],
      summary: "Monstrous information brokers who survive through secrecy and hidden communities.",
      weakness: "Appearance is permanently 0 and cannot be improved."
    },
    Ravnos: {
      disciplines: ["Animalism", "Chimerstry", "Fortitude"],
      summary: "Independent illusionists and wanderers whose adaptability is undermined by a consuming vice.",
      weakness: "The vampire must resist a chosen vice when a clear opportunity to indulge appears."
    },
    Toreador: {
      disciplines: ["Auspex", "Celerity", "Presence"],
      summary: "Sensual aesthetes, artists, patrons, and social predators captivated by beauty and intensity.",
      weakness: "Remarkable beauty or performance can entrance and immobilize the vampire."
    },
    Tremere: {
      disciplines: ["Auspex", "Dominate", "Thaumaturgy"],
      summary: "Hierarchical blood sorcerers whose power is reinforced by discipline, secrecy, and loyalty.",
      weakness: "Tremere form blood bonds unusually quickly."
    },
    Tzimisce: {
      disciplines: ["Animalism", "Auspex", "Vicissitude"],
      summary: "Territorial Fiends who reshape flesh, bone, and identity according to ancient notions of ownership.",
      weakness: "The vampire must sleep near personally significant native soil."
    },
    Ventrue: {
      disciplines: ["Dominate", "Fortitude", "Presence"],
      summary: "Commanding aristocrats who claim responsibility for Kindred order and tradition.",
      weakness: "Only one specific class of mortal blood provides nourishment."
    },
    Caitiff: {
      disciplines: [],
      summary: "Clanless vampires without a consistent lineage, inherited Discipline set, or common weakness.",
      weakness: "No shared clan weakness, but Caitiff face severe social stigma and advance Disciplines differently."
    },
    "Bloodline / Other": {
      disciplines: [],
      summary: "A custom bloodline, rare lineage, antitribu variant, or chronicle-specific inheritance. Record its inherited Disciplines and defining traits in the lineage and Discipline notes.",
      weakness: "Record the bloodline or lineage weakness in Weakness details."
    }
  };

  const creationPackages = {
    standard: {
      id: "standard",
      label: "Standard V20",
      disciplines: 3,
      backgrounds: 5,
      virtues: 7,
      freebies: 15,
      flawCap: 7
    },
    moreInhuman: {
      id: "moreInhuman",
      label: "More Inhuman Vampires",
      disciplines: 4,
      backgrounds: 0,
      virtues: 7,
      freebies: 15,
      flawCap: 7
    }
  };

  window.V20_SHARED = {
    schemaVersion: 1,
    clans,
    clanOptions: Object.keys(clans),
    sects: ["Camarilla", "Sabbat", "Anarch Movement", "Independent / Autarkis", "Other / Chronicle-specific"],
    archetypes: "Architect.Autocrat.Bon Vivant.Bravo.Capitalist.Caregiver.Celebrant.Chameleon.Child.Competitor.Conformist.Conniver.Creep Show.Curmudgeon.Dabbler.Deviant.Director.Enigma.Eye of the Storm.Fanatic.Gallant.Guru.Idealist.Judge.Loner.Martyr.Masochist.Monster.Pedagogue.Penitent.Perfectionist.Rebel.Rogue.Sadist.Scientist.Sociopath.Soldier.Survivor.Thrill-Seeker.Traditionalist.Trickster.Visionary".split("."),
    disciplines: ["Animalism", "Auspex", "Celerity", "Chimerstry", "Dementation", "Dominate", "Fortitude", "Necromancy", "Obfuscate", "Obtenebration", "Potence", "Presence", "Protean", "Quietus", "Serpentis", "Thaumaturgy", "Vicissitude"],
    backgrounds: ["Allies", "Alternate Identity", "Black Hand Membership", "Contacts", "Domain", "Fame", "Generation", "Herd", "Influence", "Mentor", "Resources", "Retainers", "Rituals", "Status"],
    generationOptions: ["13th+", "12th", "11th", "10th", "9th", "8th", "7th", "6th", "5th", "4th", "3rd", "Storyteller-defined"],
    generationTable: {
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
      ethics: {
        standard: { id: "conscience", label: "Conscience", freeDots: 1 },
        alternate: { id: "conviction", label: "Conviction", freeDots: 0 }
      },
      control: {
        standard: { id: "selfControl", label: "Self-Control", freeDots: 1 },
        alternate: { id: "instinct", label: "Instinct", freeDots: 0 }
      },
      courage: { id: "courage", label: "Courage", freeDots: 1 }
    }
  };
})();
