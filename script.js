// ===== CONFIGURATION ET VARIABLES GLOBALES =====
let terms = [];
let usedTerms = [];
let currentTerm = {};
let score = 0;
let streak = 0;
let correctAnswers = 0;
let hintsUsed = 0;
let currentQuestion = 1;
const totalQuestions = 20;
let gameId = null;
let difficulty = 'easy';

// Données de l'utilisateur
let userStats = {
    gamesPlayed: 0,
    bestScore: 0,
    termsMastered: 0,
    successRate: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0
};

// Éléments DOM
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameSummary: document.getElementById('game-summary'),
    statsScreen: document.getElementById('stats-screen'),
    leaderboardScreen: document.getElementById('leaderboard-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    anagram: document.getElementById('anagram'),
    userInput: document.getElementById('user-input'),
    validateBtn: document.getElementById('validate-btn'),
    hintBtn: document.getElementById('hint-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    result: document.getElementById('result'),
    hintText: document.getElementById('hint-text'),
    hintContainer: document.getElementById('hint-container'),
    definition: document.getElementById('definition'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    correct: document.getElementById('correct'),
    currentQuestion: document.getElementById('current-question'),
    progressFill: document.getElementById('progress-fill'),
    progressPercent: document.getElementById('progress-percent'),
    skipBtn: document.getElementById('skip-btn'),
    saveExitBtn: document.getElementById('save-exit-btn'),
    finalScore: document.getElementById('final-score'),
    correctAnswers: document.getElementById('correct-answers'),
    successRate: document.getElementById('success-rate'),
    playAgainBtn: document.getElementById('play-again-btn'),
    shareBtn: document.getElementById('share-btn'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    saveIndicator: document.getElementById('save-indicator'),
    startNewBtn: document.getElementById('start-new-btn'),
    resumeBtn: document.getElementById('resume-btn'),
    statsBackBtn: document.getElementById('stats-back-btn'),
    leaderboardBackBtn: document.getElementById('leaderboard-back-btn'),
    settingsBackBtn: document.getElementById('settings-back-btn'),
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    themeOptions: document.querySelectorAll('.theme-option'),
    featurePlay: document.getElementById('feature-play'),
    featureStats: document.getElementById('feature-stats'),
    featureLeaderboard: document.getElementById('feature-leaderboard'),
    featureSettings: document.getElementById('feature-settings')
};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadMedicalTerms();
    loadUserStats();
    setupEventListeners();
    checkSavedGame();
    
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('medicalAnagramTheme') || 'default';
    document.body.className = `theme-${savedTheme}`;
    document.querySelector(`.theme-option[data-theme="${savedTheme}"]`).classList.add('active');
});

// ===== CHARGEMENT DES DONNÉES =====
async function loadMedicalTerms() {
    try {
        // Charger depuis le fichier terms.json
        const response = await fetch('terms.json');
        terms = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des termes médicaux:', error);
        
        // Termes par défaut en cas d'erreur
        terms = [
            { term: "stéthoscope", definition: "Instrument médical utilisé pour écouter les sons internes du corps." },
            { term: "antibiotique", definition: "Substance qui tue ou inhibe la croissance des bactéries." },
            { term: "hypertension", definition: "Pression artérielle anormalement élevée." },
            { term: "gastroentérite", definition: "Inflammation de l'estomac et des intestins." },
            { term: "ophtalmologue", definition: "Médecin spécialiste des maladies des yeux." },
            { term: "cardiologie", definition: "Spécialité médicale concernant le cœur et les vaisseaux sanguins." },
            { term: "neurologie", definition: "Spécialité médicale concernant le système nerveux." },
            { term: "pédiatrie", definition: "Spécialité médicale concernant les enfants." },
            { term: "dermatologie", definition: "Spécialité médicale concernant la peau." },
            { term: "radiographie", definition: "Technique d'imagerie utilisant des rayons X." }
        ];
        
        showResult("Chargement des termes échoué, utilisation des termes par défaut.", "error");
    }
}

function loadUserStats() {
    const savedStats = localStorage.getItem('medicalAnagramStats');
    if (savedStats) {
        try {
            userStats = JSON.parse(savedStats);
            updateStatsDisplay();
        } catch (e) {
            console.error('Erreur lors du chargement des statistiques:', e);
        }
    }
}

function saveUserStats() {
    try {
        localStorage.setItem('medicalAnagramStats', JSON.stringify(userStats));
    } catch (e) {
        console.error('Erreur lors de la sauvegarde des statistiques:', e);
    }
}

// ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
function setupEventListeners() {
    // Navigation
    elements.startNewBtn.addEventListener('click', startNewGame);
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.playAgainBtn.addEventListener('click', startNewGame);
    elements.backToMenuBtn.addEventListener('click', showWelcomeScreen);
    elements.shareBtn.addEventListener('click', shareScore);
    
    // Gameplay
    elements.validateBtn.addEventListener('click', validateAnswer);
    elements.userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') validateAnswer();
    });
    elements.hintBtn.addEventListener('click', giveHint);
    elements.shuffleBtn.addEventListener('click', shuffleAnagram);
    elements.skipBtn.addEventListener('click', skipTerm);
    elements.saveExitBtn.addEventListener('click', saveAndExit);
    
    // Écrans
    elements.featurePlay.addEventListener('click', startNewGame);
    elements.featureStats.addEventListener('click', showStatsScreen);
    elements.featureLeaderboard.addEventListener('click', showLeaderboardScreen);
    elements.featureSettings.addEventListener('click', showSettingsScreen);
    elements.statsBackBtn.addEventListener('click', showWelcomeScreen);
    elements.leaderboardBackBtn.addEventListener('click', showWelcomeScreen);
    elements.settingsBackBtn.addEventListener('click', showWelcomeScreen);
    
    // Difficulté
    elements.difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.difficultyButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            difficulty = this.getAttribute('data-difficulty');
        });
    });
    
    // Thèmes
    elements.themeOptions.forEach(theme => {
        theme.addEventListener('click', function() {
            elements.themeOptions.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const themeName = this.getAttribute('data-theme');
            document.body.className = `theme-${themeName}`;
            // Sauvegarder le thème
            localStorage.setItem('medicalAnagramTheme', themeName);
        });
    });
    
    // Sauvegarde automatique
    window.addEventListener('beforeunload', function() {
        if (elements.gameScreen.style.display !== 'none') {
            saveGame();
        }
    });
}

// ===== FONCTIONNALITÉS DE JEU =====
function startNewGame() {
    if (terms.length === 0) {
        showResult("Aucun terme médical disponible.", "error");
        return;
    }
    
    // Réinitialiser les variables de jeu
    score = 0;
    streak = 0;
    correctAnswers = 0;
    currentQuestion = 1;
    usedTerms = [];
    gameId = Date.now().toString();
    
    // Mettre à jour l'interface
    updateStats();
    updateProgress();
    
    // Changer d'écran
    showGameScreen();
    
    // Commencer avec la première question
    nextTerm();
    
    // Sauvegarder la nouvelle partie
    saveGame();
}

function resumeGame() {
    if (loadSavedGame()) {
        showGameScreen();
    } else {
        showResult("Aucune partie sauvegardée trouvée.", "error");
    }
}

function nextTerm() {
    if (currentQuestion > totalQuestions) {
        endGame();
        return;
    }
    
    // Filtrer les termes selon la difficulté
    let filteredTerms = terms;
    if (difficulty === 'easy') {
        filteredTerms = terms.filter(term => term.term.length <= 8);
    } else if (difficulty === 'medium') {
        filteredTerms = terms.filter(term => term.term.length > 8 && term.term.length <= 12);
    } else if (difficulty === 'hard') {
        filteredTerms = terms.filter(term => term.term.length > 12);
    }
    
    // Trouver un terme non encore utilisé
    let availableTerms = filteredTerms.filter(term => !usedTerms.includes(term.term));
    
    if (availableTerms.length === 0) {
        // Si tous les termes ont été utilisés, réinitialiser
        usedTerms = [];
        availableTerms = filteredTerms;
    }
    
    const randomIndex = Math.floor(Math.random() * availableTerms.length);
    currentTerm = availableTerms[randomIndex];
    usedTerms.push(currentTerm.term);
    
    // Mélanger les lettres pour créer l'anagramme
    const shuffled = shuffleArray(currentTerm.term.split('')).join('');
    elements.anagram.textContent = shuffled;
    elements.anagram.classList.add("pulse");
    
    // Réinitialiser l'interface
    elements.userInput.value = "";
    elements.userInput.focus();
    elements.result.style.display = "none";
    elements.hintContainer.classList.remove("show");
    elements.definition.style.display = "none";
    hintsUsed = 0;
    
    // Mettre à jour la progression
    updateProgress();
    
    // Sauvegarder la progression
    saveGame();
    
    // Retirer l'animation après un délai
    setTimeout(() => {
        elements.anagram.classList.remove("pulse");
    }, 1500);
}

function validateAnswer() {
    const userAnswer = elements.userInput.value.trim().toLowerCase();
    const correctAnswer = currentTerm.term.toLowerCase();
    
    if (userAnswer === correctAnswer) {
        // Bonne réponse
        const points = hintsUsed > 0 ? 5 : 10;
        score += points;
        streak++;
        correctAnswers++;
        
        updateStats();
        
        showResult(`Correct! +${points} points. C'était bien "${currentTerm.term}".`, "success");
        elements.definition.textContent = currentTerm.definition || "Aucune définition disponible.";
        elements.definition.style.display = "block";
        
        // Animation de succès
        elements.userInput.style.borderColor = "#2ecc71";
        createConfetti(20);
        
        // Sauvegarder la progression
        saveGame();
        
        // Mettre à jour les statistiques utilisateur
        userStats.totalCorrectAnswers++;
        userStats.totalQuestions++;
        userStats.termsMastered = Math.floor(userStats.totalCorrectAnswers / 2);
        userStats.successRate = Math.round((userStats.totalCorrectAnswers / userStats.totalQuestions) * 100);
        saveUserStats();
        
        // Passer à la question suivante après un délai
        setTimeout(() => {
            currentQuestion++;
            nextTerm();
        }, 3000);
    } else {
        // Mauvaise réponse
        streak = 0;
        updateStats();
        
        showResult("Incorrect. Essayez encore!", "error");
        elements.userInput.classList.add("shake");
        
        // Mettre à jour les statistiques utilisateur
        userStats.totalQuestions++;
        userStats.successRate = Math.round((userStats.totalCorrectAnswers / userStats.totalQuestions) * 100);
        saveUserStats();
        
        setTimeout(() => {
            elements.userInput.classList.remove("shake");
        }, 500);
    }
}

function giveHint() {
    hintsUsed++;
    const hintLength = Math.min(hintsUsed + 1, currentTerm.term.length);
    const hint = currentTerm.term.substring(0, hintLength);
    elements.hintText.textContent = `Indice: ${hint}... (${hintsUsed}/${currentTerm.term.length})`;
    elements.hintContainer.classList.add("show");
}

function shuffleAnagram() {
    const shuffled = shuffleArray(currentTerm.term.split('')).join('');
    elements.anagram.textContent = shuffled;
    elements.anagram.classList.add("flip");
    
    setTimeout(() => {
        elements.anagram.classList.remove("flip");
    }, 600);
}

function skipTerm() {
    streak = 0;
    updateStats();
    showResult(`Terme passé: "${currentTerm.term}".`, "error");
    
    // Mettre à jour les statistiques utilisateur
    userStats.totalQuestions++;
    userStats.successRate = Math.round((userStats.totalCorrectAnswers / userStats.totalQuestions) * 100);
    saveUserStats();
    
    // Sauvegarder la progression
    saveGame();
    
    setTimeout(() => {
        currentQuestion++;
        nextTerm();
    }, 2000);
}

function endGame() {
    // Mettre à jour les statistiques utilisateur
    userStats.gamesPlayed++;
    if (score > userStats.bestScore) {
        userStats.bestScore = score;
    }
    saveUserStats();
    
    // Afficher l'écran de résumé
    showSummaryScreen();
    
    const successRate = Math.round((correctAnswers / totalQuestions) * 100);
    
    elements.finalScore.textContent = score;
    elements.correctAnswers.textContent = `${correctAnswers}/${totalQuestions}`;
    elements.successRate.textContent = `${successRate}%`;
    
    createConfetti(50);
    
    // Supprimer la sauvegarde
    localStorage.removeItem('medicalAnagramSavedGame');
}

// ===== SYSTÈME DE SAUVEGARDE =====
function checkSavedGame() {
    const savedGame = localStorage.getItem('medicalAnagramSavedGame');
    if (savedGame) {
        try {
            const gameData = JSON.parse(savedGame);
            // Vérifier si la sauvegarde est récente (moins de 7 jours)
            const saveDate = new Date(gameData.saveDate);
            const now = new Date();
            const diffTime = Math.abs(now - saveDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 7) {
                // Afficher le bouton pour reprendre
                elements.resumeBtn.style.display = 'block';
                return true;
            } else {
                // Supprimer la sauvegarde trop ancienne
                localStorage.removeItem('medicalAnagramSavedGame');
                elements.resumeBtn.style.display = 'none';
                return false;
            }
        } catch (e) {
            console.error('Erreur lors de la lecture de la sauvegarde:', e);
            localStorage.removeItem('medicalAnagramSavedGame');
            elements.resumeBtn.style.display = 'none';
            return false;
        }
    } else {
        elements.resumeBtn.style.display = 'none';
        return false;
    }
}

function loadSavedGame() {
    const savedGame = localStorage.getItem('medicalAnagramSavedGame');
    if (savedGame) {
        try {
            const gameData = JSON.parse(savedGame);
            
            // Restaurer l'état de la partie
            score = gameData.score || 0;
            streak = gameData.streak || 0;
            correctAnswers = gameData.correctAnswers || 0;
            currentQuestion = gameData.currentQuestion || 1;
            usedTerms = gameData.usedTerms || [];
            gameId = gameData.gameId;
            difficulty = gameData.difficulty || 'easy';
            
            // Mettre à jour la difficulté dans l'interface
            elements.difficultyButtons.forEach(btn => {
                if (btn.getAttribute('data-difficulty') === difficulty) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Mettre à jour l'interface
            updateStats();
            updateProgress();
            
            return true;
        } catch (e) {
            console.error('Erreur lors du chargement de la sauvegarde:', e);
            showResult("Erreur lors du chargement de la sauvegarde.", "error");
            return false;
        }
    }
    return false;
}

function saveGame() {
    const gameData = {
        score,
        streak,
        correctAnswers,
        currentQuestion,
        usedTerms,
        gameId: gameId || Date.now().toString(),
        saveDate: new Date().toISOString(),
        difficulty
    };
    
    try {
        localStorage.setItem('medicalAnagramSavedGame', JSON.stringify(gameData));
        showSaveIndicator();
        return true;
    } catch (e) {
        console.error('Erreur lors de la sauvegarde:', e);
        showResult("Erreur lors de la sauvegarde.", "error");
        return false;
    }
}

function saveAndExit() {
    if (saveGame()) {
        showWelcomeScreen();
    }
}

// ===== FONCTIONS D'AFFICHAGE =====
function showWelcomeScreen() {
    hideAllScreens();
    elements.welcomeScreen.style.display = 'block';
    checkSavedGame();
}

function showGameScreen() {
    hideAllScreens();
    elements.gameScreen.style.display = 'block';
}

function showSummaryScreen() {
    hideAllScreens();
    elements.gameSummary.style.display = 'block';
}

function showStatsScreen() {
    hideAllScreens();
    elements.statsScreen.style.display = 'block';
    updateStatsDisplay();
}

function showLeaderboardScreen() {
    hideAllScreens();
    elements.leaderboardScreen.style.display = 'block';
}

function showSettingsScreen() {
    hideAllScreens();
    elements.settingsScreen.style.display = 'block';
}

function hideAllScreens() {
    elements.welcomeScreen.style.display = 'none';
    elements.gameScreen.style.display = 'none';
    elements.gameSummary.style.display = 'none';
    elements.statsScreen.style.display = 'none';
    elements.leaderboardScreen.style.display = 'none';
    elements.settingsScreen.style.display = 'none';
}

function showResult(message, type) {
    elements.result.textContent = message;
    elements.result.className = `result ${type}`;
    elements.result.style.display = "block";
}

function showSaveIndicator() {
    elements.saveIndicator.classList.add('show');
    setTimeout(() => {
        elements.saveIndicator.classList.remove('show');
    }, 2000);
}

function updateStats() {
    elements.score.textContent = score;
    elements.streak.textContent = streak;
    elements.correct.textContent = correctAnswers;
}

function updateStatsDisplay() {
    document.getElementById('stats-games-played').textContent = userStats.gamesPlayed;
    document.getElementById('stats-best-score').textContent = userStats.bestScore;
    document.getElementById('stats-terms-mastered').textContent = `${userStats.termsMastered}/120`;
    document.getElementById('stats-success-rate').textContent = `${userStats.successRate}%`;
}

function updateProgress() {
    const progress = ((currentQuestion - 1) / totalQuestions) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressPercent.textContent = Math.round(progress);
    elements.currentQuestion.textContent = currentQuestion;
}

// ===== FONCTIONS UTILITAIRES =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createConfetti(amount) {
    for (let i = 0; i < amount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'
        ][Math.floor(Math.random() * 5)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        
        // Nettoyer après l'animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function shareScore() {
    if (navigator.share) {
        navigator.share({
            title: 'Anagrammes Médicales',
            text: `J'ai obtenu ${score} points aux Anagrammes Médicales! Saurez-vous faire mieux?`,
            url: window.location.href
        })
        .catch(error => {
            console.log('Erreur de partage:', error);
        });
    } else {
        alert(`J'ai obtenu ${score} points aux Anagrammes Médicales! Saurez-vous faire mieux?`);
    }
}