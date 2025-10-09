<template>
    <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
    >
        <div
            class="bg-gray-900/95 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 max-w-5xl w-full h-[90vh] flex flex-col scanline"
        >
            <!-- Header (fixe) -->
            <div class="text-center mb-6 flex-shrink-0">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <i data-lucide="trophy" class="w-8 h-8 text-cyber-blue"></i>
                    <h1 class="text-4xl font-cyber font-bold text-cyber-blue">
                        SCORE FINAL
                    </h1>
                </div>
                <div class="text-cyber-green font-tech text-lg">
                    Équipe : {{ scoreData.teamName }}
                </div>
            </div>

            <!-- Contenu scrollable -->
            <div class="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar">
                <!-- Score principal -->
                <div class="text-center">
                    <div
                        class="text-6xl md:text-8xl font-cyber font-bold text-cyber-blue mb-4"
                    >
                        {{ scoreData.score }}/20
                    </div>
                    <div
                        class="text-xl md:text-2xl font-cyber font-bold mb-2"
                        :class="getScoreColor()"
                    >
                        {{ getAppreciation() }}
                    </div>
                    <div class="text-gray-300 font-tech text-sm md:text-base">
                        {{ getComment() }}
                    </div>
                </div>

                <!-- Message de fin de mission -->
                <div class="text-center">
                    <div
                        class="bg-gray-800/50 border rounded-lg p-6"
                        :class="getMissionBorderColor()"
                    >
                        <div
                            class="flex items-center justify-center gap-3 mb-4"
                        >
                            <div
                                class="w-3 h-3 rounded-full animate-pulse"
                                :class="getMissionStatusColor()"
                            ></div>
                            <h2
                                class="text-lg font-bold font-tech"
                                :class="getMissionTextColor()"
                            >
                                {{ getMissionStatus() }}
                            </h2>
                        </div>

                        <div
                            class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed"
                        >
                            <p
                                v-if="scoreData.score >= 10"
                                class="text-cyber-green"
                            >
                                <span class="font-bold"
                                    >Excellent travail, agent !</span
                                >
                            </p>
                            <p v-else class="text-red-400">
                                <span class="font-bold"
                                    >Mission échouée, agent.</span
                                >
                            </p>

                            <p v-if="scoreData.score >= 10">
                                Vous avez brillamment repoussé la cyberattaque
                                et sécurisé tous les systèmes hospitaliers.
                                <span class="text-cyber-green font-bold"
                                    >Les patients de l'hôpital ont été sauvés
                                    grâce à votre expertise.</span
                                >
                            </p>
                            <p v-else>
                                La cyberattaque a réussi à compromettre les
                                systèmes hospitaliers.
                                <span class="text-red-400 font-bold"
                                    >Les patients de l'hôpital n'ont pas été
                                    sauvés.</span
                                >
                            </p>

                            <div
                                class="rounded p-4 mt-4"
                                :class="getMissionBoxColor()"
                            >
                                <p
                                    class="font-bold mb-2"
                                    :class="getMissionBoxTextColor()"
                                >
                                    STATUT DE LA MISSION :
                                </p>
                                <div class="space-y-2 text-xs">
                                    <div
                                        class="flex items-center gap-2"
                                        v-if="scoreData.score >= 10"
                                    >
                                        <div
                                            class="w-2 h-2 bg-cyber-green rounded-full"
                                        ></div>
                                        <span class="text-cyber-green"
                                            >Cyberattaque repoussée</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2"
                                        v-if="scoreData.score >= 10"
                                    >
                                        <div
                                            class="w-2 h-2 bg-cyber-green rounded-full"
                                        ></div>
                                        <span class="text-cyber-green"
                                            >Systèmes hospitaliers
                                            sécurisés</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2"
                                        v-if="scoreData.score >= 10"
                                    >
                                        <div
                                            class="w-2 h-2 bg-cyber-green rounded-full"
                                        ></div>
                                        <span class="text-cyber-green"
                                            >Patients sauvés</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2"
                                        v-if="scoreData.score < 10"
                                    >
                                        <div
                                            class="w-2 h-2 bg-red-400 rounded-full"
                                        ></div>
                                        <span class="text-red-400"
                                            >Cyberattaque réussie</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2"
                                        v-if="scoreData.score < 10"
                                    >
                                        <div
                                            class="w-2 h-2 bg-red-400 rounded-full"
                                        ></div>
                                        <span class="text-red-400"
                                            >Systèmes hospitaliers
                                            compromis</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2"
                                        v-if="scoreData.score < 10"
                                    >
                                        <div
                                            class="w-2 h-2 bg-red-400 rounded-full"
                                        ></div>
                                        <span class="text-red-400"
                                            >Patients en danger</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <p
                                v-if="scoreData.score >= 10"
                                class="text-center text-cyber-green font-bold mt-4"
                            >
                                Mission accomplie avec succès, agent. Vous êtes
                                un héros.
                            </p>
                            <p
                                v-else
                                class="text-center text-red-400 font-bold mt-4"
                            >
                                Mission échouée. Les patients paient le prix de
                                votre échec.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Détails des scores -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Score Rapidité -->
                    <div
                        class="bg-gray-800/50 border border-cyber-blue/30 rounded-lg p-4"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <i
                                data-lucide="clock"
                                class="w-5 h-5 text-cyber-blue"
                            ></i>
                            <h3
                                class="font-cyber font-bold text-cyber-blue text-sm"
                            >
                                RAPIDITÉ
                            </h3>
                        </div>
                        <div
                            class="text-2xl md:text-3xl font-cyber font-bold text-cyber-blue mb-2"
                        >
                            {{ scoreData.timeScore.toFixed(1) }}/8
                        </div>
                        <div class="text-xs text-gray-400 font-tech">
                            Temps : {{ formatTime(scoreData.totalTime) }}
                        </div>
                    </div>

                    <!-- Score Précision -->
                    <div
                        class="bg-gray-800/50 border border-red-500/30 rounded-lg p-4"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <i
                                data-lucide="target"
                                class="w-5 h-5 text-red-500"
                            ></i>
                            <h3
                                class="font-cyber font-bold text-red-500 text-sm"
                            >
                                PRÉCISION
                            </h3>
                        </div>
                        <div
                            class="text-2xl md:text-3xl font-cyber font-bold text-red-500 mb-2"
                        >
                            {{ scoreData.errorScore.toFixed(1) }}/7
                        </div>
                        <div class="text-xs text-gray-400 font-tech">
                            Erreurs : {{ scoreData.errors }}
                        </div>
                    </div>

                    <!-- Score Autonomie -->
                    <div
                        class="bg-gray-800/50 border border-yellow-500/30 rounded-lg p-4"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <i
                                data-lucide="lightbulb"
                                class="w-5 h-5 text-yellow-500"
                            ></i>
                            <h3
                                class="font-cyber font-bold text-yellow-500 text-sm"
                            >
                                AUTONOMIE
                            </h3>
                        </div>
                        <div
                            class="text-2xl md:text-3xl font-cyber font-bold text-yellow-500 mb-2"
                        >
                            {{ scoreData.hintScore.toFixed(1) }}/5
                        </div>
                        <div class="text-xs text-gray-400 font-tech">
                            Indices : {{ scoreData.hints }}
                        </div>
                    </div>
                </div>

                <!-- Statistiques par salle -->
                <div>
                    <h3
                        class="text-lg md:text-xl font-cyber font-bold text-white mb-4 flex items-center gap-2"
                    >
                        <i
                            data-lucide="bar-chart-3"
                            class="w-5 h-5 text-cyber-green"
                        ></i>
                        STATISTIQUES PAR SALLE
                    </h3>
                    <div
                        class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar"
                    >
                        <div
                            v-for="room in [
                                'server',
                                'dna-lab',
                                'imaging',
                                'heart',
                                'audition',
                                'eye',
                                'pathology',
                                'prosthesis',
                                'final',
                            ]"
                            :key="room"
                            class="bg-gray-800/40 rounded-lg p-3"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <span
                                    class="font-cyber font-bold text-gray-300 text-sm"
                                >
                                    {{ getRoomName(room) }}
                                </span>
                                <span class="font-tech text-xs text-gray-500">
                                    {{
                                        formatTime(
                                            scoreData.roomTimes[room] || 0,
                                        )
                                    }}
                                </span>
                            </div>
                            <div class="flex gap-4 text-xs">
                                <span class="text-red-400">
                                    ❌ {{ scoreData.roomErrors[room] || 0 }}
                                </span>
                                <span class="text-yellow-400">
                                    💡 {{ scoreData.roomHints[room] || 0 }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Barème explicatif -->
                <div
                    class="bg-gray-800/30 border border-gray-600 rounded-lg p-4"
                >
                    <h4 class="font-cyber font-bold text-gray-300 mb-3 text-sm">
                        BARÈME DE NOTATION
                    </h4>
                    <div class="grid grid-cols-3 gap-4 text-xs">
                        <div class="text-center">
                            <div class="font-cyber font-bold text-cyber-blue">
                                18-20
                            </div>
                            <div class="text-gray-400">EXCELLENT 🏆</div>
                        </div>
                        <div class="text-center">
                            <div class="font-cyber font-bold text-cyber-green">
                                16-18
                            </div>
                            <div class="text-gray-400">TRÈS BIEN 🌟</div>
                        </div>
                        <div class="text-center">
                            <div class="font-cyber font-bold text-yellow-500">
                                14-16
                            </div>
                            <div class="text-gray-400">BIEN ✨</div>
                        </div>
                        <div class="text-center">
                            <div class="font-cyber font-bold text-orange-500">
                                12-14
                            </div>
                            <div class="text-gray-400">ASSEZ BIEN 👍</div>
                        </div>
                        <div class="text-center">
                            <div class="font-cyber font-bold text-red-500">
                                10-12
                            </div>
                            <div class="text-gray-400">PASSABLE 💪</div>
                        </div>
                        <div class="text-center">
                            <div class="font-cyber font-bold text-red-600">
                                0-10
                            </div>
                            <div class="text-gray-400">À AMÉLIORER 📚</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions (fixes en bas) -->
            <div
                class="flex gap-4 justify-center pt-4 border-t border-gray-700 flex-shrink-0 mt-4"
            >
                <button
                    @click="$emit('restart')"
                    class="px-6 py-2 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all text-sm"
                >
                    RECOMMENCER
                </button>
                <button
                    @click="generateDiploma"
                    class="px-6 py-2 bg-yellow-500 hover:bg-yellow-500/80 text-black font-cyber font-bold rounded-lg transition-all text-sm"
                >
                    TÉLÉCHARGER DIPLÔME
                </button>
                <button
                    @click="$emit('close')"
                    class="px-6 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-cyber font-bold rounded-lg transition-all text-sm"
                >
                    FERMER
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import { jsPDF } from "jspdf";

const props = defineProps({
    scoreData: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["close", "restart"]);

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const getRoomName = (roomId) => {
    const names = {
        server: "SALLE DU SERVEUR",
        "dna-lab": "LABORATOIRE ADN",
        imaging: "SALLE D'IMAGERIE",
        heart: "SALLE DE RÉANIMATION",
        audition: "SALLE D'AUDITION",
        eye: "SALLE OPHTALMOLOGIE",
        pathology: "SALLE PATHOLOGIE",
        prosthesis: "SALLE PROTHÈSE",
        final: "SALLE FINALE",
    };
    return names[roomId] || roomId;
};

const getScoreColor = () => {
    const score = props.scoreData.score;
    if (score >= 18) return "text-cyber-blue";
    if (score >= 16) return "text-cyber-green";
    if (score >= 14) return "text-yellow-500";
    if (score >= 12) return "text-orange-500";
    if (score >= 10) return "text-red-500";
    return "text-red-600";
};

const getAppreciation = () => {
    const score = props.scoreData.score;
    if (score >= 18) return "EXCELLENT";
    if (score >= 16) return "TRÈS BIEN";
    if (score >= 14) return "BIEN";
    if (score >= 12) return "ASSEZ BIEN";
    if (score >= 10) return "PASSABLE";
    return "À AMÉLIORER";
};

const getComment = () => {
    const score = props.scoreData.score;
    if (score >= 18)
        return "Performance exceptionnelle ! Vous maîtrisez parfaitement les enjeux de cybersécurité.";
    if (score >= 16)
        return "Très bonne performance. Quelques détails à peaufiner.";
    if (score >= 14)
        return "Bonne compréhension des concepts. Continuez ainsi !";
    if (score >= 12)
        return "Résultats corrects. Il reste des points à améliorer.";
    if (score >= 10)
        return "Performance acceptable. Plus d'attention aux détails serait bénéfique.";
    return "Des efforts supplémentaires sont nécessaires pour maîtriser ces concepts.";
};

const generateDiploma = async () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Couleur de fond
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Cadre officiel double
    doc.setLineWidth(3);
    doc.setDrawColor(0, 102, 204);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    doc.setLineWidth(1);
    doc.rect(18, 18, pageWidth - 36, pageHeight - 36);

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(0, 102, 204);
    doc.text("DIPLÔME D'HONNEUR", pageWidth / 2, 40, { align: "center" });

    // Nom du jeu
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("Escape Game Numérique", pageWidth / 2, 55, { align: "center" });
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("« Urgence à l'hôpital »", pageWidth / 2, 68, { align: "center" });

    // Ligne décorative supérieure
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 204);
    doc.line(80, 78, pageWidth - 80, 78);

    // Texte officiel
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Ce diplôme certifie que", pageWidth / 2, 95, {
        align: "center",
    });

    // Nom de l'équipe
    doc.setFontSize(24);
    doc.setFont("times", "italic");
    doc.setTextColor(0, 102, 204);
    doc.text(props.scoreData.teamName, pageWidth / 2, 110, { align: "center" });

    // Ligne décorative sous le nom
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 60, 113, pageWidth / 2 + 60, 113);

    // Pour avoir obtenu
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(
        "a brillamment terminé l'escape game avec la note de",
        pageWidth / 2,
        128,
        {
            align: "center",
        },
    );

    // Note avec encadré
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text(`${props.scoreData.score}/20`, pageWidth / 2, 145, {
        align: "center",
    });

    // Appréciation
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${getAppreciation()}`, pageWidth / 2, 158, {
        align: "center",
    });

    // Félicitations
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 60);
    doc.text(
        "Félicitations pour votre excellent travail et votre sens de la cybersécurité !",
        pageWidth / 2,
        175,
        {
            align: "center",
        },
    );

    // Date en bas à gauche
    const today = new Date();
    const dateStr = today.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fait le ${dateStr}`, 40, pageHeight - 25);

    // Signature avec image
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Le Directeur de l'Hôpital", pageWidth - 80, pageHeight - 50, {
        align: "center",
    });

    try {
        const response = await fetch("/Signature.png");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            doc.addImage(
                base64,
                "PNG",
                pageWidth - 120,
                pageHeight - 45,
                80,
                30,
            );
            doc.save(
                `diplome_${props.scoreData.teamName.replace(/\s+/g, "_")}.pdf`,
            );
        };
        reader.readAsDataURL(blob);
    } catch (error) {
        console.error("Erreur chargement signature:", error);
        doc.save(
            `diplome_${props.scoreData.teamName.replace(/\s+/g, "_")}.pdf`,
        );
    }
};

// Fonctions pour le message de fin de mission
const getMissionStatus = () => {
    const score = props.scoreData.score;
    if (score >= 10) return "MISSION RÉUSSIE - CYBERATTAQUE ÉCHOUÉE";
    return "MISSION ÉCHOUÉE - CYBERATTAQUE RÉUSSIE";
};

const getMissionBorderColor = () => {
    const score = props.scoreData.score;
    if (score >= 10) return "border-cyber-green/30";
    return "border-red-500/30";
};

const getMissionStatusColor = () => {
    const score = props.scoreData.score;
    if (score >= 10) return "bg-cyber-green";
    return "bg-red-500";
};

const getMissionTextColor = () => {
    const score = props.scoreData.score;
    if (score >= 10) return "text-cyber-green";
    return "text-red-400";
};

const getMissionBoxColor = () => {
    const score = props.scoreData.score;
    if (score >= 10) return "bg-cyber-green/10 border border-cyber-green/30";
    return "bg-red-500/10 border border-red-500/30";
};

const getMissionBoxTextColor = () => {
    const score = props.scoreData.score;
    if (score >= 10) return "text-cyber-green";
    return "text-red-400";
};

onMounted(() => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
</script>

<style scoped>
.scanline {
    position: relative;
    overflow: hidden;
}

.scanline::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #06b6d4, transparent);
    animation: scan 3s linear infinite;
}

@keyframes scan {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.5);
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.8);
}
</style>
