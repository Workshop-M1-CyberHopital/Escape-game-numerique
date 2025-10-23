import msvcrt
import time
from datetime import datetime

def get_touche_name(touche):
    """Retourne le nom lisible d'une touche pressée."""
    if touche == b'\r':
        return "Entrée"
    elif touche == b' ':
        return "Espace"
    elif touche == b'\t':
        return "Tabulation"
    elif touche == b'\x1b':
        return "Échap"
    elif touche in (b'\x00', b'\xe0'):
        next_char = msvcrt.getch()
        codes = {
            b'H': "Flèche Haut",
            b'P': "Flèche Bas",
            b'K': "Flèche Gauche",
            b'M': "Flèche Droite",
            b';': "F1", b'<': "F2", b'=': "F3", b'>': "F4", b'?': "F5",
            b'@': "F6", b'A': "F7", b'B': "F8", b'C': "F9", b'D': "F10",
            b'E': "F11", b'F': "F12",
        }
        return codes.get(next_char, f"Touche spéciale (code: 0x{next_char.hex()})")
    else:
        try:
            return touche.decode('utf-8')
        except UnicodeDecodeError:
            return f"Touche inconnue ({touche})"

def enregistrer_touches():
    """Enregistre les touches pressées dans un fichier texte en temps réel."""
    nom_fichier = datetime.now().strftime("%Y-%m-%d_%H-%M-%S_touches.txt")
    print(f"Enregistrement des touches... (Appuyez sur 'Échap' pour arrêter)\nFichier : {nom_fichier}")

    debut = None
    dernier_temps = None

    with open(nom_fichier, "w", encoding="utf-8", buffering=1) as f:
        while True:
            if msvcrt.kbhit():
                touche = msvcrt.getch()
                if touche == b'\x1b':  # ESC = arrêt
                    print("\nEnregistrement terminé.")
                    break

                nom_touche = get_touche_name(touche)
                maintenant = time.perf_counter() * 1000

                if debut is None:
                    debut = maintenant
                    intervalle = 0
                else:
                    intervalle = int(maintenant - dernier_temps) if dernier_temps else 0
                dernier_temps = maintenant

                code_touche = touche.hex(" ")
                ligne = (f"{datetime.now():%Y-%m-%d %H:%M:%S.%f} - "
                         f"Intervalle: {intervalle:4d} ms - "
                         f"Touche: {nom_touche} (Code: {code_touche})\n")

                f.write(ligne)
                f.flush() 
                print(f"Touche: {nom_touche:<15} | {intervalle:4d} ms")

if __name__ == "__main__":
    enregistrer_touches()
