// Screen information data
const screenInfo = {
    'home': {
        title: '🏠 홈 화면',
        description: '사용자의 일일 커피 통계와 최근 기록을 보여주는 메인 대시보드입니다.',
        features: [
            '오늘의 커피 통계 (잔 수, 평균 평점, 연속 일수)',
            '최근 기록 2-3개 표시',
            '플로팅 액션 버튼 (FAB)으로 빠른 기록 추가',
            '하단 네비게이션 바'
        ]
    },
    'mode-select': {
        title: '✍️ 모드 선택',
        description: '커피 기록을 위한 두 가지 모드 중 하나를 선택하는 화면입니다.',
        features: [
            'Cafe Mode: 카페에서 마시는 커피 (6단계, 8-12분)',
            'HomeCafe Mode: 집에서 내리는 커피 (7단계, 14-25분)',
            '각 모드별 특징 설명',
            '시각적으로 구분된 카드 UI'
        ]
    },
    'cafe-coffee': {
        title: '☕ Cafe Mode - 커피 정보 (1/6)',
        description: 'Cafe Mode의 1단계로, 커피와 카페의 기본 정보를 입력합니다.',
        features: [
            '필수: 카페명, 로스터명, 커피명',
            '3단계 Cascade 자동완성',
            '선택: 원산지, 품종, 가공방식, 고도',
            'GPS 기반 카페 자동 감지',
            'OCR 메뉴판 스캔 기능'
        ]
    },
    'home-coffee': {
        title: '☕ HomeCafe Mode - 커피 정보 (1/7)',
        description: 'HomeCafe Mode의 1단계로, 원두의 기본 정보를 입력합니다.',
        features: [
            '필수: 로스터명, 커피명, 온도(Hot/Iced)',
            '2단계 Cascade 자동완성 (카페 없음)',
            '선택: 원산지, 품종, 가공방식, 고도',
            '로스팅 레벨 선택',
            '카페 이름 필드 없음'
        ]
    },
    'cafe-taste': {
        title: '🍓 Cafe Mode - 향미 선택 (2/6)',
        description: 'Cafe Mode의 2단계로, SCA Flavor Wheel 기반 향미를 선택합니다.',
        features: [
            '9개 대분류, 85개 향미',
            '3단계 계층 구조',
            '최소 1개 이상 선택 (권장 3개)',
            '검색 기능으로 빠른 찾기'
        ]
    },
    'home-extraction': {
        title: '🔧 HomeCafe Mode - 브루잉 설정 (2/7)',
        description: 'HomeCafe Mode의 2단계로, 브루잉 방법과 레시피를 기록합니다.',
        features: [
            '드리퍼 선택 (V60, Kalita Wave, Origami, April)',
            '비율 프리셋 (1:15 ~ 1:18)',
            '원두량/물량/온도 입력',
            '분쇄도 세팅 기록',
            '추출 타이머 및 랩타임'
        ]
    },
    'my-records': {
        title: '📚 내 기록',
        description: '사용자의 모든 커피 기록을 관리하는 화면입니다.',
        features: [
            '전체/카페/홈카페 필터',
            '총 기록 통계',
            '날짜별 그룹핑',
            '향미 태그 표시',
            '평점 표시'
        ]
    },
    'community': {
        title: '🌍 커뮤니티',
        description: 'MVP 버전의 간소화된 커뮤니티 기능입니다.',
        features: [
            '인기 커피 랭킹',
            '커피별 평균 평점',
            '마신 사람 수 표시',
            '커뮤니티 매치 점수 (취향 유사도)'
        ]
    },
    'profile': {
        title: '👤 프로필',
        description: '사용자 프로필과 통계를 보여주는 화면입니다.',
        features: [
            '총 기록 통계',
            '획득 배지 시스템',
            '취향 프로필 차트',
            '설정 접근'
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const screenId = btn.dataset.screen;
            showScreen(screenId);
            
            // Update active button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Add click handlers to bottom nav items
    const bottomNavItems = document.querySelectorAll('.nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            // Simple navigation logic
            const screens = ['home', 'community', 'mode-select', 'my-records', 'profile'];
            const index = Array.from(item.parentElement.children).indexOf(item);
            if (screens[index]) {
                showScreen(screens[index]);
                updateNavButton(screens[index]);
            }
        });
    });

    // Add click handler for FAB
    const fabs = document.querySelectorAll('.fab');
    fabs.forEach(fab => {
        fab.addEventListener('click', () => {
            showScreen('mode-select');
            updateNavButton('mode-select');
        });
    });

    // Add click handlers for mode selection
    const selectBtns = document.querySelectorAll('.select-btn');
    selectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isHomeCafe = btn.closest('.mode-card').querySelector('h3').textContent.includes('HomeCafe');
            if (isHomeCafe) {
                // Add class to hide cafe-only fields
                if (document.getElementById('home-coffee')) {
                    document.getElementById('home-coffee').classList.add('home-mode');
                }
                showScreen('home-coffee');
                updateNavButton('home-coffee');
            } else {
                // Remove class to show cafe fields
                if (document.getElementById('cafe-coffee')) {
                    document.getElementById('cafe-coffee').classList.remove('home-mode');
                }
                showScreen('cafe-coffee');
                updateNavButton('cafe-coffee');
            }
        });
    });

    // Add click handlers for next/previous buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentScreen = document.querySelector('.screen.active').id;
            if (currentScreen === 'cafe-coffee') {
                showScreen('cafe-taste');
                updateNavButton('cafe-taste');
            } else if (currentScreen === 'home-coffee') {
                showScreen('home-extraction');
                updateNavButton('home-extraction');
            }
        });
    });

    // Interactive elements
    addInteractiveElements();
});

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        
        // Update info panel
        updateInfoPanel(screenId);
    }
}

function updateNavButton(screenId) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.dataset.screen === screenId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateInfoPanel(screenId) {
    const info = screenInfo[screenId];
    const infoPanel = document.getElementById('screen-info');
    
    if (info) {
        let html = `
            <h4>${info.title}</h4>
            <p>${info.description}</p>
            <h5>주요 기능:</h5>
            <ul>
        `;
        
        info.features.forEach(feature => {
            html += `<li>${feature}</li>`;
        });
        
        html += '</ul>';
        infoPanel.innerHTML = html;
    }
}

function addInteractiveElements() {
    // Make star rating interactive
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('filled');
                } else {
                    s.classList.remove('filled');
                }
            });
        });
    });

    // Make roast options interactive
    const roastOptions = document.querySelectorAll('.roast-option');
    roastOptions.forEach(option => {
        option.addEventListener('click', () => {
            roastOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Make flavor buttons interactive
    const flavorBtns = document.querySelectorAll('.flavor-btn');
    flavorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
        });
    });

    // Make chips interactive
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.style.background = chip.style.background === 'rgb(76, 175, 80)' ? '#FFE066' : '#4CAF50';
        });
    });

    // Animate circular timer
    animateTimer();
}

function animateTimer() {
    const circle = document.querySelector('.circular-timer circle:last-child');
    if (circle) {
        let offset = 141;
        setInterval(() => {
            offset -= 1;
            if (offset < 0) offset = 565;
            circle.style.strokeDashoffset = offset;
            
            // Update timer text
            const timerTime = document.querySelector('.timer-time');
            if (timerTime) {
                const totalSeconds = Math.floor((565 - offset) / 565 * 150);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                timerTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 200);
    }

    // Animate flow rate
    const flowIndicator = document.querySelector('.flow-indicator');
    if (flowIndicator) {
        setInterval(() => {
            const width = 50 + Math.random() * 40;
            flowIndicator.style.width = width + '%';
            
            const flowValue = document.querySelector('.flow-value');
            if (flowValue) {
                flowValue.textContent = (1.5 + Math.random() * 1.5).toFixed(1) + ' g/s';
            }
        }, 1000);
    }
}