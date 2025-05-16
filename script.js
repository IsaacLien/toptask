document.addEventListener('DOMContentLoaded', () => {
    const mainTaskInput = document.getElementById('main-task-input');
    const submitMainTask = document.getElementById('submit-main-task');
    const mainTaskDisplay = document.getElementById('main-task-display');
    const mainTaskText = document.getElementById('main-task-text');
    const mainTaskCheckbox = document.getElementById('main-task-checkbox');
    const taskInputSection = document.getElementById('task-input-section');
    const additionalTasksSection = document.getElementById('additional-tasks-section');
    const additionalTaskInput = document.getElementById('additional-task-input-field');
    const submitAdditionalTask = document.getElementById('submit-additional-task');
    const additionalTasksList = document.getElementById('additional-tasks-list');
    const celebrationModal = document.getElementById('celebration-modal');
    const celebrationButton = document.getElementById('celebration-button');
    const summary = document.getElementById('summary');

    function updateSummary() {
        const tasks = [];
        const mainTask = mainTaskText.textContent.trim();
        if (mainTask) tasks.push(mainTask);
        const additionalSpans = additionalTasksList.querySelectorAll('span');
        additionalSpans.forEach(span => tasks.push(span.textContent.trim()));

        const today = new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (tasks.length === 0) {
            summary.textContent = `Today's date is ${today}.`;
        } else if (tasks.length === 1) {
            summary.textContent = `Today's date is ${today}. My top task is ${tasks[0]}.`;
        } else {
            summary.textContent = `Today's date is ${today}. My top tasks are ${tasks.join(', ')}.`;
        }
    }

    function submitMainTaskHandler() {
        const task = mainTaskInput.value.trim();
        if (task) {
            mainTaskText.textContent = task;
            taskInputSection.classList.add('hidden');
            mainTaskDisplay.classList.remove('hidden');
            updateSummary();
        }
    }

    function submitAdditionalTaskHandler() {
        const task = additionalTaskInput.value.trim();
        if (task) {
            const taskElement = createTaskElement(task);
            additionalTasksList.appendChild(taskElement);
            additionalTaskInput.value = '';
            updateSummary();
            
            // Limit to 3 additional tasks
            if (additionalTasksList.children.length >= 3) {
                additionalTaskInput.disabled = true;
                submitAdditionalTask.disabled = true;
            }
        }
    }

    function checkAllTasksComplete() {
        if (!mainTaskCheckbox.checked) return false;
        
        const additionalTasks = additionalTasksList.querySelectorAll('input[type="checkbox"]');
        if (additionalTasks.length < 3) return false;
        
        return Array.from(additionalTasks).every(checkbox => checkbox.checked);
    }

    function triggerFinalCelebration() {
        // Multiple confetti bursts
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        // Show the celebration modal
        celebrationModal.classList.remove('hidden');
    }

    // Add Enter key listeners
    mainTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitMainTaskHandler();
        }
    });

    additionalTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !additionalTaskInput.disabled) {
            e.preventDefault();
            submitAdditionalTaskHandler();
        }
    });

    // Click handlers
    submitMainTask.addEventListener('click', submitMainTaskHandler);
    submitAdditionalTask.addEventListener('click', submitAdditionalTaskHandler);

    mainTaskCheckbox.addEventListener('change', () => {
        if (mainTaskCheckbox.checked) {
            // Trigger confetti animation
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Show additional tasks section
            additionalTasksSection.classList.remove('hidden');
        }
    });

    // Reset for next day
    celebrationButton.addEventListener('click', () => {
        location.reload();
    });

    function createTaskElement(taskText) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        
        // Add change listener to check if all tasks are complete
        checkbox.addEventListener('change', () => {
            if (checkAllTasksComplete()) {
                triggerFinalCelebration();
            }
        });
        
        const text = document.createElement('span');
        text.textContent = taskText;
        
        taskCard.appendChild(checkbox);
        taskCard.appendChild(text);

        return taskCard;
    }

    // ---------------- Flappy Bird Game -----------------
    const flappyCanvas = document.getElementById('flappy-canvas');
    const flappyStart = document.getElementById('flappy-start');

    const fctx = flappyCanvas.getContext('2d');
    let bird, pipes, frameCount, playing;

    function resetFlappy() {
        bird = { x: 50, y: flappyCanvas.height / 2, width: 20, height: 20, velocity: 0 };
        pipes = [];
        frameCount = 0;
        playing = true;
        fctx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);
        flappyStart.classList.add('hidden');
        requestAnimationFrame(updateFlappy);
    }

    function addPipe() {
        const gap = 120;
        const minHeight = 40;
        const maxHeight = flappyCanvas.height - gap - minHeight;
        const top = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        pipes.push({ x: flappyCanvas.width, top });
    }

    function drawFlappy() {
        fctx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);
        // Draw bird
        fctx.fillStyle = '#f0f';
        fctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        // Draw pipes
        fctx.fillStyle = '#0f0';
        pipes.forEach(p => {
            fctx.fillRect(p.x, 0, 40, p.top);
            fctx.fillRect(p.x, p.top + 120, 40, flappyCanvas.height - p.top - 120);
        });
    }

    function checkCollision() {
        if (bird.y < 0 || bird.y + bird.height > flappyCanvas.height) return true;
        for (const p of pipes) {
            if (bird.x + bird.width > p.x && bird.x < p.x + 40) {
                if (bird.y < p.top || bird.y + bird.height > p.top + 120) return true;
            }
        }
        return false;
    }

    function updateFlappy() {
        if (!playing) return;
        frameCount++;
        bird.velocity += 0.6;
        bird.y += bird.velocity;

        if (frameCount % 90 === 0) addPipe();
        pipes.forEach(p => p.x -= 2);
        pipes = pipes.filter(p => p.x + 40 > 0);

        if (checkCollision()) {
            playing = false;
            flappyStart.classList.remove('hidden');
            return;
        }

        drawFlappy();
        requestAnimationFrame(updateFlappy);
    }

    function flap() {
        if (!playing) return;
        bird.velocity = -8;
    }

    flappyStart.addEventListener('click', resetFlappy);
    flappyCanvas.addEventListener('click', flap);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            flap();
        }
    });

    updateSummary();

    // --- Cute snail animation ---
    const snail = document.getElementById('snail');
    let sx = 0;
    let sy = 0;
    let dir = 'right';
    const snailSpeed = 1; // pixels per frame

    function moveSnail() {
        const maxX = window.innerWidth - snail.offsetWidth;
        const maxY = window.innerHeight - snail.offsetHeight;

        switch (dir) {
            case 'right':
                sx += snailSpeed;
                if (sx >= maxX) { sx = maxX; dir = 'down'; }
                break;
            case 'down':
                sy += snailSpeed;
                if (sy >= maxY) { sy = maxY; dir = 'left'; }
                break;
            case 'left':
                sx -= snailSpeed;
                if (sx <= 0) { sx = 0; dir = 'up'; }
                break;
            case 'up':
                sy -= snailSpeed;
                if (sy <= 0) { sy = 0; dir = 'right'; }
                break;
        }

        snail.style.transform = `translate(${sx}px, ${sy}px)`;

        const slime = document.createElement('div');
        slime.className = 'slime';
        slime.style.left = (sx + snail.offsetWidth / 2) + 'px';
        slime.style.top = (sy + snail.offsetHeight / 2) + 'px';
        document.body.appendChild(slime);
        setTimeout(() => slime.remove(), 2000);
    }

    setInterval(moveSnail, 30);
});
