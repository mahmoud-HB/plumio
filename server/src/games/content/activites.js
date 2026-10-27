// Contenus des jeux d'activité : chasse au trésor, bingo, énigmes, défis (voir test/content.test.js).
const CHASSE_PETITS = {
  generic: [
    'Trouve quelque chose de rouge.',
    'Trouve quelque chose de bleu.',
    'Trouve quelque chose de jaune.',
    'Trouve quelque chose de vert.',
    'Trouve quelque chose de tout doux.',
    'Trouve quelque chose de rond.',
    'Trouve une feuille et rapporte-la.',
    'Trouve un petit caillou lisse.',
    'Trouve ton doudou préféré.',
    'Trouve une chaussette et rapporte-la.',
    'Compte tes doigts de la main : 1, 2, 3, 4, 5 !',
    'Saute trois fois comme une grenouille.',
    'Marche à quatre pattes comme un chat.',
    'Fais un gros câlin à quelqu’un.',
    'Trouve quelque chose qui fait du bruit.',
    'Trouve quelque chose de plus grand que toi.',
    'Trouve quelque chose de tout petit.',
    'Regarde le ciel : vois-tu un nuage ?',
    'Trouve une fleur et sens-la doucement.',
    'Trouve un livre avec des images.',
    'Trouve un jouet qui roule.',
    'Touche quelque chose de rugueux.',
    'Fais le tour d’un arbre en sautillant.',
    'Trouve deux objets de la même couleur.',
    'Cherche un insecte sans le toucher.',
    'Montre-moi ta plus belle grimace !'
  ],
  themed: {
    space: ['Trouve quelque chose de rond comme la Lune.', 'Fais une fusée avec tes bras et dis 3, 2, 1, partez !', 'Trouve quelque chose de jaune comme le Soleil.', 'Marche comme un astronaute, tout doucement.', 'Dessine une étoile avec ton doigt dans l’air.', 'Trouve un objet qui brille comme une étoile.'],
    forest: ['Trouve une feuille et rapporte-la.', 'Cherche quelque chose de marron comme un tronc.', 'Marche sur la pointe des pieds comme une souris.', 'Fais le cri du hibou : hou-hou !', 'Trouve un petit bâton et rapporte-le.', 'Trouve quelque chose de vert comme la forêt.'],
    pirates: ['Trouve quelque chose de doré comme un trésor.', 'Dis « Ohé, moussaillon ! » bien fort.', 'Fais un cache-œil avec ta main.', 'Cherche un coffre : une boîte ou un panier.', 'Marche comme un pirate : pas lourds, pas lourds !', 'Cache un jouet, puis dis où il est.'],
    heroes: ['Prends la pose d’un super-héros !', 'Trouve quelque chose pour faire une cape.', 'Cours sur place comme un héros très rapide.', 'Aide quelqu’un à ranger un jouet.', 'Fais ton plus grand sourire de héros.', 'Trouve quelque chose de rouge pour ton costume.'],
    unicorns: ['Trouve quelque chose de rose.', 'Galope comme une licorne dans la pièce.', 'Trouve quelque chose qui brille.', 'Fais pousser une corne avec ton doigt sur ton front.', 'Trouve quelque chose de tout doux.', 'Dessine un arc-en-ciel avec ton doigt dans l’air.'],
    dinos: ['Fais le cri du dinosaure : Rooaar !', 'Marche à grands pas comme un gros dinosaure.', 'Trouve quelque chose de vert comme un dino.', 'Trouve un gros caillou, un œuf de dino !', 'Cherche un jouet avec quatre pattes.', 'Fais de grands bras comme un ptérodactyle.'],
    ocean: ['Trouve quelque chose de bleu comme la mer.', 'Nage comme un poisson dans le salon.', 'Trouve un objet qui flotte dans l’eau du bain.', 'Fais des bulles avec ta bouche : blub, blub !', 'Marche de côté comme un crabe.', 'Trouve un coquillage ou quelque chose de rond.'],
    knights: ['Trouve quelque chose pour faire un bouclier.', 'Fais une révérence de chevalier.', 'Galope sur un cheval imaginaire.', 'Trouve un coussin pour le château.', 'Dis « Je suis un brave chevalier ! » bien fort.', 'Trouve quelque chose de gris comme une armure.'],
    safari: ['Fais le rugissement du lion : Grrr !', 'Marche lentement comme un éléphant.', 'Trouve quelque chose à rayures.', 'Trouve quelque chose de jaune comme le lion.', 'Saute comme un singe, ou-ou-ou !', 'Cherche un animal en peluche.'],
    robots: ['Marche comme un robot : bip, bip !', 'Parle comme un robot : « Bon-jour ! »', 'Trouve quelque chose de gris ou en métal.', 'Trouve quelque chose avec des boutons.', 'Compte tes doigts comme un robot.', 'Tourne la tête comme un robot, doucement.'],
    circus: ['Fais un grand saut de clown !', 'Marche sur une ligne droite comme un équilibriste.', 'Trouve quelque chose de rouge comme un nez de clown.', 'Fais une grimace de clown.', 'Fais une roulade sur un tapis doux.', 'Trouve trois balles ou trois objets à tenir.'],
    mystery: ['Trouve quelque chose de caché sous un coussin.', 'Marche sur la pointe des pieds sans bruit.', 'Trouve un objet qui ouvre quelque chose.', 'Chuchote ton nom à l’oreille de quelqu’un.', 'Trouve quelque chose de noir.', 'Regarde bien : trouve un petit objet qui a bougé.'],
    fairies: ['Fais voler tes bras comme des ailes de fée.', 'Trouve quelque chose qui brille.', 'Trouve une jolie fleur et sens-la.', 'Fais tourner une baguette magique imaginaire.', 'Trouve quelque chose de rose ou de violet.', 'Danse comme une fée pendant dix secondes.'],
    polar: ['Trouve quelque chose de blanc comme la neige.', 'Marche comme un pingouin, tout dandinant.', 'Trouve quelque chose de tout doux comme un ours.', 'Fais « Brrr, il fait froid ! » en frissonnant.', 'Trouve quelque chose de bleu comme la glace.', 'Glisse en chaussettes comme sur la glace.'],
    sports: ['Fais cinq sauts à pieds joints.', 'Cours jusqu’au bout du couloir et reviens.', 'Trouve un ballon ou quelque chose de rond.', 'Lance doucement une chaussette dans un panier.', 'Lève les bras comme un champion !', 'Fais trois grands pas de géant.'],
    bakery: ['Trouve quelque chose de rond comme un gâteau.', 'Fais semblant de pétrir la pâte.', 'Trouve quelque chose de jaune comme le beurre.', 'Mets la table pour le goûter.', 'Fais semblant de souffler sur des bougies.', 'Trouve un bol ou une cuillère en bois.']
  }
};
const CHASSE_MOYENS = {
  generic: [
    'Trouve cinq objets de couleurs différentes et aligne-les.',
    'Rapporte trois choses qui commencent par la lettre M.',
    'Trouve un objet plus lourd qu’un livre et un plus léger.',
    'Compte les fenêtres de ta maison ou de ton étage.',
    'Rapporte quelque chose qui a une forme de triangle.',
    'Trouve trois choses douces au toucher et trois rugueuses.',
    'Observe un insecte pendant une minute et dessine-le.',
    'Trouve une feuille et dessine-la en détail.',
    'Mime ton animal préféré pour que quelqu’un le devine.',
    'Rapporte un objet qui sert à écrire ou à dessiner.',
    'Trouve quelque chose qui commence par ta première lettre.',
    'Compte le nombre de marches ou de pas jusqu’à la porte.',
    'Trouve un objet plus petit que ta main.',
    'Écoute en silence et note trois bruits que tu entends.',
    'Trouve cinq choses vertes dans le jardin ou la maison.',
    'Cherche quelque chose qui a des rayures ou des pois.',
    'Prépare une petite devinette sur un objet de la pièce.',
    'Trouve un objet qui peut faire de la musique.',
    'Trouve deux objets qui vont ensemble, comme une paire.',
    'Écris ton prénom avec des objets alignés par terre.',
    'Cherche trois choses rondes et trois carrées.',
    'Trouve un nuage et dis à quoi il ressemble.',
    'Cherche l’objet le plus ancien de la maison, avec un adulte.',
    'Fais un mini-spectacle de trente secondes avec un jouet.',
    'Trouve quelque chose de plus grand que toi.',
    'Compte combien de portes il y a dans la maison.'
  ],
  themed: {
    space: ['Dessine une planète imaginaire et donne-lui un nom.', 'Trouve cinq objets ronds comme des planètes.', 'Invente un message pour les extraterrestres, {name}.', 'Construis une fusée avec des coussins ou des cartons.', 'Compte à rebours de dix à zéro, puis décolle !', 'Trouve un objet qui brille comme une étoile.'],
    forest: ['Rapporte trois feuilles de formes différentes.', 'Trouve un arbre et touche son écorce.', 'Cherche trois traces ou signes de petits animaux.', 'Écoute les oiseaux et compte combien tu en entends.', 'Fabrique un petit nid avec des brindilles ou du tissu.', 'Trouve quelque chose de brun, de vert et de jaune.'],
    pirates: ['Dessine une carte au trésor de ta chambre.', 'Cache un « trésor » et fais-le chercher par un adulte.', 'Trouve dix objets dorés ou jaunes pour ton butin.', 'Invente un nom de pirate pour toi et pour ta famille.', 'Fabrique un drapeau pirate avec une feuille.', 'Trouve un « coffre » : une boîte pour ranger ton trésor.'],
    heroes: ['Invente un super-pouvoir et mime-le.', 'Fabrique une cape ou un masque avec ce que tu trouves.', 'Aide un adulte avec une petite tâche de la maison.', 'Invente un nom de héros et dessine ton emblème.', 'Rapporte un objet qui pourrait servir à un héros.', 'Fais trois exercices de super-héros : sauts, étirements, course.'],
    unicorns: ['Dessine une licorne avec une corne magique.', 'Trouve cinq objets de couleurs d’arc-en-ciel.', 'Invente un nom pour ta licorne et décris-la.', 'Fabrique une couronne de fleurs en papier.', 'Trouve quelque chose qui brille ou scintille.', 'Fais un parcours de galop autour de la maison.'],
    dinos: ['Dessine ton dinosaure préféré avec ses dents ou ses cornes.', 'Trouve un caillou qui ressemble à un œuf de dino.', 'Imite le cri et la marche d’un dinosaure.', 'Trouve une feuille géante pour un herbivore.', 'Fais une empreinte de dinosaure avec ta main.', 'Compte combien de jouets à quatre pattes tu as.'],
    ocean: ['Dessine un poisson avec trois couleurs.', 'Trouve cinq choses bleues autour de toi.', 'Fabrique un bateau en papier.', 'Imite trois animaux marins : poisson, crabe, pieuvre.', 'Trouve un objet qui flotte, avec un adulte à côté.', 'Dessine une carte de l’océan avec une île au trésor.'],
    knights: ['Fabrique un bouclier avec du carton ou du papier.', 'Construis un château avec des coussins ou des cubes.', 'Écris une lettre au roi ou à la reine.', 'Invente ton nom de chevalier ou de princesse.', 'Trouve trois objets gris comme une armure.', 'Fais un défilé royal à travers la maison.'],
    safari: ['Dessine un animal de la savane sans lever le crayon.', 'Trouve trois objets avec des rayures ou des taches.', 'Imite un lion, un éléphant et un singe.', 'Fabrique des jumelles avec des rouleaux de papier.', 'Compte tous les animaux en peluche de la maison.', 'Observe un oiseau ou un insecte comme un explorateur.'],
    robots: ['Dessine un robot avec trois boutons et deux antennes.', 'Parle comme un robot pendant une minute.', 'Trouve cinq objets en métal ou en plastique.', 'Donne des ordres de robot à un adulte : « Avance de deux pas ! »', 'Construis un robot avec des boîtes en carton.', 'Compte les boutons ou interrupteurs de la pièce.'],
    circus: ['Jongle avec deux écharpes ou deux chaussettes.', 'Invente un numéro de clown de trente secondes.', 'Marche en équilibre sur une ligne tracée au sol.', 'Fabrique un nez de clown avec du papier.', 'Annonce ton spectacle : « Mesdames et messieurs… »', 'Trouve trois objets pour ton numéro de cirque.'],
    mystery: ['Cache un objet et écris trois indices pour le trouver.', 'Observe une pièce vingt secondes, puis dis ce qui a changé.', 'Écris ton prénom en code, avec des chiffres pour les lettres.', 'Trouve un objet qui commence par chaque lettre de « CLÉ ».', 'Suis une série de flèches dessinées pour trouver un secret.', 'Invente une énigme sur un objet de la maison.'],
    fairies: ['Dessine une fée avec ses ailes et sa baguette.', 'Trouve cinq fleurs ou cinq choses de couleur pastel.', 'Fabrique une baguette magique avec un bâton et du papier.', 'Invente un sort rigolo : « Abracadabra, deviens… »', 'Construis une petite maison de fée avec des feuilles.', 'Fais pousser une fleur magique en la dessinant.'],
    polar: ['Trouve cinq objets blancs dans la maison.', 'Dessine un ours polaire et un pingouin.', 'Mime la marche d’un pingouin et d’un phoque.', 'Fabrique un flocon de neige en papier.', 'Construis un igloo de coussins.', 'Trouve quelque chose de glacé dans le congélateur, avec un adulte.'],
    sports: ['Fais dix sauts et dix étirements.', 'Invente un nouveau sport avec un ballon ou une chaussette.', 'Réussis trois lancers dans un panier ou un seau.', 'Chronomètre ton tour de la maison en courant.', 'Trouve un objet qui roule et un qui rebondit.', 'Dessine un trophée et remets-le à un champion de la famille.'],
    bakery: ['Dessine le gâteau de tes rêves.', 'Trouve cinq objets pour préparer une recette.', 'Compte combien de cuillères tu as dans le tiroir.', 'Prépare une pâte à modeler et fais-en des gâteaux.', 'Écris le menu de la boulangerie de ta famille.', 'Aide à mettre la table pour le goûter.']
  }
};
const CHASSE_GRANDS = {
  generic: [
    'Trouve cinq objets dont le nom contient la lettre R.',
    'Cherche trois objets en bois, trois en métal et trois en tissu.',
    'Mesure la longueur de ta chambre en pas, puis en pieds.',
    'Trouve un objet qui a plus de dix ans, avec l’aide d’un adulte.',
    'Observe un arbre pendant deux minutes et décris-le en trois phrases.',
    'Écris un mot de sept lettres à partir de quelque chose que tu vois.',
    'Trouve un objet pour chaque couleur de l’arc-en-ciel.',
    'Écoute le silence pendant une minute et liste les bruits.',
    'Cherche un objet qui commence par chaque lettre de ton prénom.',
    'Trouve cinq choses symétriques dans la maison ou le jardin.',
    'Fais un croquis d’un coin de jardin ou de pièce en trois minutes.',
    'Compte les arbres, les fleurs ou les plantes que tu vois depuis la porte.',
    'Mime un métier pour que la famille le devine.',
    'Trouve quelque chose de plus ancien que tes parents.',
    'Rapporte trois objets qui ont une forme géométrique différente.',
    'Estime combien de pas il y a jusqu’au portail, puis vérifie.',
    'Trouve un objet qui peut servir à deux choses différentes.',
    'Invente un nouveau nom drôle pour un objet de la maison.',
    'Écris une devinette sur un objet et fais-la deviner.',
    'Photographie ou dessine trois textures différentes.',
    'Trouve la plus petite et la plus grande chose de la pièce.',
    'Cherche trois objets qui font des sons différents.',
    'Observe où va le soleil et indique le sud avec un adulte.',
    'Compte les carreaux ou les dalles d’une pièce ou du jardin.',
    'Trouve un objet qui commence et finit par la même lettre.',
    'Raconte en une minute l’histoire d’un objet de la maison.'
  ],
  themed: {
    space: ['Dessine une constellation inventée avec huit étoiles.', 'Calcule ton poids en kilos, puis cherche des objets de même poids.', 'Écris un journal de bord de ton voyage dans l’espace.', 'Invente une planète avec son nom, son climat et ses habitants.', 'Construis une station spatiale avec des objets de la maison.', 'Repère le Soleil ou la Lune dans le ciel et décris sa position.'],
    forest: ['Identifie trois arbres différents à leurs feuilles.', 'Trouve cinq choses naturelles et classe-les par taille.', 'Cherche trois traces de vie animale : plumes, trous, toiles.', 'Dessine une feuille et son nervurage avec précision.', 'Invente un animal de la forêt avec ses habitudes.', 'Compte les sons d’oiseaux que tu entends en deux minutes.'],
    pirates: ['Dessine une carte au trésor avec légende et échelle.', 'Cache un trésor et écris un parcours de sept indices.', 'Rédige un vrai message codé avec un alphabet inventé.', 'Invente le règlement de ton équipage en cinq articles.', 'Estime la distance du « trésor » à ton point de départ.', 'Trouve dix objets pour remplir ton coffre de pirate.'],
    heroes: ['Invente un super-héros : nom, pouvoir et point faible.', 'Écris la première page de sa bande dessinée.', 'Fais une bonne action discrète pour quelqu’un de la maison.', 'Trouve quatre objets qui pourraient servir de gadgets.', 'Dessine l’emblème de ton équipe de héros.', 'Rédige le serment du héros en trois phrases.'],
    unicorns: ['Invente un royaume magique et dessine sa carte.', 'Écris un conte de licorne en cinq phrases.', 'Trouve sept objets pour les sept couleurs de l’arc-en-ciel.', 'Fabrique une corne de licorne en papier roulé.', 'Invente trois potions magiques sans danger, juste dessinées.', 'Compose un poème de quatre vers sur une licorne.'],
    dinos: ['Dessine un dinosaure inventé et donne-lui un nom latin.', 'Mesure ta chambre en « dinos » de trois mètres.', 'Trouve des traces ou formes qui ressemblent à des fossiles.', 'Classe tes jouets en carnivores, herbivores et autres.', 'Écris la fiche d’identité de ton dinosaure préféré.', 'Imagine une journée dans la vie d’un tricératops.'],
    ocean: ['Dessine un animal marin et écris trois infos sur lui.', 'Compte et classe cinq objets selon leur capacité à flotter.', 'Écris un message dans une bouteille imaginaire.', 'Invente un monstre marin sympathique.', 'Fabrique un bateau en papier et teste-le dans une bassine.', 'Dessine les couches de l’océan, de la surface au fond.'],
    knights: ['Dessine ton blason avec trois symboles personnels.', 'Écris le serment d’un chevalier en quatre phrases.', 'Construis un château avec des coussins et un plan.', 'Rédige une lettre au roi pour demander une mission.', 'Invente un tournoi avec trois épreuves sûres.', 'Écris le nom de ta lance imaginaire et son histoire.'],
    safari: ['Dessine un animal d’Afrique avec son habitat.', 'Observe des animaux dehors et note leurs comportements.', 'Fabrique des jumelles et fais un relevé des oiseaux.', 'Trouve cinq objets avec des motifs d’animaux.', 'Écris une fiche d’expédition : matériel, route, dangers.', 'Imite le déplacement de trois animaux différents.'],
    robots: ['Écris un programme de cinq ordres pour guider un adulte à un objet.', 'Dessine un robot avec le rôle de chaque pièce.', 'Trouve cinq objets qui fonctionnent à l’électricité sans y toucher.', 'Invente un robot qui aide à ranger la maison.', 'Écris en binaire ton prénom avec des 0 et des 1 inventés.', 'Construis un robot en carton et donne-lui un nom.'],
    circus: ['Invente un numéro de magie sans danger et présente-le.', 'Prépare l’affiche de ton spectacle de cirque.', 'Jongle avec deux objets mous et compte tes réussites.', 'Invente un clown avec son nom, son costume et sa blague.', 'Monte un mini-spectacle de trois numéros.', 'Mime un numéro de cirque sans parler.'],
    mystery: ['Écris un message codé avec le code de César et fais-le déchiffrer.', 'Crée une enquête : un objet disparu et trois suspects.', 'Cache un objet et rédige cinq indices de plus en plus précis.', 'Observe une pièce trente secondes et note dix détails.', 'Écris un message qui se lit dans un miroir.', 'Invente une énigme dont la réponse est un objet du salon.'],
    fairies: ['Invente une fée avec son nom, son pouvoir et son royaume.', 'Écris la recette d’une potion magique imaginaire.', 'Dessine la carte du royaume des fées.', 'Fabrique un petit jardin de fées avec des éléments naturels.', 'Écris un conte de fée en cinq phrases.', 'Invente trois sortilèges rigolos.'],
    polar: ['Dessine un animal polaire et son adaptation au froid.', 'Cherche pourquoi la glace flotte, avec un adulte et un verre d’eau.', 'Fabrique un flocon en papier à six branches.', 'Écris le journal d’un explorateur polaire.', 'Compare cinq objets : lequel est le plus froid au toucher ?', 'Construis un igloo avec des coussins et un plan.'],
    sports: ['Invente un sport avec règles, score et arbitre.', 'Chronomètre trois exercices et compare tes temps.', 'Organise un mini-tournoi en famille.', 'Dessine l’affiche des jeux de la maison.', 'Compte tes pas en un tour du jardin et note le résultat.', 'Prépare un échauffement en cinq mouvements.'],
    bakery: ['Écris une recette inventée avec ingrédients et étapes.', 'Mesure combien de cuillères remplissent un bol, avec un adulte.', 'Dessine la vitrine d’une boulangerie avec les prix.', 'Joue au boulanger : prends les commandes de la famille.', 'Compte combien de sortes de farine ou de sucre il y a, avec un adulte.', 'Invente le nom et la forme d’un nouveau gâteau.']
  }
};
export const CHASSE = { petits: CHASSE_PETITS, moyens: CHASSE_MOYENS, grands: CHASSE_GRANDS };
export const BINGO = {
  petits: [
    'une coccinelle', 'un nuage', 'un oiseau', 'une fleur jaune', 'une fleur rouge', 'un chien', 'un chat', 'un papillon',
    'un arbre', 'une voiture rouge', 'un camion', 'un vélo', 'une feuille', 'un caillou', 'un escargot', 'une fourmi',
    'le soleil', 'un avion', 'une maison', 'une porte bleue', 'un ballon', 'un banc', 'une poussette', 'un bus',
    'de l’herbe', 'une abeille', 'un enfant qui rit', 'une grenouille', 'un pigeon', 'une mouche', 'une flaque', 'un toboggan'
  ],
  moyens: [
    'une coccinelle', 'un nuage en forme de cœur', 'un oiseau qui chante', 'une fleur violette', 'une voiture bleue', 'un papillon blanc',
    'une feuille en forme de cœur', 'un escargot', 'une toile d’araignée', 'un avion dans le ciel', 'un panneau rond', 'une plaque d’égout',
    'un chien avec sa laisse', 'un chat sur un mur', 'une bicyclette', 'un arbre fruitier', 'une pomme de pin', 'un champignon',
    'une abeille sur une fleur', 'un nid d’oiseau', 'un écureuil', 'une trace dans la boue', 'un arc-en-ciel', 'un drapeau',
    'un facteur ou une facteuse', 'une boîte aux lettres', 'une cheminée', 'un ver de terre', 'un pissenlit', 'un banc vert',
    'une ombre rigolote', 'une plume', 'un bourdon', 'un tracteur', 'un lampadaire'
  ],
  grands: [
    'un nuage en forme d’animal', 'un panneau triangulaire', 'une porte au numéro pair', 'un arbre toujours vert', 'un insecte à six pattes',
    'une toile d’araignée', 'un oiseau de proie', 'une plaque commémorative', 'une cheminée qui fume', 'une horloge ou un cadran',
    'une fleur à cinq pétales', 'un lichen sur un mur', 'une graine ailée', 'un avion et sa traînée', 'une enseigne de magasin',
    'une rue au nom d’arbre', 'un nid ou un abri d’oiseau', 'une pierre avec des fossiles', 'un mot en langue étrangère', 'une girouette',
    'un pont ou une passerelle', 'un chat au pelage tricolore', 'un papillon de nuit', 'une plante grimpante', 'une empreinte d’animal',
    'une voiture électrique', 'un reflet dans une vitre', 'un symbole sur un panneau', 'un arbre plus vieux que toi', 'un objet de plus de cent ans',
    'une cloche ou un carillon', 'un nuage en forme de chiffre', 'un drapeau à trois couleurs', 'une mousse verte', 'une ombre étonnante'
  ]
};
export const ESCAPE = {
  moyens: [
    {
      title: 'Le secret de la forêt', intro: 'Tu es perdu dans la forêt enchantée, {name} ! Résous les 5 énigmes pour trouver le mot de passe de la sortie.', level: 1, code: 'FORET',
      riddles: [
        { text: 'Je suis fait avec du lait, les souris m’adorent et j’ai parfois des trous. Que suis-je ?', answer: 'FROMAGE', why: 'Le fromage est fait avec du lait et certains, comme l’emmental, ont des trous.' },
        { text: 'Je n’ai ni porte ni fenêtre, mais un poussin peut sortir de chez moi. Que suis-je ?', answer: 'OEUF', why: 'Le poussin naît en cassant la coquille de son œuf.' },
        { text: 'Je suis ronde, je tourne et je fais avancer les vélos et les voitures. Que suis-je ?', answer: 'ROUE', why: 'Les vélos et les voitures avancent grâce à leurs roues.' },
        { text: 'Je répète ce que tu dis, mais on ne me voit pas. Crie dans la montagne et tu m’entends. Qui suis-je ?', answer: 'ECHO', why: 'L’écho renvoie les sons : c’est la voix qui rebondit.' },
        { text: 'Je porte une carapace dure, je vis très longtemps et, dans la fable, je bats le lièvre à la course.', answer: 'TORTUE', why: 'Dans la fable de La Fontaine, c’est la tortue qui gagne contre le lièvre.' }
      ]
    },
    {
      title: 'Le trésor de l’océan', intro: 'Un coffre est caché au fond de la mer, {name} ! Trouve les 5 réponses pour l’ouvrir avec le bon code.', level: 1, code: 'OCEAN',
      riddles: [
        { text: 'Je te suis partout quand il y a du soleil, mais je disparais dans le noir. Qui suis-je ?', answer: 'OMBRE', why: 'L’ombre se forme quand ton corps arrête la lumière du soleil.' },
        { text: 'J’ai des moustaches, je ronronne et je chasse les souris. Qui suis-je ?', answer: 'CHAT', why: 'Le chat a des moustaches, ronronne et chasse les souris.' },
        { text: 'Tu me bois chaque jour. Je suis transparente, je coule, et la mer est faite de moi. Qui suis-je ?', answer: 'EAU', why: 'L’eau est transparente, on la boit, et les mers en sont remplies.' },
        { text: 'Je butine les fleurs et je fabrique du miel. Qui suis-je ?', answer: 'ABEILLE', why: 'Ce sont les abeilles qui fabriquent le miel dans la ruche.' },
        { text: 'Quel nombre vient juste après huit ? Écris-le en lettres.', answer: 'NEUF', why: '8 + 1 = 9, qui s’écrit « neuf ».' }
      ]
    },
    {
      title: 'La panne du robot', intro: 'Le robot Bip est en panne, {name} ! Résous les 5 énigmes pour trouver son mot de réparation.', level: 1, code: 'ROBOT',
      riddles: [
        { text: 'Tu fais « ha ha ha ! » quand quelque chose est très drôle. Que fais-tu ?', answer: 'RIRE', why: 'On rit quand quelque chose nous amuse.' },
        { text: 'Je suis un fruit rond et juteux, et je porte le nom de ma couleur. On boit mon jus au petit-déjeuner.', answer: 'ORANGE', why: 'L’orange est à la fois un fruit et une couleur.' },
        { text: 'On me gonfle avec de l’air, je suis rond et je m’envole à la fête d’anniversaire. Que suis-je ?', answer: 'BALLON', why: 'Un ballon gonflé à l’hélium s’envole.' },
        { text: 'J’ai des plumes, des ailes et un bec, et je fais mon nid dans un arbre. Qui suis-je ?', answer: 'OISEAU', why: 'Plumes, ailes et bec : c’est un oiseau.' },
        { text: 'Je suis le nombre de côtés d’un triangle. Écris-moi en lettres.', answer: 'TROIS', why: 'Un triangle a trois côtés.' }
      ]
    },
    {
      title: 'L’atelier du magicien', intro: 'Le magicien a perdu sa formule, {name} ! Résous 5 énigmes pour retrouver le mot magique.', level: 2, code: 'MAGIE',
      riddles: [
        { text: 'Tu me regardes et tu vois ton visage, mais je ne suis pas une photo. Que suis-je ?', answer: 'MIROIR', why: 'Un miroir renvoie ton image.' },
        { text: 'J’ai un tronc, des branches, et mes feuilles tombent en automne. Que suis-je ?', answer: 'ARBRE', why: 'Un arbre a un tronc et des branches.' },
        { text: 'Je suis de l’eau gelée et, en été, tu me manges parfois en cornet. Que suis-je ?', answer: 'GLACE', why: 'La glace est de l’eau gelée, et c’est aussi un dessert.' },
        { text: 'Je suis une terre entourée d’eau de tous les côtés. Que suis-je ?', answer: 'ILE', why: 'Une île est entourée d’eau.' },
        { text: 'Je porte ma maison sur le dos et je laisse une traînée brillante en avançant. Qui suis-je ?', answer: 'ESCARGOT', why: 'L’escargot transporte sa coquille et laisse du mucus.' }
      ]
    },
    {
      title: 'Les clefs du château', intro: 'Le château est fermé à double tour, {name} ! Trouve les 5 réponses pour deviner le mot de passe.', level: 2, code: 'CLEFS',
      riddles: [
        { text: 'Je suis bleu le jour, noir la nuit, et je porte les nuages. Que suis-je ?', answer: 'CIEL', why: 'Le ciel change de couleur entre le jour et la nuit.' },
        { text: 'La nuit je brille, tantôt ronde tantôt en croissant, mais je ne suis pas une étoile. Qui suis-je ?', answer: 'LUNE', why: 'La Lune change de forme chaque semaine.' },
        { text: 'On y apprend à lire et à compter avec une maîtresse ou un maître. Qu’est-ce que c’est ?', answer: 'ECOLE', why: 'C’est à l’école qu’on apprend à lire et à compter.' },
        { text: 'Je suis en verre, on m’ouvre pour aérer, et on regarde dehors à travers moi. Que suis-je ?', answer: 'FENETRE', why: 'Une fenêtre est en verre et on l’ouvre pour aérer.' },
        { text: 'Combien font 3 + 4 ? Écris le résultat en lettres.', answer: 'SEPT', why: '3 + 4 = 7, qui s’écrit « sept ».' }
      ]
    },
    {
      title: 'La carte du renard', intro: 'Maître Renard a caché sa carte, {name} ! Résous les 5 énigmes pour trouver le mot qui la révèle.', level: 2, code: 'CARTE',
      riddles: [
        { text: 'Je galope, j’ai une crinière et on peut monter sur mon dos. Qui suis-je ?', answer: 'CHEVAL', why: 'Le cheval a une crinière et on le monte.' },
        { text: 'J’ai huit pattes et je tisse une toile pour attraper mes proies. Qui suis-je ?', answer: 'ARAIGNEE', why: 'Seule l’araignée a huit pattes et tisse une toile.' },
        { text: 'Je suis roux avec une queue en panache, et dans les fables on dit que je suis rusé. Qui suis-je ?', answer: 'RENARD', why: 'Le renard est roux et rusé dans les fables.' },
        { text: 'J’ai quatre pieds mais je ne marche pas, et on mange sur moi. Que suis-je ?', answer: 'TABLE', why: 'Une table a quatre pieds et ne bouge pas.' },
        { text: 'J’ai une trompe, de grandes oreilles, et je suis le plus grand animal terrestre. Qui suis-je ?', answer: 'ELEPHANT', why: 'L’éléphant a une trompe et de grandes oreilles.' }
      ]
    }
  ],
  grands: [
    {
      title: 'Sur la piste du voleur', intro: 'Un voleur a laissé des indices, {name} ! Résous 5 énigmes pour trouver le mot qui le démasque.', level: 2, code: 'TRACE',
      riddles: [
        { text: 'Plus on m’enlève de matière, plus je deviens grand. Que suis-je ?', answer: 'TROU', why: 'Plus on creuse un trou, plus il s’agrandit.' },
        { text: 'Lu à l’endroit ou à l’envers, je suis le même, et je repère les avions. Que suis-je ?', answer: 'RADAR', why: 'RADAR est un palindrome, et c’est un appareil qui détecte.' },
        { text: 'Je suis la saison qui suit l’été, quand les feuilles tombent. Quelle saison ?', answer: 'AUTOMNE', why: 'Après l’été vient l’automne.' },
        { text: 'Je n’ai ni début ni fin, aucun angle, et tous mes points sont à égale distance du centre.', answer: 'CERCLE', why: 'C’est la définition d’un cercle.' },
        { text: 'Jeu de plateau de 64 cases où l’on doit mettre le roi adverse échec et mat. Quel jeu ?', answer: 'ECHECS', why: 'Les échecs se jouent sur 64 cases.' }
      ]
    },
    {
      title: 'Mission agent secret', intro: 'Agent {name}, un code secret est caché dans cinq mots ! Résous les énigmes pour l’identifier.', level: 2, code: 'AGENT',
      riddles: [
        { text: 'Je commence par A, je finis par Z, et j’ai 26 lettres. Que suis-je ?', answer: 'ALPHABET', why: 'L’alphabet français compte 26 lettres de A à Z.' },
        { text: 'J’ai six cordes, une caisse en bois et un manche, et on me gratte. Quel instrument ?', answer: 'GUITARE', why: 'La guitare a six cordes et on la gratte.' },
        { text: 'Quand la Lune se place devant le Soleil, on assiste à ce phénomène. Lequel ?', answer: 'ECLIPSE', why: 'C’est une éclipse solaire.' },
        { text: 'Je flotte dans le ciel, fait de gouttelettes d’eau, et je deviens gris avant la pluie.', answer: 'NUAGE', why: 'Un nuage est un amas de gouttelettes d’eau.' },
        { text: 'Je suis la troisième planète à partir du Soleil, et tu vis dessus. Laquelle ?', answer: 'TERRE', why: 'Mercure, Vénus, puis la Terre.' }
      ]
    },
    {
      title: 'Le temps s’arrête', intro: 'L’horloge magique est bloquée, {name} ! Trouve les 5 réponses pour relancer le temps.', level: 2, code: 'TEMPS',
      riddles: [
        { text: 'On me colle sur une enveloppe pour qu’elle voyage. Que suis-je ?', answer: 'TIMBRE', why: 'Le timbre paie l’envoi d’une lettre.' },
        { text: 'Je brille dans le ciel avant que le tonnerre ne gronde. Que suis-je ?', answer: 'ECLAIR', why: 'On voit l’éclair avant d’entendre le tonnerre.' },
        { text: 'Quel jour de la semaine est entre mardi et jeudi ?', answer: 'MERCREDI', why: 'Lundi, mardi, mercredi, jeudi.' },
        { text: 'J’ai une base carrée et quatre faces triangulaires, et on me trouve en Égypte. Que suis-je ?', answer: 'PYRAMIDE', why: 'Une pyramide a une base carrée et des faces triangulaires.' },
        { text: 'Si tu dis mon nom, tu me brises. Que suis-je ?', answer: 'SILENCE', why: 'Dire « silence » casse le silence.' }
      ]
    },
    {
      title: 'La bibliothèque oubliée', intro: 'Une bibliothèque ancienne cache un mot secret, {name} ! Résous 5 énigmes pour l’ouvrir.', level: 3, code: 'LIVRE',
      riddles: [
        { text: 'Le Minotaure vivait dans moi et il est facile de s’y perdre. Que suis-je ?', answer: 'LABYRINTHE', why: 'Le Minotaure vivait dans le labyrinthe de Crète.' },
        { text: 'Je suis la maison de glace des Inuits. Quel est mon nom ?', answer: 'IGLOO', why: 'L’igloo est un abri en blocs de neige.' },
        { text: 'Montagne qui crache de la lave et de la fumée. Que suis-je ?', answer: 'VOLCAN', why: 'Un volcan rejette de la lave.' },
        { text: 'J’ai un lit mais ne dors jamais, des berges et une source. Je me jette dans un fleuve.', answer: 'RIVIERE', why: 'Une rivière a un lit et une source.' },
        { text: 'Petit rongeur roux à queue en panache, je cache mes noisettes pour l’hiver. Qui suis-je ?', answer: 'ECUREUIL', why: 'L’écureuil cache des noisettes.' }
      ]
    },
    {
      title: 'Le coffre à codes', intro: 'Un coffre ne s’ouvre qu’avec un mot de cinq lettres, {name} ! Les réponses te le donneront.', level: 3, code: 'CODES',
      riddles: [
        { text: 'Dix fois dix, écrit en lettres. Quel nombre ?', answer: 'CENT', why: '10 × 10 = 100, écrit « cent ».' },
        { text: 'Polygone à huit côtés, comme certains panneaux Stop. Quelle forme ?', answer: 'OCTOGONE', why: 'Octo veut dire huit.' },
        { text: 'Petite plaque à points : si on me renverse, tous mes voisins tombent à la suite.', answer: 'DOMINO', why: 'L’effet domino fait tomber toute la ligne.' },
        { text: 'Je suis pleine de trous, et pourtant je retiens l’eau. Que suis-je ?', answer: 'EPONGE', why: 'Une éponge absorbe l’eau.' },
        { text: 'Mes grains coulent du haut vers le bas pour mesurer le temps. Que suis-je ?', answer: 'SABLIER', why: 'Le sablier mesure le temps avec du sable.' }
      ]
    },
    {
      title: 'La piste du grand explorateur', intro: 'Un explorateur a laissé une piste, {name} ! Résous les énigmes pour retrouver son mot de passe.', level: 3, code: 'PISTE',
      riddles: [
        { text: 'On m’ouvre quand il pleut, et je me replie quand le ciel est dégagé. Que suis-je ?', answer: 'PARAPLUIE', why: 'Le parapluie protège de la pluie.' },
        { text: 'J’ai six pattes et mon corps est en trois parties : tête, thorax, abdomen. Quel groupe ?', answer: 'INSECTE', why: 'Tous les insectes ont six pattes.' },
        { text: 'Je suis fait de 206 os chez l’adulte et je te soutiens de l’intérieur. Que suis-je ?', answer: 'SQUELETTE', why: 'Le squelette adulte compte 206 os.' },
        { text: 'Forme à trois côtés et trois angles. Quel est mon nom ?', answer: 'TRIANGLE', why: 'Tri veut dire trois.' },
        { text: 'Ligne imaginaire à 0° de latitude, entre l’hémisphère nord et l’hémisphère sud.', answer: 'EQUATEUR', why: 'L’équateur partage la Terre en deux.' }
      ]
    }
  ]
};
export const DEFIS = {
  petits: [
    'Fais le cri de trois animaux différents.', 'Saute comme une grenouille jusqu’à la porte.', 'Tourne sur toi-même trois fois, doucement.', 'Fais ton plus beau sourire, puis ta plus drôle grimace.',
    'Marche comme un éléphant, puis comme une souris.', 'Touche ton nez, puis tes pieds, puis ta tête.', 'Fais un gros câlin à ton doudou.', 'Chante ta chanson préférée tout doucement.',
    'Fais semblant de dormir comme un chat.', 'Applaudis cinq fois, très fort puis très doucement.', 'Imite un oiseau qui vole avec tes bras.', 'Fais un bisou à quelqu’un de ta famille.',
    'Danse comme un robot pendant dix secondes.', 'Fais la statue sans bouger, 1, 2, 3 !', 'Dis « bonjour » à l’oreille de quelqu’un.', 'Compte jusqu’à dix en sautant.',
    'Fais semblant de boire une soupe très chaude.', 'Fais la chenille qui avance sur le ventre.', 'Mime un lapin qui mange une carotte.', 'Fais le bruit d’un camion de pompiers.',
    'Fais voler un avion avec ta main.', 'Dis ton prénom avec une voix de géant.', 'Dis ton prénom avec une petite voix de souris.', 'Cache-toi les yeux, puis dis « coucou ! »',
    'Pose un livre sur ta tête et marche doucement.', 'Fais une grosse bulle de savon imaginaire.', 'Rampe comme un serpent sur le tapis.', 'Fais la danse de la pluie avec tes doigts.',
    'Fais semblant d’éternuer comme un dragon.', 'Fais un grand cœur avec tes bras.', 'Mime que tu manges une glace géante.'
  ],
  moyens: [
    'Mime un animal et laisse la famille deviner lequel.', 'Invente une chanson sur ton goûter préféré.', 'Raconte une histoire de trois phrases avec un dragon et un fromage.', 'Dessine un monstre rigolo les yeux fermés.',
    'Fabrique un avion en papier et fais-le voler le plus loin possible.', 'Parle comme un robot pendant une minute entière.', 'Invente un nom drôle pour {name} et présente-toi avec.', 'Fais deviner un objet de la pièce avec trois indices.',
    'Dis le mot « chaussette » de dix façons différentes.', 'Invente une devinette qui commence par « Je suis… »', 'Fais un mini-spectacle de marionnettes avec tes mains.', 'Plie une feuille pour faire un chapeau et défile.',
    'Imite une personne de la famille sans parler.', 'Dis un mot qui rime avec chaque membre de la famille.', 'Raconte ta journée comme un journaliste à la télé.', 'Invente un animal avec une tête de lion et des ailes. Décris-le.',
    'Écris ton prénom avec ta main non habituelle.', 'Fais rire quelqu’un sans parler, en dix secondes.', 'Raconte une histoire où chaque phrase commence par la lettre S.', 'Invente un cri de ralliement pour ta famille.',
    'Dessine un cœur, une étoile et une maison sans lever le crayon.', 'Mime un métier et fais-le deviner.', 'Invente un mot qui n’existe pas et donne-lui une définition.', 'Fais un défilé de mode avec des vêtements du placard.',
    'Fabrique un bateau en papier pour ton prochain bain.', 'Dis une phrase sans prononcer la lettre A.', 'Invente un jeu à faire avec une chaussette.', 'Décris une pomme sans dire « rouge » ni « fruit ».',
    'Fais un discours de trente secondes sur les chats.', 'Invente une recette de sorcière avec des ingrédients rigolos.', 'Crée un animal avec ton nom et celui d’un animal.', 'Dis cinq fois vite : « Un chasseur sachant chasser… »'
  ],
  grands: [
    'Invente un mini-conte de quatre phrases sur un objet de ta chambre.', 'Mime un film célèbre sans parler : la famille doit le deviner.', 'Raconte une histoire de pirates en utilisant cinq mots imposés.', 'Invente une publicité rigolo pour une chaussette.',
    'Fais un discours sérieux sur le droit de dormir tard.', 'Invente une devinette dont la réponse est « le temps ».', 'Écris un haïku sur ton goûter : 5, 7 et 5 syllabes.', 'Invente une blague avec un jeu de mots.',
    'Raconte ta journée à l’envers, de la fin au début.', 'Dis ton prénom à l’envers et fais deviner à quoi il ressemble.', 'Invente une langue secrète de cinq mots et traduis-les.', 'Plie un origami simple : un bateau ou un avion.',
    'Mime une émotion sans parler et laisse la famille deviner.', 'Fais une interview imaginaire d’un animal de la maison.', 'Invente un super-pouvoir inutile mais drôle.', 'Raconte une histoire à partir de trois mots donnés par quelqu’un.',
    'Décris-toi avec trois adjectifs commençant par la même lettre.', 'Invente un proverbe et explique ce qu’il veut dire.', 'Fais une présentation de dix secondes sur un caillou.', 'Écris trois fois la même phrase avec trois émotions.',
    'Invente une chanson avec le refrain « Oh oh oh ! »', 'Trouve dix mots qui riment avec « maison ».', 'Fais deviner un mot en le dessinant en dix secondes.', 'Raconte une histoire sans utiliser la lettre E.',
    'Invente la règle d’un jeu absurde et fais-le tester.', 'Imite un présentateur météo avec la météo de ta chambre.', 'Parle pendant trente secondes sans dire « euh ».', 'Crée un blason de papier pour ta famille.',
    'Invente un personnage et décris-le en trois indices pour qu’on le devine.', 'Fais un défi de langue : « Les chaussettes de l’archiduchesse ».', 'Écris un mot avec les lettres de ton prénom, dans le désordre.', 'Compose un slogan pour ta ville ou ton jardin.'
  ]
};
