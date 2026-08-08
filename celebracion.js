/**
 * CELEBRACIÓN DE ANIVERSARIO - MOTOR CINEMÁTICO
 * ARQUITECTURA: Canvas Render Loop + Object Pooling + Timeline Sequencer
 */

(() => {
    'use strict';

    // --- CONFIGURACIÓN GLOBAL ---
    const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const PARTICLE_MULT = IS_MOBILE ? 0.45 : 1.0; // Optimización de rendimiento en móviles

    // --- ELEMENTOS DEL DOM ---
    const canvas = document.getElementById('fxCanvas');
    const ctx = canvas.getContext('2d');
    const flashOverlay = document.getElementById('flashOverlay');
    const textTeAmo = document.getElementById('textTeAmo');
    const textAnniversary = document.getElementById('textAnniversary');
    const btnReturn = document.getElementById('btnReturn');
    const btnAudio = document.getElementById('btnAudio');
    const audioIcon = document.getElementById('audioIcon');
    const bgMusic = document.getElementById('bgMusic');

    // --- ESTADO DE LA APLICACIÓN ---
    let width = 0;
    let height = 0;
    let particles = [];
    let activeScene = 'SCENE_0';
    let animationFrameId = null;
    let isAudioPlaying = false;

    // --- AJUSTE RESIZABLE ---
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- MATEMÁTICAS & UTILIDADES ---
    const random = (min, max) => Math.random() * (max - min) + min;
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const PALETTE = [
        '#ffffff', // Blanco brillante
        '#e6e6fa', // Lavanda
        '#ffb6c1', // Rosa pastel
        '#8a2be2', // Violeta brillante
        '#da70d6', // Orquídea
        '#ffd700'  // Dorado discreto
    ];

    // --- GENERADORES DE FORMAS CANVAS ---
    function drawHeartPath(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
        ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
        ctx.closePath();
    }

    function drawFlowerPath(ctx, size, petals = 5) {
        ctx.beginPath();
        for (let i = 0; i < petals; i++) {
            const angle = (i * 2 * Math.PI) / petals;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            ctx.quadraticCurveTo(0, 0, x, y);
        }
        ctx.closePath();
    }

    // --- CLASE PARTÍCULA MULTIPROPÓSITO ---
    class Particle {
        constructor(opts) {
            this.x = opts.x || 0;
            this.y = opts.y || 0;
            this.vx = opts.vx || 0;
            this.vy = opts.vy || 0;
            this.size = opts.size || 2;
            this.color = opts.color || '#fff';
            this.alpha = opts.alpha !== undefined ? opts.alpha : 1;
            this.decay = opts.decay || 0.015;
            this.gravity = opts.gravity || 0;
            this.drag = opts.drag || 0.98;
            this.rotation = opts.rotation || 0;
            this.vRot = opts.vRot || 0;
            this.type = opts.type || 'circle'; // 'circle', 'star', 'petal', 'heart', 'flower'
            this.glow = opts.glow || false;
            this.flicker = opts.flicker || false;
        }

        update() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.vRot;
            this.alpha -= this.decay;
        }

        draw(ctx) {
            if (this.alpha <= 0) return;

            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            if (this.glow) {
                ctx.shadowBlur = this.size * 2;
                ctx.shadowColor = this.color;
            }

            let drawAlpha = this.alpha;
            if (this.flicker) {
                drawAlpha *= (0.5 + Math.sin(Date.now() * 0.01 + this.x) * 0.5);
                ctx.globalAlpha = Math.max(0, drawAlpha);
            }

            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;

            switch (this.type) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'star':
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
                        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'petal':
                    ctx.beginPath();
                    ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'heart':
                    drawHeartPath(ctx, this.size);
                    ctx.fill();
                    break;

                case 'flower':
                    drawFlowerPath(ctx, this.size);
                    ctx.fill();
                    break;
            }

            ctx.restore();
        }
    }

    // --- FUEGO ARTIFICIAL (COHETE) ---
    class FireworkRocket {
        constructor(targetX, targetY, isHeart = false) {
            this.x = targetX + random(-50, 50);
            this.y = height;
            this.targetY = targetY;
            this.vx = random(-1, 1);
            this.vy = random(-12, -16);
            this.color = randomChoice(PALETTE);
            this.isHeart = isHeart;
            this.dead = false;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.15; // Gravedad suave de subida

            // Estela del cohete
            particles.push(new Particle({
                x: this.x,
                y: this.y,
                vx: random(-0.5, 0.5),
                vy: random(1, 2),
                size: random(1, 2.5),
                color: this.color,
                alpha: 0.6,
                decay: 0.04,
                type: 'circle'
            }));

            if (this.vy >= -1 || this.y <= this.targetY) {
                this.dead = true;
                this.explode();
            }
        }

        explode() {
            const count = Math.floor((this.isHeart ? 80 : 100) * PARTICLE_MULT);

            if (this.isHeart) {
                // Explosión paramétrica en forma de corazón
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    // Ecuación paramétrica del corazón
                    const heartX = 16 * Math.pow(Math.sin(angle), 3);
                    const heartY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));

                    const speed = random(0.18, 0.22);
                    particles.push(new Particle({
                        x: this.x,
                        y: this.y,
                        vx: heartX * speed,
                        vy: heartY * speed,
                        size: random(2, 4),
                        color: this.color,
                        alpha: 1,
                        decay: random(0.012, 0.02),
                        gravity: 0.04,
                        drag: 0.96,
                        glow: true,
                        type: 'heart'
                    }));
                }
            } else {
                // Explosión Esférica Estándar
                for (let i = 0; i < count; i++) {
                    const angle = random(0, Math.PI * 2);
                    const speed = random(2, 8);
                    particles.push(new Particle({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: random(1.5, 3.5),
                        color: this.color,
                        alpha: 1,
                        decay: random(0.015, 0.025),
                        gravity: 0.06,
                        drag: 0.95,
                        glow: true,
                        type: randomChoice(['circle', 'star'])
                    }));
                }
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    let rockets = [];

    // --- RENDER LOOP PRINCIPAL ---
    function renderLoop() {
        // Fondo semi-transparente para trailing suave
        ctx.fillStyle = 'rgba(3, 1, 8, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // Actualizar y dibujar cohetes
        for (let i = rockets.length - 1; i >= 0; i--) {
            rockets[i].update();
            rockets[i].draw(ctx);
            if (rockets[i].dead) rockets.splice(i, 1);
        }

        // Actualizar y dibujar partículas
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.alpha <= 0 || p.x < -50 || p.x > width + 50 || p.y > height + 50) {
                particles.splice(i, 1);
            }
        }

        // Generadores continuos según la escena activa
        processSceneGenerators();

        animationFrameId = requestAnimationFrame(renderLoop);
    }

    // --- EMISORES CONTINUOS POR ESCENA ---
    function processSceneGenerators() {
        // ESCENA 1: Estrellas Parpadeantes
        if (activeScene === 'SCENE_1_STARS') {
            if (Math.random() < 0.3 * PARTICLE_MULT) {
                particles.push(new Particle({
                    x: random(0, width),
                    y: random(0, height),
                    size: random(1, 3),
                    color: randomChoice(['#ffffff', '#e6e6fa', '#ffb6c1']),
                    alpha: 0.1,
                    decay: random(0.005, 0.01),
                    flicker: true,
                    type: 'star'
                }));
            }
        }

        // ESCENA 2: Flores Moradas Flotantes
        if (activeScene === 'SCENE_2_FLOWERS' || activeScene === 'SCENE_7_PARTY' || activeScene === 'SCENE_9_FINAL_CELEBRATION') {
            if (Math.random() < 0.15 * PARTICLE_MULT) {
                particles.push(new Particle({
                    x: random(0, width),
                    y: random(0, height),
                    size: random(8, 16),
                    color: randomChoice(['#8a2be2', '#da70d6', '#e6e6fa']),
                    alpha: 0.8,
                    decay: 0.008,
                    vRot: random(-0.02, 0.02),
                    glow: true,
                    type: 'flower'
                }));
            }
        }

        // ESCENA 3: Pétalos Cayendo
        if (activeScene === 'SCENE_3_PETALS' || activeScene === 'SCENE_7_PARTY' || activeScene === 'SCENE_9_FINAL_CELEBRATION') {
            if (Math.random() < 0.4 * PARTICLE_MULT) {
                particles.push(new Particle({
                    x: random(-20, width + 20),
                    y: -10,
                    vx: random(-1, 1),
                    vy: random(1, 2.5),
                    size: random(4, 8),
                    color: randomChoice(['#ffb6c1', '#da70d6', '#8a2be2']),
                    alpha: 0.9,
                    decay: 0.003,
                    gravity: 0.01,
                    drag: 0.99,
                    vRot: random(-0.03, 0.03),
                    type: 'petal'
                }));
            }
        }

        // ESCENA 4: Lluvia de Corazones Flotantes
        if (activeScene === 'SCENE_4_HEARTS' || activeScene === 'SCENE_7_PARTY' || activeScene === 'SCENE_9_FINAL_CELEBRATION') {
            if (Math.random() < 0.3 * PARTICLE_MULT) {
                particles.push(new Particle({
                    x: random(0, width),
                    y: height + 10,
                    vx: random(-0.5, 0.5),
                    vy: random(-1.5, -3),
                    size: random(6, 12),
                    color: randomChoice(['#ffb6c1', '#ffffff', '#8a2be2']),
                    alpha: 0.9,
                    decay: 0.005,
                    vRot: random(-0.02, 0.02),
                    glow: true,
                    type: 'heart'
                }));
            }
        }
    }

    // --- TIMELINE SEQUENCER (MOTOR DE ESCENAS) ---
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function runTimeline() {
        // ESCENA 0: Oscuridad Inicial
        activeScene = 'SCENE_0';
        await wait(1500);

        // ESCENA 1: Estrellas progresivas
        activeScene = 'SCENE_1_STARS';
        await wait(4000);

        // ESCENA 2: Flores Moradas
        activeScene = 'SCENE_2_FLOWERS';
        await wait(4000);

        // ESCENA 3: Pétalos Cayendo
        activeScene = 'SCENE_3_PETALS';
        await wait(4000);

        // ESCENA 4: Lluvia de Corazones
        activeScene = 'SCENE_4_HEARTS';
        await wait(4500);

        // ESCENA 5: Primeros Fuegos Artificiales
        activeScene = 'SCENE_5_FIREWORKS';
        for (let i = 0; i < 5; i++) {
            rockets.push(new FireworkRocket(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.5), false));
            await wait(random(600, 1000));
        }
        await wait(1500);

        // ESCENA 6: Fuegos Artificiales en Forma de Corazón
        activeScene = 'SCENE_6_HEART_FIREWORKS';
        for (let i = 0; i < 4; i++) {
            rockets.push(new FireworkRocket(random(width * 0.25, width * 0.75), random(height * 0.2, height * 0.4), true));
            await wait(1000);
        }
        await wait(2000);

        // ESCENA 7: Gran Fiesta Coreografiada
        activeScene = 'SCENE_7_PARTY';
        const partyTimeline = [
            { t: 0, x: 0.2, heart: false },
            { t: 400, x: 0.8, heart: false },
            { t: 800, x: 0.5, heart: true },
            { t: 1200, x: 0.3, heart: false },
            { t: 1600, x: 0.7, heart: true },
            { t: 2200, x: 0.5, heart: false }
        ];

        partyTimeline.forEach(item => {
            setTimeout(() => {
                rockets.push(new FireworkRocket(width * item.x, random(height * 0.2, height * 0.45), item.heart));
            }, item.t);
        });
        await wait(4000);

        // ESCENA 8: Gran Explosión Final
        activeScene = 'SCENE_8_FINAL_EXPLOSION';
        // Limpieza paulatina
        await wait(1000);

        // Punto de luz central que crece
        const centerX = width / 2;
        const centerY = height / 2;

        for (let r = 2; r <= 30; r += 2) {
            particles.push(new Particle({
                x: centerX,
                y: centerY,
                size: r,
                color: '#ffffff',
                alpha: 0.9,
                decay: 0.1,
                glow: true,
                type: 'circle'
            }));
            await wait(50);
        }

        // FLASH BANG & EXPLOSIÓN
        flashOverlay.classList.add('active');
        setTimeout(() => flashOverlay.classList.remove('active'), 300);

        // Megaráfaga de partículas centrífugas
        const megaCount = Math.floor(250 * PARTICLE_MULT);
        for (let i = 0; i < megaCount; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(4, 16);
            particles.push(new Particle({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: random(2, 6),
                color: randomChoice(PALETTE),
                alpha: 1,
                decay: random(0.008, 0.018),
                gravity: 0.03,
                drag: 0.96,
                glow: true,
                type: randomChoice(['circle', 'star', 'heart'])
            }));
        }

        await wait(2000);

        // ESCENA 9: Muestra de "TE AMO"
        activeScene = 'SCENE_TE_AMO';
        textTeAmo.classList.add('visible');
        await wait(4000);
        textTeAmo.classList.remove('visible');
        textTeAmo.classList.add('fade-out');
        await wait(1800);

        // ESCENA 10: Muestra de "FELIZ ANIVERSARIO"
        activeScene = 'SCENE_9_FINAL_CELEBRATION';
        textAnniversary.classList.add('visible');
        await wait(7000);

        // CIERRE & RETORNO
        await exitExperience();
    }

    // --- CONTROL DE AUDIO ---
    function initAudio() {
        bgMusic.volume = 0.5;
        const playPromise = bgMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                isAudioPlaying = true;
                audioIcon.textContent = '🎵';
            }).catch(() => {
                // Autoplay bloqueado por el navegador
                isAudioPlaying = false;
                audioIcon.textContent = '🔇';
            });
        }
    }

    btnAudio.addEventListener('click', () => {
        if (isAudioPlaying) {
            bgMusic.pause();
            audioIcon.textContent = '🔇';
            isAudioPlaying = false;
        } else {
            bgMusic.play();
            audioIcon.textContent = '🎵';
            isAudioPlaying = true;
        }
    });

    // Intentar reproducción al primer touch/click global si fue bloqueado
    window.addEventListener('click', () => {
        if (!isAudioPlaying && bgMusic.paused) {
            initAudio();
        }
    }, { once: true });

    // --- NAVEGACIÓN Y SALIDA LIMPIA ---
    async function exitExperience() {
        document.body.classList.add('fade-exit');

        // Fade out de audio gradual
        const fadeAudio = setInterval(() => {
            if (bgMusic.volume > 0.05) {
                bgMusic.volume -= 0.05;
            } else {
                bgMusic.pause();
                clearInterval(fadeAudio);
            }
        }, 100);

        await wait(1500);
        window.location.href = "index.html";
    }

    btnReturn.addEventListener('click', exitExperience);

    // --- INICIALIZACIÓN ---
    window.addEventListener('DOMContentLoaded', () => {
        renderLoop();
        initAudio();
        runTimeline();
    });
})();