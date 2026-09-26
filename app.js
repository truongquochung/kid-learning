/**
 * BÉ HỌC SO SÁNH SỐ (1-10) - Pure JavaScript Engine
 * Designed for 5-6 year old preschool children
 */

(function () {
  'use strict';

  // --- Theme Emojis for Visual Counting (Cute, recognizable animals & icons) ---
  const COUNT_EMOJIS = ['🐶', '🐱', '🐰', '🐼', '🐻', '🦁', '🐸', '🐥', '🐬', '🐧', '🐘', '🦊', '🐯', '🐵', '🦄', '🐙', '🐢', '🐞', '🍎', '⭐', '🍓'];

  // --- Sound Synthesizer & Audio Engine ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.currentAudio = null;
      this.sequenceTimer = null;

      // Preload audio files
      this.audioCorrect = new Audio('sound/correct.mp3');
      this.audioIncorrect = new Audio('sound/incorect.mp3');
      this.audioCorrect.preload = 'auto';
      this.audioIncorrect.preload = 'auto';
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    stopAudio() {
      if (this.sequenceTimer) {
        clearTimeout(this.sequenceTimer);
        this.sequenceTimer = null;
      }
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        } catch (e) {}
        this.currentAudio = null;
      }
    }

    playTone(freq, type = 'sine', duration = 0.2, delay = 0, gainLevel = 0.2) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
          console.warn('Audio play error:', e);
        }
      }, delay * 1000);
    }

    playSuccess() {
      // Cheerful ascending arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        this.playTone(f, 'triangle', 0.25, i * 0.08, 0.25);
      });
    }

    playAlligatorChomp() {
      // Snappy bite / chomp sound effect
      this.playTone(350, 'square', 0.08, 0, 0.3);
      this.playTone(180, 'sine', 0.15, 0.06, 0.4);
    }

    playTinhTinh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      const chime = (freq, startOffset, duration, volume = 0.3) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + startOffset);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 2.01, t + startOffset);

          gain.gain.setValueAtTime(volume, t + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, t + startOffset + duration);

          gain2.gain.setValueAtTime(volume * 0.35, t + startOffset);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + startOffset + duration * 0.7);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);

          osc.start(t + startOffset);
          osc.stop(t + startOffset + duration);
          osc2.start(t + startOffset);
          osc2.stop(t + startOffset + duration);
        } catch (e) {
          console.warn('Audio play error:', e);
        }
      };

      // 2 resonant, cheerful bell "Tinh ... Tinh!"
      chime(1046.50, 0, 0.4, 0.35);        // "Tinh" 1 (C6)
      chime(1318.51, 0.15, 0.55, 0.4);     // "Tinh" 2 (E6)
    }

    playTetTet() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      const buzz = (freq, startOffset, duration, volume = 0.25) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + startOffset);
          osc.frequency.linearRampToValueAtTime(freq * 0.85, t + startOffset + duration);

          gain.gain.setValueAtTime(volume, t + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.01, t + startOffset + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t + startOffset);
          osc.stop(t + startOffset + duration);
        } catch (e) {
          console.warn('Audio play error:', e);
        }
      };

      // 2 snappy cartoon buzzes "Tẹt ... Tẹt!"
      buzz(160, 0, 0.11, 0.25);         // "Tẹt" 1
      buzz(135, 0.14, 0.13, 0.25);      // "Tẹt" 2
    }

    // Sequence: Tinh Tinh -> Phát correct.mp3
    playCorrectSequence() {
      if (!this.enabled) return;
      this.stopAudio();

      // 1. Phát Tinh Tinh trước
      this.playTinhTinh();

      // 2. Phát âm thanh sound/correct.mp3 sau tiếng Tinh Tinh (~420ms)
      this.sequenceTimer = setTimeout(() => {
        if (!this.enabled) return;
        try {
          this.audioCorrect.currentTime = 0;
          this.currentAudio = this.audioCorrect;
          this.audioCorrect.play().catch(e => console.warn('Audio play error:', e));
        } catch (e) {
          console.warn('Audio error:', e);
        }
      }, 420);
    }

    // Sequence: Tẹt Tẹt -> Phát incorect.mp3
    playIncorrectSequence() {
      if (!this.enabled) return;
      this.stopAudio();

      // 1. Phát Tẹt Tẹt trước
      this.playTetTet();

      // 2. Phát âm thanh sound/incorect.mp3 sau tiếng Tẹt Tẹt (~350ms)
      this.sequenceTimer = setTimeout(() => {
        if (!this.enabled) return;
        try {
          this.audioIncorrect.currentTime = 0;
          this.currentAudio = this.audioIncorrect;
          this.audioIncorrect.play().catch(e => console.warn('Audio play error:', e));
        } catch (e) {
          console.warn('Audio error:', e);
        }
      }, 350);
    }

    playError() {
      this.playIncorrectSequence();
    }

    playClick() {
      this.playTone(600, 'sine', 0.05, 0, 0.15);
    }

    playFanfare() {
      this.playCorrectSequence();
    }
  }

  // --- Voice Over Engine (Disabled as requested) ---
  class SpeechEngine {
    constructor() {
      this.enabled = false; // Tạm thời tắt voice đọc tiếng
      this.currentAudio = null;
      this.vietnameseVoice = null;
      this.initVoices();
    }

    initVoices() {
      if ('speechSynthesis' in window) {
        const updateVoices = () => {
          this.vietnameseVoice = this.findVietnameseVoice();
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    findVietnameseVoice() {
      if (!('speechSynthesis' in window)) return null;
      const voices = window.speechSynthesis.getVoices() || [];
      return (
        voices.find(v => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return (
            lang.startsWith('vi') ||
            lang.includes('vi-vn') ||
            lang.includes('vi_vn') ||
            name.includes('vietnam') ||
            name.includes('tiếng việt') ||
            name.includes('linh') ||
            name.includes('mai') ||
            name.includes('hoaimy')
          );
        }) || null
      );
    }

    cleanText(text) {
      if (!text) return '';
      // Remove HTML tags and emojis so TTS only speaks clean Vietnamese words
      return text
        .replace(/<[^>]*>/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
        .trim();
    }

    stop() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
    }

    speak(rawText) {
      if (!this.enabled) return;
      this.stop();

      const text = this.cleanText(rawText);
      if (!text) return;

      // Dynamically query available voices
      if (!this.vietnameseVoice) {
        this.vietnameseVoice = this.findVietnameseVoice();
      }

      // If a native Vietnamese voice is installed on OS/Browser
      if (this.vietnameseVoice && 'speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = this.vietnameseVoice;
          utterance.lang = this.vietnameseVoice.lang || 'vi-VN';
          utterance.rate = 0.92; // Gentle speed for kids
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
          return;
        } catch (e) {
          console.warn('SpeechSynthesis error:', e);
        }
      }

      // Fallback: Use high-quality Google Vietnamese TTS audio
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        this.currentAudio = audio;
        audio.play().catch(err => {
          console.warn('Audio fallback blocked or failed:', err);
          if ('speechSynthesis' in window) {
            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            fallbackUtterance.lang = 'vi-VN';
            window.speechSynthesis.speak(fallbackUtterance);
          }
        });
      } catch (err) {
        console.warn('Audio fallback error:', err);
      }
    }
  }

  // --- Confetti Particle System ---
  class ConfettiSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animId = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 80) {
      if (!this.ctx) return;
      const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#2ECC71', '#9B59B6', '#FF9F43'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          gravity: 0.25
        });
      }

      if (!this.animId) {
        this.render();
      }
    }

    render() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();

        if (p.opacity <= 0 || p.y > this.canvas.height) {
          this.particles.splice(idx, 1);
        }
      });

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.render());
      } else {
        this.animId = null;
      }
    }
  }

  // --- Main Game Controller ---
  class ComparisonGame {
    constructor() {
      this.sound = new SoundEngine();
      this.speech = new SpeechEngine();
      this.confetti = new ConfettiSystem('confettiCanvas');

      // Game status
      this.totalQuestions = 10;
      this.currentQuestionIndex = 1;
      this.score = 0;
      this.streak = 0;
      this.showCounters = true;
      this.currentEmoji = '🍎';

      // Current Round values
      this.numLeft = 0;
      this.numRight = 0;
      this.correctSign = '';
      this.isLocked = false; // prevent rapid spamming during animations

      // DOM Elements
      this.numLeftEl = document.getElementById('numLeft');
      this.numRightEl = document.getElementById('numRight');
      this.itemsLeftEl = document.getElementById('itemsLeft');
      this.itemsRightEl = document.getElementById('itemsRight');
      this.centerSlotEl = document.getElementById('centerSlot');
      this.slotPlaceholderEl = document.getElementById('slotPlaceholder');
      this.feedbackBubbleEl = document.getElementById('feedbackBubble');
      this.feedbackTextEl = document.getElementById('feedbackText');
      this.instructionTextEl = document.getElementById('instructionText');

      this.starCountEl = document.getElementById('starCount');
      this.currentQuestionNumEl = document.getElementById('currentQuestionNum');
      this.totalQuestionsNumEl = document.getElementById('totalQuestionsNum');
      this.progressFillEl = document.getElementById('progressFill');
      this.progressAvatarEl = document.getElementById('progressAvatar');
      this.streakBadgeEl = document.getElementById('streakBadge');

      this.btnSoundToggle = document.getElementById('btnSoundToggle');
      this.btnVoiceToggle = document.getElementById('btnVoiceToggle');
      this.btnToggleHelp = document.getElementById('btnToggleHelp');
      this.btnReplayAudio = document.getElementById('btnReplayAudio');

      this.signButtons = document.querySelectorAll('.sign-btn');

      // Modal elements
      this.victoryModal = document.getElementById('victoryModal');
      this.finalScoreEl = document.getElementById('finalScore');
      this.awardTitleEl = document.getElementById('awardTitle');
      this.btnPlayAgain = document.getElementById('btnPlayAgain');

      this.initEventListeners();
      this.startNewGame();
    }

    initEventListeners() {
      // Audio Toggles
      this.btnSoundToggle.addEventListener('click', () => {
        this.sound.enabled = !this.sound.enabled;
        if (!this.sound.enabled) {
          this.sound.stopAudio();
        }
        this.btnSoundToggle.querySelector('#soundIcon').textContent = this.sound.enabled ? '🔊' : '🔇';
        this.sound.playClick();
      });

      this.btnVoiceToggle.addEventListener('click', () => {
        this.speech.enabled = !this.speech.enabled;
        if (!this.speech.enabled) {
          this.speech.stop();
        }
        this.btnVoiceToggle.querySelector('#voiceIcon').textContent = this.speech.enabled ? '🗣️' : '🤫';
        this.sound.playClick();
      });

      // Helper counting toggle
      this.btnToggleHelp.addEventListener('click', () => {
        this.showCounters = !this.showCounters;
        this.btnToggleHelp.classList.toggle('active', this.showCounters);
        this.btnToggleHelp.querySelector('.helper-text').innerHTML = `Đếm đồ vật: <b>${this.showCounters ? 'BẬT' : 'TẮT'}</b>`;
        this.sound.playClick();
        this.renderVisualCounters();
      });

      // Replay Audio Prompt (if present)
      if (this.btnReplayAudio) {
        this.btnReplayAudio.addEventListener('click', () => {
          this.sound.init();
          this.promptCurrentQuestion();
        });
      }

      // Sign buttons click & touch
      this.signButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.vibrate(25);
          this.sound.init();
          const sign = btn.dataset.sign;
          this.handleAnswer(sign);
        });

        // Drag & drop support
        btn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', btn.dataset.sign);
        });
      });

      // Drag over center slot
      this.centerSlotEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.centerSlotEl.classList.add('drag-over');
      });

      this.centerSlotEl.addEventListener('dragleave', () => {
        this.centerSlotEl.classList.remove('drag-over');
      });

      this.centerSlotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        this.centerSlotEl.classList.remove('drag-over');
        const sign = e.dataTransfer.getData('text/plain');
        if (sign) {
          this.handleAnswer(sign);
        }
      });

      // Play Again Modal Button
      this.btnPlayAgain.addEventListener('click', () => {
        this.victoryModal.style.display = 'none';
        this.startNewGame();
      });
    }

    startNewGame() {
      this.score = 0;
      this.streak = 0;
      this.currentQuestionIndex = 1;
      this.updateStatusUI();
      this.loadQuestion();
    }

    generateNumbers() {
      // Pick random emoji theme for this round
      this.currentEmoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];

      // 1 to 10 range
      let a = Math.floor(Math.random() * 10) + 1;
      let b = Math.floor(Math.random() * 10) + 1;

      // 20% chance of equal numbers to ensure "=" is well practiced
      if (Math.random() < 0.25) {
        b = a;
      }

      this.numLeft = a;
      this.numRight = b;

      if (a > b) {
        this.correctSign = '>';
      } else if (a < b) {
        this.correctSign = '<';
      } else {
        this.correctSign = '=';
      }
    }

    loadQuestion() {
      this.isLocked = false;
      this.sound.stopAudio();
      this.generateNumbers();

      // Update numbers
      this.numLeftEl.textContent = this.numLeft;
      this.numRightEl.textContent = this.numRight;

      // Reset center slot
      this.slotPlaceholderEl.textContent = '?';
      this.slotPlaceholderEl.className = 'slot-placeholder';
      this.centerSlotEl.className = 'center-slot';
      this.feedbackBubbleEl.className = 'feedback-bubble';
      this.feedbackTextEl.textContent = 'Bé chọn dấu nào nè?';

      // Render Visual Items (apples, stars, etc.)
      this.renderVisualCounters();

      // Update Instruction and Voice
      this.updateStatusUI();
      this.promptCurrentQuestion();
    }

    renderVisualCounters() {
      this.itemsLeftEl.innerHTML = '';
      this.itemsRightEl.innerHTML = '';

      if (!this.showCounters) {
        this.itemsLeftEl.style.display = 'none';
        this.itemsRightEl.style.display = 'none';
        return;
      }

      this.itemsLeftEl.style.display = 'flex';
      this.itemsRightEl.style.display = 'flex';

      this.itemsLeftEl.className = 'items-grid' + (this.numLeft <= 3 ? ' count-few' : (this.numLeft <= 6 ? ' count-med' : ''));
      this.itemsRightEl.className = 'items-grid' + (this.numRight <= 3 ? ' count-few' : (this.numRight <= 6 ? ' count-med' : ''));

      for (let i = 0; i < this.numLeft; i++) {
        const span = document.createElement('span');
        span.className = 'item-badge';
        span.style.animationDelay = `${i * 0.04}s`;
        span.textContent = this.currentEmoji;
        this.itemsLeftEl.appendChild(span);
      }

      for (let i = 0; i < this.numRight; i++) {
        const span = document.createElement('span');
        span.className = 'item-badge';
        span.style.animationDelay = `${i * 0.04}s`;
        span.textContent = this.currentEmoji;
        this.itemsRightEl.appendChild(span);
      }
    }

    promptCurrentQuestion() {
      this.instructionTextEl.innerHTML = `Bé hãy so sánh số <b>${this.numLeft}</b> và số <b>${this.numRight}</b>:`;
    }

    handleAnswer(chosenSign) {
      if (this.isLocked) return;

      const isCorrect = chosenSign === this.correctSign;

      // Fill in chosen sign in center slot
      this.slotPlaceholderEl.textContent = chosenSign;
      let signColorClass = 'sign-color-greater';
      if (chosenSign === '<') signColorClass = 'sign-color-less';
      if (chosenSign === '=') signColorClass = 'sign-color-equal';
      this.slotPlaceholderEl.className = `slot-filled-sign ${signColorClass}`;

      if (isCorrect) {
        this.handleCorrectAnswer(chosenSign);
      } else {
        this.handleWrongAnswer(chosenSign);
      }
    }

    vibrate(pattern) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {}
      }
    }

    handleCorrectAnswer(sign) {
      this.isLocked = true;
      this.score += 1;
      this.streak += 1;

      // Haptic & Sound (Tiếng Tinh Tinh -> Tiếp nối sound/correct.mp3)
      this.vibrate([40, 50, 70]);
      this.sound.playCorrectSequence();

      // Slot visual effect
      this.centerSlotEl.className = 'center-slot correct-glow';
      this.feedbackBubbleEl.className = 'feedback-bubble success';

      if (sign === '>') {
        this.feedbackTextEl.textContent = `🎉 Đúng rồi! ${this.numLeft} LỚN HƠN ${this.numRight}`;
      } else if (sign === '<') {
        this.feedbackTextEl.textContent = `🎉 Chuẩn luôn! ${this.numLeft} BÉ HƠN ${this.numRight}`;
      } else {
        this.feedbackTextEl.textContent = `🎉 Tuyệt vời! ${this.numLeft} BẰNG ${this.numRight}`;
      }

      // Small confetti burst if streak >= 3
      if (this.streak >= 3) {
        this.confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
      }

      this.updateStatusUI();

      // Proceed to next question after audio finish (~2.9s)
      setTimeout(() => {
        if (this.currentQuestionIndex < this.totalQuestions) {
          this.currentQuestionIndex += 1;
          this.loadQuestion();
        } else {
          this.showVictoryModal();
        }
      }, 2900);
    }

    handleWrongAnswer(sign) {
      this.streak = 0;
      // Haptic & Sound (Tiếng Tẹt Tẹt -> Tiếp nối sound/incorect.mp3)
      this.vibrate([70, 50, 70]);
      this.sound.playIncorrectSequence();

      // Slot shake visual effect
      this.centerSlotEl.className = 'center-slot wrong-shake';
      this.feedbackBubbleEl.className = 'feedback-bubble error';
      this.feedbackTextEl.textContent = 'Ồ, chưa đúng rồi! Bé thử lại nhé!';

      // Auto turn on counters helper if not already on
      if (!this.showCounters) {
        this.showCounters = true;
        this.btnToggleHelp.classList.add('active');
        this.btnToggleHelp.querySelector('.helper-text').innerHTML = `Đếm đồ vật: <b>BẬT</b>`;
        this.renderVisualCounters();
      }

      this.updateStatusUI();

      // Reset slot after a short delay so kid can retry
      setTimeout(() => {
        this.centerSlotEl.className = 'center-slot';
        this.slotPlaceholderEl.textContent = '?';
        this.slotPlaceholderEl.className = 'slot-placeholder';
        this.feedbackBubbleEl.className = 'feedback-bubble';
        this.feedbackTextEl.textContent = 'Bé chọn lại dấu nào?';
      }, 1400);
    }

    updateStatusUI() {
      this.starCountEl.textContent = this.score;
      this.currentQuestionNumEl.textContent = this.currentQuestionIndex;
      this.totalQuestionsNumEl.textContent = this.totalQuestions;

      const progressPercent = (this.currentQuestionIndex / this.totalQuestions) * 100;
      this.progressFillEl.style.width = `${progressPercent}%`;
      this.progressAvatarEl.style.left = `${progressPercent}%`;

      // Streak badge
      if (this.streak >= 2) {
        this.streakBadgeEl.style.display = 'inline-block';
        this.streakBadgeEl.innerHTML = `🔥 Đúng <b>${this.streak}</b> câu liên tiếp!`;
      } else {
        this.streakBadgeEl.style.display = 'none';
      }
    }

    showVictoryModal() {
      this.sound.playFanfare();
      this.confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 140);

      this.finalScoreEl.textContent = `${this.score}/${this.totalQuestions}`;

      let title = 'Thần Đồng Toán Học 🌟';
      if (this.score >= 9) {
        title = 'Vua So Sánh Nhí 👑';
      } else if (this.score >= 7) {
        title = 'Nhà Toán Học Tài Ba 🚀';
      } else {
        title = 'Bé Học Rất Chăm Chỉ 🎈';
      }
      this.awardTitleEl.textContent = title;

      this.victoryModal.style.display = 'flex';
    }
  }

  // --- Initialize when DOM is ready ---
  document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new ComparisonGame();
  });
})();
