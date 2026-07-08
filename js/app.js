// 掌纹算命应用逻辑

// 掌纹解读数据库
const palmReadings = {
    life: {
        long: {
            title: "生命线 · 长而清晰",
            desc: "你的生命线长且弧度大，这是健康长寿的象征。你天生体魄强健，精力充沛，拥有旺盛的生命力。即使偶有小恙，也能迅速恢复。",
            score: 90
        },
        medium: {
            title: "生命线 · 中等长度",
            desc: "你的生命线长度适中，健康状况整体平稳。你懂得劳逸结合，生活节奏把握得当。注意规律作息，福气自然绵长。",
            score: 75
        },
        short: {
            title: "生命线 · 较短",
            desc: "你的生命线较短且靠近大拇指，提醒你要多关注身体信号。适当运动、均衡饮食可以增强体质。掌纹会随生活改变而变化，不必忧虑。",
            score: 60
        }
    },
    head: {
        straight: {
            title: "智慧线 · 平直延伸",
            desc: "你的智慧线平直，思维务实理性，擅长逻辑分析。你做事有条理，是值得信赖的实干家。在商界和工程领域大有可为。",
            score: 82
        },
        curved: {
            title: "智慧线 · 向下弯曲",
            desc: "你的智慧线向下弯曲，富有想象力与创造力。你心思细腻，有艺术天赋，适合从事文学、艺术或设计类工作。灵感是你最大的财富。",
            score: 85
        },
        long: {
            title: "智慧线 · 长而深刻",
            desc: "你的智慧线长且深刻，思维缜密，学习能力强。你善于深谋远虑，能洞察事物本质。是天生的智者和领导者。",
            score: 92
        }
    },
    heart: {
        long: {
            title: "感情线 · 长且上翘",
            desc: "你的感情线长且末端上翘，感情丰富而真挚。你重情重义，待人温暖，容易收获美好姻缘。桃花旺盛，注意甄别真心人。",
            score: 88
        },
        wavy: {
            title: "感情线 · 波浪起伏",
            desc: "你的感情线呈波浪状，情感经历较为丰富曲折。你感性多情，感情路上有惊喜也有波折。学会平和心态，终会遇到对的人。",
            score: 70
        },
        straight: {
            title: "感情线 · 平直清晰",
            desc: "你的感情线平直清晰，感情观成熟稳定。你对待感情忠诚专一，不轻易动心但一旦投入便全心全意。是值得托付终身的人。",
            score: 80
        }
    }
};

// 综合运势文案
const fortuneLabels = [
    { min: 90, label: "大吉大利 ✨", desc: "鸿运当头，万事顺遂！" },
    { min: 75, label: "吉星高照 🌟", desc: "运势上佳，把握机遇。" },
    { min: 60, label: "平稳安康 🍀", desc: "稳中向好，脚踏实地。" },
    { min: 0, label: "蓄势待发 🌱", desc: "韬光养晦，静待花开。" }
];

// 用户选择
const selections = {
    life: null,
    head: null,
    heart: null
};

// DOM 元素
const screens = document.querySelectorAll('.screen');
const startBtn = document.getElementById('start-btn');
const readBtn = document.getElementById('read-btn');
const restartBtn = document.getElementById('restart-btn');
const options = document.querySelectorAll('.option');

// 切换页面
function showScreen(screenId) {
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 选项点击事件
options.forEach(option => {
    option.addEventListener('click', () => {
        const line = option.dataset.line;
        const value = option.dataset.value;

        // 取消同组其他选项的选中状态
        document.querySelectorAll(`.option[data-line="${line}"]`).forEach(opt => {
            opt.classList.remove('selected');
        });

        // 选中当前选项
        option.classList.add('selected');
        selections[line] = value;

        // 检查是否全部选完
        checkAllSelected();
    });
});

// 检查是否三项都选完
function checkAllSelected() {
    const allSelected = selections.life && selections.head && selections.heart;
    readBtn.disabled = !allSelected;
}

// 生成解读结果
function generateResult() {
    const lifeReading = palmReadings.life[selections.life];
    const headReading = palmReadings.head[selections.head];
    const heartReading = palmReadings.heart[selections.heart];

    const avgScore = Math.round((lifeReading.score + headReading.score + heartReading.score) / 3);

    // 生成结果 HTML
    const resultContent = document.getElementById('result-content');
    resultContent.innerHTML = `
        <div class="result-section">
            <h3>💪 ${lifeReading.title}</h3>
            <p>${lifeReading.desc}</p>
        </div>
        <div class="result-section">
            <h3>🧠 ${headReading.title}</h3>
            <p>${headReading.desc}</p>
        </div>
        <div class="result-section">
            <h3>❤️ ${heartReading.title}</h3>
            <p>${heartReading.desc}</p>
        </div>
    `;

    // 显示运势分数
    const scoreFill = document.getElementById('score-fill');
    const scoreText = document.getElementById('score-text');
    const fortune = fortuneLabels.find(f => avgScore >= f.min);

    setTimeout(() => {
        scoreFill.style.width = avgScore + '%';
    }, 300);

    scoreText.textContent = `${avgScore} 分 · ${fortune.label} — ${fortune.desc}`;
}

// 事件绑定
startBtn.addEventListener('click', () => showScreen('palm-screen'));
readBtn.addEventListener('click', () => {
    showScreen('result-screen');
    generateResult();
});
restartBtn.addEventListener('click', () => {
    // 重置选择
    selections.life = null;
    selections.head = null;
    selections.heart = null;
    options.forEach(opt => opt.classList.remove('selected'));
    readBtn.disabled = true;
    document.getElementById('score-fill').style.width = '0%';
    showScreen('welcome-screen');
});
