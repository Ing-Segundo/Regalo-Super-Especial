/**
 * PROMPT MAESTRO - PÁGINA WEB INTERACTIVA DE ANIVERSARIO
 * JavaScript principal: Lógica de interacción, música, contador,
 * animaciones de partículas, explosión de corazones y scroll reveal.
 */

/* ==========================================================================
   1. CONFIGURACIÓN Y VARIABLES GLOBALES
   ========================================================================== */

// FECHA DE INICIO DE LA RELACIÓN
// Si conoces la fecha exacta, cámbiala abajo en formato "YYYY-MM-DD" o "YYYY-MM-DDTHH:MM:SS"
// Ejemplo: "2023-05-15" (1 año y 3 meses antes de agosto de 2024)
const relationshipStartDate = "2023-05-08T00:00:00"; 

/* Detectar si es dispositivo móvil para optimizar rendimiento */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initHeroButton();
    initInteractiveChoices();
    initLiveCounter();
    initMusicPlayer();
    initCanvasBackground();
    initClickEffects();
    initPetals();
});

/* ==========================================================================
   2. HERO & SCROLL REVEAL
   ========================================================================== */

function initHeroButton() {
    const startBtn = document.getElementById('startBtn');
    const letterSection = document.getElementById('letter');

    if (startBtn && letterSection) {
        startBtn.addEventListener('click', (e) => {
            // Generar destellos al hacer clic en el botón principal
            createBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
            
            // Scroll suave hacia la carta
            letterSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Si es la sección final, disparar animación especial
                if (entry.target.classList.contains('final-card')) {
                    triggerFinalAnimation();
                }
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   3. SECCIÓN INTERACTIVA ("¿Qué hacemos hoy?")
   ========================================================================== */

const choiceResponses = {
    jugar: "Entonces hoy tú eliges el juego. Yo solo quiero compartir el momento contigo ❤️",
    anime: "Perfecto. Tú eliges el anime y yo pongo toda mi atención en ti. ❤️",
    llamada: "Solo quiero escuchar tu voz y pasar un rato tranquilo contigo. ❤️",
    videollamada: "Quiero verte, aunque sea a través de una pantalla. ❤️",
    loquetuquieras: "Entonces hagamos algo que los dos disfrutemos. Lo importante no es qué hagamos, sino que estemos juntos. ❤️"
};

function initInteractiveChoices() {
    const optionBtns = document.querySelectorAll('.option-btn');
    const responseBox = document.getElementById('choiceResponse');
    const responseText = document.getElementById('responseText');
    const placeholder = responseBox ? responseBox.querySelector('.response-placeholder') : null;

    optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Quitar activo de otros botones
            optionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const choiceKey = btn.getAttribute('data-choice');
            const message = choiceResponses[choiceKey];

            if (message && responseText) {
                if (placeholder) placeholder.style.display = 'none';
                
                responseText.style.display = 'none';
                responseText.textContent = message;
                
                // Trigger animation
                setTimeout(() => {
                    responseText.style.display = 'block';
                }, 50);

                // Efecto de destellos
                const rect = btn.getBoundingClientRect();
                createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        });
    });
}

/* ==========================================================================
   4. CONTADOR DE TIEMPO DINÁMICO
   ========================================================================== */

function initLiveCounter() {
    const elDays = document.getElementById('countDays');
    const elHours = document.getElementById('countHours');
    const elMinutes = document.getElementById('countMinutes');
    const elSeconds = document.getElementById('countSeconds');

    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    const startDate = new Date(relationshipStartDate).getTime();

    function updateCounter() {
        if (isNaN(startDate)) {
            // Si no se ha configurado la fecha válida
            elDays.textContent = "--";
            elHours.textContent = "--";
            elMinutes.textContent = "--";
            elSeconds.textContent = "--";
            return;
        }

        const now = new Date().getTime();
        const difference = now - startDate;

        if (difference < 0) {
            elDays.textContent = "00";
            elHours.textContent = "00";
            elMinutes.textContent = "00";
            elSeconds.textContent = "00";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        elDays.textContent = String(days).padStart(2, '0');
        elHours.textContent = String(hours).padStart(2, '0');
        elMinutes.textContent = String(minutes).padStart(2, '0');
        elSeconds.textContent = String(seconds).padStart(2, '0');
    }

    updateCounter();
    setInterval(updateCounter, 1000);
}

/* ==========================================================================
   5. REPRODUCTOR DE MÚSICA
   ========================================================================== */

function initMusicPlayer() {
    const musicBtn = document.getElementById('musicToggle');
    const audio = document.getElementById('bgMusic');
    const playIcon = document.getElementById('musicIconPlay');
    const pauseIcon = document.getElementById('musicIconPause');
    const musicStatus = document.querySelector('.music-status');

    if (!musicBtn || !audio) return;

    let isPlaying = false;

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            if (musicStatus) musicStatus.textContent = "Toca para reproducir 🎵";
            isPlaying = false;
        } else {
            audio.play().then(() => {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                if (musicStatus) musicStatus.textContent = "Sonando ❤️";
                isPlaying = true;
            }).catch(err => {
                console.log("Auto-play prevenido o archivo no encontrado:", err);
                if (musicStatus) musicStatus.textContent = "Agrega tu canción mp3";
            });
        }
    }

    musicBtn.addEventListener('click', togglePlay);
}

/* ==========================================================================
   6. CANVA CON ESTRELLAS Y DESTELLOS DE FONDO
   ========================================================================== */

function initCanvasBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Menos partículas en móvil para cuidar batería
    const starCount = isMobile ? 40 : 90;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005,
            color: Math.random() > 0.4 ? '#d8b4fe' : '#fbcfe8'
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            star.alpha += star.speed;
            if (star.alpha > 1 || star.alpha < 0) {
                star.speed = -star.speed;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
            ctx.shadowBlur = 8;
            ctx.shadowColor = star.color;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   7. PETALOS Y CORAZONES FLOTANTES
   ========================================================================== */

function initPetals() {
    // Si prefiere movimiento reducido, no crear pétalos
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const petalEmojis = ['🌸', '✨', '💜', '🍃'];
    const maxPetals = isMobile ? 8 : 16;

    setInterval(() => {
        const activePetals = document.querySelectorAll('.floating-petal').length;
        if (activePetals >= maxPetals) return;

        const petal = document.createElement('div');
        petal.className = 'floating-petal';
        petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
        
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 6 + 7; // 7 a 13 segundos
        const fontSize = Math.random() * 12 + 12; // 12px a 24px

        petal.style.left = `${startX}px`;
        petal.style.top = `-30px`;
        petal.style.fontSize = `${fontSize}px`;
        petal.style.animationDuration = `${duration}s`;

        document.body.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, duration * 1000);
    }, isMobile ? 2500 : 1500);
}

/* ==========================================================================
   8. INTERACCIÓN DE CLICS (EXPLOSIÓN Y CORAZONES)
   ========================================================================== */

function initClickEffects() {
    window.addEventListener('click', (e) => {
        // Evitar activar en botones para no saturar
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        createClickHeart(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            if (touch.target.tagName === 'BUTTON' || touch.target.closest('button')) return;
            createClickHeart(touch.clientX, touch.clientY);
        }
    }, { passive: true });
}

function createClickHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'click-heart';
    
    const icons = ['❤️', '💖', '💜', '✨'];
    heart.textContent = icons[Math.floor(Math.random() * icons.length)];
    
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 1200);
}

function createBurst(x, y) {
    const count = isMobile ? 10 : 20;
    const icons = ['✨', '💖', '🌸', '💜', '⭐'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-heart';
        particle.textContent = icons[Math.floor(Math.random() * icons.length)];
        
        const angle = (Math.PI * 2 / count) * i;
        const velocity = Math.random() * 80 + 40;
        const destX = x + Math.cos(angle) * velocity;
        const destY = y + Math.sin(angle) * velocity;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.transition = 'all 0.8s ease-out';

        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            particle.style.left = `${destX}px`;
            particle.style.top = `${destY}px`;
            particle.style.opacity = '0';
            particle.style.transform = 'scale(0.5)';
        });

        setTimeout(() => particle.remove(), 850);
    }
}

function triggerFinalAnimation() {
    if (window.finalAnimated) return;
    window.finalAnimated = true;

    const finalCard = document.querySelector('.final-card');
    if (finalCard) {
        const rect = finalCard.getBoundingClientRect();
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 3);
    }
}

// ==========================================
// TRANSICIÓN CINEMÁTICA HACIA CELEBRACION.HTML
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const btnCelebration = document.getElementById('btnCelebration');

    if (btnCelebration) {
        btnCelebration.addEventListener('click', (e) => {
            e.preventDefault(); // Detiene el cambio de página inmediato
            const targetUrl = btnCelebration.getAttribute('href');

            // Aplica efecto de desvanecimiento y desenfoque a la página actual
            document.body.style.transition = 'opacity 1.2s ease, filter 1.2s ease';
            document.body.style.opacity = '0';
            document.body.style.filter = 'blur(10px)';

            // Espera 1.2 segundos a que termine el efecto y redirige
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1200);
        });
    }
});