// 게임 상태 변수
let coins = 1000;
let betAmount = 10;
let isSpinning = false;

// 슬롯 심볼들
const symbols = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍑'];

// DOM 요소들
const coinsElement = document.getElementById('coins');
const betAmountElement = document.getElementById('bet-amount');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinButton = document.getElementById('spin-btn');
const betMinusButton = document.getElementById('bet-minus');
const betPlusButton = document.getElementById('bet-plus');
const messageElement = document.getElementById('message');

// 초기 상태 업데이트
updateDisplay();

// 이벤트 리스너 등록
spinButton.addEventListener('click', spin);
betMinusButton.addEventListener('click', decreaseBet);
betPlusButton.addEventListener('click', increaseBet);

// 베팅 금액 감소
function decreaseBet() {
    if (betAmount > 10) {
        betAmount -= 10;
        updateDisplay();
    }
}

// 베팅 금액 증가
function increaseBet() {
    if (betAmount < coins && betAmount < 100) {
        betAmount += 10;
        updateDisplay();
    }
}

// 화면 업데이트
function updateDisplay() {
    coinsElement.textContent = coins;
    betAmountElement.textContent = betAmount;
    
    // 버튼 활성화/비활성화
    betMinusButton.disabled = betAmount <= 10;
    betPlusButton.disabled = betAmount >= coins || betAmount >= 100;
    spinButton.disabled = coins < betAmount || isSpinning;
}

// 랜덤 심볼 생성
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// 스핀 애니메이션
function animateReel(reel, finalSymbol, delay) {
    return new Promise((resolve) => {
        reel.classList.add('spinning');
        
        let spinCount = 0;
        const maxSpins = 20 + Math.floor(Math.random() * 10);
        
        const spinInterval = setInterval(() => {
            reel.textContent = getRandomSymbol();
            spinCount++;
            
            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                setTimeout(() => {
                    reel.textContent = finalSymbol;
                    reel.classList.remove('spinning');
                    resolve();
                }, delay);
            }
        }, 100);
    });
}

// 스핀 실행
async function spin() {
    if (coins < betAmount || isSpinning) return;
    
    isSpinning = true;
    coins -= betAmount;
    
    // 메시지 초기화
    messageElement.textContent = '스핀 중...';
    messageElement.className = 'message';
    
    updateDisplay();
    
    // 결과 심볼 미리 생성
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // 각 릴을 순차적으로 정지
    await Promise.all([
        animateReel(reels[0], results[0], 0),
        animateReel(reels[1], results[1], 200),
        animateReel(reels[2], results[2], 400)
    ]);
    
    // 결과 계산
    const winnings = calculateWinnings(results);
    
    if (winnings > 0) {
        coins += winnings;
        messageElement.textContent = `축하합니다! ${winnings} 코인 획득! 🎉`;
        messageElement.className = 'message win';
    } else {
        messageElement.textContent = '아쉽네요. 다시 도전해보세요! 💪';
        messageElement.className = 'message lose';
    }
    
    // 게임 오버 체크
    if (coins < betAmount) {
        if (coins < 10) {
            messageElement.textContent = '게임 오버! 코인이 부족합니다. 😢';
            messageElement.className = 'message lose';
        } else {
            betAmount = Math.min(betAmount, coins);
        }
    }
    
    isSpinning = false;
    updateDisplay();
}

// 당첨 계산
function calculateWinnings(results) {
    const [r1, r2, r3] = results;
    
    // 세 개 모두 같은 경우
    if (r1 === r2 && r2 === r3) {
        switch (r1) {
            case '🍎': return betAmount * 10;
            case '🍊': return betAmount * 8;
            case '🍌': return betAmount * 6;
            case '🍇': return betAmount * 5;
            case '🍓': return betAmount * 4;
            case '🍑': return betAmount * 3;
        }
    }
    
    // 두 개가 같은 경우
    if (r1 === r2 || r2 === r3 || r1 === r3) {
        return betAmount * 2;
    }
    
    return 0;
}

// 키보드 이벤트 (스페이스바로 스핀)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning && coins >= betAmount) {
        e.preventDefault();
        spin();
    }
});