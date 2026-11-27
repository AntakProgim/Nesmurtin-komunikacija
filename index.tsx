import { analyzeTextLocally, renderAnimatedDonutChart, type TextAnalysisResult } from './donutChart';

// --- TYPES ---
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: 'general' | 'institution';
}

interface LetterTemplate {
  id: string;
  category: 'svietimas' | 'savivaldybe' | 'paslaugos' | 'velavimas' | 'padeka';
  categoryLabel: string;
  title: string;
  addressee: string;
  subject: string;
  salutation: string;
  facts: string;
  feelings: string;
  needs: string;
  request: string;
  closing: string;
  whyItWorks: string;
}

// --- DATA ---
const feelingsData: Record<string, Record<string, string[]>> = {
  "Jausmai, kai poreikiai yra patenkinti": {
    "Taikus": ["aiškus", "atsipalaidavęs", "gyvas", "maloniai", "pailsėjęs", "patogiai", "pilnatviškas", "ramus", "saugus", "stiprus"],
    "Malonus": ["dėkingas", "džiaugsmingas", "išdidus", "įsidrąsinęs", "laimingas", "optimistiškas", "palengvėjęs", "pasitikintis", "patenkintas", "viltingas"],
    "Susidomėjęs": ["budrus", "energingas", "entuziastingas", "įkvėptas", "nustebęs", "susididžiavęs", "susijaudinęs", "trokštantis", "žaismingas"],
    "Mylintis": ["atviraširdis", "dėkingas", "draugiškas", "prielankus", "priimantis", "šiltas", "švelnus"]
  },
  "Jausmai, kai poreikiai nėra patenkinti": {
    "Išsigandęs": ["bailus", "baikštus", "budrus", "nervingas", "paklaikęs", "panikuojantis", "pasibaisėjęs", "praradęs viltį", "sudirgęs", "sunerimęs"],
    "Liūdnas": ["įsiskaudinęs", "nedrąsus", "nusiminęs", "skausmingas", "sunkus", "susikaustęs", "susirūpinęs", "tuščias"],
    "Nusivylęs": ["bejėgis", "išsekęs", "kaltas", "nesaugus", "nuobodus", "pasibjaurėjęs", "susikrimtęs", "sustingęs"],
    "Sumišęs": ["abejingas", "audringas", "nesaugus", "nustebęs", "prieštaraujantis", "suglumęs", "sutrikęs"],
    "Piktas": ["apsunkęs", "įsiutęs", "įsižeidęs", "liūdnas", "pasipiktinęs", "pesimistiškas", "sudirgęs", "susierzinęs"]
  }
};

const fullNeedsList: Record<string, { icon: string, sub: string[], desc: string, question: string }> = {
  "Gerovė": { 
      icon: "🏃", 
      sub: ["judėjimas", "maitinimas", "poilsis", "stabilumas", "sveikata"],
      desc: "Fizinė ir emocinė būsena, kuri leidžia mums jaustis gyvybingiems ir sveikiems.",
      question: "Ar mano kūnui ir protui šiuo metu pakanka poilsio ir energijos?"
  },
  "Prasmė": { 
      icon: "⭐", 
      sub: ["dvasingumas", "galia", "pagalba", "prisidėjimas", "tikslas, rezultatas"],
      desc: "Jausmas, kad mūsų veikla ir buvimas turi vertę, kryptį ir poveikį.",
      question: "Ar tai, ką darau, man atrodo svarbu ir prasminga?"
  },
  "Ryšys": { 
      icon: "👥", 
      sub: ["abipusiškumas", "bendravimas", "empatija", "palytėjimas"],
      desc: "Gilus ir autentiškas santykis su kitais žmonėmis, pagrįstas supratimu.",
      question: "Ar jaučiuosi išgirstas ir suprastas santykyje su kitais?"
  },
  "Taika": { 
      icon: "🌊", 
      sub: ["buvimas", "pusiausvyra", "ramybė", "sąžinė", "sklandumas"],
      desc: "Vidinė harmonija ir konfliktų nebuvimas aplinkoje.",
      question: "Ar jaučiuosi ramiai savo viduje ir aplinkoje?"
  },
  "Saugumas": { 
      icon: "🏠", 
      sub: ["globa", "pastovumas", "patikimumas", "tikėjimas", "tvarka, struktūra"],
      desc: "Užtikrintumas, kad esame apsaugoti nuo fizinio ar emocinio pavojaus.",
      question: "Ar jaučiuosi saugiai šioje situacijoje?"
  },
  "Laisvė": { 
      icon: "🕊️", 
      sub: ["integralumas", "nepriklausomumas", "pasirinkimas", "pilnatvė", "savarankiškumas"],
      desc: "Galimybė rinktis savo kelią, vertybes ir veiksmus be prievartos.",
      question: "Ar turiu galimybę rinktis?"
  },
  "Meilė": { 
      icon: "❤️", 
      sub: ["gailestingumas", "intymumas", "prieraišumas", "šiluma", "švelnumas"],
      desc: "Besąlygiškas priėmimas, šiluma ir artumas.",
      question: "Ar jaučiuosi mylimas ir priimtas toks, koks esu?"
  },
  "Šventimas": { 
      icon: "❄️", 
      sub: ["dėkingumas", "džiaugsmas", "grožis", "priėmimas"],
      desc: "Gebėjimas džiaugtis gyvenimu, pasiekimais ir tiesiog buvimu.",
      question: "Ar skiriu laiko pasidžiaugti tuo, kas pavyko?"
  },
  "Garbingumas": { 
      icon: "⚖️", 
      sub: ["atitikimas", "atvirumas", "savęs pažinimas", "skaidrumas"],
      desc: "Sąžiningumas sau ir kitiems, gyvenimas pagal savo vertybes ir skaidrumas priimant sprendimus.",
      question: "Ar elgiuosi taip, kaip man atrodo teisinga ir skaidru?"
  },
  "Kūrybingumas": { 
      icon: "🖌️", 
      sub: ["aistra", "įkvėpimas", "išraiškingumas", "žaidimas"],
      desc: "Galimybė kurti, išreikšti save ir tyrinėti naujas idėjas.",
      question: "Ar turiu erdvės saviraiškai?"
  },
  "Rūpestis": { 
      icon: "🙏", 
      sub: ["pagalba", "palaikymas", "pasitikėjimas", "svarstymas", "pagarba"],
      desc: "Dėmesys ir atjauta sau bei kitiems.",
      question: "Ar jaučiu, kad manimi ar kitais yra pasirūpinta?"
  },
  "Gebėjimas": { 
      icon: "🌱", 
      sub: ["atsinaujinimas", "dalijimasis", "dėkingumas", "pažeidžiamumas"],
      desc: "Jausmas, kad galiu įveikti iššūkius ir augti.",
      question: "Ar turiu resursų susitvarkyti su šia situacija?"
  },
  "Atsakomybė": { 
      icon: "🤝", 
      sub: ["dalyvavimas", "įsipareigojimas", "ryžtas", "pastovumas"],
      desc: "Sąmoningas įsipareigojimų prisiėmimas ir vykdymas.",
      question: "Ar jaučiuosi atsakingas už savo veiksmus?"
  },
  "Mokymasis": { 
      icon: "📖", 
      sub: ["aiškinimasis", "integracija", "iššūkis", "kompetencija", "tyrinėjimas"],
      desc: "Nuolatinis augimas, žinių siekimas ir pasaulio pažinimas.",
      question: "Ką naujo galiu sužinoti ar išmokti?"
  },
  "Supratimas": { 
      icon: "♾️", 
      sub: ["aiškumas", "jausmingumas", "priėmimas", "susidomėjimas"],
      desc: "Aiškus situacijos, sprendimų ar kito žmogaus motyvų suvokimas.",
      question: "Ar aš tikrai suprantu, kas vyksta?"
  },
  "Bendruomenė": { 
      icon: "🏘️", 
      sub: ["bendradarbiavimas", "draugystė", "įtraukimas", "lygybė", "priklausymas"],
      desc: "Jausmas, kad esi grupės ar bendruomenės dalis ir kad joje bendradarbiaujama.",
      question: "Ar jaučiuosi priklausantis šiai grupei ir įtrauktas?"
  }
};

const connectionMap: Record<string, { needs: string[], type: 'pleasant' | 'unpleasant' }> = {
  "Taikus": { needs: ["Taika", "Gerovė", "Saugumas"], type: 'pleasant' },
  "Malonus": { needs: ["Šventimas", "Meilė", "Gerovė"], type: 'pleasant' },
  "Susidomėjęs": { needs: ["Mokymasis", "Kūrybingumas", "Prasmė", "Supratimas"], type: 'pleasant' },
  "Mylintis": { needs: ["Meilė", "Ryšys", "Bendruomenė"], type: 'pleasant' },
  "Išsigandęs": { needs: ["Saugumas", "Taika", "Gerovė"], type: 'unpleasant' },
  "Liūdnas": { needs: ["Ryšys", "Gebėjimas", "Supratimas", "Meilė"], type: 'unpleasant' },
  "Nusivylęs": { needs: ["Prasmė", "Atsakomybė", "Garbingumas"], type: 'unpleasant' },
  "Sumišęs": { needs: ["Supratimas", "Mokymasis", "Laisvė"], type: 'unpleasant' },
  "Piktas": { needs: ["Rūpestis", "Garbingumas", "Saugumas"], type: 'unpleasant' }
};

const guideExamples: Record<string, { sit: string, quote: string }[]> = {
  mokiniai: [
    { sit: "Dėl vėlavimo į pamoką", quote: "„Pastebėjau, kad šiandien į pamoką atėjai 10 minučių vėliau. Jaučiuosi susirūpinęs, nes man svarbu, kad visi pradėtume darbą kartu ir niekas neatsiliktų. Ar galėtum pasistengti kitą kartą ateiti laiku?“" },
    { sit: "Dėl keiksmažodžių vartojimo", quote: "„Girdėjau tavo pokalbyje vartojant keiksmažodžius. Jaučiuosi nepatogiai, nes man svarbi pagarbi aplinka, kurioje visi jaustųsi saugiai. Prašau, rask kitų žodžių savo mintims išreikšti.“" },
    { sit: "Kai mokinys nesimoko pamokos metu", quote: "„Pastebėjau, kad neužsirašinėji ir nedalyvauji veikloje. Jaučiuosi sunerimęs, nes man svarbu, kad visi įgytų žinių. Gal galėtum pasidalinti, kas tau trukdo susikaupti, ir kartu paieškotume sprendimo?“" },
    { sit: "Kai mokinys sako, kad jam nuobodu", quote: "„Girdžiu, kad tau nuobodu. Man svarbus tavo įsitraukimas ir noriu, kad mokymasis būtų prasmingas. Gal turi pasiūlymų, kaip galėtume šią užduotį padaryti įdomesne?“" },
    { sit: "Kai mokinys sako, kad tingi", quote: "„Kai sakai „tingiu“, man kyla smalsumas. Dažnai už šio žodžio slepiasi poilsio, aiškumo ar prasmės poreikis. Ar galėtum pasidalinti, ko tau dabar labiausiai trūksta – galbūt pertraukėlės ar pagalbos suprantant užduotį?“" },
    { sit: "Dėl mokyklos turto laužymo", quote: "„Matau, kad sulaužei pieštuką. Man liūdna, nes man svarbi tvarka ir pagarba daiktams, kuriais visi dalijamės. Prašau, ateityje elkimės su mokyklos inventoriumi atsakingiau.“" },
    { sit: "Dėl maisto mėtymo", quote: "„Matau, kad mėtai maistą ant žemės. Jaučiuosi nusivylęs, nes man svarbi pagarba maistui ir švari aplinka. Prašau, maistą valgykime, o ne mėtykime.“" },
    { sit: "Dėl užlindinėjimo eilėje", quote: "„Matau, kad atsistojai prieš kitus mokinius, kurie jau laukė. Man svarbus sąžiningumas ir pagarba vieni kitiems. Prašau, atsistok į eilės galą.“" },
    { sit: "Dėl draudžiamų daiktų", quote: "„Matau, kad turi energetinį gėrimą, kuris nėra leidžiamas mokykloje. Jaučiuosi sunerimęs, nes man rūpi tavo sveikata ir visų mokinių saugumas. Prašau, atiduok jį man iki pamokų pabaigos.“" },
    { sit: "Dėl atsikalbinėjimo", quote: "„Kai kalbi pakeltu tonu, man sunku tave išgirsti. Jaučiuosi nuliūdęs, nes man svarbus abipusis suprantimas ir pagarba. Ar galėtume abu kalbėti ramiau ir pabandyti suprasti vienas kitą?“" },
    { sit: "Dėl bėgimo koridoriumi", quote: "„Matau, kad bėgi koridoriumi. Jaučiuosi išsigandęs, nes man rūpi tavo ir kitų saugumas. Prašau, koridoriais eikime, o ne bėgiokime.“" }
  ],
  mokytojai: [
    { sit: "Dėl vėlavimo", quote: "„Pastebėjau, kad šiandien vėlavote į pamoką. Aš jaučiuosi sunerimęs, nes man svarbu užtikrinti pamokos nuoseklumą. Norėčiau jūsų paprašyti ateityje atvykti laiku, kad pamokos netrikdytų vėlavimas.“" },
    { sit: "Dėl mokinių saugumo", quote: "„Pastebėjau, kad neatvykote į savo postą per pertrauką. Jaučiuosi susirūpinęs, nes man svarbu užtikrinti, kad mokiniai jaustųsi saugiai. Ar galėtumėte ateityje pasirūpinti, kad būtumėte savo vietoje nustatytu laiku?“" },
    { sit: "Dėl apkalbų", quote: "„Išgirdau, kaip šiandien per posėdį neigiamai kalbėjote apie kitą mokinį. Jaučiuosi nepatogiai, nes man svarbu, kad kritika būtų konstruktyvi. Ar galėtumėte ateityje, jei turite kritikos, aptarti ją su mokiniu ar kolega asmeniškai, o ne viešai?“" },
    { sit: "Dėl el. dienyno pildymo", quote: "„Pastebėjau, kad jau kelias dienas nėra jokių įrašų jūsų el. dienyne. Jaučiuosi sunerimęs, nes man svarbu, kad tėvai būtų nuolat informuojami apie savo vaiko pažangą. Ar galėtumėte dėti įrašus laiku, kad tėvai galėtų sekti savo vaiko pažangą?“" },
    { sit: "Dėl neatsakytų laiškų", quote: "„Pastebėjau, kad neatsakėte į mano praėjusios savaitės el. laišką. Jaučiuosi susirūpinęs, nes man svarbu, kad komunikacija tarp mūsų būtų sklandi. Ar galėtumėte peržiūrėti savo el. paštą ir atsakyti į laiškus, kad mes galėtume efektyviai dirbti?“" }
  ],
  tevams: [
    { sit: "Dėl piktų laiškų", quote: "„Gavau jūsų el. laišką, kuriame pastebėjau stiprų toną. Jaučiuosi sunerimęs, nes man svarbu, kad mes bendrautume pagarbiai ir išklausytume vienas kitą. Ar galėtume pasikalbėti, kad suprasčiau jūsų poziciją ir išspręstume nesusipratimą?“" },
    { sit: "Dėl duomenų viešinimo", quote: "„Išgirdau, kad pasidalinote kito mokinio vardu ir pavarde socialiniuose tinkluose. Jaučiuosi susirūpinęs, nes man svarbu, kad būtų gerbiamas visų mokinių privatumas. Ar galėtumėte ateityje gerbti kitų mokinių duomenis ir jų neviešinti?“" },
    { sit: "Dėl el. dienyno", quote: "„Pastebėjau, kad nesijungėte į el. dienyną jau ilgą laiką. Jaučiuosi sunerimęs, nes man svarbu, kad žinotumėte, kaip jūsų vaikui sekasi. Ar galėtumėte prisijungti prie el. dienyno ir peržiūrėti vaiko pažangą bei lankomumą, kad mes galėtume laiku aptarti galimus sunkumus?“" },
    { sit: "Dėl praleistų pamokų", quote: "„Pastebėjau, kad jūsų vaikas nebuvo pamokose jau kelias dienas, ir neturime jokio paaiškinimo dėl praleistų pamokų. Jaučiuosi sunerimęs, nes man svarbu žinoti, ar viskas gerai ir kad vaikas nepraleistų svarbių dalykų pamokose. Ar galėtumėte atsiųsti paaiškinimą, kad žinotume, kad jūsų vaikas saugus, ir kad galėtume kartu rasti sprendimą?“" },
    { sit: "Dėl sveikatos pažymos", quote: "„Pastebėjau, kad dar negavome vaiko sveikatos pažymos, o terminas jau pasibaigė. Jaučiuosi sunerimęs, nes man svarbu, kad mokykla turėtų naujausią informaciją apie vaiką ir galėtų užtikrinti jo saugumą. Ar galėtumėte pasirūpinti, kad pažyma būtų pristatyta?“" }
  ],
  namams: [
    { sit: "Dėl netvarkingo kambario", quote: "„Matau drabužius ant žemės. Man svarbi tvarka ir estetika namuose. Ar galėtum juos sudėti į spintą dabar, kad visiems būtų maloniau?“" },
    { sit: "Dėl garsios muzikos", quote: "„Girdžiu garsią muziką. Jaučiuosi pavargęs ir man reikia ramybės poilsiui. Ar galėtum prisitylinti muziką arba užsidėti ausines?“" },
    { sit: "Dėl vėlavimo vakarieniauti", quote: "„Pastebėjau, kad atėjai vakarieniauti 20 minučių vėliau nei sutarėme. Jaučiuosi nuliūdęs, nes man svarbus bendras laikas su šeima. Ar kitą kartą galėtum mane informuoti, jei vėluosi?“" },
    { sit: "Dėl indų plovimo", quote: "„Matau pilną kriauklę neplautų indų. Jaučiuosi apsunkęs, nes man svarbus abipusis prisidėjimas prie buities. Ar galėtum juos sutvarkyti per artimiausią pusvalandį?“" },
    { sit: "Dėl neišneštų šiukšlių", quote: "„Matau, kad šiukšlių dėžė pilna. Jaučiuosi susierzinęs, nes man svarbi švara ir tvarka namuose. Ar galėtum šiukšles išnešti dabar?“" },
    { sit: "Dėl telefono naudojimo prie stalo", quote: "„Pastebėjau, kad vakarieniaudamas naudojiesi telefonu. Jaučiuosi nuliūdęs, nes man trūksta ryšio ir bendravimo su tavimi. Ar galėtume vakarienės metu telefonus pasidėti į šalį?“" },
    { sit: "Dėl pagalbos gaminant maistą", quote: "„Jaučiuosi šiek tiek pavargusi ruošdama vakarienę viena. Man labai padėtų tavo pagalba, kad galėtume greičiau visi kartu pavalgyti. Ar galėtum nulupti daržoves?“" },
    { sit: "Dėl paliktų įjungtų šviesų", quote: "„Pastebėjau, kad išeidamas iš kambario palikai įjungtą šviesą. Jaučiuosi sunerimęs dėl energijos taupymo ir tvarumo. Ar galėtum kitą kartą išeidamas išjungti šviesą?“" }
  ],
  institucijos: [
    { sit: "Savivaldybei dėl neatsakyto rašto", quote: "„2026 m. spalio 10 d. pateikėme oficialų prašymą Nr. 142 dėl saugaus pėsčiųjų tako, tačiau per 20 darbo dienų atsakymo negavome. Jaučiame nerimą dėl neapibrėžtumo, nes mums svarbus informacijos skaidrumas ir bendruomenės saugumas. Prašome iki šio penktadienio el. paštu informuoti apie prašymo nagrinėjimo eigą ir atsakingą specialistą.“" },
    { sit: "Švietimo skyriui dėl švietimo pagalbos", quote: "„Per pastaruosius du mėnesius mūsų klasėje padaugėjo mokinių, kuriems rekomenduota logopedo pagalba, tačiau šiuo metu skirtos valandos padengia tik pusę poreikio. Esame susirūpinę, nes visiems vaikams svarbios lygios ugdymosi galimybės. Prašome peržiūrėti etatų skyrimo galimybes ir iki kito mėnesio 10 d. pateikti rašytinį atsakymą.“" },
    { sit: "Administracijai dėl sprendimo paaiškinimo", quote: "„Gavome jūsų sprendimą dėl patalpų naudojimo grafiko pakeitimo, tačiau rašte nenurodyti pakeitimo kriterijai. Jaučiamės sutrikę, nes planuojant veiklas mums svarbus aiškumas ir nuspėjamumas. Prašome pasidalinti sprendimo argumentais ir numatyti 20 minučių susitikimą galimiems variantams aptarti.“" },
    { sit: "Komunalinių paslaugų teikėjui", quote: "„Nuo lapkričio 3 d. šalia įėjimo į įstaigą neveikia du lauko žibintai, nors apie gedimą pranešėme tel. lapkričio 5 d. Jaučiame susirūpinimą dėl lankytojų ir vaikų saugumo tamsiuoju paros metu. Prašome nurodyti tikslią remonto datą ir patvirtinti ją el. paštu iki savaitės pabaigos.“" },
    { sit: "Sveikatos priežiūros įstaigai", quote: "„Bandant registruotis pas specialistą per e. sveikatos sistemą tris savaites iš eilės nėra laisvų talonų, o registratūroje nepavyko sužinoti, kada skelbiami nauji laikai. Jaučiuosi sunerimęs dėl savo sveikatos ir nežinomybės. Prašau paaiškinti tikslią registracijos tvarką ir nurodyti artimiausią galimą vizito datą.“" },
    { sit: "Padėka institucijai už operatyvumą", quote: "„Pastebėjome, kad per penkias darbo dienas nuo mūsų pranešimo buvo sutvarkyta pėsčiųjų perėja ir įrengti papildomi ženklai. Jaučiame didelį palengvėjimą ir dėkingumą, nes bendruomenei itin svarbus vaikų saugumas ir pasitikėjimas viešosiomis institucijomis. Dėkojame atsakingai komandai ir tikimės tolesnio sklandaus bendradarbiavimo.“" }
  ]
};

// --- LETTER TEMPLATES DATA ---
const letterTemplates: LetterTemplate[] = [
  {
    id: "tpl-delayed-response",
    category: "velavimas",
    categoryLabel: "Atsakymų vėlavimas",
    title: "Priminimas dėl neatsakyto oficialaus kreipimosi",
    addressee: "Savivaldybei, ministerijai ar kitai valstybinei įstaigai",
    subject: "Dėl [Data] pateikto prašymo Nr. [Nr.] nagrinėjimo eigos",
    salutation: "Gerb. [Institucijos pavadinimas] atstovai,",
    facts: "[Data] pateikėme oficialų kreipimąsi (registracijos Nr. [Nr.]) dėl [trumpas klausimo aprašymas]. Nuo kreipimosi pateikimo praėjo [skaičius] darbo dienų, tačiau atsakymo ar informacijos apie nagrinėjimo termino pratęsimą dar negavome.",
    feelings: "Dėl užsitęsusios nežinomybės jaučiame susirūpinimą ir nerimą, nes negalime planuoti tolesnių bendruomenės / įstaigos žingsnių.",
    needs: "Mums svarbus informacijos aiškumas, sprendimų skaidrumas ir sklandus bendradarbiavimas su atsakingomis institucijomis.",
    request: "Prašome iki [norima data, pvz., per 5 darbo dienas] el. paštu informuoti apie šio prašymo nagrinėjimo būseną, numatomą atsakymo datą bei nurodyti už klausimą atsakingo specialisto kontaktus.",
    closing: "Iš anksto dėkojame už bendradarbiavimą.\n\nPagarbiai,\n[Vardas, pavardė]\nTel. [telefonas], el. p. [el. paštas]",
    whyItWorks: "Rašte nėra kaltinimų („jūs mus ignoruojate“), pateikiama tiksli data ir registracijos numeris, o prašymas apibrėžia konkretų atsakymo būdą ir realų terminą."
  },
  {
    id: "tpl-school-safety",
    category: "savivaldybe",
    categoryLabel: "Savivaldybė ir aplinka",
    title: "Dėl vaikų saugumo ir infrastruktūros prie mokyklos",
    addressee: "Savivaldybės administracijai / Miesto ūkio ir transporto skyriui",
    subject: "Dėl pėsčiųjų saugumo užtikrinimo prie [gatvės / įstaigos pavadinimas]",
    salutation: "Gerb. [Institucijos pavadinimas] vadovybė ir specialistai,",
    facts: "Kiekvieną darbo dieną tarp 7:30 ir 8:15 val. per [gatvės pavadinimas] pėsčiųjų perėją eina apie [skaičius] mokinių. Tamsiuoju metų laiku ši atkarpa yra nepakankamai apšviesta, o per pastarąjį mėnesį tėvai užfiksavo kelis atvejus, kai automobiliai laiku nepastebėjo pėsčiųjų.",
    feelings: "Ši situacija mokyklos bendruomenei ir tėvams kelia didelį nerimą bei susirūpinimą dėl kasdienės vaikų kelionės į ugdymo įstaigą.",
    needs: "Mūsų bendras ir svarbiausias prioritetas – mokinių fizinis saugumas, nuspėjama eismo aplinka ir ramybė šeimoms.",
    request: "Prašome įvertinti pėsčiųjų perėjos apšvietimo bei greičio mažinimo priemonių įrengimo galimybes ir iki [norima data] raštu informuoti apie planuojamus sprendimus arba pasiūlyti datą bendrai apžiūrai vietoje.",
    closing: "Dėkojame už dėmesį bendruomenės saugumui.\n\nPagarbiai,\n[Vardas, pavardė]\n[Data]",
    whyItWorks: "Remiamasi konkrečiu laiku ir faktine situacija, o saugumo poreikis įvardijamas kaip bendras tiek bendruomenės, tiek savivaldybės tikslas."
  },
  {
    id: "tpl-education-support",
    category: "svietimas",
    categoryLabel: "Švietimas ir mokykla",
    title: "Dėl švietimo pagalbos ar ugdymo sąlygų užtikrinimo",
    addressee: "Mokyklos administracijai / Savivaldybės švietimo skyriui",
    subject: "Dėl [pagalbos rūšis, pvz., švietimo pagalbos / ugdymo sąlygų] užtikrinimo [klasė / vaikas]",
    salutation: "Gerb. [Institucijos pavadinimas] administracija,",
    facts: "Remiantis [Data] pedagoginės psichologinės tarnybos (arba kito dokumento) rekomendacijomis, mokiniui (-iams) numatyta [konkreti pagalba, pvz., specialiojo pedagogo ar mokytojo padėjėjo pagalba]. Šiuo metu per savaitę skiriama [dabartinis kiekis], o rekomenduojamas poreikis yra [rekomenduojamas kiekis].",
    feelings: "Esame sunerimę dėl vaiko emocinės savijautos ir mokymosi pažangos, kai ugdymo procese pritrūksta nuoseklaus palaikymo.",
    needs: "Mums svarbu užtikrinti lygias ugdymosi galimybes, vaiko saugumą mokykloje ir konstruktyvią partnerystę tarp šeimos bei ugdymo įstaigos.",
    request: "Prašome iki [norima data] pateikti informaciją apie galimybes užtikrinti rekomenduojamą pagalbos apimtį bei pasiūlyti tinkamą laiką bendram aptarimui su atsakingais specialistais.",
    closing: "Vertiname jūsų kasdienį darbą ir tikimės bendro sprendimo.\n\nPagarbiai,\n[Vardas, pavardė]\nKontaktai: [telefonas / el. paštas]",
    whyItWorks: "Išvengiama kaltinimų mokyklai ar specialistams; remiamasi objektyviu dokumentu ir siūloma partnerystė dėl vaiko gerovės."
  },
  {
    id: "tpl-decision-clarification",
    category: "velavimas",
    categoryLabel: "Atsakymų vėlavimas",
    title: "Dėl nesutikimo su sprendimu ir motyvų paaiškinimo",
    addressee: "Institucijos vadovybei / Sprendimą priėmusiai komisijai",
    subject: "Prašymas paaiškinti [Data] sprendimo Nr. [Nr.] motyvus ir peržiūrėti aplinkybes",
    salutation: "Gerb. [Institucijos pavadinimas] komisija / vadovybė,",
    facts: "[Data] gavome jūsų sprendimą Nr. [Nr.], kuriuo mūsų prašymas dėl [tema] buvo atmestas (arba tenkintas iš dalies). Pateiktame atsakyme nenurodyta, kaip buvo įvertinti mūsų pridėti papildomi dokumentai ([dokumentų pavadinimai]).",
    feelings: "Gavus tokį atsakymą jaučiamės sutrikę ir nusivylę, nes šiuo metu negalime suprasti, kokių konkrečių reikalavimų neatitikome.",
    needs: "Mums labai svarbus sprendimų skaidrumas, aiškumas ir pasitikėjimas, kad visos reikšmingos faktinės aplinkybės buvo įvertintos objektyviai.",
    request: "Prašome iki [norima data] pateikti išsamesnį sprendimo motyvų paaiškinimą nurodant vertinimo kriterijus, o esant galimybei – pakartotinai įvertinti pridėtus dokumentus ir informuoti apie galimus tolesnius žingsnius.",
    closing: "Dėkojame už skirtą laiką ir aiškų dialogą.\n\nPagarbiai,\n[Vardas, pavardė]\n[Data]",
    whyItWorks: "Vietoj grasinimų skundais pirmiausia konstruktyviai prašoma skaidrumo ir argumentų – tai dažnai padeda greičiau išspręsti nesusipratimą ar pakartotinai peržiūrėti bylą."
  },
  {
    id: "tpl-public-service-quality",
    category: "paslaugos",
    categoryLabel: "Viešosios paslaugos",
    title: "Dėl viešųjų ar komunalinių paslaugų kokybės trūkumų",
    addressee: "Komunalinių paslaugų, transporto ar kitos paslaugos teikėjui",
    subject: "Dėl [paslaugos pavadinimas] teikimo kokybės [adresas / maršrutas]",
    salutation: "Gerb. [Institucijos pavadinimas] klientų aptarnavimo komanda,",
    facts: "Per pastarąsias [skaičius] savaites ([konkrečios datos]) [vieta / maršrutas] užfiksavome šiuos neatitikimus: [konkretus faktas, pvz., atliekos nebuvo išvežtos pagal grafiką / autobusas neatvyko 7:40 val.]. Pridedame [nuotraukas / ankstesnių pranešimų numerius].",
    feelings: "Pasikartojantys sutrikimai sukelia nepatogumų ir nusivylimą, nes trikdo kasdienį šeimų bei įstaigos ritmą.",
    needs: "Mums svarbus paslaugų patikimumas, tvarkinga aplinka ir galimybė pasikliauti skelbiamu grafiku.",
    request: "Prašome išsiaiškinti šių trikdžių priežastis ir iki [norima data] el. paštu informuoti, kokių priemonių bus imtasi, kad paslauga būtų teikiama pagal numatytą grafiką.",
    closing: "Tikimės operatyvaus problemos sprendimo.\n\nPagarbiai,\n[Vardas, pavardė]\n[Data]",
    whyItWorks: "Konkrečios datos, pridedami įrodymai ir neutrali kalba leidžia paslaugos teikėjui iškart nukreipti užklausą atsakingam padaliniui be gynybinės reakcijos."
  },
  {
    id: "tpl-healthcare-access",
    category: "paslaugos",
    categoryLabel: "Viešosios paslaugos",
    title: "Dėl sveikatos ar socialinės paslaugos prieinamumo",
    addressee: "Gydymo įstaigos administracijai / Socialinės paramos skyriui",
    subject: "Dėl informacijos apie [paslaugos pavadinimas] prieinamumą ir registracijos tvarką",
    salutation: "Gerb. [Institucijos pavadinimas] administracija,",
    facts: "Nuo [Data] kelis kartus bandžiau užsiregistruoti pas [specialistas / dėl paslaugos] per [sistema / telefonas], tačiau laisvų laikų nebuvo, o skambinant [datos] nepavyko gauti informacijos, kada skelbiami nauji registracijos laikai.",
    feelings: "Dėl nežinomybės jaučiu nerimą ir įtampą, nes šią paslaugą svarbu gauti laiku.",
    needs: "Man svarbus aiškumas, pagarbus prieinamumas prie reikalingos pagalbos ir galimybė planuoti savo sveikatos / šeimos priežiūrą.",
    request: "Prašau iki [norima data] raštu arba telefonu paaiškinti tikslią registracijos tvarką, nurodyti, kada atveriami nauji vizitų laikai, ir, esant galimybei, pasiūlyti artimiausią prieinamą alternatyvą.",
    closing: "Dėkoju už jūsų pagalbą ir atsakymą.\n\nPagarbiai,\n[Vardas, pavardė]\nTel. [telefonas]",
    whyItWorks: "Padeda išreikšti žmogišką poreikį laiku gauti pagalbą nekaltinant personalo ir skatina administraciją pasiūlyti konkretų sprendimą."
  },
  {
    id: "tpl-meeting-request",
    category: "savivaldybe",
    categoryLabel: "Savivaldybė ir aplinka",
    title: "Dėl bendruomenės ir institucijos susitikimo inicijavimo",
    addressee: "Savivaldybės atstovams / Mokyklos ar įstaigos tarybai",
    subject: "Pasiūlymas dėl darbinio susitikimo sprendžiant [klausimo tema]",
    salutation: "Gerb. [Institucijos pavadinimas] atstovai,",
    facts: "Pastaruoju metu bendruomenėje kilo klausimų dėl [trumpas faktinis aprašymas, pvz., kiemo tvarkymo projekto / naujos tvarkos įsigaliojimo nuo Data]. Šiuo metu tarp gyventojų (arba tėvų) vyrauja skirtingos interpretacijos apie planuojamus pokyčius.",
    feelings: "Matydami augančią įtampą ir neaiškumą, jaučiame susirūpinimą, tačiau kartu esame nusiteikę ieškoti abiem pusėms priimtino sprendimo.",
    needs: "Mums svarbus atviras dialogas, bendruomenės įtraukimas ir tarpusavio pasitikėjimas priimant visus liečiančius sprendimus.",
    request: "Siūlome surengti 45 minučių darbinį susitikimą (gyvai arba nuotoliu) vieną iš šių datų: [1 data ir laikas] arba [2 data ir laikas]. Prašome iki [norima data] patvirtinti jums tinkamą laiką ir dalyvius.",
    closing: "Tikimės prasmingo ir konstruktyvaus pokalbio.\n\nPagarbiai,\n[Vardas, pavardė]\n[Data]",
    whyItWorks: "Pasiūlydami dvi konkrečias susitikimo datas ir aiškią trukmę, sumažinate administracinę naštą gavėjui ir paverčiate bendradarbiavimą lengvai įgyvendinamu."
  },
  {
    id: "tpl-gratitude-cooperation",
    category: "padeka",
    categoryLabel: "Padėka ir dialogas",
    title: "Konstruktyvi padėka institucijai už bendradarbiavimą",
    addressee: "Institucijos vadovybei ir atsakingam skyriui",
    subject: "Padėka už operatyvų sprendimą dėl [klausimo tema]",
    salutation: "Gerb. [Institucijos pavadinimas] komanda,",
    facts: "[Data] kreipėmės dėl [trumpas aprašymas], ir jau [įvykdymo data] pastebėjome, kad situacija buvo sėkmingai išspręsta – [kas konkrečiai padaryta].",
    feelings: "Jaučiame nuoširdų dėkingumą ir palengvėjimą matydami greitą bei dėmesingą reakciją į bendruomenės prašymą.",
    needs: "Tokie veiksmai stiprina mūsų pasitikėjimą viešosiomis institucijomis, bendrystės jausmą ir saugumą kasdienėje aplinkoje.",
    request: "Prašome perduoti mūsų padėką tiesiogiai prie šio sprendimo prisidėjusiems specialistams. Džiaugiamės šia patirtimi ir tikimės tokio pat sklandaus dialogo ateityje.",
    closing: "Su pagarba ir dėkingumu,\n[Vardas, pavardė]\n[Data]",
    whyItWorks: "NK taikoma ir dėkingumui – įvardijus konkretų veiksmą bei jo poveikį, stiprinamas ilgalaikis pasitikėjimas ir geranoriškumas būsimuose kreipimuose."
  }
];

// --- FLASH CARDS DATA ---
const flashcardsData: Record<string, { feeling: string, need: string, context: string, explanation: string, type: 'pleasant' | 'unpleasant' }[]> = {
  "fc-mokiniai": [
    { feeling: "Piktas", need: "Pagarba", context: "Mokytojas pakėlė balsą prieš klasę.", explanation: "Pyktis signalizuoja ribų peržengimą ir norą būti gerbiamam.", type: 'unpleasant' },
    { feeling: "Nuobodžiaujantis", need: "Prasmė", context: "Mokomės taisyklę, kurios nesuprantu, kur panaudoti.", explanation: "Nuobodulys rodo, kad trūksta veiklos prasmės ir aktualumo.", type: 'unpleasant' },
    { feeling: "Išsigandęs", need: "Saugumas", context: "Reikia eiti prie lentos, o aš nemoku.", explanation: "Baimė kyla, kai nesijaučiame saugūs klysti ar būti vertinami.", type: 'unpleasant' },
    { feeling: "Vienišas", need: "Bendrystė", context: "Pertraukos metu niekas su manimi nekalba.", explanation: "Vienišumas rodo nepatenkintą ryšio ir priklausymo grupei poreikį.", type: 'unpleasant' },
    { feeling: "Didžiuojuosi", need: "Kompetencija", context: "Pavyko išspręsti sunkų uždavinį.", explanation: "Pasididžiavimas rodo, kad poreikis gebėti ir augti yra patenkintas.", type: 'pleasant' },
    { feeling: "Pavydus", need: "Lygybė", context: "Mokytojas pagyrė kitą, nors aš irgi stengiausi.", explanation: "Pavydas dažnai slepia norą būti pamatytam ir vertinamam lygiavertiškai.", type: 'unpleasant' }
  ],
  "fc-mokytojai": [
    { feeling: "Beviltiškas", need: "Palaikymas", context: "Turiu suvaldyti klasę, bet niekas manęs negirdi.", explanation: "Beviltiškumas kyla, kai vienas neši naštą ir trūksta resursų ar pagalbos.", type: 'unpleasant' },
    { feeling: "Susierzinęs", need: "Tvarka", context: "Mokiniai nuolat vėluoja į pamoką.", explanation: "Susierzinimas rodo, kad norisi struktūros ir susitarimų laikymosi.", type: 'unpleasant' },
    { feeling: "Kaltas", need: "Empatija", context: "Pasakiau griežtą pastabą ir mokinys nuliūdo.", explanation: "Kaltė rodo norą elgtis pagal savo vertybes (švelnumą) ir rūpestį kitu.", type: 'unpleasant' },
    { feeling: "Perdegęs", need: "Poilsis", context: "Taisau darbus visą savaitgalį.", explanation: "Perdegimas yra kūno signalas, kad gyvybiškai trūksta atsinaujinimo.", type: 'unpleasant' },
    { feeling: "Dėkingas", need: "Prasmė", context: "Mokinys pasakė, kad pamoka buvo įdomi.", explanation: "Dėkingumas kyla matant, kad tavo darbas kuria vertę kitiems.", type: 'pleasant' },
    { feeling: "Smalsus", need: "Augimas", context: "Bandau naują mokymo metodą.", explanation: "Smalsumas rodo poreikį mokytis, tyrinėti ir atsinaujinti.", type: 'pleasant' }
  ],
  "fc-tevai": [
    { feeling: "Piktas", need: "Bendradarbiavimas", context: "Grįžau pavargęs, o namai visiškai sujaukti.", explanation: "Pyktis čia kalba apie norą, kad buities našta būtų pasidalinta.", type: 'unpleasant' },
    { feeling: "Nerimastingas", need: "Saugumas", context: "Vaikas neatsiliepia į skambučius vėlai vakare.", explanation: "Nerimas kyla iš meilės ir poreikio žinoti, kad artimajam viskas gerai.", type: 'unpleasant' },
    { feeling: "Nusivylęs", need: "Pasitikėjimas", context: "Vaikas pamelavo apie pažymius.", explanation: "Nusivylimas rodo, kad santykyje trūksta atvirumo ir sąžiningumo.", type: 'unpleasant' },
    { feeling: "Sutrikęs", need: "Supratimas", context: "Paauglys staiga užsidarė savo kambaryje.", explanation: "Sutrikimas rodo poreikį suprasti, kas vyksta kito žmogaus viduje.", type: 'unpleasant' },
    { feeling: "Palengvėjęs", need: "Harmonija", context: "Vaikai nustojo peštis ir žaidžia kartu.", explanation: "Palengvėjimas ateina, kai aplinkoje įsivyrauja taika ir ramybė.", type: 'pleasant' },
    { feeling: "Susižavėjęs", need: "Autentiškumas", context: "Vaikas drąsiai išsakė savo nuomonę.", explanation: "Susižavėjimas kyla matant kito žmogaus laisvę būti savimi.", type: 'pleasant' }
  ],
  "fc-institucijos": [
    { feeling: "Susirūpinęs", need: "Aiškumas ir skaidrumas", context: "Į oficialų prašymą savivaldybė neatsakė per 20 darbo dienų.", explanation: "Susirūpinimas rodo poreikį žinoti situacijos eigą ir pasitikėti viešųjų procesų skaidrumu.", type: 'unpleasant' },
    { feeling: "Sutrikęs", need: "Supratimas ir nuspėjamumas", context: "Gautas formalus atsisakymas be aiškių vertinimo kriterijų.", explanation: "Sutrikimas signalizuoja, kad bendruomenei trūksta supratimo, kuo pagrįstas sprendimas.", type: 'unpleasant' },
    { feeling: "Nerimastingas", need: "Saugumas", context: "Prie mokyklos pėsčiųjų perėjos tamsiu metu neveikia apšvietimas.", explanation: "Nerimas kyla dėl pamatinio fizinio vaikų ir pėsčiųjų saugumo poreikio.", type: 'unpleasant' },
    { feeling: "Bejėgis", need: "Įtraukimas ir bendradarbiavimas", context: "Sprendimas dėl bendruomenės erdvės priimtas be gyventojų aptarimo.", explanation: "Bejėgiškumas rodo poreikį būti išgirstiems ir dalyvauti priimant bendrus sprendimus.", type: 'unpleasant' },
    { feeling: "Palengvėjęs", need: "Patikimumas", context: "Institucija aiškiai patvirtino darbų grafiką ir paskyrė atsakingą asmenį.", explanation: "Palengvėjimas kyla patenkinus aiškumo, atsakomybės ir nuspėjamumo poreikius.", type: 'pleasant' },
    { feeling: "Dėkingas", need: "Pasitikėjimas ir partnerystė", context: "Į pranešimą sureaguota operatyviai ir pagarbiai.", explanation: "Dėkingumas stiprina bendradarbiavimo kultūrą tarp piliečių ir institucijų.", type: 'pleasant' }
  ]
};

// --- QUIZ DATABASE ---
const quizDatabase: QuizQuestion[] = [
  // --- STEBĖJIMAS vs VERTINIMAS (General) ---
  { question: "Kuris teiginys yra stebėjimas (faktas), o ne vertinimas?", options: ["Jonas yra tinginys.", "Jonas neatliko dviejų namų darbų iš eilės.", "Jonas nemėgsta mokytis."], correctIndex: 1, explanation: "Stebėjimas fiksuoja konkretų faktą be etiketės.", category: "general" },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Tu visada vėluoji.", "Tu atėjai 10 minučių vėliau.", "Tu negerbi mano laiko."], correctIndex: 1, explanation: "„Visada“ ir „negerbi“ yra interpretacijos.", category: "general" },
  { question: "Pasirinkite stebėjimą:", options: ["Petras daug valgo.", "Petras suvalgė tris porcijas.", "Petras yra ėdrūnas."], correctIndex: 1, explanation: "Kiekis yra faktas, „daug“ yra vertinimas.", category: "general" },
  { question: "Kuris sakinys yra be vertinimo?", options: ["Šiame kambaryje netvarka.", "Ant grindų guli trys marškiniai.", "Tu esi nevala."], correctIndex: 1, explanation: "„Netvarka“ yra subjektyvu, daiktai ant grindų – faktas.", category: "general" },
  { question: "Identifikuokite stebėjimą:", options: ["Mokytoja kalbėjo garsiai.", "Mokytoja rėkė ant klasės.", "Mokytoja kalbėjo pakeltu tonu."], correctIndex: 2, explanation: "„Rėkė“ dažnai turi vertinamąjį atspalvį, „pakeltas tonas“ objektyviau.", category: "general" },
  { question: "Kuris yra stebėjimas?", options: ["Jie ilgai kalbėjosi.", "Jie kalbėjosi 45 minutes.", "Jie plepėjo visą amžinybę."], correctIndex: 1, explanation: "Laiko trukmė yra išmatuojama.", category: "general" },
  { question: "Pasirinkite faktą:", options: ["Tu manęs nemyli.", "Tu manęs nepakvietei į kiną.", "Tu esi abejingas."], correctIndex: 1, explanation: "Veiksmo nebuvimas yra faktas, jausmo priskyrimas – vertinimas.", category: "general" },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Jis vairuoja pavojingai.", "Jis viršijo greitį 20 km/h.", "Jis yra kelių chuliganas."], correctIndex: 1, explanation: "Greičio viršijimas yra faktas.", category: "general" },
  { question: "Identifikuokite stebėjimą:", options: ["Ši užduotis per sunki.", "Tik du mokiniai išsprendė šią užduotį.", "Užduotis neįveikiama."], correctIndex: 1, explanation: "Statistika yra stebėjimas.", category: "general" },
  { question: "Kuris sakinys be vertinimo?", options: ["Tu dažnai pertraukinėji.", "Per šį pokalbį pertraukei mane tris kartus.", "Tu nemoki klausytis."], correctIndex: 1, explanation: "Skaičius yra konkretus.", category: "general" },
  { question: "Identifikuokite stebėjimą:", options: ["Tu niekada manęs neklausai.", "Kai aš kalbėjau, tu žiūrėjai į telefoną.", "Tau nerūpi, ką aš sakau."], correctIndex: 1, explanation: "Veiksmo aprašymas yra stebėjimas.", category: "general" },
  { question: "Kuris sakinys be vertinimo?", options: ["Jonas yra agresyvus.", "Jonas pastūmė Tomą.", "Jonas elgiasi blogai."], correctIndex: 1, explanation: "Veiksmas „pastūmė“ yra faktas.", category: "general" },
  { question: "Pasirinkite stebėjimą:", options: ["Ona retai lanko pamokas.", "Ona praleido 5 pamokas šį mėnesį.", "Ona yra bėglė."], correctIndex: 1, explanation: "Skaičius yra konkretus.", category: "general" },

  // --- JAUSMAI vs MINTYS (General) ---
  { question: "Kuris žodis apibūdina jausmą?", options: ["Jaučiuosi išduotas.", "Jaučiuosi liūdnas.", "Jaučiuosi, kad manimi manipuliuoja."], correctIndex: 1, explanation: "Liūdesys yra emocija. Kiti du yra mintys apie kito elgesį.", category: "general" },
  { question: "Pasirinkite tikrą jausmą:", options: ["Jaučiuosi nereikalingas.", "Jaučiuosi vienišas.", "Jaučiuosi nesuprastas."], correctIndex: 1, explanation: "Vienišumas yra jausmas. „Nesuprastas“ – vertinimas.", category: "general" },
  { question: "Kuris teiginys išreiškia jausmą?", options: ["Jaučiuosi kvailai.", "Jaučiuosi susigėdęs.", "Jaučiuosi ignoruojamas."], correctIndex: 1, explanation: "Gėda yra jausmas. „Ignoruojamas“ – veiksmo interpretacija.", category: "general" },
  { question: "Identifikuokite jausmą:", options: ["Jaučiu, kad tu neteisi.", "Jaučiuosi piktas.", "Jaučiuosi užpultas."], correctIndex: 1, explanation: "Pyktis yra jausmas.", category: "general" },
  { question: "Pasirinkite jausmą:", options: ["Jaučiuosi spaudžiamas.", "Jaučiuosi nerimastingas.", "Jaučiuosi išnaudojamas."], correctIndex: 1, explanation: "Nerimas yra emocija.", category: "general" },
  { question: "Kuris teiginys išreiškia jausmą?", options: ["Jaučiuosi dėkingas.", "Jaučiuosi skolingas.", "Jaučiuosi įpareigotas."], correctIndex: 0, explanation: "Dėkingumas yra jausmas.", category: "general" },
  { question: "Identifikuokite jausmą:", options: ["Jaučiuosi kritikuojamas.", "Jaučiuosi nesaugus.", "Jaučiuosi puolamas."], correctIndex: 1, explanation: "Nesaugumas yra jausmas.", category: "general" },

  // --- POREIKIAI vs STRATEGIJOS (General) ---
  { question: "Kuris yra poreikis, o ne strategija?", options: ["Man reikia automobilio.", "Man reikia laisvės judėti.", "Man reikia, kad mane nuvežtum."], correctIndex: 1, explanation: "Laisvė yra universalus poreikis.", category: "general" },
  { question: "Pasirinkite poreikį:", options: ["Man reikia poilsio.", "Man reikia atostogų.", "Man reikia pamiegoti."], correctIndex: 0, explanation: "Poilsis yra poreikis, miegas/atostogos – būdai.", category: "general" },
  { question: "Kuris yra universalus poreikis?", options: ["Man reikia pinigų.", "Man reikia saugumo.", "Man reikia darbo."], correctIndex: 1, explanation: "Saugumas yra poreikis, pinigai/darbas – strategijos.", category: "general" },
  { question: "Identifikuokite poreikį:", options: ["Man reikia, kad tu nutiltum.", "Man reikia ramybės.", "Man reikia išeiti iš kambario."], correctIndex: 1, explanation: "Ramybė yra poreikis.", category: "general" },
  { question: "Kuris teiginys nurodo poreikį?", options: ["Man reikia pagarbos.", "Man reikia, kad manęs atsiprašytum.", "Man reikia, kad su manimi kalbėtum gražiai."], correctIndex: 0, explanation: "Pagarba yra universalus poreikis.", category: "general" },
  { question: "Kuris yra poreikis?", options: ["Man reikia, kad mane suprastum.", "Man reikia supratimo.", "Man reikia, kad man pritartum."], correctIndex: 1, explanation: "Supratimas yra poreikis.", category: "general" },
  { question: "Kuris teiginys nurodo poreikį?", options: ["Man reikia pasitikėjimo.", "Man reikia, kad manęs netikrintum.", "Man reikia slaptažodžių."], correctIndex: 0, explanation: "Pasitikėjimas yra poreikis.", category: "general" },

  // --- PRAŠYMAI vs REIKALAVIMAI (General) ---
  { question: "Kuris yra konkretus prašymas?", options: ["Būk geresnis.", "Ar galėtum išplauti indus per valandą?", "Noriu, kad labiau stengtumeisi."], correctIndex: 1, explanation: "Konkretus veiksmas ir laikas.", category: "general" },
  { question: "Pasirinkite prašymą:", options: ["Noriu pagarbos.", "Ar galėtum manęs nepertraukti, kol baigsiu sakinį?", "Gerbk mane."], correctIndex: 1, explanation: "Konkretus elgesys.", category: "general" },
  { question: "Identifikuokite prašymą:", options: ["Nustok triukšmauti.", "Ar galėtum pritildyti muziką?", "Būk tyliau."], correctIndex: 1, explanation: "Teigiamas veiksmas (ką daryti, o ne ko ne).", category: "general" },
  { question: "Kuris yra prašymas, ne reikalavimas?", options: ["Tu privalai tai padaryti.", "Ar sutiktum man padėti?", "Daryk, kaip sakau."], correctIndex: 1, explanation: "Paliekama laisvė atsisakyti.", category: "general" },
  { question: "Kuris yra konkretus prašymas?", options: ["Ar galėtum atsakyti į šį laišką iki rytojaus?", "Atrašyk greičiau.", "Noriu atsakymo."], correctIndex: 0, explanation: "Konkretus veiksmas ir laikas.", category: "general" },

  // --- SUSIRAŠINĖJIMAS SU INSTITUCIJOMIS (14) ---
  { question: "Rašote savivaldybei dėl neatsakyto prašymo. Kuris sakinys atitinka NK stebėjimo (faktų) principą?", options: ["Jūsų skyrius visiškai ignoruoja gyventojus.", "Spalio 10 d. pateikėme prašymą Nr. 142, tačiau per 20 darbo dienų atsakymo negavome.", "Jūs dirbate neatsakingai ir vilkinate procesus."], correctIndex: 1, explanation: "Oficialiame rašte stebėjimas remiasi tikslia data, registracijos numeriu ir neutralia fakto konstatacija be kaltinimų.", category: "institution" },
  { question: "Kaip profesionaliai išreikšti jausmą (poveikį) laiške valstybinei institucijai?", options: ["Jaučiame nerimą ir susirūpinimą dėl mokinių saugumo tamsiuoju paros metu.", "Esame įsiutę dėl jūsų abejingumo ir aplaidumo.", "Jaučiamės jūsų apgauti ir išduoti."], correctIndex: 0, explanation: "Oficialiame susirašinėjime tinkama santūri, bet aiški emocinė raiška („nerimas“, „susirūpinimas“), o „apgauti“ ar „abejingumas“ yra kaltinimai.", category: "institution" },
  { question: "Kuris sakinys institucijai aiškiai įvardija universalų poreikį, o ne tik priekaištą?", options: ["Mums reikia, kad pakeistumėte skyriaus vedėją.", "Bendruomenei svarbus sprendimų skaidrumas ir vaikų fizinis saugumas.", "Jūs privalote klausyti mokesčių mokėtojų."], correctIndex: 1, explanation: "Skaidrumas ir saugumas yra universalūs, abiem pusėms suprantami poreikiai, mažinantys gynybinę reakciją.", category: "institution" },
  { question: "Kuris prašymas oficialiame el. laiške institucijai suformuluotas pagal NK principus?", options: ["Imkitės skubių priemonių ir susitvarkykite!", "Prašome iki lapkričio 30 d. el. paštu informuoti apie numatomą darbų grafiką ir atsakingą specialistą.", "Tikimės, kad pagaliau pradėsite dirbti."], correctIndex: 1, explanation: "Geras institucinis prašymas apibrėžia konkretų veiksmą, realų terminą ir atsakymo formą.", category: "institution" },
  { question: "Kuri el. laiško tema labiausiai atitinka nesmurtinės ir dalykiškos komunikacijos principus?", options: ["SKUBU! Visiška betvarkė prie mokyklos!", "Dėl pėsčiųjų perėjos apšvietimo prie Antakalnio g. (prašymas Nr. 142)", "Kodėl vėl nieko nedarote?!"], correctIndex: 1, explanation: "Neutrali, konkreti tema su vieta ar rašto numeriu padeda greičiau užregistruoti ir nukreipti kreipimąsi.", category: "institution" },
  { question: "Gavote neigiamą institucijos sprendimą be aiškių argumentų. Kokia NK reakcija konstruktyviausia?", options: ["„Jūsų sprendimas neteisingas ir šališkas.“", "„Gavus sprendimą be vertinimo kriterijų jaučiamės sutrikę, nes mums svarbus aiškumas. Prašome iki penktadienio pateikti sprendimo motyvus.“", "„Iškart skųsimės žiniasklaidai, jei nepakeisite sprendimo.“"], correctIndex: 1, explanation: "Pirmiausia įvardijamas faktas, poveikis, aiškumo poreikis ir konkretus prašymas pateikti motyvus.", category: "institution" },
  { question: "Kuris sakinys rašte paslaugų teikėjui yra faktas be vertinimo?", options: ["Jūsų paslaugos tapo pasibaisėtinos.", "Lapkričio 4 d. ir 11 d. atliekos nebuvo išvežtos pagal skelbiamą grafiką.", "Darbuotojai visiškai nesistengia atlikti darbo."], correctIndex: 1, explanation: "Konkrečios datos ir neatitikimas grafikui yra patikrinami faktai.", category: "institution" },
  { question: "Kuo skiriasi poreikis nuo strategijos kreipiantis į švietimo skyrių?", options: ["„Lygios ugdymosi galimybės“ yra poreikis, o „papildomas logopedo etatas“ – viena iš strategijų.", "„Papildomas etatas“ yra poreikis, o „ugdymosi kokybė“ – strategija.", "Raštuose institucijoms poreikių nereikia minėti."], correctIndex: 0, explanation: "Įvardijus poreikį (lygios galimybės), institucija gali pasiūlyti ir papildomų sprendimo būdų, jei konkreti strategija tuo metu ribota.", category: "institution" },
  { question: "Kaip rašte mokyklos administracijai geriausia inicijuoti sudėtingo klausimo aptarimą?", options: ["„Reikia kuo greičiau kažką daryti.“", "„Siūlome surengti 30 min. susitikimą lapkričio 28 d. 15:00 arba lapkričio 29 d. 14:00 – prašome patvirtinti tinkamą laiką.“", "„Kada nors susitikime pasikalbėti apie problemas.“"], correctIndex: 1, explanation: "Konkrečios alternatyvios datos ir aiški trukmė palengvina sprendimo priėmimą.", category: "institution" },
  { question: "Kuris teiginys rašte institucijai yra tikras jausmas, o ne kito vertinimas?", options: ["Jaučiamės ignoruojami administracijos.", "Jaučiame nusivylimą ir susirūpinimą dėl užsitęsusio sprendimo.", "Jaučiame, kad institucija vilkina laiką."], correctIndex: 1, explanation: "Nusivylimas ir susirūpinimas apibūdina jūsų vidinę būseną; „ignoruojami“ ir „vilkina“ priskiria motyvus kitai pusei.", category: "institution" },
  { question: "Kodėl verta parašyti trumpą NK padėkos laišką institucijai, kai problema išspręsta?", options: ["Tai neturi jokios prasmės oficialiuose santykiuose.", "Įvardytas konkretus rezultatas ir jo poveikis stiprina pasitikėjimą bei bendradarbiavimą ateityje.", "Tik tam, kad būtų galima iškart prašyti naujos paslaugos."], correctIndex: 1, explanation: "Dėkingumas su konkrečiu faktu ir poreikiu (pasitikėjimas, saugumas) kuria tvarią partnerystę.", category: "institution" },
  { question: "Ką geriausia daryti su pirminiu piktu laiško juodraščiu institucijai pagal NK metodiką?", options: ["Išsiųsti iškart, kad institucija pajustų emocijų stiprumą.", "Atpažinti savo jausmus ir poreikius, pašalinti kaltinimus, palikti faktus su datomis ir aiškų prašymą.", "Nieko nerašyti ir atsisakyti savo poreikio."], correctIndex: 1, explanation: "NK neskatina tylėti – ji padeda stiprią emociją paversti aiškiu, faktiniu ir paveikiu prašymu.", category: "institution" },
  { question: "Kuris sakinys geriausiai atskiria problemą nuo žmonių vertinimo rašte sveikatos įstaigai?", options: ["Registratūros darbuotojos yra nemandagios ir nekompetentingos.", "Tris savaites sistemoje nematyti laisvų laikų, o telefonu nepavyko gauti informacijos apie jų skelbimo tvarką.", "Jūsų poliklinikoje niekada neįmanoma patekti pas gydytoją."], correctIndex: 1, explanation: "Aprašoma konkreti patirtis ir sistemos trūkumas, nepuolant konkrečių darbuotojų.", category: "institution" },
  { question: "Kuri detalė dažniausiai paverčia bendrą nusiskundimą institucijai veiksmingu NK prašymu?", options: ["Didžiosios raidės ir šauktukai tekste.", "Aiškiai nurodytas konkretus veiksmas, pageidaujamas atsakymo terminas ir kontaktiniai duomenys.", "Kuo ilgesnis emocinis aprašymas be konkrečių datų."], correctIndex: 1, explanation: "Konkretus veiksmas, terminas ir kontaktai aiškiai parodo, ko tikitės ir kaip su jumis susisiekti.", category: "institution" }
];

// --- STATE ---
let selectedMapFeeling: string | null = null;
let lastReframedText = '';
let activeTemplateCategory = 'all';
let activeTemplateId = letterTemplates[0].id;
let activeTemplateMode: 'structured' | 'editor' = 'structured';
let isEditorDirty = false;
let liveAnalysisTimer: number | null = null;

// Quiz State
let quizSet: QuizQuestion[] = [];
let quizIndex = 0;
let quizScore = 0;
let hasAnswered = false;
let currentQuizMode: 'mixed' | 'institution' = 'mixed';

const intensityLabels = [
    "Itin minkštas / Pasyvus", "Labai švelnus", "Švelnus", "Jautrus", "Dėmesingas",
    "Labai mandagus", "Mandagus", "Diplomatiškas", "Taktiškas", "Atsargus / Neutralus",
    "Dalykiškas", "Tikslus", "Konkretus", "Tiesioginis", "Atviras",
    "Drąsus", "Ryžtingas", "Griežtas", "Labai griežtas", "Itin tiesmukas / Be filtrų"
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTodayLt(): string {
  const now = new Date();
  const months = [
    'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio',
    'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'
  ];
  return `${now.getFullYear()} m. ${months[now.getMonth()]} ${now.getDate()} d.`;
}

function init() {
  setupNavigation();
  setupReframer();
  setupTemplates();
  setupPractice();
  setupGuideTabs();
  setupModals();
  setupSliderDisplay();
  setupMapSearch();
  setupFlashcards();
  setupGuideShortcuts();
  showSection('reframer');
}

function setupSliderDisplay() {
    const slider = document.getElementById('intensity-slider') as HTMLInputElement;
    const display = document.getElementById('intensity-value');
    if (!slider || !display) return;
    slider.addEventListener('input', () => { 
        display.textContent = intensityLabels[parseInt(slider.value) - 1]; 
    });
    display.textContent = intensityLabels[parseInt(slider.value) - 1];
}

function setupNavigation() {
  ['reframer', 'templates', 'practice', 'map', 'guide', 'vocab'].forEach(id => {
    document.getElementById(`nav-${id}`)?.addEventListener('click', () => showSection(id));
  });
}

function setupGuideShortcuts() {
  document.getElementById('guide-open-templates-btn')?.addEventListener('click', () => {
    showSection('templates');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupMapSearch() {
  const input = document.getElementById('map-search-input');
  input?.addEventListener('input', () => renderMap());
}

function showSection(id: string) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`${id}-section`)?.classList.add('active');
  document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${id}`)?.classList.add('active');

  if (id === 'vocab') renderVocab();
  if (id === 'map') renderMap();
  if (id === 'templates') {
      renderTemplatesList();
      renderActiveTemplate();
  }
  if (id === 'guide') {
      renderNeedsGrid();
      const activeFc = document.querySelector('.ex-tab-btn[data-fc-target].active') as HTMLElement | null;
      renderFlashcards(activeFc?.dataset.fcTarget || 'fc-mokiniai');
  }
  if (id === 'reframer') {
      const activeEx = document.querySelector('.ex-tab-btn[data-target].active') as HTMLElement | null;
      renderGuideExamples(activeEx?.dataset.target || 'mokiniai');
  }
}

interface RephraseApiResponse {
  text: string;
  analysis?: {
    facts: number;
    feelings: number;
    needs: number;
    summary: string;
  };
}

async function apiRephrase(audience: string, format: string, intensityDesc: string, intensity: string, input: string): Promise<RephraseApiResponse> {
  const res = await fetch('/api/rephrase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audience, format, intensityDesc, intensity, input })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Serverio klaida: ${res.status}`);
  }
  const data = await res.json();
  return {
    text: data.text,
    analysis: data.analysis
  };
}

function normalizeAnalysisResult(
  raw: { facts?: number; feelings?: number; needs?: number; summary?: string } | undefined,
  fallbackInput: string,
  source: 'live' | 'ai'
): TextAnalysisResult {
  if (
    raw &&
    typeof raw.facts === 'number' &&
    typeof raw.feelings === 'number' &&
    typeof raw.needs === 'number' &&
    Number.isFinite(raw.facts) &&
    Number.isFinite(raw.feelings) &&
    Number.isFinite(raw.needs)
  ) {
    const f = Math.max(0, raw.facts);
    const e = Math.max(0, raw.feelings);
    const n = Math.max(0, raw.needs);
    const total = f + e + n;
    if (total > 0) {
      const facts = Math.round((f / total) * 100);
      const feelings = Math.round((e / total) * 100);
      const needs = Math.max(0, 100 - facts - feelings);
      return {
        facts,
        feelings,
        needs,
        summary: (raw.summary || '').trim() || analyzeTextLocally(fallbackInput).summary,
        source
      };
    }
  }
  return { ...analyzeTextLocally(fallbackInput), source };
}

function updateAnalysisPanel(result: TextAnalysisResult, popReveal: boolean) {
  const panel = document.getElementById('text-analysis-panel');
  const metaEl = document.getElementById('analysis-source-meta');
  const donutContainer = document.getElementById('nvc-donut-container');
  const factsPct = document.getElementById('legend-facts-pct');
  const feelingsPct = document.getElementById('legend-feelings-pct');
  const needsPct = document.getElementById('legend-needs-pct');
  const summaryEl = document.getElementById('analysis-summary-text');

  if (!panel || !donutContainer) return;

  panel.classList.remove('hidden');
  if (metaEl) {
    metaEl.textContent = result.source === 'ai'
      ? 'DI teksto analizė (atnaujinta gavus atsakymą)'
      : 'Preliminari analizė rašant';
  }
  if (factsPct) factsPct.textContent = `${result.facts}%`;
  if (feelingsPct) feelingsPct.textContent = `${result.feelings}%`;
  if (needsPct) needsPct.textContent = `${result.needs}%`;
  if (summaryEl) summaryEl.textContent = result.summary;

  renderAnimatedDonutChart(donutContainer, result, { popReveal });
}

function updateReframerFormatUI() {
  const format = (document.querySelector('input[name="comm-format"]:checked') as HTMLInputElement)?.value || 'spoken';
  const indicator = document.getElementById('result-format-indicator');
  const textarea = document.getElementById('user-input') as HTMLTextAreaElement | null;
  if (indicator) {
    indicator.textContent = format === 'written' ? 'Oficialus laiškas / raštas' : 'Pokalbis gyvai';
  }
  if (textarea && !textarea.value.trim()) {
    textarea.placeholder = format === 'written'
      ? 'Pvz.: „Savivaldybė jau mėnesį neatsako į mūsų raštą dėl pėsčiųjų perėjos apšvietimo prie mokyklos!“'
      : 'Pvz.: „Tu niekada manęs neklausai!“ arba „Mokiniai nuolat vėluoja į pamoką!“';
  }
}

function setupReframer() {
  const actionsRow = document.getElementById('reframer-result-actions');
  const copyBtn = document.getElementById('copy-rephrase-button');
  const exportBtn = document.getElementById('export-pdf-button');
  const userInputEl = document.getElementById('user-input') as HTMLTextAreaElement | null;

  // Live animated D3 donut analysis as user types
  userInputEl?.addEventListener('input', () => {
    if (liveAnalysisTimer !== null) {
      window.clearTimeout(liveAnalysisTimer);
      liveAnalysisTimer = null;
    }
    const val = userInputEl.value.trim();
    const panel = document.getElementById('text-analysis-panel');
    if (!val) {
      panel?.classList.add('hidden');
      return;
    }
    if (val.length < 6) return;

    liveAnalysisTimer = window.setTimeout(() => {
      const wasHidden = Boolean(panel?.classList.contains('hidden'));
      const localAnalysis = analyzeTextLocally(val);
      updateAnalysisPanel(localAnalysis, wasHidden);
    }, 280);
  });

  // Auto-switch to written format when "Institucijai" is selected
  document.querySelectorAll('input[name="audience"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).value;
      const formatRadio = document.querySelector(`input[name="comm-format"][value="${val === 'institution' ? 'written' : 'spoken'}"]`) as HTMLInputElement | null;
      if (formatRadio && val === 'institution') {
        formatRadio.checked = true;
      }
      updateReframerFormatUI();
    });
  });

  document.querySelectorAll('input[name="comm-format"]').forEach(radio => {
    radio.addEventListener('change', updateReframerFormatUI);
  });
  updateReframerFormatUI();

  document.getElementById('rephrase-button')?.addEventListener('click', async () => {
    const input = (document.getElementById('user-input') as HTMLTextAreaElement).value.trim();
    const output = document.getElementById('gemini-output');
    if (!input || !output) return;

    if (liveAnalysisTimer !== null) {
      window.clearTimeout(liveAnalysisTimer);
      liveAnalysisTimer = null;
    }

    output.innerHTML = '<div class="loading-shimmer" style="height:120px; width:100%; border-radius:12px;"></div>';
    actionsRow?.classList.add('hidden');

    try {
      const audience = (document.querySelector('input[name="audience"]:checked') as HTMLInputElement)?.value || 'child';
      const format = (document.querySelector('input[name="comm-format"]:checked') as HTMLInputElement)?.value || 'spoken';
      const intensity = (document.getElementById('intensity-slider') as HTMLInputElement)?.value || '10';
      const intensityDesc = intensityLabels[parseInt(intensity) - 1];
      
      const result = await apiRephrase(audience, format, intensityDesc, intensity, input);
      lastReframedText = result.text || '';
      output.innerHTML = `<div class="output-text">${escapeHtml(lastReframedText)}</div>`;
      actionsRow?.classList.remove('hidden');

      // Pop-reveal animated D3 donut chart with scale + color transition on AI response
      const aiAnalysis = normalizeAnalysisResult(result.analysis, input, 'ai');
      updateAnalysisPanel(aiAnalysis, true);
    } catch (e: any) {
      console.error("Reframer error:", e);
      output.innerHTML = `<p class="error-msg">Įvyko klaida: ${escapeHtml(e.message || 'Nepavyko susisiekti su serveriu.')}</p>`;
      // Still display local analysis so user gets visual feedback even if AI quota is temporarily hit
      const fallbackAnalysis = analyzeTextLocally(input);
      updateAnalysisPanel(fallbackAnalysis, true);
    }
  });

  copyBtn?.addEventListener('click', async () => {
    if (!lastReframedText) return;
    try {
      await navigator.clipboard.writeText(lastReframedText);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Nukopijuota!';
      setTimeout(() => { copyBtn.textContent = original || 'Kopijuoti tekstą'; }, 2000);
    } catch {
      // Fallback selection
      const temp = document.createElement('textarea');
      temp.value = lastReframedText;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      copyBtn.textContent = 'Nukopijuota!';
      setTimeout(() => { copyBtn.textContent = 'Kopijuoti tekstą'; }, 2000);
    }
  });

  exportBtn?.addEventListener('click', () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const originalInput = (document.getElementById('user-input') as HTMLTextAreaElement).value;
    const format = (document.querySelector('input[name="comm-format"]:checked') as HTMLInputElement)?.value || 'spoken';
    const isWritten = format === 'written';

    printArea.innerHTML = `
      <div class="print-header">${isWritten ? 'Nesmurtinės komunikacijos oficialus kreipimasis' : 'Nesmurtinės komunikacijos performuluotas prašymas'}</div>
      
      <div class="print-section">
        <h2>Pradinė mintis</h2>
        <div class="print-text" style="font-style: italic; color: #555;">„${escapeHtml(originalInput)}“</div>
      </div>

      <div class="print-section">
        <h2>DI Pasiūlymas</h2>
        <div class="print-text" style="font-weight: 500; white-space: pre-line;">${escapeHtml(lastReframedText)}</div>
      </div>

      <div class="print-section">
        <h2>Metodikos patarimai (4 NK žingsniai ${isWritten ? 'susirašinėjimui su institucijomis' : 'pokalbiui'})</h2>
        <div class="print-text">
          <ol style="margin-left: 20px; line-height: 1.65;">
            <li><strong>Stebėjimas (Faktai):</strong> ${isWritten ? 'Pateikite tikslias datas, dokumentų numerius ir faktus be kaltinimų.' : 'Ką matau ar girdžiu (faktai be vertinimo).'}</li>
            <li><strong>Jausmas / Poveikis:</strong> ${isWritten ? 'Naudokite dalykišką emocinę kalbą („jaučiame susirūpinimą“, „kyla nerimas“).' : 'Kaip dėl to jaučiuosi.'}</li>
            <li><strong>Poreikis:</strong> ${isWritten ? 'Įvardykite bendrą visuotinį poreikį (saugumas, skaidrumas, aiškumas, pasitikėjimas).' : 'Koks universalus poreikis nepatenkintas.'}</li>
            <li><strong>Prašymas:</strong> ${isWritten ? 'Nurodykite konkretų veiksmą, realų atsakymo terminą ir kontaktinius duomenis.' : 'Konkretus ir įgyvendinamas prašymas klausimo forma.'}</li>
          </ol>
        </div>
      </div>
    `;
    window.print();
  });
}

// --- LETTER TEMPLATES LOGIC ---
function getQuickFillValues() {
  const instInput = document.getElementById('qf-institution') as HTMLInputElement | null;
  const senderInput = document.getElementById('qf-sender') as HTMLInputElement | null;
  const dateInput = document.getElementById('qf-date') as HTMLInputElement | null;

  return {
    institution: instInput?.value.trim() || '',
    sender: senderInput?.value.trim() || '',
    date: dateInput?.value.trim() || ''
  };
}

function applyPlaceholders(text: string): string {
  const { institution, sender, date } = getQuickFillValues();
  let result = text;
  if (institution) {
    result = result.replace(/\[Institucijos pavadinimas\]/g, institution);
  }
  if (sender) {
    result = result.replace(/\[Vardas, pavardė\]/g, sender);
  }
  if (date) {
    result = result.replace(/\[Data\]/g, date);
  }
  return result;
}

function buildFullLetterBody(tpl: LetterTemplate): string {
  return [
    applyPlaceholders(tpl.salutation),
    '',
    applyPlaceholders(tpl.facts),
    '',
    `${applyPlaceholders(tpl.feelings)} ${applyPlaceholders(tpl.needs)}`,
    '',
    applyPlaceholders(tpl.request),
    '',
    applyPlaceholders(tpl.closing)
  ].join('\n');
}

function setupTemplates() {
  // Pre-fill date with today's Lithuanian date as a helpful starting point
  const dateInput = document.getElementById('qf-date') as HTMLInputElement | null;
  if (dateInput && !dateInput.value) {
    dateInput.value = getTodayLt();
  }

  // Category filter buttons
  document.querySelectorAll('#template-category-tabs .ex-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#template-category-tabs .ex-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTemplateCategory = (btn as HTMLElement).dataset.tplCat || 'all';
      const filtered = getFilteredTemplates();
      if (filtered.length > 0 && !filtered.some(t => t.id === activeTemplateId)) {
        activeTemplateId = filtered[0].id;
        isEditorDirty = false;
        resetTemplateChecklist();
      }
      renderTemplatesList();
      renderActiveTemplate();
    });
  });

  // View mode toggle
  const structuredBtn = document.getElementById('tpl-mode-structured');
  const editorBtn = document.getElementById('tpl-mode-editor');

  structuredBtn?.addEventListener('click', () => {
    activeTemplateMode = 'structured';
    structuredBtn.classList.add('active');
    editorBtn?.classList.remove('active');
    document.getElementById('tpl-structured-view')?.classList.remove('hidden');
    document.getElementById('tpl-editor-view')?.classList.add('hidden');
  });

  editorBtn?.addEventListener('click', () => {
    activeTemplateMode = 'editor';
    editorBtn.classList.add('active');
    structuredBtn?.classList.remove('active');
    document.getElementById('tpl-structured-view')?.classList.add('hidden');
    document.getElementById('tpl-editor-view')?.classList.remove('hidden');
  });

  // Quick-fill inputs live update
  ['qf-institution', 'qf-sender', 'qf-date'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      renderActiveTemplate();
    });
  });

  // Track manual edits in editor view
  const subjectInput = document.getElementById('tpl-subject-input') as HTMLInputElement | null;
  const bodyTextarea = document.getElementById('tpl-body-textarea') as HTMLTextAreaElement | null;
  subjectInput?.addEventListener('input', () => { isEditorDirty = true; });
  bodyTextarea?.addEventListener('input', () => { isEditorDirty = true; });

  document.getElementById('tpl-reset-btn')?.addEventListener('click', () => {
    isEditorDirty = false;
    renderActiveTemplate();
  });

  // Copy full letter
  const copyTplBtn = document.getElementById('copy-template-btn');
  copyTplBtn?.addEventListener('click', async () => {
    const { subject, body } = getActiveLetterContent();
    const fullText = `Tema: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const temp = document.createElement('textarea');
      temp.value = fullText;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    copyTplBtn.textContent = 'Laiškas nukopijuotas!';
    setTimeout(() => { copyTplBtn.textContent = 'Kopijuoti laišką'; }, 2200);
  });

  // Send template to AI Reframer for custom tone adjustment
  document.getElementById('send-template-to-reframer-btn')?.addEventListener('click', () => {
    const { subject, body } = getActiveLetterContent();
    const fullText = `Tema: ${subject}\n\n${body}`;
    const userInput = document.getElementById('user-input') as HTMLTextAreaElement | null;
    if (userInput) {
      userInput.value = fullText;
    }
    const instRadio = document.querySelector('input[name="audience"][value="institution"]') as HTMLInputElement | null;
    if (instRadio) instRadio.checked = true;
    const writtenRadio = document.querySelector('input[name="comm-format"][value="written"]') as HTMLInputElement | null;
    if (writtenRadio) writtenRadio.checked = true;
    updateReframerFormatUI();
    showSection('reframer');
    updateAnalysisPanel(analyzeTextLocally(fullText), true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Print / PDF
  document.getElementById('print-template-btn')?.addEventListener('click', () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    const tpl = letterTemplates.find(t => t.id === activeTemplateId) || letterTemplates[0];
    const { subject, body } = getActiveLetterContent();

    printArea.innerHTML = `
      <div class="print-header">${escapeHtml(tpl.title)}</div>
      <div class="print-section">
        <h2>Tema</h2>
        <div class="print-text"><strong>${escapeHtml(subject)}</strong></div>
      </div>
      <div class="print-section">
        <h2>Laiško tekstas</h2>
        <div class="print-text" style="white-space: pre-line;">${escapeHtml(body)}</div>
      </div>
    `;
    window.print();
  });

  // Checklist progress
  document.querySelectorAll('.tpl-check-input').forEach(checkbox => {
    checkbox.addEventListener('change', updateChecklistProgress);
  });
  updateChecklistProgress();
}

function resetTemplateChecklist() {
  document.querySelectorAll('.tpl-check-input').forEach(cb => {
    (cb as HTMLInputElement).checked = false;
  });
  updateChecklistProgress();
}

function updateChecklistProgress() {
  const boxes = Array.from(document.querySelectorAll('.tpl-check-input')) as HTMLInputElement[];
  const checkedCount = boxes.filter(b => b.checked).length;
  const label = document.getElementById('tpl-checklist-progress');
  if (label) {
    label.textContent = `${checkedCount} / ${boxes.length} patikrinta`;
  }
}

function getFilteredTemplates(): LetterTemplate[] {
  if (activeTemplateCategory === 'all') return letterTemplates;
  return letterTemplates.filter(t => t.category === activeTemplateCategory);
}

function getActiveLetterContent(): { subject: string, body: string } {
  const tpl = letterTemplates.find(t => t.id === activeTemplateId) || letterTemplates[0];
  const subjectInput = document.getElementById('tpl-subject-input') as HTMLInputElement | null;
  const bodyTextarea = document.getElementById('tpl-body-textarea') as HTMLTextAreaElement | null;

  if (isEditorDirty && subjectInput && bodyTextarea) {
    return { subject: subjectInput.value, body: bodyTextarea.value };
  }
  return {
    subject: applyPlaceholders(tpl.subject),
    body: buildFullLetterBody(tpl)
  };
}

function renderTemplatesList() {
  const container = document.getElementById('templates-list');
  if (!container) return;
  const items = getFilteredTemplates();

  container.innerHTML = items.map(tpl => `
    <button type="button" class="template-list-item ${tpl.id === activeTemplateId ? 'active' : ''}" data-tpl-id="${tpl.id}">
      <div class="tpl-item-title">${escapeHtml(tpl.title)}</div>
      <div class="tpl-item-meta">${escapeHtml(tpl.categoryLabel)} · ${escapeHtml(tpl.addressee)}</div>
    </button>
  `).join('');

  container.querySelectorAll('.template-list-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.tplId;
      if (!id || id === activeTemplateId) return;
      activeTemplateId = id;
      isEditorDirty = false;
      resetTemplateChecklist();
      renderTemplatesList();
      renderActiveTemplate();
    });
  });
}

function renderActiveTemplate() {
  const tpl = letterTemplates.find(t => t.id === activeTemplateId) || letterTemplates[0];
  const titleEl = document.getElementById('tpl-detail-title');
  const metaEl = document.getElementById('tpl-detail-meta');
  const structuredEl = document.getElementById('tpl-structured-view');
  const subjectInput = document.getElementById('tpl-subject-input') as HTMLInputElement | null;
  const bodyTextarea = document.getElementById('tpl-body-textarea') as HTMLTextAreaElement | null;

  if (titleEl) titleEl.textContent = tpl.title;
  if (metaEl) metaEl.textContent = `Kam skirta: ${tpl.addressee} · ${tpl.categoryLabel}`;

  const subjectResolved = applyPlaceholders(tpl.subject);
  const salutationResolved = applyPlaceholders(tpl.salutation);
  const factsResolved = applyPlaceholders(tpl.facts);
  const feelingsResolved = applyPlaceholders(tpl.feelings);
  const needsResolved = applyPlaceholders(tpl.needs);
  const requestResolved = applyPlaceholders(tpl.request);
  const closingResolved = applyPlaceholders(tpl.closing);

  if (structuredEl) {
    structuredEl.innerHTML = `
      <div class="tpl-letter-envelope">
        <div class="tpl-subject-line"><strong>Tema:</strong> ${escapeHtml(subjectResolved)}</div>
        <div class="tpl-salutation">${escapeHtml(salutationResolved)}</div>

        <div class="tpl-nvc-block step-facts">
          <div class="tpl-step-header">
            <span class="tpl-step-title">1. Faktai (Stebėjimas)</span>
            <span class="tpl-step-hint">Datos, numeriai ir neutralūs faktai be kaltinimų</span>
          </div>
          <div class="tpl-step-body">${escapeHtml(factsResolved)}</div>
        </div>

        <div class="tpl-nvc-block step-feelings">
          <div class="tpl-step-header">
            <span class="tpl-step-title">2. Jausmai / Poveikis</span>
            <span class="tpl-step-hint">Dalykiška, žmogiška emocinė raiška</span>
          </div>
          <div class="tpl-step-body">${escapeHtml(feelingsResolved)}</div>
        </div>

        <div class="tpl-nvc-block step-needs">
          <div class="tpl-step-header">
            <span class="tpl-step-title">3. Poreikiai / Vertybės</span>
            <span class="tpl-step-hint">Bendras visuotinis ar bendruomenės interesas</span>
          </div>
          <div class="tpl-step-body">${escapeHtml(needsResolved)}</div>
        </div>

        <div class="tpl-nvc-block step-request">
          <div class="tpl-step-header">
            <span class="tpl-step-title">4. Konkretus prašymas</span>
            <span class="tpl-step-hint">Aiškus veiksmas, terminas ir atsakymo būdas</span>
          </div>
          <div class="tpl-step-body">${escapeHtml(requestResolved)}</div>
        </div>

        <div class="tpl-closing">${escapeHtml(closingResolved)}</div>
      </div>

      <div class="tpl-why-box">
        <strong>Kodėl ši struktūra veikia institucijose:</strong> ${escapeHtml(tpl.whyItWorks)}
      </div>
    `;
  }

  if (!isEditorDirty && subjectInput && bodyTextarea) {
    subjectInput.value = subjectResolved;
    bodyTextarea.value = buildFullLetterBody(tpl);
  }
}

// --- PRACTICE QUIZ ---
function setupPractice() {
  document.getElementById('game-control-button')?.addEventListener('click', () => startQuiz('mixed'));
  document.getElementById('game-institution-button')?.addEventListener('click', () => startQuiz('institution'));
}

function startQuiz(mode: 'mixed' | 'institution' = 'mixed') {
    currentQuizMode = mode;
    const pool = mode === 'institution'
      ? quizDatabase.filter(q => q.category === 'institution')
      : quizDatabase;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    quizSet = shuffled.slice(0, Math.min(10, shuffled.length));
    quizIndex = 0;
    quizScore = 0;
    hasAnswered = false;

    document.querySelector('.practice-welcome')?.classList.add('hidden');
    document.getElementById('game-card')?.classList.remove('hidden');
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const card = document.getElementById('game-card');
    if (!card) return;

    if (quizIndex >= quizSet.length) {
        card.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
                <h2 style="margin-bottom: 1rem; color: var(--primary);">Testas baigtas!</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">Jūsų rezultatas: <strong>${quizScore}</strong> iš ${quizSet.length}</p>
                <div class="practice-mode-buttons">
                    <button class="btn btn-primary-dark full-width" id="restart-quiz">Bandyti dar kartą</button>
                    <button class="btn btn-secondary full-width" id="switch-quiz-mode">${currentQuizMode === 'institution' ? 'Išbandyti mišrų testą' : 'Treniruotis su institucijomis'}</button>
                </div>
            </div>
        `;
        document.getElementById('restart-quiz')?.addEventListener('click', () => startQuiz(currentQuizMode));
        document.getElementById('switch-quiz-mode')?.addEventListener('click', () => startQuiz(currentQuizMode === 'institution' ? 'mixed' : 'institution'));
        return;
    }

    const q = quizSet[quizIndex];
    hasAnswered = false;
    const modeNote = q.category === 'institution' ? 'Susirašinėjimas su institucijomis' : 'Kasdienė komunikacija';

    card.innerHTML = `
        <div class="quiz-header" style="display: flex; justify-content: space-between; margin-bottom: 1.25rem; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <span class="quiz-progress" style="font-weight: 700; color: var(--text-muted);">Klausimas ${quizIndex + 1} / ${quizSet.length} · ${modeNote}</span>
            <span class="quiz-score" style="background: var(--accent); padding: 0.25rem 0.7rem; border-radius: 8px; font-size: 0.82rem; font-weight: 800; font-variant-numeric: tabular-nums;">Taškai: ${quizScore}</span>
        </div>
        <h3 style="margin-bottom: 1.75rem; font-size: 1.15rem; line-height: 1.5;">${escapeHtml(q.question)}</h3>
        <div class="quiz-options-grid" style="display: flex; flex-direction: column; gap: 0.9rem;">
            ${q.options.map((opt, idx) => `
                <button class="quiz-option btn-outline" data-idx="${idx}">${escapeHtml(opt)}</button>
            `).join('')}
        </div>
        <div id="quiz-feedback" class="hidden" style="margin-top: 1.75rem; padding: 1.25rem; border-radius: var(--radius-sm);"></div>
        <button id="next-q-btn" class="btn btn-primary-dark full-width hidden" style="margin-top: 1.25rem;">Kitas klausimas</button>
    `;

    card.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', (e) => handleOptionClick(e, q));
    });

    document.getElementById('next-q-btn')?.addEventListener('click', () => {
        quizIndex++;
        renderQuizQuestion();
    });
}

function handleOptionClick(e: Event, q: QuizQuestion) {
    if (hasAnswered) return;
    hasAnswered = true;

    const btn = e.currentTarget as HTMLElement;
    const selectedIdx = parseInt(btn.dataset.idx!);
    const isCorrect = selectedIdx === q.correctIndex;

    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-q-btn');

    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach((b: any) => {
        b.classList.add('disabled');
        if (parseInt(b.dataset.idx!) === q.correctIndex) {
            b.classList.add('correct');
        } else if (parseInt(b.dataset.idx!) === selectedIdx && !isCorrect) {
            b.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        quizScore++;
        if (feedbackEl) {
            feedbackEl.classList.remove('hidden');
            feedbackEl.style.background = '#f0fdf4';
            feedbackEl.style.border = '1px solid #bbf7d0';
            feedbackEl.innerHTML = `<strong style="color: var(--success);">Teisingai!</strong> <p style="margin-top: 0.35rem;">${escapeHtml(q.explanation)}</p>`;
        }
    } else {
        if (feedbackEl) {
            feedbackEl.classList.remove('hidden');
            feedbackEl.style.background = '#fef2f2';
            feedbackEl.style.border = '1px solid #fecaca';
            feedbackEl.innerHTML = `<strong style="color: var(--error);">Neteisingai.</strong> <p style="margin-top: 0.35rem;">${escapeHtml(q.explanation)}</p>`;
        }
    }

    const scoreDisplay = document.querySelector('.quiz-score');
    if (scoreDisplay) scoreDisplay.textContent = `Taškai: ${quizScore}`;

    if (nextBtn) nextBtn.classList.remove('hidden');
}

// --- NEEDS & FLASHCARDS ---
function renderNeedsGrid() {
  const container = document.getElementById('needs-grid-container');
  if (!container) return;
  container.innerHTML = Object.entries(fullNeedsList).map(([name, data]) => `
    <div class="card need-item-card has-tooltip" data-need="${name}">
      <div class="need-icon">${data.icon}</div>
      <h4>${name}</h4>
      <div class="need-sub-list">${data.sub.slice(0, 3).join(', ')}${data.sub.length > 3 ? '...' : ''}</div>
      <div class="need-more-hint">Spustelėkite, kad sužinotumėte daugiau</div>
    </div>
  `).join('');
  
  container.querySelectorAll('.need-item-card').forEach(card => {
    card.addEventListener('click', () => {
        openNeedInfo((card as HTMLElement).dataset.need!);
    });
  });
}

function openNeedInfo(needName: string) {
    const data = fullNeedsList[needName];
    if (!data) return;

    const modal = document.getElementById('feeling-modal');
    if (!modal) return;

    document.getElementById('modal-title')!.textContent = needName;
    document.getElementById('modal-need')!.textContent = "Universalus poreikis";
    document.getElementById('modal-desc')!.textContent = data.desc;

    const labels = modal.querySelectorAll('.context-label');
    const contents = modal.querySelectorAll('.context-item p');
    const items = modal.querySelectorAll('.context-item');

    if (labels[0]) labels[0].textContent = "📝 Sudėtinės dalys";
    if (contents[0]) contents[0].textContent = data.sub.join(', ');
    if (items[0]) items[0].classList.remove('hidden');

    if (labels[1]) labels[1].textContent = "🤔 Klausimas sau";
    if (contents[1]) contents[1].textContent = data.question;
    if (items[1]) items[1].classList.remove('hidden');

    if (labels[2]) labels[2].textContent = "🏛️ Pritaikymas laiške institucijai";
    if (contents[2]) contents[2].textContent = `„Mūsų bendruomenei svarbus poreikis – ${needName.toLowerCase()} (${data.sub.slice(0, 2).join(', ')}), todėl prašome kartu ieškoti aiškaus sprendimo.“`;
    if (items[2]) items[2].classList.remove('hidden');

    if (items[3]) items[3].classList.add('hidden');

    modal.classList.remove('hidden');
}

function setupFlashcards() {
  document.querySelectorAll('.ex-tab-btn[data-fc-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ex-tab-btn[data-fc-target]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFlashcards((btn as HTMLElement).dataset.fcTarget || 'fc-mokiniai');
    });
  });
}

function renderFlashcards(target: string) {
  const container = document.getElementById('flashcards-container');
  if (!container) return;
  
  const cards = flashcardsData[target] || [];
  container.innerHTML = cards.map(card => `
    <div class="flashcard ${card.type}">
      <div class="flashcard-inner">
        <div class="flashcard-front">
            <div class="fc-label">Jausmas</div>
            <div class="fc-main-text">${escapeHtml(card.feeling)}</div>
            <div class="fc-sub-text">„${escapeHtml(card.context)}“</div>
        </div>
        <div class="flashcard-back">
            <div class="fc-icon">💡</div>
            <div class="fc-label">Tikrasis poreikis</div>
            <div class="fc-main-text">${escapeHtml(card.need)}</div>
            <div class="fc-sub-text">${escapeHtml(card.explanation)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// --- CONNECTION MAP ---
function renderMap() {
  const flist = document.getElementById('map-feelings-list');
  const nlist = document.getElementById('map-needs-list');
  const searchInput = document.getElementById('map-search-input') as HTMLInputElement;
  const filter = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!flist || !nlist) return;

  const allPleasant = Object.keys(connectionMap).filter(k => connectionMap[k].type === 'pleasant');
  const allUnpleasant = Object.keys(connectionMap).filter(k => connectionMap[k].type === 'unpleasant');
  const allNeeds = Object.keys(fullNeedsList);

  const pleasant = filter ? allPleasant.filter(k => k.toLowerCase().includes(filter)) : allPleasant;
  const unpleasant = filter ? allUnpleasant.filter(k => k.toLowerCase().includes(filter)) : allUnpleasant;
  const needs = filter ? allNeeds.filter(k => k.toLowerCase().includes(filter)) : allNeeds;

  let feelingsHTML = '';
  if (pleasant.length > 0) {
    feelingsHTML += `<div class="map-group-label" style="color: var(--success); font-weight:800; font-size: 0.7rem; text-transform:uppercase; margin-bottom:0.5rem;">Patenkinti poreikiai</div>`;
    feelingsHTML += pleasant.map(f => `<div class="map-node feeling-node pleasant ${f === selectedMapFeeling ? 'active' : ''}" data-f="${f}">${f}</div>`).join('');
  }
  if (unpleasant.length > 0) {
    feelingsHTML += `<div class="map-group-label" style="color: var(--error); font-weight:800; font-size: 0.7rem; text-transform:uppercase; margin:1rem 0 0.5rem;">Nepatenkinti poreikiai</div>`;
    feelingsHTML += unpleasant.map(f => `<div class="map-node feeling-node unpleasant ${f === selectedMapFeeling ? 'active' : ''}" data-f="${f}">${f}</div>`).join('');
  }
  
  flist.innerHTML = feelingsHTML;

  const highlightedNeeds = selectedMapFeeling ? (connectionMap[selectedMapFeeling]?.needs || []) : [];

  nlist.innerHTML = needs.map(n => {
    const isHighlighted = highlightedNeeds.some(hn => hn.toLowerCase() === n.toLowerCase());
    return `<div class="map-node need-node ${isHighlighted ? 'highlight' : ''}" id="need-${n.toLowerCase()}">
      <span class="need-node-icon">${fullNeedsList[n].icon}</span> ${n}
    </div>`;
  }).join('');

  flist.querySelectorAll('.feeling-node').forEach(node => {
    node.addEventListener('click', (e) => {
      const f = (e.currentTarget as HTMLElement).dataset.f!;
      if (selectedMapFeeling === f) return;
      selectedMapFeeling = f;
      
      const relatedNeeds = connectionMap[f]?.needs || [];
      const bridge = document.getElementById('bridge-text');
      const bridgeCard = document.getElementById('connection-bridge');

      if (bridge && bridgeCard) {
        bridgeCard.classList.add('active-result');
        bridge.classList.remove('bridge-text-anim');
        void bridge.offsetWidth; 
        
        const firstNeed = relatedNeeds[0]?.toLowerCase() || 'kažko svarbaus';
        if (connectionMap[f].type === 'pleasant') {
          bridge.innerHTML = `<span style="color: var(--success)">Jaučiuosi ${f.toLowerCase()}</span>, nes mano poreikis <span style="text-decoration: underline;">${firstNeed}</span> yra patenkintas.`;
        } else {
          bridge.innerHTML = `<span style="color: var(--error)">Jaučiuosi ${f.toLowerCase()}</span>, nes man trūksta <span style="text-decoration: underline;">${firstNeed}</span>.`;
        }
        
        bridge.classList.add('bridge-text-anim');
      }
      renderMap();
    });
  });
}

// --- VOCABULARY ---
function renderVocab() {
  const display = document.getElementById('vocab-display');
  if (!display) return;
  display.innerHTML = '<div class="vocab-grid"></div>';
  const grid = display.querySelector('.vocab-grid')!;
  Object.entries(feelingsData).forEach(([cat, groups]) => {
    const section = document.createElement('div');
    section.className = "vocab-section-group";
    section.innerHTML = `<h3 class="vocab-cat-title">${cat}</h3>`;
    Object.entries(groups).forEach(([group, words]) => {
      section.innerHTML += `<p class="vocab-group"><strong>${group}:</strong> ${words.map(w => `<span class="vocab-word" data-w="${w}">${w} <small class="info-icon">ⓘ</small></span>`).join(', ')}</p>`;
    });
    grid.appendChild(section);
  });
  display.querySelectorAll('.vocab-word').forEach(w => w.addEventListener('click', () => openInteractionInfo((w as HTMLElement).dataset.w!)));
}

function setupGuideTabs() {
  document.querySelectorAll('.ex-tab-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ex-tab-btn[data-target]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGuideExamples((btn as HTMLElement).dataset.target || 'mokiniai');
    });
  });
}

function renderGuideExamples(target: string) {
  const container = document.getElementById('examples-content');
  const examples = guideExamples[target] || [];
  if (!container) return;
  container.innerHTML = examples.map((ex) => `
    <div class="card example-item-card">
      <div class="example-sit-tag">${escapeHtml(ex.sit)}</div>
      <div class="example-quote">${escapeHtml(ex.quote)}</div>
    </div>
  `).join('');
}

function setupModals() {
  const modal = document.getElementById('feeling-modal');
  const closeBtn = document.getElementById('close-modal');
  if (!modal) return;

  closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

function isSatisfiedFeeling(word: string): boolean {
  const satisfied = feelingsData["Jausmai, kai poreikiai yra patenkinti"];
  return Object.values(satisfied).some(list => list.includes(word));
}

function openInteractionInfo(word: string) {
  const modal = document.getElementById('feeling-modal');
  if (!modal) return;
  
  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = word.charAt(0).toUpperCase() + word.slice(1);
  
  const descEl = document.getElementById('modal-desc');
  const needEl = document.getElementById('modal-need');

  const labels = modal.querySelectorAll('.context-label');
  const items = modal.querySelectorAll('.context-item');
  if (labels[0]) labels[0].textContent = "👶 Vaikui";
  if (labels[1]) labels[1].textContent = "👤 Suaugusiam";
  if (labels[2]) labels[2].textContent = "💼 Darbe";
  if (labels[3]) labels[3].textContent = "🏛️ Laiške institucijai";
  items.forEach(i => i.classList.remove('hidden'));

  const exChildEl = document.getElementById('modal-ex-child');
  const exAdultEl = document.getElementById('modal-ex-adult');
  const exProEl = document.getElementById('modal-ex-pro');
  const exInstEl = document.getElementById('modal-ex-inst');

  const satisfied = isSatisfiedFeeling(word);

  if (descEl) {
    descEl.textContent = satisfied
      ? "Šis jausmas rodo, kad šiuo metu svarbūs vertybiniai poreikiai (saugumas, aiškumas, ryšys ar bendradarbiavimas) yra patenkinti."
      : "Šis jausmas padeda atpažinti nepatenkintą poreikį – pokalbyje jį įvardijame tiesiogiai, o laiške institucijai paverčiame dalykišku poveikio apibūdinimu.";
  }
  if (needEl) needEl.textContent = satisfied ? "Patenkinti NK poreikiai" : "Nepatenkinti NK poreikiai";
  if (exChildEl) exChildEl.textContent = satisfied
    ? `„Matau, kad šypsaisi. Ar jautiesi ${word}, nes tau pavyko susitarti su draugu?“`
    : `„Pastebėjau, kad tyli. Ar jautiesi ${word}, nes tau šiuo metu reikia daugiau aiškumo arba palaikymo?“`;
  if (exAdultEl) exAdultEl.textContent = `„Jaučiuosi ${word}, nes man svarbus abipusis supratimas ir aiškumas.“`;
  if (exProEl) exProEl.textContent = `„Esu ${word} dėl šios situacijos darbe, nes man rūpi sklandus rezultatas ir susitarimai.“`;
  if (exInstEl) exInstEl.textContent = satisfied
    ? `„Esame ${word} dėl jūsų operatyvaus atsakymo – mums svarbus pasitikėjimas ir sklandus bendradarbiavimas su įstaiga.“`
    : `„Dėl užsitęsusios situacijos jaučiame susirūpinimą (vidinė būsena: ${word}), nes bendruomenei itin svarbus aiškumas, skaidrumas ir saugumas.“`;
  
  modal.classList.remove('hidden');
}

init();