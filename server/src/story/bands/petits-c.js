// Histoires 3-5 ans (lot C) : safari, robots, circus, mystery. Même format que local-stories.js, texte neutre pour le héros.

const safari = {
  title: '{name} et le petit lion muet',
  subtitle: 'Un safari pour trouver un rugissement',
  intro: 'Dans la savane, un bébé lion ne sait pas rugir. {name} veut l’aider.',
  scenes: [
    'a child in a safari hat sitting in a jeep at sunrise, golden savanna',
    'a small lion cub opening its mouth but only a tiny squeak comes out, a child beside it',
    'a child asking a tall giraffe, acacia trees in the background',
    'a big elephant spraying water with its trunk near a child and a lion cub',
    'a child and a lion cub copying a loud elephant trumpet, dust flying',
    'a family of zebras laughing, a lion cub looking shy',
    'a wise old turtle by a pond whispering to a child',
    'a child and a lion cub standing on a flat rock at sunset, the cub taking a deep breath',
    'a lion cub roaring a little roar, animals cheering around',
    'a child falling asleep in a jeep with a lion cub plush toy, starry sky'
  ],
  pages: [
    ['Le matin doré', 'Le soleil se lève sur la savane. Tout est doré et calme. {name} monte dans la grande jeep, avec un chapeau sur la tête. « Brrr, brrr ! » fait le moteur. Là-bas, il y a de l’herbe haute et plein d’animaux. Aujourd’hui, c’est le jour du safari ! {name} sourit. Quelle belle aventure va commencer !'],
    ['Un petit couinement', 'Sous un arbre, {name} entend un drôle de bruit. « Pip ! » C’est un bébé lion. Il s’appelle Roro. Il ouvre grand la gueule, mais il ne sort qu’un couinement. « Pip ! » Roro baisse la tête. « Je veux rugir comme papa, dit-il. Mais je n’y arrive pas. » {name} caresse sa tête douce. « On va chercher ton rugissement ensemble ! »'],
    ['La girafe très haute', 'Roro et {name} marchent dans l’herbe jaune. Ils croisent Mirou, la girafe. Son cou est très, très long. « Bonjour ! Roro a perdu son rugissement, dit {name}. Tu le vois, de là-haut ? » Mirou cherche partout. « Non, je ne vois rien. Va voir Bouba, l’éléphant. Sa voix est énorme ! » Roro remercie la girafe, et les voilà repartis.'],
    ['Bouba et sa trompe', 'Près de l’eau, le grand éléphant Bouba prend un bain. « Splotch ! » Une pluie fraîche tombe sur Roro et sur {name}. Quel fou rire ! « Tu veux une grosse voix ? Regarde ! » dit Bouba. Il lève sa trompe vers le ciel. « POUET ! » Les oiseaux s’envolent. Roro ouvre de grands yeux. « Je vais essayer ! » dit-il.'],
    ['Pouet pouet !', 'Roro prend une grande inspiration. Il souffle fort. « Pouet ! » Oh là là ! Ce n’est pas un rugissement. C’est un pouet d’éléphant ! {name} éclate de rire. Bouba aussi. Même Roro rigole, le ventre tout secoué. « Ce n’est pas ça, mais c’est drôle ! » dit-il. Bouba lui fait un clin d’œil. « Va voir les zèbres, ils ont de bonnes idées. »'],
    ['Les zèbres rayés', 'Dans la plaine, les zèbres courent dans un nuage de poussière. « Hi hi hi ! » Ils s’arrêtent devant Roro. « Moi, je hennis quand je suis content. Essaie ! » dit le plus petit. Roro est timide. Il cache son nez dans ses pattes. « J’ai un peu peur, murmure-t-il. Et si on rit de moi ? » {name} prend sa patte. « On est tes amis. On t’écoute. »'],
    ['La vieille tortue', 'Près de la mare vit Gaspard, une très vieille tortue. Elle avance pas à pas. « Petit lion, dit-elle doucement, un rugissement ne vient pas de la gorge. Il vient du cœur. Quand on se sent fort, il sort tout seul. » Roro réfléchit. {name} sourit. « Alors, on va te donner du courage ! » La tortue cligne de l’œil. « Allez sur le grand rocher plat. »'],
    ['Le grand rocher', 'Le ciel devient orange. Roro monte sur le grand rocher plat. {name} reste juste à côté. Les animaux arrivent un par un : Mirou, Bouba, les zèbres, la tortue. Personne ne parle. On entend seulement le vent dans l’herbe. Roro respire doucement. Une fois, deux fois, trois fois. Son cœur fait boum, boum. « Je crois en toi, Roro », murmure {name}.'],
    ['Grrrooar !', 'Roro ouvre la gueule, et cette fois… « GRRRAOUUU ! » Quel rugissement ! Il est petit, mais il est joyeux et fort. Les oiseaux s’envolent, les zèbres sautent, Bouba lève sa trompe. « Bravo, Roro ! » crient les animaux. Le petit lion n’en revient pas. Il tourne en rond, puis saute dans les bras de {name}. « J’ai réussi ! »'],
    ['Bonne nuit, la savane', 'Le soir, {name} remonte dans la jeep. Roro agite sa patte pour dire au revoir. Les étoiles brillent déjà. Au loin, on entend un petit « Grrraou » tout doux. {name} sourit, les yeux presque fermés. Quelle belle journée ! La jeep ronronne dans la nuit. Bonne nuit, Roro. Bonne nuit, la savane. À bientôt !']
  ]
};

const robots = {
  title: '{name} et le robot Bip-Bip',
  subtitle: 'Une petite invention qui aide tout le monde',
  intro: 'Dans un atelier plein de boulons, {name} construit un robot ami.',
  scenes: [
    'a child in a cozy workshop full of gears and tools, a pile of metal parts on the table',
    'a small round robot with big eyes switched on for the first time, a child clapping',
    'a robot rolling in a garden, bumping into flower pots, a child laughing',
    'a neighbor old lady with a heavy basket, robot offering its arm',
    'a robot with a squeaky wheel next to a child holding an oil can',
    'a robot suddenly going dark with a blinking red light, a worried child',
    'a child searching a drawer full of gadgets and finding a tiny glowing gear',
    'a child carefully placing a shiny gear in a robot chest door',
    'a robot lighting up with a heart-shaped light, a child hugging it',
    'a robot and a child together bringing a tiny invention to neighbors at sunset'
  ],
  pages: [
    ['L’atelier', 'Dans l’atelier, il y a des boulons, des vis et des fils de toutes les couleurs. Clic, clac ! {name} visse et tape avec un petit marteau. Sur la table, il y a une boîte ronde, deux grands yeux en verre et deux bras en métal. {name} les assemble un à un. « Je t’appellerai Bip-Bip ! » Il ne reste qu’à appuyer sur le gros bouton rouge.'],
    ['Allumé !', 'Bzzz… Clic ! Les yeux de Bip-Bip s’allument, bleus et brillants. Il tourne la tête à droite, puis à gauche. « Bip bip ! Bonjour ! » dit-il d’une petite voix de radio. {name} bat des mains. Bip-Bip roule sur ses deux roues. Il touche la table, la lampe, le marteau. « Qu’est-ce que c’est, ça ? Et ça ? Et ça ? » Quelle drôle de première journée !'],
    ['Pouf, les pots !', 'Dehors, le jardin sent l’herbe fraîche. Bip-Bip roule vite, très vite. « Vroum ! » Oups ! Il ne voit pas le pot de fleurs. « Boum ! Plouf ! » Tout tombe dans la terre. Bip-Bip baisse ses yeux. « Pardon. Je ne sais pas faire attention. » {name} ramasse les pétales. « Ce n’est pas grave. On replante ensemble. » Cette fois, Bip-Bip roule très doucement.'],
    ['Le panier de Mamie Rose', 'Dans la rue, Mamie Rose porte un énorme panier de pommes. Elle souffle en marchant. « Ouf, c’est lourd ! » Bip-Bip tend ses bras de métal. « Bip bip ! Je peux aider ? » Mamie Rose rit. « Avec plaisir, petit robot ! » Bip-Bip porte le panier sans perdre une pomme. « Merci, tu es très gentil ! » Les yeux de Bip-Bip brillent encore plus fort.'],
    ['Une roue qui grince', 'Le soir, une roue de Bip-Bip se met à grincer. « Cuiiic ! Cuiiic ! » Il avance de plus en plus lentement. {name} prend la burette d’huile. Une goutte, deux gouttes. Cuic… plus rien ! Le robot soupire. « Ça va mieux, merci ! » Mais soudain, quelque chose cloche dans sa poitrine. Ça fait : « tic… tic… tic… »'],
    ['Bip-Bip s’éteint', 'Tic… tic… Les yeux de Bip-Bip clignotent en rouge. Il ralentit, puis il s’arrête au milieu de l’atelier. « Je… crois… que… » Clac ! Ses lumières s’éteignent. Le silence est total. Le cœur de {name} bat très fort. « Bip-Bip ? Réponds-moi ! » Rien ne bouge. Il faut vite trouver ce qui ne va pas.'],
    ['Le tiroir aux trésors', '{name} ouvre un grand tiroir. Des ressorts, des clés, des ficelles… Tout est mélangé ! {name} fouille, fouille, fouille. Et tout au fond, quelque chose brille. C’est un petit engrenage doré, chaud dans la main. Il tourne tout seul avec un joli « ding ». « C’est exactement ce qu’il faut ! » Merci, tiroir magique !'],
    ['Une pièce en or', 'Délicatement, {name} ouvre la petite porte dans la poitrine de Bip-Bip. Il y a une place vide, juste là. L’engrenage doré s’y glisse. Clic ! Il tient bien. {name} referme la porte et retient son souffle. Une seconde passe. Puis deux. Rien. Puis, tout doucement, un bruit commence : « tic… tic… tic-tic-tic ». C’est un cœur qui se réveille.'],
    ['Un cœur qui brille', 'Les yeux de Bip-Bip s’allument d’un coup. Sur sa poitrine, une lumière rose en forme de cœur se met à briller. « Bip bip ! Je suis là ! » {name} serre le petit robot dans ses bras. « Tu m’as fait peur ! » Bip-Bip tourne ses yeux vers {name}. « Je sens quelque chose de chaud, là. C’est ça, un ami ? » {name} rit et hoche la tête.'],
    ['Une invention pour tous', 'Le lendemain, {name} et Bip-Bip ont une idée. Ils fabriquent de petits chariots à roulettes, légers comme des plumes. Mamie Rose reçoit le premier pour ses pommes. Bientôt, tous les voisins en veulent un. Ding-ding ! Les chariots roulent dans la rue. Au coucher du soleil, Bip-Bip se pose sur l’épaule de {name}. « Merci de m’avoir construit ! »']
  ]
};

const circus = {
  title: '{name} et le grand numéro de Tilou',
  subtitle: 'Un trac, un chapiteau et un ami',
  intro: 'Le cirque arrive en ville ! Tilou le clown a très peur. {name} va l’aider.',
  scenes: [
    'a colorful circus tent arriving in a village, a child watching from a hill',
    'a child meeting a small clown with a red nose sitting alone behind the curtain',
    'a clown sadly looking at a pile of colorful juggling balls, a child next to him',
    'a child and a clown practicing balloons with a friendly elephant',
    'a little seal balancing a ball on its nose, a clown clapping',
    'a child and a clown trying a tiny trampoline, laughing and falling softly',
    'a drum roll with a clown peeking through the curtain at a full audience',
    'a clown frozen on the circus stage, spotlight on, a child waving from the front row',
    'a clown juggling and laughing, audience cheering and throwing flowers',
    'a child and a clown eating cotton candy under circus lights at night'
  ],
  pages: [
    ['Le cirque arrive', 'Pom pom pom ! Les trompettes jouent dans la rue. Un énorme chapiteau rouge et jaune se dresse près du village. Des chevaux dansent. Des caravanes colorées arrivent une à une. {name} court pour voir ça de plus près. Il y a des lumières partout et une bonne odeur de sucre. Ce soir, il y a un spectacle ! Quelle chance !'],
    ['Un clown tout seul', 'Derrière le rideau, {name} entend un petit hoquet. Un clown est assis par terre. Il a un nez rouge et des chaussures immenses. « Je m’appelle Tilou, dit-il en reniflant. Ce soir, c’est mon premier numéro. J’ai le trac. » {name} s’assoit à côté. « Que vas-tu faire ? » Tilou montre un sac de balles. « Jongler. Mais je les fais toujours tomber ! »'],
    ['Les balles qui tombent', 'Tilou lance trois balles en l’air. Une rouge, une bleue, une jaune. Hop, hop, hop ! Plouf, plouf, plouf ! Elles roulent sur le sol. « Tu vois ? soupire Tilou. Je suis nul. » {name} ramasse les balles. « Ce n’est pas vrai. Il faut juste s’entraîner. Je vais t’aider ! » Tilou relève la tête. Un petit sourire apparaît sous son nez rouge.'],
    ['Un éléphant qui rit', 'Tilou et {name} s’entraînent dans la cour. Un gros éléphant gris les regarde. Il s’appelle Bibo. À chaque balle qui tombe, il fait « Pouêt ! » avec sa trompe. Tilou rit de bon cœur. Bibo lui rend une balle, très doucement. « Tu y es presque, dit {name}. Une, deux, trois ! » Cette fois, Tilou rattrape deux balles. Quelle joie !'],
    ['Le phoque rigolo', 'Plus loin, un petit phoque joue avec un ballon. Il le pose sur son nez, sans le faire tomber. « Ouaf, ouaf ! » Il s’appelle Nino. « Le secret, c’est de respirer lentement, dit-il. Et de regarder la balle. » Tilou respire une fois, deux fois. Il jongle ! La jaune monte, la bleue descend. « Bravo, Tilou, c’est parfait ! » crie {name}.'],
    ['Boing, boing !', 'Il reste un peu de temps. {name} et Tilou essaient un petit trampoline. Boing ! Tilou saute si haut que son chapeau s’envole. Boing ! {name} rebondit aussi, les bras en l’air. Ils rient en tombant sur le tapis mou. Tilou a presque oublié sa peur. Mais au loin, la musique retentit. Poum, poum, poum ! Le spectacle commence. Le ventre de Tilou se serre.'],
    ['Roulement de tambour', 'Les gens entrent sous le chapiteau. Tilou regarde par un petit trou du rideau. « Oh non, ils sont si nombreux ! » murmure-t-il. {name} lui prend la main. « Je serai au premier rang. Cherche-moi des yeux. » Le tambour roule : « Rrrrr ! » Une voix annonce : « Voici Tilou le clown ! » Tilou avance sur la piste, les genoux tout mous.'],
    ['Le grand silence', 'Sous les projecteurs, Tilou s’arrête. Toutes les têtes se tournent vers lui. Son cœur bat très vite. Il a tout oublié ! Alors, il cherche {name} du regard. Au premier rang, un grand signe de la main, avec un immense sourire. Tilou respire doucement, comme Nino le phoque. Une fois. Deux fois. Ses épaules se détendent. Et il lance la première balle.'],
    ['Bravo, Tilou !', 'Hop ! La balle rouge monte vers le plafond. Hop ! La bleue la suit. Hop ! La jaune danse entre les deux. Les trois balles tournent comme un petit soleil. Pas une ne tombe ! Les gens applaudissent à tout rompre. Des fleurs volent sur la piste. Tilou salue avec un grand sourire. Son nez rouge brille. Il a réussi son premier numéro !'],
    ['Barbe à papa', 'Après le spectacle, Tilou court serrer {name} dans ses bras. « Sans toi, je n’aurais jamais osé ! » Pour fêter ça, ils partagent une grande barbe à papa rose. C’est sucré, collant et délicieux. Au-dessus d’eux, les guirlandes brillent comme des étoiles. Au loin, Bibo fait « Pouêt ! ». {name} se sent léger comme une bulle. Le cirque est le plus bel endroit du monde.']
  ]
};

const mystery = {
  title: '{name} et le mystère des gâteaux',
  subtitle: 'Une petite enquête dans le village',
  intro: 'Qui a pris les gâteaux de la boulangère ? {name} mène l’enquête avec sa loupe.',
  scenes: [
    'a child with a magnifying glass walking on a cobbled village street in the morning',
    'a baker lady in a bakery looking at an empty tray, a child listening',
    'a child examining tiny crumbs on the ground with a magnifying glass',
    'a child talking to a postman with a bicycle in the village square',
    'a child and a sleepy cat on a sunny wall, crumbs near its paws',
    'a child following small paw prints in the mud near a garden fence',
    'a child peeking behind a hedge with a notebook, seeing a hole in the ground',
    'a family of hedgehogs eating pastry crumbs in a cozy hole, a child smiling',
    'a child and baker lady leaving a basket of cakes near the hedge',
    'a village party with cakes at a long table, children, hedgehogs peeking nearby'
  ],
  pages: [
    ['Un détective en herbe', 'C’est le matin dans le petit village. Les oiseaux chantent, et les pavés brillent au soleil. {name} se promène avec un carnet et une grosse loupe. « Aujourd’hui, je suis détective ! » Tout à coup, un cri vient de la boulangerie. « Au secours ! » {name} accourt, le crayon à la main. La clochette de la porte fait « ding ! »'],
    ['Le plateau vide', 'Dans la boulangerie, Madame Fanny se tient la tête. « Mes gâteaux ont disparu ! Il y en avait vingt sur ce plateau. Il n’en reste aucun. » {name} s’approche du comptoir et note tout dans le carnet. « Quand les avez-vous vus pour la dernière fois ? » demande {name}. « Hier soir, avant de fermer. » {name} sourit. « Je vais vous aider à les retrouver. »'],
    ['Des miettes', 'Sous la fenêtre ouverte, {name} se baisse. La loupe grossit le sol. Que voit-on ? De toutes petites miettes dorées, alignées comme un chemin. « Voilà un premier indice ! » Les miettes mènent dehors, dans la rue. Il y en a près de la fontaine, puis sur le trottoir. Quelqu’un est passé par là. Le carnet se remplit : « Indice numéro un : des miettes. »'],
    ['Le facteur Léon', 'Sur la place, {name} croise Léon, le facteur, sur son vélo rouge. « Bonjour ! Avez-vous vu quelqu’un avec des gâteaux ? » Léon se gratte le menton. « Non. Mais j’ai entendu un petit bruit près du mur. Des pas, comme de minuscules pattes. » {name} écrit tout cela. « Merci, Léon ! » Le facteur sonne : « Dring ! Bonne chance, détective ! »'],
    ['Minet endormi', 'Sur le mur, un gros chat roux dort au soleil. Il s’appelle Minet. Il ronronne : « Rrrr, rrrr. » Il a quelques miettes sur les pattes ! {name} le regarde de près. « Est-ce toi, le voleur de gâteaux ? » Le chat ouvre un œil, bâille et se retourne. Pas une miette sur sa moustache. Ce n’est pas lui. {name} barre son nom dans le carnet.'],
    ['Des traces dans la boue', 'Près d’un jardin, la terre est encore humide. {name} aperçoit de minuscules traces de pattes. Un, deux, trois, quatre petits points. Elles vont tout droit vers la haie. Ce ne sont pas des traces de chat, ni de chien. Elles sont beaucoup trop petites ! {name} avance sur la pointe des pieds, sans faire de bruit. Le mystère est tout proche.'],
    ['Derrière la haie', 'Doucement, {name} écarte les branches. Il y a un petit trou sous la haie, tout rond et tout chaud. Crrr, crrr ! On entend des grignotements. {name} retient son souffle et se penche. Dans la pénombre, deux petits yeux noirs brillent. Puis quatre. Puis six ! Ce sont de toutes petites piques brunes. Le détective sourit : le voleur de gâteaux est trouvé !'],
    ['La famille hérisson', 'Une maman hérisson et ses trois bébés mangent des gâteaux. Ils ont des miettes plein le nez ! « Excusez-nous, dit la maman d’une petite voix. Il faisait froid, et mes petits avaient très faim. Nous avons trouvé la fenêtre ouverte… » Les bébés baissent la tête, tout honteux. {name} s’accroupit. « Je comprends. Mais Madame Fanny est triste. Il faut lui expliquer. »'],
    ['Un panier pour les hérissons', 'Quand {name} raconte tout, Madame Fanny sourit. « Pauvres petits ! Si on me l’avait demandé, je leur aurais donné un gâteau. » Elle prépare un panier de pain doux et de pommes. Elle le dépose près de la haie avec une couverture. Les hérissons sortent en reniflant. « Merci, merci ! » disent-ils. « Nous ne volerons plus jamais ! » Madame Fanny rit, toute émue.'],
    ['La fête du village', 'Le soir, Madame Fanny fait de nouveaux gâteaux pour tout le village. Il y en a vingt, et même vingt et un ! La grande table est dressée sur la place. Léon arrive avec Minet dans son panier. Tout le monde chante et rit. Derrière la haie, quatre petits nez pointus regardent la fête. Mystère résolu ! {name} s’endormira ce soir avec un grand sourire.']
  ]
};

export const PETITS_C = { safari, robots, circus, mystery };
