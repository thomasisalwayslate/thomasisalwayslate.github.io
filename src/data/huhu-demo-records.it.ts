import type { LifeEntry } from './huhu-demo';

type EntryCopy = [title: string, text: string];

const coreEntries: Record<string, EntryCopy> = {
  'old-sketch': ['Un vecchio schizzo del dispositivo', 'Ho disegnato un piccolo dispositivo per conservare le idee. Devo ancora decidere se costruirlo.'],
  conversation: ['Una conversazione sul canale', 'Sam mi ha parlato di una strada più tranquilla lungo il canale. Voglio provarla tornando a casa.'],
  'new-route': ['Provo la strada lungo il canale', 'Ho provato la strada che mi ha suggerito Sam. Vicino al ponte ho notato un laboratorio aperto e mi sono segnato l’indirizzo.'],
  workshop: ['Una visita al laboratorio', 'Sono tornato al laboratorio che avevo notato lungo il canale. Tenere in mano un piccolo involucro mi ha fatto riprendere lo schizzo del dispositivo.'],
  'device-decision': ['Avvio il progetto del dispositivo', 'Ho deciso di costruire il dispositivo che avevo disegnato ad agosto. La visita al laboratorio mi ha aiutato a immaginare come sarebbe stato tenerlo in mano.'],
  sleep: ['Una notte breve', 'Ho dormito quattro ore. Sono rimasto sveglio per finire un disegno.'],
  run: ['La corsa di martedì', 'Una corsa di 32 minuti. I dati dell’attività contengono il percorso e le misurazioni della velocità nel tempo.'],
  pace: ['Un cambio al minuto 14', 'La velocità registrata è scesa intorno al minuto 14. I dati, da soli, non dicono perché.'],
  hill: ['La salita sul percorso', 'Circa a metà di quel percorso c’è un tratto in salita. A volte mi fermo lì per attraversare la strada.'],
  ankle: ['Un dolore alla caviglia', 'Oggi mi fa male la caviglia destra. Mi chiedo se ieri abbia preso una storta. Non so bene quando sia cominciato il dolore.'],
  rest: ['Un pomeriggio a casa', 'Sono rimasto a casa e ho ascoltato il disco che mi aveva consigliato Alex. Mi sentivo meno di fretta.'],
  alex: ['Alex', 'Alex è mia sorella. Dopo la scuola andavamo a camminare lungo il fiume.'],
  visit: ['Sabato con Alex', 'Alex è passata questo pomeriggio. Abbiamo fatto il tè e guardato le vecchie foto del fiume. Mi sentivo tranquillo.'],
  photo: ['La foto del fiume', 'Una foto che avevo conservato del ponte dove io e Alex ci fermavamo. Alex ha confermato che era proprio lì.'],
  feeling: ['Una sensazione familiare', 'Oggi mi sento tranquillo. Non riesco a capire bene che cosa mi ricordi.'],
  song: ['La canzone che mi ha mandato Alex', 'Alex mi ha mandato una canzone con una frase di chitarra delicata che si ripete. Mi ha ricordato le nostre passeggiate.'],
  walk: ['Una passeggiata lungo il fiume', 'Oggi ho camminato lungo il fiume. I riflessi continuavano a spezzarsi in piccoli quadrati colorati.'],
  colour: ['Conservare un colore', 'Volevo conservare l’azzurro pallido dell’acqua senza tenere tutte le foto.'],
  drawing: ['Un disegno nato dalla passeggiata', 'Ho fatto un piccolo disegno partendo dalla foto del fiume. Ho usato solo quattro colori.'],
  idea: ['L’idea per un piccolo strumento', 'E se si potessero raccogliere i colori come piccoli oggetti, ognuno con un nome e un posto in una scatola?'],
  music: ['Provo una melodia', 'Dopo aver ascoltato la canzone di Alex ho provato un breve giro di chitarra. Ho tenuto la frase che si ripete ma ho cambiato il ritmo.'],
  forgot: ['In cerca di un ricordo', 'Mi ricordavo di Alex e di una sensazione di calma. I dettagli di sabato mi sfuggivano. Ho cercato il suo nome.'],
  return: ['Riprendo un’idea', 'Rivedere la foto del fiume mi ha ricordato perché avevo iniziato a progettare lo strumento per i colori.'],
};

const themeNotes: Record<string, EntryCopy[]> = {
  body: [
    ['Una corsa tranquilla', 'Oggi ho corso senza sforzarmi. Mi sono accorto di quanto cambiasse il percorso quando smettevo di guardare il tempo.'],
    ['La strada più lunga', 'Ho fatto il giro lungo per tornare a casa. All’ultimo incrocio avevo le gambe pesanti.'],
    ['Una mattina all’aperto', 'Sono uscito prima di aprire il computer. Dopo ho scritto come mi sentivo.'],
    ['Una pausa nel pomeriggio', 'Ho smesso di lavorare per fare due passi. Al ritorno il problema era ancora lì, ma riuscivo a guardarlo di nuovo.'],
    ['Un percorso familiare', 'C’era molta gente sul giro lungo il fiume. Mi sono fermato due volte per lasciar passare qualcuno.'],
    ['Una nota dopo la passeggiata', 'Dopo la passeggiata mi sentivo stanco. Avevo anche dormito male, così ho annotato entrambe le cose.'],
  ],
  family: [
    ['Un tè con Alex', 'Alex è passata per un tè. Abbiamo parlato del ponte vicino alla nostra vecchia scuola.'],
    ['Una vecchia foto', 'Abbiamo guardato una foto del fiume. Alex si ricordava che tempo faceva quel giorno.'],
    ['Un nome familiare', 'Ho scritto il nome della persona e come l’avevo conosciuta, perché la nota avesse senso anche più avanti.'],
    ['Il pranzo della domenica', 'Abbiamo cucinato insieme e siamo rimasti a tavola più del solito.'],
    ['Un messaggio breve', 'Alex mi ha scritto della canzone che ascoltavamo tornando a casa.'],
    ['Qualcosa da conservare', 'Ho salvato una frase della nostra conversazione perché volevo tornarci.'],
  ],
  ideas: [
    ['Uno schizzo a margine', 'Una forma disegnata a margine mi ha dato l’idea per una piccola interfaccia.'],
    ['Un colore da conservare', 'Ho notato un verde pallido su una porta e ho scritto perché mi aveva colpito.'],
    ['Un’idea lasciata a metà', 'Ho ripreso un vecchio schizzo. Questa volta mi è tornata utile la parte che avevo cancellato.'],
    ['Quattro colori', 'Ho provato a fare il disegno con solo quattro colori. Usarne così pochi ha cambiato quello a cui facevo caso.'],
    ['Una piccola raccolta', 'Volevo che i pezzi salvati mi sembrassero oggetti da passare in rassegna.'],
    ['Guardare di nuovo', 'Una foto a cui la settimana scorsa non avevo fatto caso oggi mi ha dato un’idea.'],
  ],
  sleep: [
    ['Una notte di risvegli', 'Mi sono svegliato più di una volta. Prima di colazione ho scritto due righe.'],
    ['Un disegno fino a tardi', 'Sono rimasto sveglio per lavorare al disegno. Ho annotato a che ora ho finito, lasciando aperta la domanda su che effetto abbia avuto.'],
    ['A letto prima', 'Ho lasciato il lavoro a metà sulla scrivania e sono andato a letto prima del solito.'],
    ['Una nota al mattino', 'Ho scritto quello che ricordavo della notte e come mi sentivo al risveglio.'],
    ['Il giorno dopo', 'La mattina è andata a rilento. L’annotazione di ieri poteva aiutarmi a capire, anche se ancora non sapevo come.'],
    ['Due orari distinti', 'Ho aggiunto l’ora in cui mi sono accorto della stanchezza, separata dall’ora in cui ne ho scritto.'],
  ],
  work: [
    ['Un problema ostinato', 'Si è ripresentato lo stesso errore. Prima di provare un’altra soluzione ho salvato i passaggi che ci hanno portato.'],
    ['Una spiegazione più chiara', 'Mettere il problema per iscritto mi ha aiutato a vedere una condizione che mancava.'],
    ['Un cambio di approccio', 'Ho cambiato l’ordine del lavoro quando mi sono accorto che due compiti dipendevano dalla stessa decisione.'],
    ['Una correzione utile', 'La prima spiegazione era sbagliata. Ho tenuto la nota originale e aggiunto quello che mi ha fatto cambiare idea.'],
    ['Per oggi basta', 'Ho smesso con una domanda ancora aperta e ho lasciato una nota sul punto da cui riprendere.'],
    ['Una decisione e il suo motivo', 'Ho annotato la scelta e gli elementi su cui si basava, oltre al risultato.'],
  ],
  music: [
    ['Una frase che si ripete', 'Ho ascoltato una breve frase di chitarra finché non ho sentito la variazione alla fine.'],
    ['La canzone di Alex', 'La canzone mi ha ricordato la passeggiata di cui avevamo parlato. Ho salvato il collegamento con quel ricordo.'],
    ['Una registrazione di prova', 'Ho registrato una breve melodia e ho scritto da quale idea precedente era nata.'],
    ['Un ritmo diverso', 'Ho provato le stesse note con un ritmo diverso. Mi sembrava più vicino al disegno che stavo facendo.'],
    ['Una serata ad ascoltare', 'Ho ascoltato senza lavorare. Dopo mi è rimasto in mente un dettaglio dell’arrangiamento.'],
    ['Ritrovare un suono', 'Ho ritrovato la registrazione cercando la sensazione che avevo annotato accanto.'],
  ],
  places: [
    ['Il ponte', 'La luce sul fiume era diversa da quella della vecchia foto.'],
    ['Un attraversamento', 'Mi sono fermato all’attraversamento vicino alla salita. Ho annotato il punto in cui mi sono dovuto fermare.'],
    ['Una strada tranquilla', 'Ho preso una strada più tranquilla e notato una vetrina davanti a cui di solito tiro dritto.'],
    ['Un luogo in una foto', 'Ho aggiunto il luogo solo dopo aver verificato con qualcuno che c’era.'],
    ['Un ritorno più lungo', 'Una deviazione mi ha riportato lungo il fiume. Mi ha ricordato una conversazione di tempo fa.'],
    ['Un angolo familiare', 'Ho riconosciuto l’angolo prima di ricordare il giorno in cui c’ero stato l’ultima volta.'],
  ],
  reflection: [
    ['Un possibile collegamento', 'Due annotazioni sembravano collegate. Ho conservato il collegamento proposto e il motivo.'],
    ['Un’altra spiegazione', 'Una nota precedente ha cambiato il modo in cui capivo quella successiva.'],
    ['Ancora troppo poco', 'C’erano troppo poche annotazioni per dire che fosse uno schema ricorrente. Ho lasciato aperta la domanda.'],
    ['Seguire il filo', 'Ho seguito un pensiero a ritroso attraverso due annotazioni e ne ho ritrovato il contesto originale.'],
    ['Quello che avevo scritto davvero', 'Prima di accettare il riassunto ho controllato l’annotazione originale.'],
    ['Un legame da rivedere', 'Ho lasciato esplicita l’incertezza, così una nuova annotazione avrebbe potuto cambiare la spiegazione.'],
  ],
};

const months: Record<string, string> = {
  June: 'giugno', July: 'luglio', August: 'agosto', September: 'settembre', October: 'ottobre',
};

export function italianEntry(entry: LifeEntry): LifeEntry {
  const match = /^([a-z]+)-(\d+)$/.exec(entry.id);
  const notes = match && themeNotes[match[1]];
  const translation = notes ? notes[(Number(match[2]) - 1) % notes.length] : coreEntries[entry.id];
  if (!translation) return entry;
  const [title, text] = translation;
  const date = entry.date.replace(/[A-Z][a-z]+/, month => months[month] ?? month);
  return { ...entry, title, text, date };
}
