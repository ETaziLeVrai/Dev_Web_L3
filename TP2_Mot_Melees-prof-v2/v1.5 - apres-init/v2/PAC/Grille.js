class MESSAGE {
    static SELECTION_MOT = "selection mot";
    static MOT_TAPE = "mot tapé";
    static SELECTION_CASE = "section des cases";
    static INIT ="initialisation";
    static AJOUTER_LIGNE = "ajouter une ligne de span";
    static FIN_INIT = "initialisation finie";

}


class Lettre {
    constructor(valeur, indice) {
        this.valeur = valeur;
        this.indice = indice;
    }
}

class AbsGrille {

    static NORD = 0;
    static NORDEST = 1;
    static EST = 2;
    static SUDEST = 3;
    static SUD = 4;
    static SUDOUEST = 5;
    static OUEST = 6;
    static NORDOUEST = 7;
    static DIRECTIONS = [AbsGrille.NORD, AbsGrille.NORDEST, AbsGrille.EST, AbsGrille.SUDEST, AbsGrille.SUD, AbsGrille.SUDOUEST, AbsGrille.OUEST, AbsGrille.NORDOUEST];

    constructor() {
        this.taille = 0;
        this.lettres = [];
    }

    setCtrl(ctrl) {
        this.ctrl = ctrl;
    }

    /**
     * méthode pour recevoir les messages du controleur
     */
    reçoitMessage(message, piecejointe) {
        let result = "";
        if (message == MESSAGE.SELECTION_MOT) {
            if (piecejointe.length > 0) {
                result = this.getToutesLesPossibilites(piecejointe);
            }

        }
        return result;
    }


    /**
     *  le nombre de lettres doit être un carré (4,9,16,25, etc.)
     *  à appeler que si l'abstraction est associée à un contrôleur
     */
    setLettres(listeDeLettres) {
        if (this.ctrl) {
            this.lettres = [];
            for (let i = 0; i < listeDeLettres.length; i++) {
                this.lettres.push(new Lettre(listeDeLettres[i], i));
            }
            this.taille = Math.sqrt(this.lettres.length);

            for(let ligne = 0; ligne < this.taille; ligne++) {
                let ligneDeMots = [];
                for(let col = 0; col < this.taille; col++) {
                    ligneDeMots.push(listeDeLettres[ligne*this.taille+col]);
                }
                this.ctrl.reçoitMessageDeLAbstraction(MESSAGE.AJOUTER_LIGNE, ligneDeMots);

            }
            this.ctrl.reçoitMessageDeLAbstraction(MESSAGE.FIN_INIT);

        }

    }


    /**
     * pour trouver la lettre suivante, en partant d'une lettre dans une direction donnée
     * @param lettre : la lettre d'où on part
     * @param direction : la direction à suivre
     * @return la lettre si elle existe (on ne sort pas du cadre) ou null sinon
     */
    getLettreSuivante(lettre, direction) {
        let i = this.getIndiceSuivant(lettre.indice, direction);
        let result = null;
        if (i >= 0) result = this.lettres[i];
        return result;
    }

    /**
     * pour obtenir l'indice suivant (d'une lettre), en partant dans une direction
     * @param indice
     * @param direction
     * @returns {number} -1 si l'indice n'est pas possible (hors du tableau) ou
     */
    getIndiceSuivant(indice, direction) {
        let indicePotentiel = indice;
        let modulo = indicePotentiel % this.taille;
        let division = Math.floor(indicePotentiel / this.taille);
        switch (direction) {
            case AbsGrille.NORD:
                if (division > 0) indicePotentiel = indicePotentiel - this.taille;
                else indicePotentiel = -1;
                break;
            case AbsGrille.NORDEST:
                if ((division > 0) && (modulo < (this.taille - 1))) {
                    indicePotentiel = indicePotentiel - this.taille + 1;
                } else indicePotentiel = -1;
                break;
            case AbsGrille.EST:
                if (modulo < (this.taille - 1)) {
                    indicePotentiel = indicePotentiel + 1;
                } else indicePotentiel = -1;
                break;
            case AbsGrille.SUDEST:
                if ((modulo < (this.taille - 1)) && (division < (this.taille - 1))) {
                    indicePotentiel = indicePotentiel + this.taille + 1;
                } else indicePotentiel = -1;
                break;
            case AbsGrille.SUD:
                if (division < (this.taille - 1)) {
                    indicePotentiel = indicePotentiel + this.taille;
                } else indicePotentiel = -1;
                break;
            case AbsGrille.SUDOUEST:
                if ((division < (this.taille - 1)) && (modulo > 0)) {
                    indicePotentiel = indicePotentiel + this.taille - 1;
                } else indicePotentiel = -1;
                break;
            case AbsGrille.OUEST:
                if (modulo > 0) {
                    indicePotentiel = indicePotentiel - 1;
                } else indicePotentiel = -1;
                break;
            case AbsGrille.NORDOUEST:
                if ((modulo > 0) && (division > 0)) {
                    indicePotentiel = indicePotentiel - this.taille - 1;
                } else indicePotentiel = -1;
                break;
            default:
                indicePotentiel = -1;
                break;
        }
        return indicePotentiel;
    }


    /**
     * recherche toutes les suites d'indice qui correspondent au mot recherché
     * @param motrecherché
     * @returns {[]} un tableau d'indice s'il n'y a qu'une lettre ou un tableau de tableau d'indice s'il y a 2 lettres ou plus
     */
    getToutesLesPossibilites(motrecherché) {
        let liste = [];
        let premiereLettre = motrecherché.charAt(0);
        let candidats = this.lettres.filter(lettre => lettre.valeur == premiereLettre);

        // pour chaque lettre, il faut explorer toutes les directions
        for (let c = 0; c < candidats.length; c++) {
            let lettreCourante = candidats[c];
            // pour chacune des directions
            if (motrecherché.length > 1) {
                for (let dir = 0; dir < AbsGrille.DIRECTIONS.length; dir++) {

                    lettreCourante = candidats[c];
                    let chemin = [];
                    chemin.push(lettreCourante);

                    let direction = AbsGrille.DIRECTIONS[dir];
                    let motCourant = motrecherché.substring(1);

                    while (motCourant.length > 0) {

                        lettreCourante = this.getLettreSuivante(lettreCourante, direction);
                        if ((lettreCourante) && (lettreCourante.valeur == motCourant.charAt(0))) {
                            chemin.push(lettreCourante);
                        } else {
                            chemin = [];
                            break;

                        }
                        motCourant = motCourant.substring(1);
                    }

                    if (chemin.length > 0) liste.push(chemin)

                }
            } else {
                liste.push(lettreCourante);
            }
        }

        return liste;
    }
}


class PresGrille {
    constructor() {
        this.lettres = null;

        this.input = document.createElement("input");
        this.input.id = "mot";

        let nav = document.createElement("nav");
        nav.appendChild(this.input);
        document.body.appendChild(nav);

        this.grille = document.createElement("div");
        this.grille.id = "motsmeles"
        document.body.appendChild(this.grille);

        this.nouveauMot = () => { // l'evenement n'interesse pas
            this.clear();
            let mot = this.input.value.toUpperCase();
            if (mot.length > 0) this.ctrl.reçoitMessageDeLaPresentation(MESSAGE.MOT_TAPE, mot);
        };
    }

    setCtrl(ctrl) {
        this.ctrl = ctrl;

    }


    reçoitMessage(message, piecejointe) {
        let result = "";
        if (message == MESSAGE.AJOUTER_LIGNE) {
            this.contruireLigne(piecejointe);
        }
        else if (message == MESSAGE.FIN_INIT) {
            // ajout de listener que quand on est pret
            this.lettres = document.querySelectorAll("div#motsmeles > div > span");
            this.input.addEventListener("keyup", this.nouveauMot);
        }
        else if (message == MESSAGE.SELECTION_CASE) {
            if (piecejointe.length > 0) {
                this.select(piecejointe);
            }

        }
        return result;
    }


    clear() {
        this.lettres.forEach(function (span) {
            span.className = "";
        });
    }

    select(liste) {
        liste.forEach((indiceSpan) => {
            this.lettres.item(indiceSpan).className = "selected";
        });
    }

    contruireLigne(mot) {
        let ligne = document.createElement("div");
        for(let i = 0; i < mot.length; i++) {
            let span = document.createElement("span");
            span.innerHTML=mot[i].toUpperCase();
            ligne.appendChild(span);
        }
        this.grille.appendChild(ligne);
    }
}


class CtrlGrille {
    constructor(abs, pres) {
        this.abs = abs;
        this.abs.setCtrl(this);
        this.pres = pres;
        this.pres.setCtrl(this);
    }

    reçoitMessageDeLAbstraction(message, piecejointe) {
        if (message == MESSAGE.AJOUTER_LIGNE) {
            this.pres.reçoitMessage(MESSAGE.AJOUTER_LIGNE, piecejointe);
        } else if (message == MESSAGE.FIN_INIT) {
            this.pres.reçoitMessage(MESSAGE.FIN_INIT);
        }
    }

    reçoitMessageDuParent(message, piecejointe) {
        console.error("reçoitMessageDuParent non impl");
    }

    reçoitMessageDUnEnfant(message, piecejointe, ctrl) {
        console.error("reçoitMessageDUnEnfant non impl : "+message);
    }

    reçoitMessageDeLaPresentation(message, piecejointe) {
        if (message == MESSAGE.MOT_TAPE) {
            this.nouvelleSelection(piecejointe);
        }
    }

    addEnfant(controleur) {
        this.enfants.push(controleur);
        controleur.setParent(this);
    }

    removeEnfant(controleur) {
        this.enfants = this.enfants.filter(pac => pac !== controleur);
    }

    setParent(controleur) {
        this.parent = controleur;
    }

    nouvelleSelection(mot) {
        let listes = this.abs.reçoitMessage(MESSAGE.SELECTION_MOT, mot);
        let indicesDesCases = [];
        for (let i = 0; i < listes.length; i++) {
            // indicesDesCases[i] est un tableau ou un int
            let chemin = listes[i];
            if (Array.isArray(chemin)) {
                for(let j = 0; j < chemin.length; j++) indicesDesCases.push(chemin[j].indice);
            }
            else {
                indicesDesCases.push(chemin.indice);
            }
        }
        this.pres.reçoitMessage(MESSAGE.SELECTION_CASE, indicesDesCases);
    }
}
