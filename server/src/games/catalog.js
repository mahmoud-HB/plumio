// Catalogue des jeux (servi au client) et données de personnalisation par thème.
import { themeKey } from '../pdf/scenes.js';

export const BANDS = {
  petits: { id: 'petits', label: '3-5 ans', min: 3, max: 5 },
  moyens: { id: 'moyens', label: '6-8 ans', min: 6, max: 8 },
  grands: { id: 'grands', label: '9-12 ans', min: 9, max: 12 }
};

export function bandOf(age) {
  const a = Number(age);
  if (a <= 5) return 'petits';
  if (a >= 9) return 'grands';
  return 'moyens';
}

export const GAMES = [
  { id: 'coloriage', band: 'petits', icon: '🖍️', title: 'Grand coloriage', blurb: 'Un grand dessin à colorier, avec le prénom de l’enfant en bannière.', skill: 'Motricité fine, créativité', minutes: 20 },
  { id: 'points', band: 'petits', icon: '🔢', title: 'Relie les points', blurb: 'Des nombres à relier dans l’ordre pour faire apparaître une surprise (étoile, cœur ou maison).', skill: 'Chiffres, tracé', minutes: 10 },
  { id: 'labyrinthe', band: 'petits', icon: '🧭', title: 'Mon premier labyrinthe', blurb: 'Un labyrinthe large et facile : aider l’enfant à atteindre son but.', skill: 'Repérage, concentration', minutes: 10 },
  { id: 'compte', band: 'petits', icon: '⭐', title: 'Compte les formes', blurb: 'Étoiles, cœurs et ballons à compter, puis à noter dans les cases.', skill: 'Dénombrement', minutes: 10 },
  { id: 'prenom', band: 'petits', icon: '✏️', title: 'J’écris mon prénom', blurb: 'Le prénom à repasser, à recopier sur des lignes guides, et un cadre pour se dessiner.', skill: 'Écriture, reconnaissance des lettres', minutes: 15 },

  { id: 'suite', band: 'petits', icon: '🔷', title: 'Continue la suite', blurb: 'Étoiles, cœurs et ronds à continuer pour compléter chaque rangée.', skill: 'Logique, observation', minutes: 10 },
  { id: 'pixel', band: 'petits', icon: '🎨', title: 'Colorie par numéros', blurb: 'Chaque numéro a sa couleur : un dessin surprise apparaît, case après case.', skill: 'Chiffres, couleurs', minutes: 20 },
  { id: 'trace', band: 'petits', icon: '〰️', title: 'Trace les chemins', blurb: 'Suivre des lignes en pointillés (vagues, zigzags, spirales) pour s’entraîner à écrire.', skill: 'Pré-écriture', minutes: 10 },

  { id: 'motsmeles', band: 'moyens', icon: '🔤', title: 'Mots mêlés', blurb: 'Grille 10×10 avec le prénom de l’enfant et des mots du thème choisi.', skill: 'Lecture, attention', minutes: 15 },
  { id: 'sudoku', band: 'moyens', icon: '🔲', title: 'Sudoku 6×6', blurb: 'Une grille générée à solution unique, pour débuter la logique.', skill: 'Logique', minutes: 15 },
  { id: 'labyrinthe', band: 'moyens', icon: '🧭', title: 'Labyrinthe', blurb: 'Un labyrinthe moyen avec départ et arrivée à thème.', skill: 'Anticipation', minutes: 10 },
  { id: 'code', band: 'moyens', icon: '🔐', title: 'Message secret', blurb: 'Chaque nombre cache une lettre : déchiffrer un message adressé à l’enfant.', skill: 'Lecture, alphabet', minutes: 15 },
  { id: 'calculs', band: 'moyens', icon: '➕', title: 'Défi des calculs', blurb: '12 calculs adaptés à l’âge (additions, soustractions, tables) et un score.', skill: 'Calcul mental', minutes: 15 },

  { id: 'oie', band: 'moyens', icon: '🎲', title: 'Jeu de l’oie', blurb: 'Un plateau à imprimer pour jouer en famille, avec le prénom de l’enfant dans l’aventure.', skill: 'Jeu de société, comptage', minutes: 30 },
  { id: 'suitenombres', band: 'moyens', icon: '🔟', title: 'Suites de nombres', blurb: 'Retrouver les deux nombres cachés dans 10 suites logiques.', skill: 'Logique numérique', minutes: 15 },
  { id: 'voyelles', band: 'moyens', icon: '🅰️', title: 'Voyelles perdues', blurb: 'Les voyelles ont disparu : remettre les mots du thème (et le prénom) en état.', skill: 'Orthographe', minutes: 15 },

  { id: 'motsmeles', band: 'grands', icon: '🔤', title: 'Mots mêlés XXL', blurb: 'Grille 14×14 dans les 8 directions, avec le prénom caché parmi les mots.', skill: 'Observation', minutes: 20 },
  { id: 'sudoku', band: 'grands', icon: '🔲', title: 'Sudoku 9×9', blurb: 'Une vraie grille 9×9 à solution unique, différente à chaque téléchargement.', skill: 'Logique, déduction', minutes: 25 },
  { id: 'labyrinthe', band: 'grands', icon: '🧭', title: 'Labyrinthe géant', blurb: 'Un labyrinthe dense 18×22 à résoudre au crayon.', skill: 'Planification', minutes: 15 },
  { id: 'cesar', band: 'grands', icon: '🕵️', title: 'Code de César', blurb: 'Un message codé par décalage de lettres : trouver la clé et le déchiffrer.', skill: 'Cryptographie, logique', minutes: 20 },
  { id: 'anagrammes', band: 'grands', icon: '🔀', title: 'Anagrammes', blurb: 'Remettre en ordre 9 mots du thème, plus le prénom en bonus.', skill: 'Orthographe, vocabulaire', minutes: 20 },
  { id: 'bataille', band: 'grands', icon: '🚢', title: 'Bataille navale', blurb: 'Deux grilles et une flotte à imprimer pour défier un adversaire, avec l’Amiral au prénom de l’enfant.', skill: 'Stratégie, repérage', minutes: 30 },
  { id: 'logique', band: 'grands', icon: '🧮', title: 'Carrés magiques & pyramides', blurb: 'Deux carrés magiques et trois pyramides de nombres à compléter.', skill: 'Calcul, déduction', minutes: 25 },
  { id: 'colonne', band: 'grands', icon: '🧱', title: 'Le mot en colonne', blurb: 'Placer les mots du thème pour faire apparaître le prénom dans la colonne centrale.', skill: 'Vocabulaire, logique', minutes: 20 },

  { id: 'addimages', band: 'petits', icon: '➕', title: 'Mes premières additions', blurb: 'Étoiles et cœurs à compter pour additionner en images (3 niveaux).', skill: 'Maths, addition', minutes: 10, edu: true },
  { id: 'comparer', band: 'petits', icon: '⚖️', title: 'Plus ou moins ?', blurb: 'Comparer des groupes : lequel en a le plus, le moins ?', skill: 'Maths, comparaison', minutes: 10, edu: true },
  { id: 'chasse', band: 'petits', icon: '🧺', title: 'Chasse au trésor', blurb: 'Missions à cocher à la maison ou dehors, à l’univers du thème choisi.', skill: 'Observation, activité', minutes: 25, edu: true },
  { id: 'bingo', band: 'petits', icon: '🎯', title: 'Bingo de la balade', blurb: 'Une grille 3×3 de choses à trouver autour de soi.', skill: 'Observation', minutes: 20, edu: true },
  { id: 'defis', band: 'petits', icon: '🤸', title: 'Défis rigolos', blurb: '8 défis à relever en famille (mouvement, imitation, rires).', skill: 'Motricité, activité', minutes: 20, edu: true },

  { id: 'problemes', band: 'moyens', icon: '🧩', title: 'Petits problèmes', blurb: '6 problèmes avec le prénom de l’enfant, corrigé détaillé pour les parents.', skill: 'Maths, raisonnement', minutes: 20, edu: true },
  { id: 'tables', band: 'moyens', icon: '✖️', title: 'Mes tables', blurb: '16 calculs de tables de multiplication, avec astuces au corrigé.', skill: 'Maths, multiplication', minutes: 15, edu: true },
  { id: 'histoire', band: 'moyens', icon: '🏰', title: 'Voyage dans l’histoire', blurb: 'QCM et vrai/faux sur l’histoire, avec explications au corrigé.', skill: 'Histoire, culture', minutes: 15, edu: true },
  { id: 'geo', band: 'moyens', icon: '🌍', title: 'Tour du monde', blurb: 'QCM et vrai/faux de géographie, avec explications au corrigé.', skill: 'Géographie, culture', minutes: 15, edu: true },
  { id: 'relier', band: 'moyens', icon: '🔗', title: 'Relie les paires', blurb: 'Relier capitales, pays, monuments… à leur partenaire.', skill: 'Géographie', minutes: 10, edu: true },
  { id: 'chasse', band: 'moyens', icon: '🧺', title: 'Chasse au trésor', blurb: 'Missions à cocher, avec l’univers du thème choisi.', skill: 'Observation, activité', minutes: 25, edu: true },
  { id: 'bingo', band: 'moyens', icon: '🎯', title: 'Bingo de la balade', blurb: 'Une grille 5×5 de choses à trouver autour de soi.', skill: 'Observation', minutes: 20, edu: true },
  { id: 'defis', band: 'moyens', icon: '🤸', title: 'Défis en famille', blurb: '12 défis rigolos et créatifs à relever à plusieurs.', skill: 'Créativité, activité', minutes: 25, edu: true },
  { id: 'escape', band: 'moyens', icon: '🗝️', title: 'Escape game', blurb: '5 énigmes à résoudre pour trouver le code du coffre.', skill: 'Logique, déduction', minutes: 25, edu: true },

  { id: 'maths', band: 'grands', icon: '🧠', title: 'Défis de maths', blurb: '6 problèmes de maths (fractions, pourcentages, proportions…) avec démarche détaillée.', skill: 'Maths, raisonnement', minutes: 25, edu: true },
  { id: 'histoire', band: 'grands', icon: '🏛️', title: 'Voyage dans l’histoire', blurb: 'QCM et vrai/faux sur l’histoire, avec explications au corrigé.', skill: 'Histoire, culture', minutes: 15, edu: true },
  { id: 'geo', band: 'grands', icon: '🌍', title: 'Tour du monde', blurb: 'QCM et vrai/faux de géographie, avec explications au corrigé.', skill: 'Géographie, culture', minutes: 15, edu: true },
  { id: 'relier', band: 'grands', icon: '🔗', title: 'Relie les paires', blurb: 'Relier capitales, fleuves, monuments… à leur partenaire.', skill: 'Géographie', minutes: 10, edu: true },
  { id: 'frise', band: 'grands', icon: '⏳', title: 'Frise du temps', blurb: 'Remettre 6 événements dans l’ordre chronologique.', skill: 'Histoire, chronologie', minutes: 15, edu: true },
  { id: 'chasse', band: 'grands', icon: '🧺', title: 'Chasse au trésor', blurb: 'Missions à cocher, avec l’univers du thème choisi.', skill: 'Observation, activité', minutes: 25, edu: true },
  { id: 'bingo', band: 'grands', icon: '🎯', title: 'Bingo de la balade', blurb: 'Une grille 5×5 d’observations et de mini-défis.', skill: 'Observation', minutes: 20, edu: true },
  { id: 'defis', band: 'grands', icon: '🤸', title: 'Défis en famille', blurb: '12 défis créatifs et sportifs à relever à plusieurs.', skill: 'Créativité, activité', minutes: 25, edu: true },
  { id: 'escape', band: 'grands', icon: '🗝️', title: 'Escape game', blurb: '5 énigmes à résoudre pour trouver le code du coffre.', skill: 'Logique, déduction', minutes: 30, edu: true }
];

export const gamesFor = (band) => GAMES.filter((g) => g.band === band);
export const findGame = (band, id) => GAMES.find((g) => g.band === band && g.id === id);

// Données par thème : mots pour les grilles, objectifs de labyrinthe, messages secrets.
const DATA = {
  generic: { label: 'Aventure', words: ['AVENTURE', 'AMITIE', 'COURAGE', 'SECRET', 'TRESOR', 'REVE', 'MAGIE', 'JEU', 'SOURIRE', 'CHANCE'], goal: 'son trésor', secret: 'TU AS TROUVE LE TRESOR', spot: 'SOUS LE GRAND CHENE' },
  space: { label: 'Espace', words: ['FUSEE', 'ETOILE', 'LUNE', 'PLANETE', 'COMETE', 'ROBOT', 'SOLEIL', 'GALAXIE', 'ORBITE', 'ASTRE'], goal: 'sa fusée', secret: 'TU ES UN VRAI ASTRONAUTE', spot: 'SUR LA PLANETE ROSE' },
  forest: { label: 'Forêt magique', words: ['ARBRE', 'RENARD', 'HIBOU', 'FEUILLE', 'LUCIOLE', 'MOUSSE', 'SENTIER', 'LAPIN', 'FOUGERE', 'ECUREUIL'], goal: 'la clairière secrète', secret: 'LA FORET TE CONNAIT', spot: 'DANS LA CLAIRIERE' },
  pirates: { label: 'Pirates', words: ['TRESOR', 'BATEAU', 'PERROQUET', 'CARTE', 'COFFRE', 'OCEAN', 'ILE', 'CAPITAINE', 'VOILE', 'ANCRE'], goal: 'le trésor', secret: 'LE TRESOR EST A TOI', spot: 'SOUS LE PALMIER' },
  heroes: { label: 'Super-héros', words: ['CAPE', 'POUVOIR', 'COURAGE', 'MASQUE', 'VILLE', 'SAUVER', 'FORCE', 'ECLAIR', 'HEROS', 'VITESSE'], goal: 'la tour des héros', secret: 'TON POUVOIR EST TON COEUR', spot: 'AU SOMMET DE LA TOUR' },
  unicorns: { label: 'Licornes', words: ['LICORNE', 'NUAGE', 'MAGIE', 'COULEUR', 'CRINIERE', 'ETOILE', 'REVE', 'PAILLETTE', 'ARC', 'PONEY'], goal: 'l’arc-en-ciel', secret: 'LA MAGIE EST EN TOI', spot: 'AU BOUT DE L ARC EN CIEL' },
  dinos: { label: 'Dinosaures', words: ['VOLCAN', 'FOUGERE', 'RAPTOR', 'FOSSILE', 'OEUF', 'GEANT', 'HERBIVORE', 'GRIFFE', 'DENT', 'PIERRE'], goal: 'la mer', secret: 'TU ES UN EXPLORATEUR', spot: 'PRES DU VOLCAN' },
  ocean: { label: 'Océan', words: ['BALEINE', 'CORAIL', 'POISSON', 'PERLE', 'VAGUE', 'POULPE', 'TORTUE', 'SIRENE', 'ALGUE', 'DAUPHIN'], goal: 'la perle', secret: 'LA MER CHANTE POUR TOI', spot: 'AU FOND DU RECIF' },
  knights: { label: 'Chevaliers & dragons', words: ['CHATEAU', 'DRAGON', 'EPEE', 'BOUCLIER', 'ROI', 'ARMURE', 'TOURNOI', 'CHEVALIER', 'ROYAUME', 'TOUR'], goal: 'le château', secret: 'TU ES UN BRAVE CHEVALIER', spot: 'DANS LA GRANDE TOUR' },
  safari: { label: 'Savane', words: ['GIRAFE', 'LION', 'ZEBRE', 'SAVANE', 'ELEPHANT', 'SINGE', 'BAOBAB', 'GUEPARD', 'SOLEIL', 'HERBE'], goal: 'le baobab', secret: 'TU AS LE COEUR D UN LION', spot: 'SOUS LE BAOBAB' },
  robots: { label: 'Robots & inventions', words: ['ROBOT', 'ENGRENAGE', 'ATELIER', 'CIRCUIT', 'PILE', 'INVENTEUR', 'MOTEUR', 'ECRAN', 'VIS', 'BOULON'], goal: 'l’atelier', secret: 'TU ES UN GRAND INVENTEUR', spot: 'DANS L ATELIER' },
  circus: { label: 'Cirque', words: ['CHAPITEAU', 'CLOWN', 'TRAPEZE', 'MAGICIEN', 'JONGLEUR', 'PISTE', 'ACROBATE', 'BALLON', 'NEZ', 'SPECTACLE'], goal: 'la piste du cirque', secret: 'TU ES LA STAR DU SPECTACLE', spot: 'SOUS LE CHAPITEAU' },
  fairies: { label: 'Fées & lutins', words: ['FEE', 'LUTIN', 'BAGUETTE', 'ETOILE', 'AILES', 'MAGIE', 'LUCIOLE', 'POUDRE', 'ELFE', 'CHAMPIGNON'], goal: 'la clairière enchantée', secret: 'LA MAGIE EST EN TOI', spot: 'SOUS LE GRAND CHAMPIGNON' },
  polar: { label: 'Banquise', words: ['PINGOUIN', 'IGLOO', 'GLACE', 'PHOQUE', 'NEIGE', 'AURORE', 'TRAINEAU', 'BANQUISE', 'MORSE', 'OURS'], goal: 'l’igloo', secret: 'TU AS LE COEUR CHAUD', spot: 'PRES DE L IGLOO' },
  sports: { label: 'Sports & champions', words: ['FOOTBALL', 'BALLON', 'COURSE', 'EQUIPE', 'MEDAILLE', 'STADE', 'COUPE', 'ARBITRE', 'VELO', 'TENNIS'], goal: 'la ligne d’arrivée', secret: 'TU ES UN CHAMPION', spot: 'AU BORD DU STADE' },
  bakery: { label: 'Pâtisserie & cuisine', words: ['GATEAU', 'FARINE', 'BRIOCHE', 'CREME', 'FOUR', 'SUCRE', 'BISCUIT', 'CHOCOLAT', 'TARTE', 'MACARON'], goal: 'la pâtisserie', secret: 'TU ES UN GRAND CHEF', spot: 'DANS LA CUISINE' },
  mystery: { label: 'Mystère & détectives', words: ['INDICE', 'ENQUETE', 'LOUPE', 'MYSTERE', 'SECRET', 'DETECTIVE', 'ENIGME', 'TEMOIN', 'TRACE', 'CLE'], goal: 'la clé du mystère', secret: 'ENQUETE RESOLUE BRAVO', spot: 'DERRIERE LA PORTE BLEUE' }
};

export const ALL_WORDS = Object.values(DATA).flatMap((d) => d.words);

export function themeData(theme) {
  if (!theme) return { key: 'generic', ...DATA.generic };
  const key = themeKey(theme);
  return { key, ...(DATA[key] || DATA.generic) };
}