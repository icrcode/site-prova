function updateClock() {
    const now = new Date();
    const options = {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const timeString = now.toLocaleTimeString('pt-BR', options);
    document.getElementById('clock').textContent = timeString;
}

// Função para mostrar notificação
function showNotification(message, type = 'info') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Função para adicionar efeito de confete quando a prova terminar
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        
        // Remove confetti após a animação
        setTimeout(() => {
            if (confetti.parentElement) {
                confetti.remove();
            }
        }, 5000);
    }
}

// Função para formatar tempo
function formatTime(hours, minutes, seconds) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Event listener para o botão de iniciar timer
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startTimer');
    const endTimeInput = document.getElementById('endTime');
    const timerDisplay = document.getElementById('timer');
    const timerControls = document.getElementById('timerControls');
    
    let timerInterval = null;
    let isTimerRunning = false;

    startButton.addEventListener('click', function() {
        const endTime = endTimeInput.value;
        
        if (!endTime) {
            showNotification('Por favor, insira um horário válido.', 'error');
            endTimeInput.focus();
            return;
        }

        const [endHour, endMinute] = endTime.split(':').map(Number);
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

        // Se o horário for para o dia seguinte
        if (end < now) {
            end.setDate(end.getDate() + 1);
        }

        // Limpa timer anterior se existir
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Esconde os controles com animação
        timerControls.style.opacity = '0';
        timerControls.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            timerControls.style.display = 'none';
        }, 300);

        isTimerRunning = true;
        showNotification('Temporizador iniciado com sucesso!', 'success');

        // Inicia o timer
        timerInterval = setInterval(() => {
            const now = new Date();
            const remainingTime = end - now;

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = 'Prova Finalizada!';
                timerDisplay.classList.add('timer-finished');
                
                // Efeitos de finalização
                createConfetti();
                showNotification('Tempo esgotado! A prova foi finalizada.', 'success');
                
                // Mostra os controles novamente após 3 segundos
                setTimeout(() => {
                    timerControls.style.display = 'block';
                    setTimeout(() => {
                        timerControls.style.opacity = '1';
                        timerControls.style.transform = 'translateY(0)';
                    }, 100);
                    
                    timerDisplay.classList.remove('timer-finished');
                    isTimerRunning = false;
                }, 3000);

                return;
            }

            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            timerDisplay.textContent = formatTime(hours, minutes, seconds);
            
            // Alerta quando restam 5 minutos
            const alertTimeMinutes = 5; //Tempo restante, em  minutos, para mostrar o alerta
            if (remainingTime <= alertTimeMinutes * 60 * 1000 && remainingTime > (alertTimeMinutes * 60 * 1000) - 1000) {
                showNotification('Atenção: Restam apenas ' + alertTimeMinutes + ' minutos!', 'error');
                timerDisplay.style.color = 'var(--danger-color)';
            }
            
            // Alerta quando resta 1 minuto
            if (remainingTime <= 1 * 60 * 1000 && remainingTime > 59 * 1000) {
                showNotification('Último minuto! Finalize suas respostas.', 'error');
            }
        }, 1000);
    });

    // Permite iniciar o timer pressionando Enter no input
    endTimeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isTimerRunning) {
            startButton.click();
        }
    });

    // Validação em tempo real do input
    endTimeInput.addEventListener('input', function() {
        const value = this.value;
        if (value) {
            const [hour, minute] = value.split(':').map(Number);
            const now = new Date();
            const inputTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
            
            if (inputTime < now) {
                inputTime.setDate(inputTime.getDate() + 1);
            }
            
            const diffMs = inputTime - now;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (diffHours > 0 || diffMinutes > 0) {
                this.style.borderColor = 'var(--secondary-color)';
            }
        }
    });
});

// Inicia o relógio
updateClock();
setInterval(updateClock, 1000);

// Adiciona estilos para notificações e confetti via JavaScript
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid var(--primary-color);
        max-width: 400px;
    }
    
    .notification-success {
        border-left-color: var(--secondary-color);
    }
    
    .notification-error {
        border-left-color: var(--danger-color);
    }
    
    .notification i {
        font-size: 1.25rem;
    }
    
    .notification-success i {
        color: var(--secondary-color);
    }
    
    .notification-error i {
        color: var(--danger-color);
    }
    
    .notification-info i {
        color: var(--primary-color);
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 0.25rem;
        border-radius: 4px;
        transition: var(--transition);
        margin-left: auto;
    }
    
    .notification-close:hover {
        background: var(--background-color);
        color: var(--text-primary);
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background: #ff6b6b;
        animation: confettiFall linear infinite;
        z-index: 999;
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
    
    @media (max-width: 768px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

