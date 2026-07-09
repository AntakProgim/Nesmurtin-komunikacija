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
      desc: "Sąžiningumas sau ir kitiems, gyvenimas pagal savo vertybes.",
      question: "Ar elgiuosi taip, kaip man atrodo teisinga?"
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
      desc: "Aiškus situacijos ar kito žmogaus motyvų suvokimas.",
      question: "Ar aš tikrai suprantu, kas vyksta?"
  },
  "Bendruomenė": { 
      icon: "🏘️", 
      sub: ["bendradarbiavimas", "draugystė", "įtraukimas", "lygybė", "priklausymas"],
      desc: "Jausmas, kad esi grupės dalis ir esi joje laukiamas.",
      question: "Ar jaučiuosi priklausantis šiai grupei?"
  }
};

const connectionMap: Record<string, { needs: string[], type: 'pleasant' | 'unpleasant' }> = {
  "Taikus": { needs: ["Taika", "Gerovė", "Saugumas"], type: 'pleasant' },
  "Malonus": { needs: ["Šventimas", "Meilė", "Gerovė"], type: 'pleasant' },
  "Susidomėjęs": { needs: ["Mokymasis", "Kūrybingumas", "Prasmė", "Supratimas"], type: 'pleasant' },
  "Mylintis": { needs: ["Meilė", "Ryšys", "Bendruomenė"], type: 'pleasant' },
  "Išsigandęs": { needs: ["Saugumas", "Saugumas", "Stabilumas", "Taika"], type: 'unpleasant' },
  "Liūdnas": { needs: ["Ryšys", "Gebėjimas", "Supratimas", "Meilė"], type: 'unpleasant' },
  "Nusivylęs": { needs: ["Prasmė", "Atsakomybė", "Tikslas", "Garbingumas"], type: 'unpleasant' },
  "Sumišęs": { needs: ["Supratimas", "Mokymasis", "Laisvė", "Aiškumas"], type: 'unpleasant' },
  "Piktas": { needs: ["Rūpestis", "Pagarba", "Garbingumas", "Saugumas"], type: 'unpleasant' }
};

const guideExamples = {
  mokiniai: [
    { sit: "Dėl vėlavimo į pamoką", quote: "„Pastebėjau, kad šiandien į pamoką atėjai 10 minučių vėliau. Jaučiuosi susirūpinęs, nes man svarbu, kad visi pradėtume darbą kartu ir niekas neatsiliktų. Ar galėtum pasistengti kitą kartą ateiti laiku?“" },
    { sit: "Dėl keiksmažodžių vartojimo", quote: "„Girdėjau tavo pokalbyje vartojant keiksmažodžius. Jaučiuosi nepatogiai, nes man svarbi pagarbi aplinka, kurioje visi jaustųsi saugiai. Prašau, rask kitų žodžių savo mintims išreikšti.“" },
    { sit: "Kai mokinys nesimoko pamokos metu", quote: "„Pastebėjau, kad neužsirašinėji ir nedalyvauji veikloje. Jaučiuosi sunerimęs, nes man svarbu, kad visi įgytų žinių. Gal galėtum pasidalinti, kas tau trukdo susikaupti, ir kartu paieškotume sprendimo?“" },
    { sit: "Kai mokinys sako, kad jam nuobodu", quote: "„Girdžiu, kad tau nuobodu. Man svarbus tavo įsitraukimas ir noriu, kad mokymasis būtų prasmingas. Gal turi pasiūlymų, kaip galėtume šią užduotį padaryti įdomesne?“" },
    { sit: "Kai mokinys sako, kad tingi", quote: "„Kai sakai „tingiu“, man kyla smalsumas. Dažnai už šio žodžio slepiasi poilsio, aiškumo ar prasmės poreikis. Ar galėtum pasidalinti, ko tau dabar labiausiai trūksta – galbūt pertraukėlės ar pagalbos suprantant užduotį?“" },
    { sit: "Dėl mokyklos turto laužymo", quote: "„Matau, kad sulaužei pieštuką. Man liūdna, nes man svarbi tvarka ir pagarba daiktams, kuriais visi dalijamės. Prašau, ateityje elkimės su mokyklos inventoriumi atsakingiau.“" },
    { sit: "Dėl maisto mėtymo", quote: "„Matau, kad mėtai maistą ant žemės. Jaučiuosi nusivylęs, nes man svarbi pagarba maistui ir švari aplinka. Prašau, maistą valgykime, o ne mėtykime.“" },
    { sit: "Dėl užlindinėjimo eilėje", quote: "„Matau, kad atsistojai prieš kitus mokinius, kurie jau laukė. Man svarbus sąžiningumas ir pagarba vieni kitiems. Prašau, atsistok į eilės galą.“" },
    { sit: "Dėl draudžiamų daiktų", quote: "„Matau, kad turi energetinį gėrimą, kuris nėra leidžiamas mokykloje. Jaučiuosi sunerimęs, nes me rūpi tavo sveikata ir visų mokinių saugumas. Prašau, atiduok jį man iki pamokų pabaigos.“" },
    { sit: "Dėl atsikalbinėjimo", quote: "„Kai kalbi pakeltu tonu, man sunku tave išgirsti. Jaučiuosi nuliūdęs, nes man svarbus abipusis suprantimas ir pagarba. Ar galėtume abu kalbėti ramiau ir pabandyti suprasti vienas kitą?“" },
    { sit: "Dėl bėgimo koridoriumi", quote: "„Matau, kad bėgi koridoriumi. Jaučiuosi išsigandęs, nes me rūpi tavo ir kitų saugumas. Prašau, koridoriais eikime, o ne bėgiokime.“" }
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
    { sit: "Dėl praleistų pamokų", quote: "„Pastebėjau, kad jūsų vaikas nebuvo pamokose jau kelias dienas, ir neturime jokio paaiškinimo dėl praleistų pamokų. Jaučiuosi sunerimęs, nes man svarbu žinoti, ar viskas gerai ir kad vaikas nepraleistų svarbių dalykų pamokose. Ar galėtumėte atsiųsti paaiškinimą, kad žinotume, kad jūsų vaikas saugus, ir kad galėtume kartu rasti sprendimą, kaip spręsti praleistas pamokas?“" },
    { sit: "Dėl sveikatos pažymos", quote: "„Pastebėjau, kad dar negavome vaiko sveikatos pažymos, o terminas jau pasibaigė. Jaučiuosi sunerimęs, nes man svarbu, kad mokykla turėtų naujausią informaciją apie vaiką ir galėtų užtikrinti jo saugumą. Ar galėtumėte pasirūpinti, kad pažyma būtų pristatyta, kad mokykla turėtų visą reikiamą informaciją?“" }
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
  ]
};

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
  ]
};

// --- QUIZ DATABASE ---
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const quizDatabase: QuizQuestion[] = [
  // --- STEBĖJIMAS vs VERTINIMAS (25) ---
  { question: "Kuris teiginys yra stebėjimas (faktas), o ne vertinimas?", options: ["Jonas yra tinginys.", "Jonas neatliko dviejų namų darbų iš eilės.", "Jonas nemėgsta mokytis."], correctIndex: 1, explanation: "Stebėjimas fiksuoja konkretų faktą be etiketės." },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Tu visada vėluoji.", "Tu atėjai 10 minučių vėliau.", "Tu negerbi mano laiko."], correctIndex: 1, explanation: "„Visada“ ir „negerbi“ yra interpretacijos." },
  { question: "Pasirinkite stebėjimą:", options: ["Petras daug valgo.", "Petras suvalgė tris porcijas.", "Petras yra ėdrūnas."], correctIndex: 1, explanation: "Kiekis yra faktas, „daug“ yra vertinimas." },
  { question: "Kuris sakinys yra be vertinimo?", options: ["Šiame kambaryje netvarka.", "Ant grindų guli trys marškiniai.", "Tu esi nevala."], correctIndex: 1, explanation: "„Netvarka“ yra subjektyvu, daiktai ant grindų – faktas." },
  { question: "Identifikuokite stebėjimą:", options: ["Mokytoja kalbėjo garsiai.", "Mokytoja rėkė ant klasės.", "Mokytoja kalbėjo pakeltu tonu."], correctIndex: 2, explanation: "„Rėkė“ dažnai turi vertinamąjį atspalvį, „pakeltas tonas“ objektyviau." },
  { question: "Kuris yra stebėjimas?", options: ["Jie ilgai kalbėjosi.", "Jie kalbėjosi 45 minutes.", "Jie plepėjo visą amžinybę."], correctIndex: 1, explanation: "Laiko trukmė yra išmatuojama." },
  { question: "Pasirinkite faktą:", options: ["Tu manęs nemyli.", "Tu manęs nepakvietei į kiną.", "Tu esi abejingas."], correctIndex: 1, explanation: "Veiksmo nebuvimas yra faktas, jausmo priskyrimas – vertinimas." },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Jis vairuoja pavojingai.", "Jis viršijo greitį 20 km/h.", "Jis yra kelių chuliganas."], correctIndex: 1, explanation: "Greičio viršijimas yra faktas." },
  { question: "Identifikuokite stebėjimą:", options: ["Ši užduotis per sunki.", "Tik du mokiniai išsprendė šią užduotį.", "Užduotis neįveikiama."], correctIndex: 1, explanation: "Statistika yra stebėjimas." },
  { question: "Kuris sakinys be vertinimo?", options: ["Tu dažnai pertraukinėji.", "Per šį pokalbį pertraukei mane tris kartus.", "Tu nemoki klausytis."], correctIndex: 1, explanation: "Skaičius yra konkretus." },
  { question: "Pasirinkite stebėjimą:", options: ["Ji gražiai dainuoja.", "Ji pataikė į visas natas.", "Ji yra talentinga."], correctIndex: 1, explanation: "„Gražiai“ yra skonio reikalas." },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Susirinkimas buvo nuobodus.", "Susirinkimas truko dvi valandas.", "Susirinkimas buvo beprasmis."], correctIndex: 1, explanation: "Laikas yra faktas." },
  { question: "Identifikuokite stebėjimą:", options: ["Tu esi išlaidus.", "Šią savaitę išleidai 100 eurų pramogoms.", "Tu nemoki elgtis su pinigais."], correctIndex: 1, explanation: "Suma yra faktas." },
  { question: "Kuris yra stebėjimas?", options: ["Jis geras darbuotojas.", "Jis įvykdė planą 110%.", "Jis stengiasi."], correctIndex: 1, explanation: "Procentai yra faktas." },
  { question: "Pasirinkite faktą:", options: ["Mano kaimynas triukšmingas.", "Mano kaimynas groja būgnais 23 valandą.", "Mano kaimynas negerbia ramybės."], correctIndex: 1, explanation: "Veiksmas ir laikas yra faktai." },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Šis filmas ilgas.", "Šis filmas trunka 3 valandas.", "Šis filmas ištęstas."], correctIndex: 1, explanation: "Trukmė yra faktas." },
  { question: "Identifikuokite stebėjimą:", options: ["Tu niekada manęs neklausai.", "Kai aš kalbėjau, tu žiūrėjai į telefoną.", "Tau nerūpi, ką aš sakau."], correctIndex: 1, explanation: "Veiksmo aprašymas yra stebėjimas." },
  { question: "Kuris sakinys be vertinimo?", options: ["Jonas yra agresyvus.", "Jonas pastūmė Tomą.", "Jonas elgiasi blogai."], correctIndex: 1, explanation: "Veiksmas „pastūmė“ yra faktas." },
  { question: "Pasirinkite stebėjimą:", options: ["Ona retai lanko pamokas.", "Ona praleido 5 pamokas šį mėnesį.", "Ona yra bėglė."], correctIndex: 1, explanation: "Skaičius yra konkretus." },
  { question: "Kuris yra stebėjimas?", options: ["Tu per daug dirbi.", "Tu išėjai iš biuro 20 valandą.", "Tu esi darboholikas."], correctIndex: 1, explanation: "Laikas yra faktas." },
  { question: "Identifikuokite stebėjimą:", options: ["Jis manęs vengia.", "Mes nesimatėme dvi savaites.", "Aš jam nepatinku."], correctIndex: 1, explanation: "Laiko tarpas yra faktas." },
  { question: "Kuris teiginys yra stebėjimas?", options: ["Supažindinimas buvo chaotiškas.", "Pranešėjas pametė savo užrašus.", "Pranešėjas nepasiruošęs."], correctIndex: 1, explanation: "Veiksmas yra faktas." },
  { question: "Pasirinkite faktą:", options: ["Tu esi netvarkingas.", "Tavo stalas apkrautas popieriais.", "Tu nemėgsti tvarkos."], correctIndex: 1, explanation: "Vaizdo aprašymas." },
  { question: "Kuris sakinys be vertinimo?", options: ["Jis kalba tyliai.", "Aš negirdžiu jo iš galinio suolo.", "Jis murma."], correctIndex: 1, explanation: "Tavo patirtis (negirdžiu) yra faktas apie tave." },
  { question: "Identifikuokite stebėjimą:", options: ["Ši sriuba neskani.", "Aš nesuvalgiau sriubos.", "Ši sriuba šlykšti."], correctIndex: 1, explanation: "Veiksmas yra faktas." },

  // --- JAUSMAI vs MINTYS/INTERPRETAVIMAI (25) ---
  { question: "Kuris žodis apibūdina jausmą?", options: ["Jaučiuosi išduotas.", "Jaučiuosi liūdnas.", "Jaučiuosi, kad manimi manipuliuoja."], correctIndex: 1, explanation: "Liūdesys yra emocija. Kiti du yra mintys apie kito elgesį." },
  { question: "Pasirinkite tikrą jausmą:", options: ["Jaučiuosi nereikalingas.", "Jaučiuosi vienišas.", "Jaučiuosi nesuprastas."], correctIndex: 1, explanation: "Vienišumas yra jausmas. „Nesuprastas“ – vertinimas." },
  { question: "Kuris teiginys išreiškia jausmą?", options: ["Jaučiuosi kvailai.", "Jaučiuosi susigėdęs.", "Jaučiuosi ignoruojamas."], correctIndex: 1, explanation: "Gėda yra jausmas. „Ignoruojamas“ – veiksmo interpretacija." },
  { question: "Identifikuokite jausmą:", options: ["Jaučiu, kad tu neteisi.", "Jaučiuosi piktas.", "Jaučiuosi užpultas."], correctIndex: 1, explanation: "Pyktis yra jausmas." },
  { question: "Kuris žodis yra jausmas?", options: ["Apleistas.", "Nusivylęs.", "Neįvertintas."], correctIndex: 1, explanation: "Nusivylimas kyla viduje. Kiti rodo į kito veiksmus." },
  { question: "Pasirinkite jausmą:", options: ["Jaučiuosi spaudžiamas.", "Jaučiuosi nerimastingas.", "Jaučiuosi išnaudojamas."], correctIndex: 1, explanation: "Nerimas yra emocija." },
  { question: "Kuris teiginys yra jausmas?", options: ["Jaučiuosi kaip nevykėlis.", "Jaučiuosi bejėgis.", "Jaučiuosi, kad manęs neklausai."], correctIndex: 1, explanation: "Bejėgiškumas yra būsena." },
  { question: "Identifikuokite jausmą:", options: ["Jaučiuosi laimingas.", "Jaučiuosi teisus.", "Jaučiuosi geras."], correctIndex: 0, explanation: "Laimė yra emocija." },
  { question: "Kuris žodis apibūdina jausmą?", options: ["Pažemintas.", "Sutrikęs.", "Atstumtas."], correctIndex: 1, explanation: "Sutrikimas yra vidinė būsena." },
  { question: "Pasirinkite tikrą jausmą:", options: ["Jaučiuosi įbaugintas.", "Jaučiuosi išsigandęs.", "Jaučiuosi provokuojamas."], correctIndex: 1, explanation: "Baimė yra emocija." },
  { question: "Kuris teiginys išreiškia jausmą?", options: ["Jaučiuosi mylimas.", "Jaučiuosi šiltas.", "Jaučiu, kad tu man geras."], correctIndex: 1, explanation: "Šiluma (emocinė) yra jausmas. „Mylimas“ kartais laikoma interpretacija (kažkas myli), bet „šiluma“ yra grynesnis jausmas." },
  { question: "Identifikuokite jausmą:", options: ["Jaučiuosi kaltinamas.", "Jaučiuosi kaltas.", "Jaučiuosi teisiamas."], correctIndex: 1, explanation: "Kaltė yra jausmas." },
  { question: "Kuris žodis yra jausmas?", options: ["Apgautas.", "Įsiutęs.", "Nuskriaustas."], correctIndex: 1, explanation: "Įsiutis yra stipri emocija." },
  { question: "Pasirinkite jausmą:", options: ["Jaučiuosi suvaržytas.", "Jaučiuosi smalsus.", "Jaučiuosi kontroliuojamas."], correctIndex: 1, explanation: "Smalsumas yra vidinė būsena." },
  { question: "Kuris teiginys yra jausmas?", options: ["Jaučiuosi ramus.", "Jaučiuosi paliktas.", "Jaučiuosi nematomas."], correctIndex: 0, explanation: "Ramybė yra jausmas." },
  { question: "Identifikuokite jausmą:", options: ["Jaučiuosi, kad tai neteisinga.", "Jaučiuosi pasibjaurėjęs.", "Jaučiuosi auka."], correctIndex: 1, explanation: "Pasibjaurėjimas yra emocija." },
  { question: "Kuris žodis apibūdina jausmą?", options: ["Nustebęs.", "Manipuliuojamas.", "Verčiamas."], correctIndex: 0, explanation: "Nuostaba yra emocija." },
  { question: "Pasirinkite tikrą jausmą:", options: ["Jaučiuosi, kad nepadariau pakankamai.", "Jaučiuosi išsekęs.", "Jaučiuosi tinginys."], correctIndex: 1, explanation: "Išsekimas yra fizinė/emocinė būsena." },
  { question: "Kuris teiginys išreiškia jausmą?", options: ["Jaučiuosi dėkingas.", "Jaučiuosi skolingas.", "Jaučiuosi įpareigotas."], correctIndex: 0, explanation: "Dėkingumas yra jausmas." },
  { question: "Identifikuokite jausmą:", options: ["Jaučiuosi kritikuojamas.", "Jaučiuosi nesaugus.", "Jaučiuosi puolamas."], correctIndex: 1, explanation: "Nesaugumas yra jausmas." },
  { question: "Kuris žodis yra jausmas?", options: ["Patenkintas.", "Apgintas.", "Palaikomas."], correctIndex: 0, explanation: "Pasitenkinimas yra jausmas. Kiti – veiksmai." },
  { question: "Pasirinkite jausmą:", options: ["Jaučiuosi optimistiškas.", "Jaučiuosi nugalėtojas.", "Jaučiuosi protingas."], correctIndex: 0, explanation: "Optimizmas yra emocinė būsena." },
  { question: "Kuris teiginys yra jausmas?", options: ["Jaučiuosi suirzęs.", "Jaučiuosi trukdomas.", "Jaučiuosi erzinamas."], correctIndex: 0, explanation: "Suirzimas yra emocija." },
  { question: "Identifikuokite jausmą:", options: ["Jaučiuosi vertinamas.", "Jaučiuosi sujaudintas.", "Jaučiuosi priimtas."], correctIndex: 1, explanation: "Susijaudinimas yra emocija." },
  { question: "Kuris žodis apibūdina jausmą?", options: ["Sielvartaujantis.", "Nubaustas.", "Atstumtas."], correctIndex: 0, explanation: "Sielvartas yra jausmas." },

  // --- POREIKIAI vs STRATEGIJOS (25) ---
  { question: "Kuris yra poreikis, o ne strategija?", options: ["Man reikia automobilio.", "Man reikia laisvės judėti.", "Man reikia, kad mane nuvežtum."], correctIndex: 1, explanation: "Laisvė yra universalus poreikis." },
  { question: "Pasirinkite poreikį:", options: ["Man reikia poilsio.", "Man reikia atostogų.", "Man reikia pamiegoti."], correctIndex: 0, explanation: "Poilsis yra poreikis, miegas/atostogos – būdai." },
  { question: "Kuris yra universalus poreikis?", options: ["Man reikia pinigų.", "Man reikia saugumo.", "Man reikia darbo."], correctIndex: 1, explanation: "Saugumas yra poreikis, pinigai/darbas – strategijos." },
  { question: "Identifikuokite poreikį:", options: ["Man reikia, kad tu nutiltum.", "Man reikia ramybės.", "Man reikia išeiti iš kambario."], correctIndex: 1, explanation: "Ramybė yra poreikis." },
  { question: "Kuris teiginys nurodo poreikį?", options: ["Man reikia pagarbos.", "Man reikia, kad manęs atsiprašytum.", "Man reikia, kad su manimi kalbėtum gražiai."], correctIndex: 0, explanation: "Pagarba yra universalus poreikis." },
  { question: "Pasirinkite poreikį:", options: ["Man reikia picos.", "Man reikia maisto.", "Man reikia nueiti į restoraną."], correctIndex: 1, explanation: "Maistas/maitinimas yra poreikis." },
  { question: "Kuris yra poreikis?", options: ["Man reikia, kad mane suprastum.", "Man reikia supratimo.", "Man reikia, kad man pritartum."], correctIndex: 1, explanation: "Supratimas yra poreikis." },
  { question: "Identifikuokite poreikį:", options: ["Man reikia ryšio.", "Man reikia pasikalbėti.", "Man reikia telefono."], correctIndex: 0, explanation: "Ryšys yra universalus poreikis." },
  { question: "Kuris yra universalus poreikis?", options: ["Man reikia tvarkos.", "Man reikia, kad susitvarkytum.", "Man reikia valytojos."], correctIndex: 0, explanation: "Tvarka/harmonija yra poreikis." },
  { question: "Pasirinkite poreikį:", options: ["Man reikia būti teisiam.", "Man reikia kompetencijos.", "Man reikia laimėti ginčą."], correctIndex: 1, explanation: "Kompetencija/meistrystė yra poreikis." },
  { question: "Kuris teiginys nurodo poreikį?", options: ["Man reikia pripažinimo.", "Man reikia medalio.", "Man reikia pagyrimo."], correctIndex: 0, explanation: "Pripažinimas yra poreikis." },
  { question: "Identifikuokite poreikį:", options: ["Man reikia erdvės.", "Man reikia, kad išeitum.", "Man reikia buto."], correctIndex: 0, explanation: "Erdvė/autonomija yra poreikis." },
  { question: "Kuris yra poreikis?", options: ["Man reikia sąžiningumo.", "Man reikia, kad nemeluotum.", "Man reikia tiesos detektoriaus."], correctIndex: 0, explanation: "Sąžiningumas yra poreikis." },
  { question: "Pasirinkite poreikį:", options: ["Man reikia paramos.", "Man reikia paskolos.", "Man reikia, kad padėtum."], correctIndex: 0, explanation: "Parama yra poreikis." },
  { question: "Kuris yra universalus poreikis?", options: ["Man reikia žaidimo.", "Man reikia žaislų.", "Man reikia kompiuterio."], correctIndex: 0, explanation: "Žaidimas/smagumas yra poreikis." },
  { question: "Identifikuokite poreikį:", options: ["Man reikia meilės.", "Man reikia vyro/žmonos.", "Man reikia pasimatymo."], correctIndex: 0, explanation: "Meilė yra poreikis." },
  { question: "Kuris teiginys nurodo poreikį?", options: ["Man reikia pasitikėjimo.", "Man reikia, kad manęs netikrintum.", "Man reikia slaptažodžių."], correctIndex: 0, explanation: "Pasitikėjimas yra poreikis." },
  { question: "Pasirinkite poreikį:", options: ["Man reikia kūrybiškumo.", "Man reikia dažų.", "Man reikia piešti."], correctIndex: 0, explanation: "Kūrybiškumas yra poreikis." },
  { question: "Kuris yra poreikis?", options: ["Man reikia prasmės.", "Man reikia paaukštinimo.", "Man reikia šio projekto."], correctIndex: 0, explanation: "Prasmė yra poreikis." },
  { question: "Identifikuokite poreikį:", options: ["Man reikia autentiškumo.", "Man reikia sakyti, ką galvoju.", "Man reikia būti savimi."], correctIndex: 0, explanation: "Autentiškumas yra poreikis." },
  { question: "Kuris yra universalus poreikis?", options: ["Man reikia bendruomenės.", "Man reikia įstoti į klubą.", "Man reikia draugų."], correctIndex: 0, explanation: "Bendruomenė/priklausymas yra poreikis." },
  { question: "Pasirinkite poreikį:", options: ["Man reikia mokymosi.", "Man reikia knygos.", "Man reikia eiti į mokyklą."], correctIndex: 0, explanation: "Mokymasis/augimas yra poreikis." },
  { question: "Kuris teiginys nurodo poreikį?", options: ["Man reikia grožio.", "Man reikia paveikslo.", "Man reikia gėlių."], correctIndex: 0, explanation: "Grožis/estetika yra poreikis." },
  { question: "Identifikuokite poreikį:", options: ["Man reikia lygybės.", "Man reikia 50% pelno.", "Man reikia, kad dalintumėmės perpus."], correctIndex: 0, explanation: "Lygybė yra poreikis." },
  { question: "Kuris yra poreikis?", options: ["Man reikia gedėjimo.", "Man reikia verkti.", "Man reikia laidotuvių."], correctIndex: 0, explanation: "Gedėjimas (atsisveikinimas) yra poreikis." },

  // --- PRAŠYMAI vs REIKALAVIMAI/NORAI (25) ---
  { question: "Kuris yra konkretus prašymas?", options: ["Būk geresnis.", "Ar galėtum išplauti indus per valandą?", "Noriu, kad labiau stengtumeisi."], correctIndex: 1, explanation: "Konkretus veiksmas ir laikas." },
  { question: "Pasirinkite prašymą:", options: ["Noriu pagarbos.", "Ar galėtum manęs nepertraukti, kol baigsiu sakinį?", "Gerbk mane."], correctIndex: 1, explanation: "Konkretus elgesys." },
  { question: "Kuris teiginys yra aiškus prašymas?", options: ["Ar galėtum grįžti namo iki 22 val.?", "Grįžk laiku.", "Noriu, kad būtum atsakingas."], correctIndex: 0, explanation: "Konkretus veiksmas." },
  { question: "Identifikuokite prašymą:", options: ["Nustok triukšmauti.", "Ar galėtum pritildyti muziką?", "Būk tyliau."], correctIndex: 1, explanation: "Teigiamas veiksmas (ką daryti, o ne ko ne). „Pritildyti“ yra konkrečiau nei „tyliau“." },
  { question: "Kuris yra prašymas, ne reikalavimas?", options: ["Tu privalai tai padaryti.", "Ar sutiktum man padėti?", "Daryk, kaip sakau."], correctIndex: 1, explanation: "Paliekama laisvė atsisakyti." },
  { question: "Pasirinkite prašymą:", options: ["Suteik man laisvės.", "Ar galėtum man leisti pabūti vienam 30 minučių?", "Netrukdyk man."], correctIndex: 1, explanation: "Konkretus veiksmas ir laikas." },
  { question: "Kuris teiginys yra aiškus prašymas?", options: ["Ar galėtum nupirkti pieno?", "Noriu, kad pasirūpintum maistu.", "Būk ūkiškas."], correctIndex: 0, explanation: "Konkretus veiksmas." },
  { question: "Identifikuokite prašymą:", options: ["Kalbėk aiškiau.", "Ar galėtum pakartoti paskutinį sakinį?", "Nemurmėk."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris yra konkretus prašymas?", options: ["Būk punktualus.", "Ar galėtum atvykti 8:00?", "Nevėluok."], correctIndex: 1, explanation: "Konkretus laikas." },
  { question: "Pasirinkite prašymą:", options: ["Mylėk mane.", "Ar galėtum mane apkabinti?", "Būk švelnus."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris teiginys yra aiškus prašymas?", options: ["Ar galėtum pasakyti, kaip jautiesi?", "Būk atviras.", "Noriu, kad mumis pasitikėtum."], correctIndex: 0, explanation: "Konkretus veiksmas." },
  { question: "Identifikuokite prašymą:", options: ["Susitvarkyk.", "Ar galėtum susidėti drabužius į spintą?", "Nebūk nevala."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris yra prašymas?", options: ["Išklausyk mane.", "Ar galėtum pasakyti, ką išgirdai mane sakant?", "Suprask mane."], correctIndex: 1, explanation: "Konkretus veiksmas (perpasakojimas)." },
  { question: "Pasirinkite prašymą:", options: ["Važiuok saugiai.", "Ar galėtum neviršyti 90 km/h greičio?", "Būk atsargus."], correctIndex: 1, explanation: "Konkretus kriterijus." },
  { question: "Kuris teiginys yra aiškus prašymas?", options: ["Ar galėtum paskambinti man kartą per savaitę?", "Bendrauk su manimi.", "Nepamiršk manęs."], correctIndex: 0, explanation: "Konkretus veiksmas ir dažnumas." },
  { question: "Identifikuokite prašymą:", options: ["Būk mandagus.", "Ar galėtum pasisveikinti su kaimynu?", "Elkis gražiai."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris yra konkretus prašymas?", options: ["Ar galėtum paaiškinti savo sprendimą?", "Būk logiškas.", "Nekalbėk nesąmonių."], correctIndex: 0, explanation: "Konkretus veiksmas." },
  { question: "Pasirinkite prašymą:", options: ["Noriu, kad mane vertintum.", "Ar galėtum pasakyti vieną dalyką, kurį padariau gerai?", "Pagyirk mane."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris teiginys yra aiškus prašymas?", options: ["Ar galėtum išnešti šiukšles dabar?", "Padėk buityje.", "Nebūk tinginys."], correctIndex: 0, explanation: "Konkretus veiksmas ir laikas." },
  { question: "Identifikuokite prašymą:", options: ["Rūpinkis savimi.", "Ar galėtum eiti miegoti 22 val.?", "Nenaktinėk."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris yra prašymas?", options: ["Būk kantrus.", "Ar galėtum palaukti 5 minutes?", "Neskubink manęs."], correctIndex: 1, explanation: "Konkretus veiksmas ir laikas." },
  { question: "Pasirinkite prašymą:", options: ["Parodyk iniciatyvą.", "Ar galėtum pasiūlyti vieną idėją?", "Būk aktyvus."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris teiginys yra aiškus prašymas?", options: ["Ar galėtum sumažinti balsą?", "Nerek.", "Kalbėk normaliai."], correctIndex: 0, explanation: "Konkretus veiksmas." },
  { question: "Identifikuokite prašymą:", options: ["Būk sąžiningas.", "Ar galėtum pasakyti, kur buvai?", "Nemeluok."], correctIndex: 1, explanation: "Konkretus veiksmas." },
  { question: "Kuris yra konkretus prašymas?", options: ["Ar galėtum atsakyti į šį laišką iki rytojaus?", "Atršyk greičiau.", "Noriu atsakymo."], correctIndex: 0, explanation: "Konkretus veiksmas ir laikas." }
];

let chatHistory: any[] = [];
let selectedMapFeeling: string | null = null;

// Quiz State
let quizSet: QuizQuestion[] = [];
let quizIndex = 0;
let quizScore = 0;
let hasAnswered = false;

const intensityLabels = [
    "Itin minkštas / Pasyvus", "Labai švelnus", "Švelnus", "Jautrus", "Dėmesingas",
    "Labai mandagus", "Mandagus", "Diplomatiškas", "Taktiškas", "Atsargus / Neutralus",
    "Dalykiškas", "Tikslus", "Konkretus", "Tiesioginis", "Atviras",
    "Drąsus", "Ryžtingas", "Griežtas", "Labai griežtas", "Itin tiesmukas / Be filtrų"
];

function init() {
  setupNavigation();
  setupReframer();
  setupPractice();
  setupChatBot();
  setupGuideTabs();
  setupModals();
  setupSliderDisplay();
  setupMapSearch();
  setupFlashcards();
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
  ['reframer', 'practice', 'map', 'guide', 'vocab'].forEach(id => {
    document.getElementById(`nav-${id}`)?.addEventListener('click', () => showSection(id));
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
  if (id === 'guide') {
      renderNeedsGrid();
      renderFlashcards('fc-mokiniai');
  }
  if (id === 'reframer') renderGuideExamples('mokiniai');
}

async function apiRephrase(audience: string, intensityDesc: string, intensity: string, input: string): Promise<string> {
  const res = await fetch('/api/rephrase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audience, intensityDesc, intensity, input })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Serverio klaida: ${res.status}`);
  }
  const data = await res.json();
  return data.text;
}

async function apiChat(text: string): Promise<string> {
  chatHistory.push({ role: 'user', parts: [{ text }] });
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Serverio klaida: ${res.status}`);
    }
    const data = await res.json();
    const botText = data.text;
    chatHistory.push({ role: 'model', parts: [{ text: botText }] });
    return botText;
  } catch (error: any) {
    chatHistory.pop(); // Remove user message since backend call failed
    throw error;
  }
}

function setupReframer() {
  document.getElementById('rephrase-button')?.addEventListener('click', async () => {
    const input = (document.getElementById('user-input') as HTMLTextAreaElement).value.trim();
    const output = document.getElementById('gemini-output');
    if (!input || !output) return;

    output.innerHTML = '<div class="loading-shimmer" style="height:100px; width:100%; border-radius:12px;"></div>';
    try {
      const audience = (document.querySelector('input[name="audience"]:checked') as HTMLInputElement)?.value || 'child';
      const intensity = (document.getElementById('intensity-slider') as HTMLInputElement)?.value || '10';
      const intensityDesc = intensityLabels[parseInt(intensity) - 1];
      
      const text = await apiRephrase(audience, intensityDesc, intensity, input);
      output.innerHTML = `<p class="output-text">${text}</p>`;
    } catch (e: any) {
      console.error("Reframer error:", e);
      output.innerHTML = `<p class="error-msg">Įvyko klaida: ${e.message || 'Nepavyko susisiekti su serveriu.'}</p>`;
    }
  });
}

function setupChatBot() {
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const chatWin = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const userInput = document.getElementById('chat-user-input') as HTMLInputElement;
  const chatMsgs = document.getElementById('chat-messages');

  if (!toggleBtn || !chatWin || !closeBtn || !sendBtn || !userInput || !chatMsgs) return;

  toggleBtn.addEventListener('click', () => chatWin.classList.toggle('hidden'));
  closeBtn.addEventListener('click', () => chatWin.classList.add('hidden'));

  const sendMessage = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    chatMsgs.innerHTML += `<div class="user-msg-bubble">${text}</div>`;
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    chatMsgs.innerHTML += `<div class="bot-msg-bubble" id="${loadingId}"><div class="loading-shimmer" style="width: 30px; height: 10px; border-radius: 5px;"></div></div>`;
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    try {
      const botText = await apiChat(text);
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) {
        loadingEl.textContent = botText || "Atsiprašau, įvyko klaida.";
      }
    } catch (e: any) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) {
          loadingEl.textContent = e.message || "Atsiprašau, susidūriau su techninėmis kliūtimis.";
      }
    }
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  };

  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
}

function setupPractice() {
  document.getElementById('game-control-button')?.addEventListener('click', startQuiz);
}

function startQuiz() {
    // Shuffle and pick 10 random questions
    const shuffled = [...quizDatabase].sort(() => 0.5 - Math.random());
    quizSet = shuffled.slice(0, 10);
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
        // Show results
        card.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
                <h2 style="margin-bottom: 1rem; color: var(--primary);">Testas baigtas!</h2>
                <p style="font-size: 1.25rem; margin-bottom: 2rem;">Jūsų rezultatas: <strong>${quizScore}</strong> iš ${quizSet.length}</p>
                <button class="btn btn-primary-dark" id="restart-quiz">Bandyti dar kartą</button>
            </div>
        `;
        document.getElementById('restart-quiz')?.addEventListener('click', startQuiz);
        return;
    }

    const q = quizSet[quizIndex];
    hasAnswered = false;

    card.innerHTML = `
        <div class="quiz-header" style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; align-items: center;">
            <span class="quiz-progress" style="font-weight: 700; color: var(--text-muted);">Klausimas ${quizIndex + 1} / ${quizSet.length}</span>
            <span class="quiz-score" style="background: var(--accent); padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.8rem; font-weight: 800;">Taškai: ${quizScore}</span>
        </div>
        <h3 style="margin-bottom: 2rem; font-size: 1.2rem; line-height: 1.5;">${q.question}</h3>
        <div class="quiz-options-grid" style="display: flex; flex-direction: column; gap: 1rem;">
            ${q.options.map((opt, idx) => `
                <button class="quiz-option btn-outline" data-idx="${idx}">${opt}</button>
            `).join('')}
        </div>
        <div id="quiz-feedback" class="hidden" style="margin-top: 2rem; padding: 1.5rem; border-radius: var(--radius-sm);"></div>
        <button id="next-q-btn" class="btn btn-primary-dark full-width hidden" style="margin-top: 1.5rem;">Kitas klausimas</button>
    `;

    // Add listeners
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

    // Style buttons
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
        if(feedbackEl) {
            feedbackEl.classList.remove('hidden');
            feedbackEl.style.background = '#f0fdf4';
            feedbackEl.style.border = '1px solid #bbf7d0';
            feedbackEl.innerHTML = `<strong style="color: var(--success);">Teisingai!</strong> <p>${q.explanation}</p>`;
        }
    } else {
        if(feedbackEl) {
            feedbackEl.classList.remove('hidden');
            feedbackEl.style.background = '#fef2f2';
            feedbackEl.style.border = '1px solid #fecaca';
            feedbackEl.innerHTML = `<strong style="color: var(--error);">Neteisingai.</strong> <p>${q.explanation}</p>`;
        }
    }

    // Update score display immediately
    const scoreDisplay = document.querySelector('.quiz-score');
    if (scoreDisplay) scoreDisplay.textContent = `Taškai: ${quizScore}`;

    if(nextBtn) nextBtn.classList.remove('hidden');
}

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
    document.getElementById('modal-need')!.textContent = "Universalus poreikis"; // Reset badge text
    document.getElementById('modal-desc')!.textContent = data.desc;

    // Reuse context items
    const labels = modal.querySelectorAll('.context-label');
    const contents = modal.querySelectorAll('.context-item p');
    const items = modal.querySelectorAll('.context-item');

    // Item 1: Sudėtinės dalys
    if(labels[0]) labels[0].textContent = "📝 Sudėtinės dalys";
    if(contents[0]) contents[0].textContent = data.sub.join(', ');
    if(items[0]) items[0].classList.remove('hidden');

    // Item 2: Refleksija
    if(labels[1]) labels[1].textContent = "🤔 Klausimas sau";
    if(contents[1]) contents[1].textContent = data.question;
    if(items[1]) items[1].classList.remove('hidden');

    // Item 3: Hide for needs
    if(items[2]) items[2].classList.add('hidden');

    modal.classList.remove('hidden');
}

function setupFlashcards() {
  document.querySelectorAll('.ex-tab-btn[data-fc-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ex-tab-btn[data-fc-target]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFlashcards((btn as any).dataset.fcTarget);
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
            <div class="fc-main-text">${card.feeling}</div>
            <div class="fc-sub-text">„${card.context}“</div>
        </div>
        <div class="flashcard-back">
            <div class="fc-icon">💡</div>
            <div class="fc-label">Tikrasis poreikis</div>
            <div class="fc-main-text">${card.need}</div>
            <div class="fc-sub-text">${card.explanation}</div>
        </div>
      </div>
    </div>
  `).join('');
}

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

  if (selectedMapFeeling) {
     const bridge = document.getElementById('bridge-text');
     const bridgeCard = document.getElementById('connection-bridge');
     if (bridge && bridgeCard && bridgeCard.classList.contains('active-result') && bridge.innerHTML === 'Pasirinkite jausmą...') {
         // Restore text if lost on re-render (though typically innerHTML on specific element isn't lost if outside flist/nlist)
         // Actually bridge is outside flist/nlist, so we don't need to restore text here, just styles if needed.
         // But bridgeCard classes persist.
     }
  }
}

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
  document.querySelectorAll('.ex-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ex-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGuideExamples((btn as any).dataset.target);
    });
  });
}

function renderGuideExamples(target: string) {
  const container = document.getElementById('examples-content');
  const examples = (guideExamples as any)[target] || [];
  if (!container) return;
  container.innerHTML = examples.map((ex: any) => `
    <div class="card example-item-card">
      <div class="example-sit-tag">${ex.sit}</div>
      <div class="example-quote">${ex.quote}</div>
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

function openInteractionInfo(word: string) {
  const modal = document.getElementById('feeling-modal');
  if (!modal) return;
  
  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = word.charAt(0).toUpperCase() + word.slice(1);
  
  const descEl = document.getElementById('modal-desc');
  const needEl = document.getElementById('modal-need');

  // Reset labels for feelings view
  const labels = modal.querySelectorAll('.context-label');
  const items = modal.querySelectorAll('.context-item');
  if(labels[0]) labels[0].textContent = "👶 Vaikui";
  if(labels[1]) labels[1].textContent = "👤 Suaugusiam";
  if(labels[2]) labels[2].textContent = "💼 Darbe";
  items.forEach(i => i.classList.remove('hidden'));

  const exChildEl = document.getElementById('modal-ex-child');
  const exAdultEl = document.getElementById('modal-ex-adult');
  const exProEl = document.getElementById('modal-ex-pro');

  if (descEl) descEl.textContent = "Šis jausmas padeda suprasti, ar pamatinių vertybių ir poreikių būsena šiuo metu yra patenkinta.";
  if (needEl) needEl.textContent = "Universalūs NK poreikiai";
  if (exChildEl) exChildEl.textContent = "„Matau, kad šypsaisi. Ar jautiesi " + word + ", nes tau pavyko susitarti su draugu?“";
  if (exAdultEl) exAdultEl.textContent = "„Jaučiuosi " + word + ", nes man svarbus abipusis suprantimas.“";
  if (exProEl) exProEl.textContent = "„Esu " + word + " dėl šio projekto, nes man rūpi rezultatas.“";
  
  modal.classList.remove('hidden');
}

init();