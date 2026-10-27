// Questions d'histoire pour les jeux éducatifs (voir test/content.test.js pour le schéma exact).
// Chaque ligne de quiz : [niveau, question, bonne réponse, mauvaise 1, mauvaise 2, explication].
// La bonne réponse est placée tour à tour au rang 0, 1, 2 pour équilibrer les positions.
const quiz = (rows) => rows.map(([level, q, good, a, b, why], i) => {
  const answer = i % 3;
  const choices = [a, b];
  choices.splice(answer, 0, good);
  return { level, q, choices, answer, why };
});
const vf = (rows) => rows.map(([level, s, answer, why]) => ({ level, s, answer, why }));

const MOYENS_QUIZ = quiz([
  [1, "Quel géant poilu les hommes préhistoriques chassaient-ils ?", "Le mammouth", "Le dauphin", "Le kangourou", "Le mammouth ressemblait à un éléphant couvert de poils. Sa chair nourrissait la tribu et ses défenses servaient d’outils !"],
  [1, "Que découvrent les hommes préhistoriques pour se chauffer et cuire leur viande ?", "Le feu", "L’électricité", "Le gaz", "Maîtriser le feu a tout changé : chaleur, lumière la nuit, protection contre les bêtes et nourriture cuite."],
  [1, "Dans quel pays les pharaons faisaient-ils construire des pyramides ?", "L’Égypte", "La Chine", "Le Canada", "Les pyramides d’Égypte sont des tombeaux de pharaons. Certaines ont plus de 4 000 ans !"],
  [1, "Comment s’appelait notre pays à l’époque des Gaulois ?", "La Gaule", "La Francie", "L’Italie", "La Gaule est devenue la France bien plus tard. Les Gaulois y vivaient dans des villages de maisons en bois."],
  [1, "Quel chef gaulois a résisté à Jules César ?", "Vercingétorix", "Charlemagne", "Louis XIV", "Vercingétorix a réuni les peuples gaulois contre les Romains. Il a fini par perdre à Alésia, en 52 av. J.-C."],
  [1, "Comment appelle-t-on la période qui vient juste après l’Antiquité ?", "Le Moyen Âge", "La Préhistoire", "L’époque moderne", "L’Histoire va de la Préhistoire à l’Antiquité, puis au Moyen Âge, aux Temps modernes et à l’époque contemporaine."],
  [1, "Qui défendait le château fort et se battait à cheval ?", "Le chevalier", "Le pharaon", "Le gladiateur", "Le chevalier portait une armure et une épée. Le seigneur, lui, possédait le château et les terres alentour."],
  [1, "Quel roi de France était surnommé le Roi-Soleil ?", "Louis XIV", "Louis XVI", "Napoléon", "Louis XIV avait choisi le soleil comme emblème : il voulait briller sur toute l’Europe !"],
  [1, "Dans quel château Louis XIV a-t-il installé sa cour ?", "Versailles", "Chambord", "Carcassonne", "Versailles possède une célèbre galerie des Glaces, longue de 73 mètres, avec 357 miroirs."],
  [1, "Dans quel pays les Jeux olympiques sont-ils nés ?", "En Grèce", "Au Brésil", "En Norvège", "Les premiers Jeux avaient lieu à Olympie, en Grèce antique, tous les quatre ans. Les athlètes couraient presque nus !"],
  [1, "Dans quels vêtements s’habillaient les hommes préhistoriques ?", "Des peaux de bêtes", "Des jeans", "Des costumes de soie", "Ils cousaient des peaux avec des aiguilles en os. Pas de tissu : il n’avait pas encore été inventé."],
  [2, "Quelle ville était la capitale de l’Empire romain ?", "Rome", "Athènes", "Paris", "« Tous les chemins mènent à Rome » : les routes romaines partaient de la capitale vers tout l’Empire."],
  [2, "Comment s’appelle l’écriture des anciens Égyptiens ?", "Les hiéroglyphes", "Les chiffres", "Le braille", "Les hiéroglyphes sont de petits dessins : oiseaux, yeux, serpents… Champollion les a déchiffrés en 1822."],
  [2, "Pourquoi les Égyptiens fabriquaient-ils des momies ?", "Pour conserver le corps", "Pour décorer les maisons", "Pour jouer", "Ils croyaient à une vie après la mort. Le corps devait donc rester intact pour le grand voyage."],
  [2, "Qui cultivait les champs du seigneur au Moyen Âge ?", "Les paysans", "Les chevaliers", "Les rois", "Les paysans travaillaient dur. En échange, le seigneur les protégeait en cas d’attaque."],
  [2, "Quelle nouveauté apparaît au Néolithique ?", "L’agriculture et l’élevage", "L’électricité", "L’imprimerie", "Les hommes cessent de seulement chasser : ils cultivent le blé et élèvent des animaux, et deviennent sédentaires."],
  [2, "Quel général romain a conquis la Gaule ?", "Jules César", "Ramsès II", "Charlemagne", "Jules César a raconté sa guerre dans un livre : La Guerre des Gaules. Il écrivait sur lui-même à la troisième personne !"],
  [2, "En quoi étaient faites les maisons gauloises ?", "Bois, terre et paille", "Béton", "Marbre", "Le toit était en chaume (de la paille). Les murs étaient faits de bois et de torchis, un mélange de terre et de paille."],
  [2, "À quoi servait le pont-levis d’un château fort ?", "À fermer l’entrée", "À pêcher", "À traverser un désert", "On relevait le pont au-dessus du fossé : plus personne ne pouvait entrer sans la permission du seigneur."],
  [2, "Où les Romains regardaient-ils les combats de gladiateurs ?", "Dans une arène", "Dans une école", "Dans un château", "Le Colisée de Rome pouvait accueillir des dizaines de milliers de spectateurs."],
  [2, "Quel navigateur est arrivé en Amérique en 1492 ?", "Christophe Colomb", "Louis Pasteur", "Jules César", "Colomb cherchait la route des Indes par l’ouest. Il a rencontré un continent que les Européens ne connaissaient pas."],
  [2, "Qui a inventé l’imprimerie en Europe, vers 1450 ?", "Gutenberg", "Colbert", "Vercingétorix", "Avec les lettres mobiles en métal de Gutenberg, on a pu fabriquer beaucoup de livres bien plus vite qu’à la main."],
  [2, "Quel jeune pharaon est célèbre pour son masque d’or ?", "Toutânkhamon", "Louis XIV", "Jules César", "Sa tombe a été découverte presque intacte en 1922 par l’archéologue Howard Carter."],
  [2, "Qui est Charlemagne ?", "Un empereur du Moyen Âge", "Un homme préhistorique", "Un chef gaulois", "Charlemagne est couronné empereur à Rome en l’an 800. On dit qu’il aurait voulu que tous les enfants aillent à l’école."],
  [3, "Comment la grotte de Lascaux a-t-elle été découverte en 1940 ?", "Par des adolescents et un chien", "Par un pilote d’avion", "Par un roi", "Un chien est tombé dans un trou, et les adolescents venus le chercher ont trouvé des peintures de 17 000 ans !"],
  [3, "À quoi servait une pyramide égyptienne ?", "De tombeau pour un pharaon", "De château fort", "D’école", "Le pharaon y reposait avec des trésors et des objets pour sa vie dans l’au-delà."],
  [3, "Quelle ville grecque a inventé la démocratie ?", "Athènes", "Rome", "Alésia", "Démocratie vient de deux mots grecs : « demos » (le peuple) et « kratos » (le pouvoir)."],
  [3, "De quelle langue le français vient-il surtout ?", "Du latin", "Du gaulois", "De l’égyptien", "Les Gaulois ont adopté la langue des Romains. Quelques mots gaulois restent, comme « chemin » ou « mouton »."],
  [3, "Comment appelle-t-on un garçon qui apprend le métier de chevalier ?", "Un page", "Un pharaon", "Un druide", "Le page devenait ensuite écuyer, puis chevalier vers 21 ans, après une cérémonie appelée l’adoubement."],
  [3, "Quelle invention a fait rouler les premiers trains au XIXe siècle ?", "La machine à vapeur", "Le moteur à fusée", "L’électricité solaire", "Le charbon chauffait l’eau, et la vapeur poussait les pistons de la locomotive."],
  [3, "Qui a inventé l’écriture en points pour les aveugles ?", "Louis Braille", "Louis Pasteur", "Louis XIV", "Louis Braille, aveugle depuis l’enfance, a mis au point son alphabet à seulement 15 ans."],
  [3, "Dans quel pays le papier a-t-il été inventé ?", "En Chine", "En France", "Au Mexique", "Les Chinois fabriquaient du papier il y a près de 2 000 ans. Les Égyptiens, eux, écrivaient sur du papyrus."],
  [3, "Comment appelle-t-on l’espèce d’homme à laquelle nous appartenons ?", "Homo sapiens", "Mammouth", "Gaulois", "Homo sapiens veut dire « l’homme qui sait ». Il est apparu il y a environ 300 000 ans."],
  [3, "Quel savant a mis au point un vaccin contre la rage ?", "Louis Pasteur", "Léonard de Vinci", "Jules César", "Pasteur l’a testé en 1885 sur un jeune garçon mordu par un chien enragé, et l’enfant a été sauvé."]
]);

const MOYENS_VF = vf([
  [1, "Les hommes préhistoriques utilisaient le feu.", true, "Le feu servait à se chauffer, à s’éclairer, à cuire les aliments et à faire fuir les animaux dangereux."],
  [1, "Les dinosaures vivaient en même temps que les hommes préhistoriques.", false, "Les dinosaures ont disparu il y a 66 millions d’années. Les premiers humains sont arrivés bien, bien plus tard."],
  [1, "Les pyramides d’Égypte sont des tombeaux.", true, "Elles protégeaient le corps du pharaon. Les pharaons se faisaient construire une pyramide de son vivant."],
  [1, "Les Gaulois parlaient français.", false, "Ils parlaient gaulois. Le français vient du latin, la langue des Romains, qui ont conquis la Gaule."],
  [1, "Louis XIV a fait construire la tour Eiffel.", false, "La tour Eiffel date de 1889, plus de 170 ans après la mort de Louis XIV. Louis XIV, lui, a agrandi Versailles."],
  [1, "Les Jeux olympiques existaient déjà dans l’Antiquité.", true, "Les Grecs organisaient les Jeux à Olympie. Les athlètes concouraient en l’honneur du dieu Zeus."],
  [1, "Les chevaliers portaient des armures en plastique.", false, "Le plastique n’existait pas ! Les armures étaient en métal et pesaient parfois plus de 20 kilos."],
  [1, "Les Égyptiens écrivaient avec des hiéroglyphes.", true, "Ces petits dessins représentent des mots ou des sons. On les trouve gravés sur les murs des temples."],
  [1, "Le Roi-Soleil est un surnom de Louis XIV.", true, "Louis XIV aimait la danse et se déguisait en soleil dans des ballets de la cour."],
  [1, "Au Moyen Âge, les châteaux forts servaient à se protéger des attaques.", true, "Murs épais, tours, fossé et pont-levis : tout était fait pour résister aux ennemis."],
  [1, "Le Colisée se trouve à Athènes.", false, "Le Colisée est à Rome, en Italie. Athènes est la capitale de la Grèce, où l’on voit le Parthénon."],
  [2, "Les gladiateurs combattaient dans des arènes.", true, "Les combats de gladiateurs étaient un spectacle très populaire dans l’Empire romain."],
  [2, "Cléopâtre était reine de Rome.", false, "Cléopâtre était reine d’Égypte. Elle a rencontré Jules César, qui était romain."],
  [2, "Les paysans du Moyen Âge habitaient dans des châteaux forts.", false, "Les paysans vivaient dans de petites maisons de village. Le château fort était la demeure du seigneur."],
  [2, "Christophe Colomb a traversé l’Atlantique avec trois navires en 1492.", true, "Ses navires s’appelaient la Santa Maria, la Pinta et la Niña."],
  [2, "Les Romains écrivaient les nombres comme nous, avec 1, 2, 3.", false, "Ils utilisaient les chiffres romains : I, V, X, L, C… Nos chiffres viennent du monde arabe, qui les tenait de l’Inde."],
  [2, "Charlemagne a vécu à l’époque préhistorique.", false, "Charlemagne a vécu au Moyen Âge, vers l’an 800. La Préhistoire est des milliers d’années plus ancienne."],
  [2, "Au Néolithique, des hommes deviennent agriculteurs.", true, "Ils cultivent des céréales et élèvent des animaux : c’est le début des premiers villages."],
  [2, "Les frères Lumière ont inventé le téléphone.", false, "Ils ont inventé le cinématographe en 1895. La première séance publique a eu lieu à Paris."],
  [3, "Les Vikings portaient des casques à cornes.", false, "C’est une légende née d’images du XIXe siècle. Leurs vrais casques étaient ronds, sans cornes."],
  [3, "Les Gaulois ont inventé le tonneau en bois.", true, "Les tonneaux étaient légers et solides : parfaits pour transporter le vin et la bière."],
  [3, "Les Grecs de l’Antiquité ont inventé le théâtre.", true, "Les tragédies et les comédies se jouaient en plein air, devant des milliers de spectateurs."],
  [3, "Louis Pasteur a mis au point un vaccin contre la rage.", true, "Pasteur a aussi montré que les microbes causent des maladies, et l’on pasteurise toujours le lait."]
]);

const GRANDS_QUIZ = quiz([
  [1, "Quel chef gaulois a été vaincu à Alésia en 52 av. J.-C. ?", "Vercingétorix", "Clovis", "Brennus", "Vercingétorix s’est rendu à César, puis il a été emmené à Rome. La Gaule est devenue romaine."],
  [1, "En quelle année la Révolution française commence-t-elle ?", "1789", "1715", "1815", "Le 14 juillet 1789, des Parisiens prennent la Bastille. On fête ce jour chaque année depuis 1880."],
  [1, "Quel général est devenu empereur des Français en 1804 ?", "Napoléon Ier", "Louis XIV", "Charlemagne", "Napoléon s’est couronné lui-même empereur à Notre-Dame, en présence du pape."],
  [1, "Qui a été le premier homme à marcher sur la Lune ?", "Neil Armstrong", "Youri Gagarine", "Thomas Pesquet", "C’était en juillet 1969, pendant la mission américaine Apollo 11."],
  [1, "Qui a été le premier homme à voyager dans l’espace ?", "Youri Gagarine", "Neil Armstrong", "Buzz Aldrin", "Gagarine, soviétique, a fait un tour de la Terre en 1961 en environ 1 h 48."],
  [1, "Qui a peint la Joconde ?", "Léonard de Vinci", "Claude Monet", "Pablo Picasso", "Léonard de Vinci était aussi inventeur. Il a dessiné des machines volantes il y a plus de 500 ans !"],
  [1, "Quel astronaute français a séjourné dans la Station spatiale internationale ?", "Thomas Pesquet", "Neil Armstrong", "Jean Moulin", "Thomas Pesquet y a fait deux séjours, en 2016-2017 puis en 2021."],
  [2, "Avec quelle guerre Jeanne d’Arc est-elle associée ?", "La guerre de Cent Ans", "La Première Guerre mondiale", "Les guerres de Gaule", "Jeanne d’Arc, jeune paysanne, a mené des soldats français contre les Anglais. Elle est morte en 1431."],
  [2, "Combien de temps a duré la guerre de Cent Ans ?", "116 ans", "100 ans exactement", "10 ans", "De 1337 à 1453 : plus longue que son nom ne le dit ! Ce n’était pas une guerre continue, mais une suite de conflits."],
  [2, "Quelle ville les croisés voulaient-ils atteindre ?", "Jérusalem", "Paris", "Rome", "Les croisades ont commencé en 1096. Elles étaient menées par des chrétiens d’Europe qui voulaient reprendre Jérusalem."],
  [2, "Quand Charlemagne a-t-il été couronné empereur ?", "En l’an 800", "En l’an 1000", "En 1515", "Le pape Léon III l’a couronné à Rome, le jour de Noël de l’an 800."],
  [2, "Quel jour a-t-on pris la Bastille ?", "Le 14 juillet 1789", "Le 11 novembre 1918", "Le 1er janvier 1800", "La Bastille était une prison-forteresse, symbole du pouvoir du roi. Il n’y avait alors que sept prisonniers !"],
  [2, "Quelle bataille a mis fin au règne de Napoléon en 1815 ?", "Waterloo", "Marignan", "Verdun", "Après Waterloo, Napoléon est exilé sur l’île de Sainte-Hélène, au milieu de l’Atlantique, où il meurt en 1821."],
  [2, "Qui a déchiffré les hiéroglyphes ?", "Champollion", "Pasteur", "Gutenberg", "En 1822, Jean-François Champollion y est parvenu grâce à la pierre de Rosette, qui portait le même texte en trois écritures."],
  [2, "Quelle cité grecque était célèbre pour ses guerriers ?", "Sparte", "Athènes", "Olympie", "Les petits Spartiates entraient très jeunes dans une éducation militaire très dure."],
  [2, "Quelle maladie a tué beaucoup d’Européens au XIVe siècle ?", "La peste noire", "La varicelle", "Le rhume", "Elle arrive en Europe vers 1347. Elle a tué environ un tiers de la population, d’après les historiens."],
  [2, "Quel écrivain du XIXe siècle a écrit Les Misérables ?", "Victor Hugo", "Jules Verne", "Molière", "Victor Hugo a aussi écrit Notre-Dame de Paris. Son livre a sauvé la cathédrale, alors presque oubliée."],
  [2, "Quelle énergie faisait avancer les premières locomotives ?", "La vapeur", "L’énergie solaire", "L’énergie nucléaire", "Le charbon brûlait pour chauffer l’eau. La vapeur obtenue, sous pression, poussait les pistons."],
  [2, "Quel animal a été le premier à voyager en orbite autour de la Terre ?", "La chienne Laïka", "Le chat Félix", "Le singe Albert", "Laïka a voyagé en 1957 à bord de Spoutnik 2. À l’époque, on ne savait pas encore ramener un vaisseau sur Terre."],
  [2, "Comment appelait-on Paris à l’époque gallo-romaine ?", "Lutèce", "Alésia", "Lugdunum", "Lutèce était un bourg du peuple gaulois des Parisii, d’où vient le nom de Paris."],
  [3, "Quel roi, vainqueur à Marignan, a accueilli Léonard de Vinci en France ?", "François Ier", "Louis XIV", "Henri IV", "Léonard est venu vivre à Amboise, avec trois de ses tableaux dont la Joconde. Il y est mort en 1519."],
  [3, "Combien de temps a duré le règne de Louis XIV ?", "72 ans", "10 ans", "30 ans", "De 1643 à 1715 : un record ! Il était devenu roi à quatre ans, et a eu pour ministre Colbert."],
  [3, "Quel roi des Francs s’est converti au christianisme ?", "Clovis", "Charlemagne", "Louis XVI", "Clovis, roi des Francs vers 500, s’est fait baptiser. Les rois de France allaient ensuite être sacrés à Reims."],
  [3, "En quelle année Louis XVI a-t-il été guillotiné ?", "1793", "1789", "1804", "Devenu simple citoyen, il est jugé et guillotiné place de la Révolution, aujourd’hui place de la Concorde."],
  [3, "Quel est le premier empereur romain ?", "Auguste", "Jules César", "Néron", "Auguste règne dès 27 av. J.-C. Le mois d’août porte son nom, comme juillet celui de César."],
  [3, "Quelle bataille a opposé les Grecs aux Perses en 490 av. J.-C. ?", "Marathon", "Alésia", "Waterloo", "Selon la légende, un messager aurait couru jusqu’à Athènes annoncer la victoire : d’où le marathon !"],
  [3, "Quelle découverte a eu lieu en 1799 pendant l’expédition de Bonaparte en Égypte ?", "La pierre de Rosette", "Le tombeau de Toutânkhamon", "Les grottes de Lascaux", "Elle a permis de comprendre les hiéroglyphes. Le tombeau de Toutânkhamon, lui, a été trouvé en 1922."],
  [3, "Quel homme a fait abolir définitivement l’esclavage en France en 1848 ?", "Victor Schœlcher", "Napoléon Bonaparte", "Louis XIV", "Schœlcher, sous-secrétaire d’État, a fait signer le décret d’abolition le 27 avril 1848."],
  [3, "Quelles lois de 1881-1882 ont rendu l’école gratuite et obligatoire ?", "Les lois de Jules Ferry", "Les lois de Colbert", "Les lois de Napoléon", "Jules Ferry voulait que tous les enfants, filles comme garçons, apprennent à lire et à écrire."],
  [3, "Quel appel a lancé le général de Gaulle le 18 juin 1940 ?", "Continuer la lutte contre l’Allemagne", "Fêter la paix", "Fermer les écoles", "Depuis Londres, à la radio de la BBC, il a appelé les Français à ne pas abandonner le combat."],
  [3, "Quelle date marque le débarquement allié en Normandie ?", "Le 6 juin 1944", "Le 11 novembre 1918", "Le 14 juillet 1789", "Appelé le « Jour J », il a permis de libérer progressivement la France de l’occupation."],
  [3, "Quel fut le premier satellite artificiel de la Terre ?", "Spoutnik 1", "Apollo 11", "Hubble", "Lancé par l’URSS en 1957, il faisait « bip-bip » et faisait à peine la taille d’un ballon de plage."],
  [3, "Quelle savante a reçu deux prix Nobel dans deux sciences différentes ?", "Marie Curie", "Jeanne d’Arc", "Cléopâtre", "Marie Curie a reçu le Nobel de physique en 1903 et celui de chimie en 1911, pour ses travaux sur la radioactivité."]
]);

const GRANDS_VF = vf([
  [1, "Louis XIV a été guillotiné.", false, "C’est Louis XVI qui a été guillotiné en 1793. Louis XIV est mort dans son lit à Versailles, en 1715."],
  [1, "Les Romains ont construit les pyramides d’Égypte.", false, "Les pyramides sont bien plus anciennes que Rome. Les Égyptiens ont construit la plus grande il y a environ 4 500 ans."],
  [1, "Le premier homme dans l’espace était américain.", false, "C’était le Soviétique Youri Gagarine, en 1961. Le premier Américain sur la Lune est arrivé huit ans plus tard."],
  [1, "Apollo 11 a posé les premiers hommes sur la Lune en 1969.", true, "Neil Armstrong et Buzz Aldrin ont marché sur la Lune, pendant que Michael Collins les attendait en orbite."],
  [1, "Jeanne d’Arc est morte à Rouen en 1431.", true, "Jeanne d’Arc avait environ 19 ans. Elle a été réhabilitée plus tard, puis canonisée en 1920."],
  [2, "Napoléon était très petit, bien plus petit que les autres hommes.", false, "Il mesurait environ 1,68 m, ce qui était dans la moyenne de l’époque. Les soldats de sa garde étaient très grands !"],
  [2, "Napoléon est mort en exil, sur l’île de Sainte-Hélène.", true, "Il y a été envoyé par les Anglais après Waterloo, et il y est mort en 1821."],
  [2, "La guerre de Cent Ans a duré exactement 100 ans.", false, "Elle a duré 116 ans, de 1337 à 1453. Son nom est donc un arrondi."],
  [2, "Charlemagne a été couronné empereur en l’an 1000.", false, "Son couronnement date de l’an 800, à Rome. L’an 1000 est deux siècles plus tard."],
  [2, "Les croisés partaient vers Jérusalem.", true, "Les croisades étaient des expéditions militaires et religieuses lancées à partir de 1096."],
  [2, "Le premier satellite artificiel, Spoutnik, a été lancé en 1957.", true, "Son lancement par l’URSS a marqué le début de la conquête spatiale."],
  [2, "L’armistice de la Première Guerre mondiale a été signé le 8 mai 1945.", false, "L’armistice de 1914-1918 date du 11 novembre 1918. Le 8 mai 1945 marque la fin de la guerre en Europe."],
  [2, "Athènes est considérée comme le berceau de la démocratie.", true, "Les citoyens athéniens votaient eux-mêmes les lois sur la colline de la Pnyx. Mais les femmes et les esclaves ne votaient pas."],
  [2, "Sparte était surtout célèbre pour ses philosophes et son théâtre.", false, "Sparte était une cité de guerriers. La philosophie et le théâtre ont surtout brillé à Athènes."],
  [2, "La statue de la Liberté a été offerte par la France aux États-Unis.", true, "Elle a été inaugurée en 1886. Son ossature intérieure a été conçue par Gustave Eiffel."],
  [2, "La tour Eiffel a été construite pour l’Exposition universelle de 1889.", true, "Elle devait être démontée après 20 ans, mais elle servait d’antenne radio, donc on l’a gardée."],
  [2, "Le Code civil a été créé sous Louis XIV.", false, "Le Code civil, appelé aussi Code Napoléon, date de 1804. Il est encore à la base du droit français."],
  [3, "Le 14 juillet 1789, il n’y avait que sept prisonniers dans la Bastille.", true, "La Bastille symbolisait l’arbitraire du roi. Les Parisiens y cherchaient surtout de la poudre pour leurs armes."],
  [3, "Cléopâtre a vécu plus près de nous que de la construction de la pyramide de Khéops.", true, "La pyramide date d’environ 2 500 av. J.-C. et Cléopâtre est morte en 30 av. J.-C. Nous sommes à 2 000 ans d’elle."],
  [3, "Vercingétorix a gagné la bataille d’Alésia contre César.", false, "Il a perdu, assiégé dans la ville. Mais il avait gagné avant à Gergovie, une victoire gauloise."],
  [3, "Léonard de Vinci est mort en France, à Amboise.", true, "Invité par François Ier, il y a vécu ses dernières années et y est mort en 1519."],
  [3, "Le Pont du Gard est un aqueduc construit par les Romains.", true, "Il amenait l’eau jusqu’à Nîmes. Il se tient debout depuis près de 2 000 ans, sans ciment !"],
  [3, "Les Jeux olympiques modernes ont été recréés en 1896 à Athènes.", true, "Pierre de Coubertin a relancé l’idée des Jeux antiques."],
  [3, "Marie Curie a reçu deux prix Nobel.", true, "Un prix Nobel de physique, partagé en 1903, et un prix Nobel de chimie en 1911."]
]);

const FRISE = [
  { title: "De la pyramide à la chute de Rome", level: 3, events: [
    { label: "Construction de la pyramide de Khéops", year: -2500, date: "vers 2500 av. J.-C." },
    { label: "Premiers Jeux olympiques antiques", year: -776, date: "776 av. J.-C." },
    { label: "Bataille de Marathon", year: -490, date: "490 av. J.-C." },
    { label: "Défaite de Vercingétorix à Alésia", year: -52, date: "52 av. J.-C." },
    { label: "Auguste, premier empereur romain", year: -27, date: "27 av. J.-C." },
    { label: "Fin de l’Empire romain d’Occident", year: 476, date: "476" }
  ] },
  { title: "Le Moyen Âge", level: 2, events: [
    { label: "Charlemagne devient empereur", year: 800, date: "800" },
    { label: "Début des croisades", year: 1096, date: "1096" },
    { label: "Début de la guerre de Cent Ans", year: 1337, date: "1337" },
    { label: "Arrivée de la peste noire en Europe", year: 1347, date: "1347" },
    { label: "Mort de Jeanne d’Arc", year: 1431, date: "1431" },
    { label: "Fin de la guerre de Cent Ans", year: 1453, date: "1453" }
  ] },
  { title: "La Renaissance et les grandes découvertes", level: 3, events: [
    { label: "Gutenberg imprime la Bible", year: 1455, date: "vers 1455" },
    { label: "Christophe Colomb arrive en Amérique", year: 1492, date: "1492" },
    { label: "Vasco de Gama atteint l’Inde", year: 1498, date: "1498" },
    { label: "Victoire de François Ier à Marignan", year: 1515, date: "1515" },
    { label: "Départ de l’expédition de Magellan", year: 1519, date: "1519" },
    { label: "Fin du premier tour du monde", year: 1522, date: "1522" }
  ] },
  { title: "La Révolution et l’Empire", level: 2, events: [
    { label: "Prise de la Bastille", year: 1789, date: "1789" },
    { label: "Proclamation de la Ire République", year: 1792, date: "1792" },
    { label: "Mort de Louis XVI", year: 1793, date: "1793" },
    { label: "Sacre de Napoléon Ier", year: 1804, date: "1804" },
    { label: "Campagne de Russie", year: 1812, date: "1812" },
    { label: "Défaite de Napoléon à Waterloo", year: 1815, date: "1815" }
  ] },
  { title: "Le XIXe siècle en France", level: 3, events: [
    { label: "Abolition de l’esclavage", year: 1848, date: "1848" },
    { label: "Napoléon III devient empereur", year: 1852, date: "1852" },
    { label: "Lois de Jules Ferry sur l’école", year: 1882, date: "1882" },
    { label: "Premier vaccin de Pasteur contre la rage", year: 1885, date: "1885" },
    { label: "Construction de la tour Eiffel", year: 1889, date: "1889" },
    { label: "Première séance de cinéma des Lumière", year: 1895, date: "1895" }
  ] },
  { title: "Les deux guerres mondiales", level: 2, events: [
    { label: "Début de la Première Guerre mondiale", year: 1914, date: "1914" },
    { label: "Armistice du 11 novembre", year: 1918, date: "1918" },
    { label: "Début de la Seconde Guerre mondiale", year: 1939, date: "1939" },
    { label: "Appel du 18 juin du général de Gaulle", year: 1940, date: "1940" },
    { label: "Débarquement en Normandie", year: 1944, date: "1944" },
    { label: "Fin de la guerre en Europe", year: 1945, date: "1945" }
  ] },
  { title: "La conquête spatiale", level: 1, events: [
    { label: "Spoutnik, premier satellite artificiel", year: 1957, date: "1957" },
    { label: "Youri Gagarine, premier homme dans l’espace", year: 1961, date: "1961" },
    { label: "Premiers pas sur la Lune", year: 1969, date: "1969" },
    { label: "Premier vol de la navette spatiale", year: 1981, date: "1981" },
    { label: "Début de l’assemblage de l’ISS", year: 1998, date: "1998" },
    { label: "Premiers occupants permanents de l’ISS", year: 2000, date: "2000" }
  ] }
];

export const HISTOIRE = {
  moyens: { quiz: MOYENS_QUIZ, vf: MOYENS_VF },
  grands: { quiz: GRANDS_QUIZ, vf: GRANDS_VF, frise: FRISE }
};
