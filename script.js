// Base de données des questions médicales
const medicalQuestions = [
    {
        question: "Quelle est la fréquence cardiaque normale au repos pour un adulte en bonne santé ?",
        answers: [
            "40-60 battements par minute",
            "60-100 battements par minute",
            "100-120 battements par minute",
            "120-140 battements par minute"
        ],
        correct: 1,
        explanation: "La fréquence cardiaque normale au repos pour un adulte se situe entre 60 et 100 battements par minute."
    },
    {
        question: "Quel organe produit l'insuline dans le corps humain ?",
        answers: [
            "Le foie",
            "Les reins",
            "Le pancréas",
            "La rate"
        ],
        correct: 2,
        explanation: "L'insuline est produite par les cellules bêta des îlots de Langerhans dans le pancréas."
    },
    {
        question: "Quelle est la pression artérielle normale pour un adulte ?",
        answers: [
            "90/60 mmHg",
            "120/80 mmHg",
            "140/90 mmHg",
            "160/100 mmHg"
        ],
        correct: 1,
        explanation: "La pression artérielle normale est généralement considérée comme étant de 120/80 mmHg."
    },
    {
        question: "Combien de chambres possède le cœur humain ?",
        answers: [
            "2 chambres",
            "3 chambres",
            "4 chambres",
            "5 chambres"
        ],
        correct: 2,
        explanation: "Le cœur humain possède 4 chambres : 2 oreillettes et 2 ventricules."
    },
    {
        question: "Quel est le plus grand organe du corps humain ?",
        answers: [
            "Le foie",
            "Les poumons",
            "La peau",
            "Le cerveau"
        ],
        correct: 2,
        explanation: "La peau est le plus grand organe du corps humain, représentant environ 16% du poids corporel total."
    }
];

// Variables globales
let currentQuestionIndex = 0;
let selectedAnswers = [];
let score = 0;
let quizStarted = false;

// Système de progression
let progressData = {
    totalQuizzes: 0,
    scores: [],
    bestScore: 0,
    currentStreak: 0,
    achievements: []
};

// Badges disponibles
const availableBadges = [
    {
        id: 'first_quiz',
        title: 'Premier Pas',
        description: 'Complétez votre premier quiz',
        icon: 'fas fa-baby',
        condition: (data) => data.totalQuizzes >= 1
    },
    {
        id: 'perfect_score',
        title: 'Score Parfait',
        description: 'Obtenez 5/5 à un quiz',
        icon: 'fas fa-star',
        condition: (data) => data.bestScore >= 5
    },
    {
        id: 'consistent',
        title: 'Régularité',
        description: 'Complétez 5 quiz',
        icon: 'fas fa-calendar-check',
        condition: (data) => data.totalQuizzes >= 5
    },
    {
        id: 'high_average',
        title: 'Excellence',
        description: 'Maintenez une moyenne de 80%',
        icon: 'fas fa-medal',
        condition: (data) => {
            if (data.scores.length === 0) return false;
            const average = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            return average >= 4; // 4/5 = 80%
        }
    },
    {
        id: 'dedicated',
        title: 'Dévoué',
        description: 'Complétez 10 quiz',
        icon: 'fas fa-fire',
        condition: (data) => data.totalQuizzes >= 10
    },
    {
        id: 'streak_master',
        title: 'Série Gagnante',
        description: 'Obtenez 3 bons scores consécutifs',
        icon: 'fas fa-bolt',
        condition: (data) => data.currentStreak >= 3
    }
];

// Éléments DOM - seront initialisés après le chargement du DOM
let heroSection, quizSection, resultsSection, progressSection;
let questionTitle, answersGrid, progressFill, progressText;
let prevBtn, nextBtn, finalScore, scoreMessage;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les éléments DOM
    heroSection = document.getElementById('home');
    quizSection = document.getElementById('quiz');
    resultsSection = document.getElementById('results');
    progressSection = document.getElementById('progress');
    questionTitle = document.getElementById('questionTitle');
    answersGrid = document.getElementById('answersGrid');
    progressFill = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    finalScore = document.getElementById('finalScore');
    scoreMessage = document.getElementById('scoreMessage');
    
    setupNavigation();
    resetQuiz();
    loadProgressData();
    updateProgressDisplay();
    initializeTheme();
});

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showSection(target);
            
            // Mise à jour de la navigation active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Masquer toutes les sections
    heroSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultsSection.style.display = 'none';
    progressSection.style.display = 'none';
    
    // Afficher la section demandée
    switch(sectionName) {
        case 'home':
            heroSection.style.display = 'block';
            break;
        case 'quiz':
            quizSection.style.display = 'block';
            if (!quizStarted) {
                startQuiz();
            }
            break;
        case 'results':
            resultsSection.style.display = 'block';
            break;
        case 'progress':
            progressSection.style.display = 'block';
            updateProgressDisplay();
            break;
    }
}

// Fonctions du quiz
function startQuiz() {
    quizStarted = true;
    currentQuestionIndex = 0;
    selectedAnswers = [];
    score = 0;
    
    showSection('quiz');
    displayQuestion();
    updateNavigation();
}

function displayQuestion() {
    const question = medicalQuestions[currentQuestionIndex];
    questionTitle.textContent = question.question;
    
    // Mise à jour de la barre de progression
    const progress = ((currentQuestionIndex + 1) / medicalQuestions.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Question ${currentQuestionIndex + 1} sur ${medicalQuestions.length}`;
    
    // Génération des réponses
    answersGrid.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.textContent = answer;
        answerElement.addEventListener('click', () => selectAnswer(index));
        
        // Restaurer la sélection précédente si elle existe
        if (selectedAnswers[currentQuestionIndex] === index) {
            answerElement.classList.add('selected');
        }
        
        answersGrid.appendChild(answerElement);
    });
    
    updateNavigation();
}

function selectAnswer(answerIndex) {
    // Retirer la sélection précédente
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Ajouter la nouvelle sélection
    options[answerIndex].classList.add('selected');
    selectedAnswers[currentQuestionIndex] = answerIndex;
    
    // Activer le bouton suivant
    nextBtn.disabled = false;
}

function nextQuestion() {
    if (currentQuestionIndex < medicalQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function updateNavigation() {
    // Bouton précédent
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Bouton suivant
    const hasAnswer = selectedAnswers[currentQuestionIndex] !== undefined;
    nextBtn.disabled = !hasAnswer;
    
    // Texte du bouton suivant
    if (currentQuestionIndex === medicalQuestions.length - 1) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Terminer';
    } else {
        nextBtn.innerHTML = 'Suivant <i class="fas fa-arrow-right"></i>';
    }
}

function finishQuiz() {
    // Calculer le score
    score = 0;
    selectedAnswers.forEach((answer, index) => {
        if (answer === medicalQuestions[index].correct) {
            score++;
        }
    });
    
    // Sauvegarder les données de progression
    saveQuizResult(score);
    
    // Afficher les résultats
    showResults();
}

function showResults() {
    finalScore.textContent = score;
    
    // Message personnalisé selon le score
    let message = '';
    const percentage = (score / medicalQuestions.length) * 100;
    
    if (percentage >= 80) {
        message = "Excellent ! Vous maîtrisez très bien ces concepts médicaux.";
    } else if (percentage >= 60) {
        message = "Bien joué ! Continuez à étudier pour améliorer vos connaissances.";
    } else if (percentage >= 40) {
        message = "Pas mal, mais il y a encore du travail. Révisez et réessayez !";
    } else {
        message = "Il faut réviser davantage. Ne vous découragez pas, la pratique fait la perfection !";
    }
    
    scoreMessage.textContent = message;
    showSection('results');
    
    // Animation du score
    animateScore();
}

function animateScore() {
    const scoreElement = document.querySelector('.score-number');
    let currentScore = 0;
    const targetScore = score;
    const duration = 1000; // 1 seconde
    const increment = targetScore / (duration / 50);
    
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }
        scoreElement.textContent = Math.floor(currentScore);
    }, 50);
}

function restartQuiz() {
    resetQuiz();
    startQuiz();
}

function resetQuiz() {
    quizStarted = false;
    currentQuestionIndex = 0;
    selectedAnswers = [];
    score = 0;
}

function goHome() {
    resetQuiz();
    showSection('home');
    
    // Réinitialiser la navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('a[href="#home"]').classList.add('active');
}

// Fonctions utilitaires pour les animations
function addGlowEffect(element) {
    element.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 300);
}

// Gestion des raccourcis clavier
document.addEventListener('keydown', function(e) {
    if (quizSection.style.display === 'block') {
        switch(e.key) {
            case 'ArrowLeft':
                if (!prevBtn.disabled) previousQuestion();
                break;
            case 'ArrowRight':
                if (!nextBtn.disabled) nextQuestion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const answerIndex = parseInt(e.key) - 1;
                if (answerIndex < document.querySelectorAll('.answer-option').length) {
                    selectAnswer(answerIndex);
                }
                break;
        }
    }
});

// Effet de particules (optionnel)
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = 'var(--primary-color)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    
    document.body.appendChild(particle);
    
    // Animation de la particule
    particle.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: 'translateY(-' + window.innerHeight + 'px)', opacity: 0 }
    ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'linear'
    }).onfinish = () => {
        particle.remove();
    };
}

// Créer des particules périodiquement
setInterval(createParticle, 2000);// === 
SYSTÈME DE PROGRESSION ===

// Charger les données de progression depuis localStorage
function loadProgressData() {
    const saved = localStorage.getItem('mediquiz_progress');
    if (saved) {
        progressData = JSON.parse(saved);
    }
}

// Sauvegarder les données de progression
function saveProgressData() {
    localStorage.setItem('mediquiz_progress', JSON.stringify(progressData));
}

// Sauvegarder le résultat d'un quiz
function saveQuizResult(score) {
    progressData.totalQuizzes++;
    progressData.scores.push(score);
    
    // Mettre à jour le meilleur score
    if (score > progressData.bestScore) {
        progressData.bestScore = score;
    }
    
    // Calculer la série actuelle
    updateCurrentStreak(score);
    
    // Vérifier les nouveaux badges
    checkAchievements();
    
    // Sauvegarder
    saveProgressData();
}

// Mettre à jour la série actuelle
function updateCurrentStreak(score) {
    const goodScore = score >= 3; // 60% ou plus
    
    if (goodScore) {
        progressData.currentStreak++;
    } else {
        progressData.currentStreak = 0;
    }
}

// Vérifier et débloquer les badges
function checkAchievements() {
    availableBadges.forEach(badge => {
        if (!progressData.achievements.includes(badge.id) && badge.condition(progressData)) {
            progressData.achievements.push(badge.id);
            showBadgeNotification(badge);
        }
    });
}

// Afficher une notification de badge
function showBadgeNotification(badge) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${badge.icon}"></i>
            <div>
                <h4>Nouveau Badge Débloqué!</h4>
                <p>${badge.title}</p>
            </div>
        </div>
    `;
    
    // Ajouter les styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        border: 2px solid var(--primary-color);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: var(--shadow-primary);
        z-index: 10000;
        animation: slideIn 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Retirer après 4 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Mettre à jour l'affichage de la section progrès
function updateProgressDisplay() {
    // Statistiques générales
    document.getElementById('totalQuizzes').textContent = progressData.totalQuizzes;
    document.getElementById('bestScore').textContent = `${progressData.bestScore}/5`;
    document.getElementById('currentStreak').textContent = progressData.currentStreak;
    
    // Score moyen
    let averageScore = 0;
    if (progressData.scores.length > 0) {
        averageScore = (progressData.scores.reduce((a, b) => a + b, 0) / progressData.scores.length / 5) * 100;
    }
    document.getElementById('averageScore').textContent = `${Math.round(averageScore)}%`;
    
    // Graphique
    updateProgressChart();
    
    // Historique
    updateHistoryDisplay();
    
    // Badges
    updateBadgesDisplay();
}

// Mettre à jour le graphique de progression
function updateProgressChart() {
    const canvas = document.getElementById('progressChart');
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (progressData.scores.length === 0) {
        canvas.style.display = 'none';
        noDataMessage.style.display = 'block';
        return;
    }
    
    canvas.style.display = 'block';
    noDataMessage.style.display = 'none';
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Configuration
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const maxScore = 5;
    
    // Dessiner les axes
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Dessiner la grille
    ctx.strokeStyle = '#1a1f2e';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        const y = padding + (chartHeight / maxScore) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Dessiner les points et la ligne
    if (progressData.scores.length > 1) {
        const stepX = chartWidth / (progressData.scores.length - 1);
        
        // Ligne
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        progressData.scores.forEach((score, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (score / maxScore) * chartHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Points
        ctx.fillStyle = '#00d4ff';
        progressData.scores.forEach((score, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (score / maxScore) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    // Labels des axes
    ctx.fillStyle = '#b8c5d6';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    // Labels Y
    for (let i = 0; i <= maxScore; i++) {
        const y = height - padding - (i / maxScore) * chartHeight;
        ctx.fillText(i.toString(), padding - 20, y + 4);
    }
}

// Mettre à jour l'historique
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (progressData.scores.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <p>Aucun quiz complété pour le moment</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    // Afficher les 10 derniers résultats
    const recentScores = progressData.scores.slice(-10).reverse();
    
    recentScores.forEach((score, index) => {
        const actualIndex = progressData.scores.length - index;
        const percentage = (score / 5) * 100;
        let scoreClass = 'score-poor';
        
        if (percentage >= 80) scoreClass = 'score-excellent';
        else if (percentage >= 60) scoreClass = 'score-good';
        else if (percentage >= 40) scoreClass = 'score-average';
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-info">
                <div class="history-date">Quiz #${actualIndex}</div>
                <div class="history-score ${scoreClass}">${score}/5 (${percentage}%)</div>
            </div>
            <div class="history-badge">
                <i class="fas fa-${score === 5 ? 'star' : score >= 3 ? 'thumbs-up' : 'thumbs-down'}"></i>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Mettre à jour l'affichage des badges
function updateBadgesDisplay() {
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';
    
    availableBadges.forEach(badge => {
        const isEarned = progressData.achievements.includes(badge.id);
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${isEarned ? 'earned' : ''}`;
        badgeElement.innerHTML = `
            <div class="badge-icon">
                <i class="${badge.icon}"></i>
            </div>
            <div class="badge-title">${badge.title}</div>
            <div class="badge-description">${badge.description}</div>
        `;
        badgesGrid.appendChild(badgeElement);
    });
}

// Réinitialiser les progrès
function resetProgress() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous vos progrès ? Cette action est irréversible.')) {
        progressData = {
            totalQuizzes: 0,
            scores: [],
            bestScore: 0,
            currentStreak: 0,
            achievements: []
        };
        saveProgressData();
        updateProgressDisplay();
        
        // Notification
        alert('Vos progrès ont été réinitialisés avec succès !');
    }
}

// Styles pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .badge-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .badge-notification i {
        font-size: 2rem;
        color: var(--primary-color);
    }
    
    .badge-notification h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1rem;
    }
    
    .badge-notification p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
`;
document.head.appendChild(notificationStyles);// =
== SYSTÈME DE THÈME ===

// Initialiser le thème
function initializeTheme() {
    const savedTheme = localStorage.getItem('mediquiz_theme') || 'dark';
    applyTheme(savedTheme);
}

// Appliquer un thème
function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('mediquiz_theme', theme);
}

// Basculer entre les thèmes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    applyTheme(newTheme);
}

// Afficher une notification de changement de thème
function showThemeNotification(theme) {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    
    const themeIcon = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    const themeText = theme === 'light' ? 'Thème Clair' : 'Thème Sombre';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${themeIcon}"></i>
            <span>${themeText} activé</span>
        </div>
    `;
    
    // Styles de la notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        box-shadow: var(--shadow-card);
        z-index: 10000;
        animation: slideInTheme 0.3s ease;
        font-size: 0.9rem;
        color: var(--text-primary);
    `;
    
    document.body.appendChild(notification);
    
    // Retirer après 2 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutTheme 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Styles pour les notifications de thème
const themeNotificationStyles = document.createElement('style');
themeNotificationStyles.textContent = `
    @keyframes slideInTheme {
        from { 
            transform: translateX(100%); 
            opacity: 0; 
        }
        to { 
            transform: translateX(0); 
            opacity: 1; 
        }
    }
    
    @keyframes slideOutTheme {
        from { 
            transform: translateX(0); 
            opacity: 1; 
        }
        to { 
            transform: translateX(100%); 
            opacity: 0; 
        }
    }
    
    .theme-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .theme-notification i {
        color: var(--primary-color);
    }
`;
document.head.appendChild(themeNotificationStyles);