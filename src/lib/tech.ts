// Hoe rackets gemaakt worden, uit de Bullpadel-catalogus 2027 (werkversie, p.4-7 en p.132-145).
// Het zijn beschrijvingen van het merk zelf; demping en spin zijn merkclaims, niet onafhankelijk getest.
export const BULLPADEL_SOURCE = { label: "Bullpadel catalogus 2027 (werkversie)", url: "https://www.flipsnack.com/aguirreycia/bp_catalago_2027_wip_eng" };

/** Slagvlak-vezels, van hard en direct naar soepel en comfortabel (catalogus p.5). */
export const FIBRE_SCALE = [
  { name: "XtendCarbon 3K", text: "Carbon met veel reactie: maximale snelheid en sterker dan gewoon carbon." },
  { name: "TriCarbon 18K", text: "Dunne carbonstroken in drie richtingen geweven, voor een snelle reactie en terugslag." },
  { name: "XtendCarbon 12K", text: "Kruiselings geweven carbon: stijf en sterk, lichter dan standaard carbon." },
  { name: "Aluminized 18K", text: "Carbon met aluminiumvezels: buigt meer, dempt de klap en de bal komt makkelijker weg." },
  { name: "Fibrix", text: "Mix van glas en carbon met een elastischere hars: meer buiging en een zachter gevoel." },
  { name: "Glaphite", text: "Carbon plus glasvezel: soepel en sterk, met comfort en gevoel." },
  { name: "Polyglass", text: "Glasvezel: een balans tussen soepelheid en sterkte, typisch voor beginnersrackets." },
  { name: "Elastic Fiber", text: "Glasvezel met lage stijfheid: vervormt veel bij de klap, zacht en een grote sweet spot." },
];

/** Kernrubbers, van hard naar comfort (catalogus p.5). */
export const RUBBER_SCALE = [
  { name: "HardEva", text: "Dichte sandwichstructuur: droog, precies gevoel en gedoseerde kracht. Voor sterke spelers." },
  { name: "MultiEva", text: "Twee dichtheden: de harde buitenlaag reageert op snelle ballen, de zachte binnenlaag geeft controle bij langzame." },
  { name: "SoftEva", text: "Stabiel en gelijkmatig, maximaal comfort, en de terugvering blijft lang gelijk." },
  { name: "Evalastic", text: "Comfort en gevoel die lang behouden blijven; gemaakt voor recreanten en jeugd." },
  { name: "CloudEva", text: "Ultrazacht rubber met lage dichtheid: dempt de klap, de bal komt er bijna vanzelf uit." },
];

/** Technologieën met hun uitleg; `match` herkent ze in de specificaties van een racket. */
export const TECH: { name: string; group: string; text: string; match: RegExp }[] = [
  { name: "MultiEva", group: "Kern", text: RUBBER_SCALE[1].text, match: /multi\s?eva/i },
  { name: "HardEva", group: "Kern", text: RUBBER_SCALE[0].text, match: /hard\s?eva/i },
  { name: "SoftEva", group: "Kern", text: RUBBER_SCALE[2].text, match: /soft\s?eva/i },
  { name: "CloudEva", group: "Kern", text: RUBBER_SCALE[4].text, match: /cloud\s?eva/i },
  { name: "Polyglass", group: "Slagvlak", text: FIBRE_SCALE[6].text, match: /polyglass/i },
  { name: "TopSpin", group: "Oppervlak", text: "Zanderige toplaag voor meer grip op de bal en meer spin.", match: /top\s?spin/i },
  { name: "3D Grain", group: "Oppervlak", text: "Reliëf in het oppervlak: meer wrijving en langer contact met de bal, dus meer controle over je effect.", match: /3d/i },
  { name: "CarbonTube", group: "Frame", text: "Frame van 100% carbon: stijf, licht en stabiel.", match: /carbon\s?tube/i },
  { name: "Vibradrive", group: "Grip", text: "Elastisch rubber dat de greep in tweeën deelt en de meeste trilling opvangt, vooral bij slagen buiten het midden.", match: /vibradrive/i },
  { name: "Hesacore", group: "Grip", text: "Grip met honingraatstructuur: je vingers liggen in holle vlakken, wat minder kracht, minder trilling en minder blessures moet opleveren.", match: /hesacore/i },
  { name: "CustomWeight", group: "Gewicht", text: "Een kanaal in het frame voor gelplaatjes van 3 gram: tot 12 gram extra in de kop, of een grip-dop van 5 gram voor meer controle.", match: /custom\s?weight/i },
  { name: "EasyVibe", group: "Demping", text: "Kleine dempertjes in de gaten. Bovenin geven ze meer kracht, onderin meer controle.", match: /easy\s?vibe|ease[- ]vibe/i },
  { name: "Air React Channel", group: "Aerodynamica", text: "Frame waar de lucht zonder wervelingen langs stroomt: lichter, stugger en sneller te bewegen.", match: /air\s?(react)?\s?channel/i },
  { name: "SmartHoles", group: "Gaten", text: "Het gatenpatroon is per racket ontworpen voor zijn frame en materialen, niet standaard.", match: /smart\s?holes/i },
  { name: "Curv:Aktiv", group: "Frame", text: "De zijkanten van het frame zijn getordeerd, alsof er een dubbel frame in twee richtingen werkt.", match: /curv/i },
];

/** Technologieën die in de tekst van een racket voorkomen. */
export function techFor(text: string) {
  return TECH.filter((t) => t.match.test(text));
}
