const CATEGORIES: Record<string, RegExp[]> = {
  Ovoce: [
    /jablk/i, /banán/i, /hrozn/i, /borůvk/i, /jahod/i, /malina/i, /malin/i,
    /mango/i, /pomelo/i, /pomeranč/i, /citron/i, /meloun/i, /hruška/i,
    /hrušk/i, /avokádo/i, /mandarink/i, /ananas/i, /grapefruit/i, /švestk/i,
    /višn/i, /broskev/i, /kaštany/i
  ],
  Zelenina: [
    /brokolice/i, /mrkev/i, /celer/i, /paprik/i, /rajčat/i, /okurk/i,
    /cuketa/i, /květák/i, /kedlubn/i, /ředkv/i, /cibule/i, /česnek/i,
    /brambor/i, /špenát/i, /hrášek/i, /fazol[eky]/i, /salát/i, /rukola/i,
    /pak choi/i, /pór /i, /fenykl/i, /zelí /i, /zelí$/i, /dýně/i, /dýňov/i,
    /zázvor/i, /řepa /i, /řeřich/i, /žampio/i, /hlíva/i, /shii-take/i,
    /klíčky/i, /microgreen/i, /pažitk/i, /medvědí/i, /výhonk/i,
    /zeleninová směs/i, /haricot/i, /bimi/i
  ],
  "Maso a ryby": [
    /kuřecí/i, /hovězí/i, /vepřov/i, /krůtí/i, /losos/i, /pstruh/i,
    /tuňák/i, /sardin/i, /kapr/i, /slanin/i, /šunk/i, /jamon/i,
    /prosciutto/i, /roastbeef/i, /masové kuli/i, /maso!/i, /světničkové/i,
    /amadori/i, /krevety/i, /tresčí/i, /filet/i, /uzené/i
  ],
  "Mléčné výrobky": [
    /mléko/i, /jogurt/i, /tvaroh/i, /smetana/i, /máslo/i, /sýr/i,
    /eidam/i, /gouda/i, /mozzarell/i, /mascarpone/i, /ricotta/i,
    /cottage/i, /parenica/i, /camembert/i, /parme[zs]/i, /bryndza/i,
    /kefír/i, /podmáslí/i, /lučina/i, /balsýr/i, /radonický/i,
    /gorgonzola/i, /cheddar/i, /parmigiano/i, /président/i, /formagia/i,
    /frico/i, /delacto/i, /matylda/i, /cheesupers/i, /vejce/i, /zakysaná/i
  ],
  "Pečivo a chléb": [
    /chléb/i, /rohlík/i, /rohlíků/i, /tousť/i, /toust/i, /focaccia/i,
    /kaiserka/i, /bulka/i, /bulk[ay]/i, /breadway/i, /pinsa/i,
    /dýňová bulka/i, /pizza těsto/i, /listové těsto/i, /sádlový/i
  ],
  "Těstoviny a přílohy": [
    /těstovin/i, /spaghetti/i, /fusilli/i, /tagliatelle/i, /tortellini/i,
    /nudle/i, /kuskus/i, /rýže/i, /noky/i, /nočky/i, /gnocchi/i,
    /halušky/i, /špecle/i, /knedlík/i, /vermicelli/i, /cornetti/i,
    /vřetena/i, /funghetto/i, /quinoa/i
  ],
  "Hotová jídla": [
    /polévka/i, /bolognese/i, /butter chicken/i, /rizoto/i, /kari s rýží/i,
    /rajskou omáčkou/i, /boloňská omáčka/i, /restaurant/i,
    /rodina koláčkova/i, /plněné bramborové/i
  ],
  "Koření a přísady": [
    /koření/i, /bazalk/i, /oregano/i, /skořice/i, /pepř/i, /hřebíček/i,
    /badyán/i, /sůl(?! do)/i, /kakao(?! pudin)/i, /vanilk/i, /soda/i,
    /cukr(?! hrášek)/i, /mouka/i, /strouhanka/i, /prášek do peč/i,
    /droždí/i, /ocet/i, /olej/i, /protlak/i, /sójová/i, /nori/i,
    /mořská řasa/i, /citronová šťáva/i, /čokoláda 60/i, /želatina/i
  ],
  Nápoje: [
    /minerální/i, /mošt/i, /džus/i, /pivo/i, /víno\b/i, /sekt/i,
    /frankovka/i, /chardonnay/i, /montepulciano/i, /guinness/i,
    /paulaner/i, /zlatopramen/i, /velkopopovický/i, /vincentka(?! nos)/i,
    /sodastream/i, /destilovaná voda/i, /melta/i
  ],
  "Čaj a káva": [/čaj/i, /earl grey/i, /rooibos/i, /heřmánek/i, /káva/i],
  "Suché plody a semínka": [
    /ořech/i, /mandle/i, /arašíd/i, /kešu/i, /rozink/i, /sezam/i,
    /kokos(?!ové mléko)/i, /semínk/i, /datlí?e/i, /banánové chip/i,
    /farmland/i
  ],
  "Snacky a sladkosti": [
    /sušenk/i, /lentilky/i, /trubičk/i, /tyčink.*čokol/i, /žvýkačk/i,
    /muffin/i, /natu(?! kokos)/i, /raw star/i, /šnek bob/i, /lyofilizo/i,
    /lyo mix/i, /mrazem suš/i, /křupk[yi]/i, /ovsánek/i, /müsli/i,
    /popcorn/i, /chipsy(?! banán)/i
  ],
  "Dětské potřeby": [
    /pampers/i, /babydream/i, /sunar/i, /hipp/i, /kubík/i, /gerber/i,
    /smileat/i, /baby happy/i, /přebalovací/i, /bryndák/i, /dětsk/i,
    /kids/i, /junior/i, /baby(?!dream)/i, /imunoglukan/i, /puntík/i,
    /čtyřlístek/i, /vystřihov/i, /samolepky/i, /dovednosti/i, /modelín/i,
    /bublifuk/i, /voskovk/i, /skicák/i, /barevné papír/i
  ],
  "Zdraví a léky": [
    /vitamin/i, /omega/i, /zinkorot/i, /sinupret/i, /fenistil/i,
    /stopkašel/i, /stoptussin/i, /stotux/i, /stomaran/i, /vigantolvit/i,
    /med ?pharma/i, /livsane/i, /lipo c/i, /nature ?via/i, /aurisclean/i,
    /nosní sprej/i, /ústenka/i, /vincentka nos/i, /vincentka.*sprej/i,
    /chicco/i
  ],
  "Hygiena a domácnost": [
    /toaletní papír/i, /kapesníč/i, /kapesník/i, /vlhčen/i, /mýdlo/i,
    /zubní/i, /kartáč/i, /curaprox/i, /kneipp/i, /ziaja/i, /vademecum/i,
    /houbičk/i, /drátěnk/i, /pytle(?! na)/i, /sáčk[yi]/i, /myčk/i,
    /frosch/i, /coccolino/i, /sanytol/i, /papír na peč/i, /balicí p/i,
    /páska/i, /svíčk/i, /hobliny/i, /žárovk/i, /prskavk/i, /kondomy/i,
    /primeros/i, /facelle/i, /punčoch/i, /motouz/i, /perlan/i, /kelímk/i,
    /baterie/i, /co2/i, /regesoft/i, /jelen tablet/i
  ],
  "Luštěniny a konzervy": [
    /cizrna/i, /čočka/i, /bonduelle/i, /ardo/i, /nowaco hrášek/i,
    /kysané zelí/i, /rajčata.*šťáv/i, /kitchin.*rajčat/i,
    /kitchin.*čočka/i, /kitchin.*červená/i, /loupaná rajčata/i,
    /seeburger/i
  ],
  "Květiny a dekorace": [
    /narcis/i, /šišky/i, /vánoční.*sada/i, /vánoční františek/i, /mašl/i
  ]
}

export function categorize(name: string): string {
  for (const [cat, patterns] of Object.entries(CATEGORIES)) {
    for (const p of patterns) {
      if (p.test(name)) return cat
    }
  }
  return "Ostatní"
}

// Colors for both regex fallback names and Rohlik API category names
const PALETTE = [
  "#f59e0b", "#22c55e", "#ef4444", "#60a5fa", "#d97706",
  "#eab308", "#f97316", "#a855f7", "#06b6d4", "#78716c",
  "#ca8a04", "#ec4899", "#8b5cf6", "#14b8a6", "#64748b",
  "#84cc16", "#f472b6", "#9ca3af", "#10b981", "#6366f1"
]

export const CATEGORY_COLORS: Record<string, string> = {
  // Rohlik API top-level category names
  "Ovoce a zelenina": "#22c55e",
  "Mléčné a chlazené": "#60a5fa",
  "Maso a ryby": "#ef4444",
  "Pekárna a cukrárna": "#d97706",
  "Uzeniny a lahůdky": "#f97316",
  "Trvanlivé": "#eab308",
  "Mražené": "#06b6d4",
  "Nápoje": "#3b82f6",
  "Drogerie": "#64748b",
  "Dítě": "#8b5cf6",
  "Domácnost a zahrada": "#78716c",
  "Lékárna": "#14b8a6",
  "Speciální výživa": "#a855f7",
  "Kosmetika": "#ec4899",
  "Plant Based": "#84cc16",
  "Zvíře": "#ca8a04",
  // Regex fallback names
  "Ovoce": "#f59e0b",
  "Zelenina": "#22c55e",
  "Mléčné výrobky": "#60a5fa",
  "Pečivo a chléb": "#d97706",
  "Těstoviny a přílohy": "#eab308",
  "Hotová jídla": "#f97316",
  "Koření a přísady": "#a855f7",
  "Čaj a káva": "#78716c",
  "Suché plody a semínka": "#ca8a04",
  "Snacky a sladkosti": "#ec4899",
  "Dětské potřeby": "#8b5cf6",
  "Zdraví a léky": "#14b8a6",
  "Hygiena a domácnost": "#64748b",
  "Luštěniny a konzervy": "#84cc16",
  "Květiny a dekorace": "#f472b6",
  "Ostatní": "#9ca3af"
}

// Assign a color to any unknown category deterministically
export function getCategoryColor(name: string): string {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
