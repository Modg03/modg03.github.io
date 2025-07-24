// --- 1. Оновлені масиви зі словами ---
// Додаємо форми для гривні та копійки
const units = [
    "нуль", "один", "два", "три", "чотири", "п'ять", "шість", "сім", "вісім", "дев'ять",
    "десять", "одинадцять", "дванадцять", "тринадцять", "чотирнадцять", "п'ятнадцять",
    "шістнадцять", "сімнадцять", "вісімнадцять", "дев'ятнадцять"
];
const femaleUnits = ["", "одна", "дві"];
const tens = ["", "", "двадцять", "тридцять", "сорок", "п'ятдесят", "шістдесят", "сімдесят", "вісімдесят", "дев'яносто"];
const hundreds = ["", "сто", "двісті", "триста", "чотириста", "п'ятсот", "шістсот", "сімсот", "вісімсот", "дев'ятсот"];

const largeNumberNouns = [
    ['', '', ''],
    ['тисяча', 'тисячі', 'тисяч'],
    ['мільйон', 'мільйони', 'мільйонів'],
    ['мільярд', 'мільярди', 'мільярдів']
];

const currencyNouns = {
    hryvnia: ['гривня', 'гривні', 'гривень'],
    kopiyka: ['копійка', 'копійки', 'копійок']
};


// --- 2. Функція для української граматики (без змін) ---
function getNounPluralForm(number, nounForms) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return nounForms[2];
    }
    if (lastDigit === 1) {
        return nounForms[0];
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return nounForms[1];
    }
    return nounForms[2];
}

// --- 3. Функція-помічник для конвертації тризначних чисел (без змін) ---
function convertThreeDigitChunkToString(chunk, gender) {
    if (chunk === 0) return "";
    const parts = [];
    const hundredPart = Math.floor(chunk / 100);
    if (hundredPart > 0) parts.push(hundreds[hundredPart]);
    const remainder = chunk % 100;
    if (remainder > 0) {
        if (remainder < 20) {
            if (gender === 'female' && remainder === 1) parts.push(femaleUnits[1]);
            else if (gender === 'female' && remainder === 2) parts.push(femaleUnits[2]);
            else parts.push(units[remainder]);
        } else {
            parts.push(tens[Math.floor(remainder / 10)]);
            const unitPart = remainder % 10;
            if (unitPart > 0) {
                if (gender === 'female' && unitPart === 1) parts.push(femaleUnits[1]);
                else if (gender === 'female' && unitPart === 2) parts.push(femaleUnits[2]);
                else parts.push(units[unitPart]);
            }
        }
    }
    return parts.join(' ');
}

// --- 4. Головна оновлена функція ---
// Тепер вона називається numberToCurrency і обробляє гривні та копійки
function numberToCurrency(number) {
    if (isNaN(number)) return "Будь ласка, введіть число.";
    if (number > 999999999999) return "Число занадто велике.";

    // Розділяємо число на гривні та копійки
    const hryvnias = Math.floor(number);
    const kopiyky = Math.round((number - hryvnias) * 100);

    // --- Обробка гривень ---
    let hryvniasAsWords = '';
    if (hryvnias === 0) {
        hryvniasAsWords = "нуль";
    } else {
        let tempHryvnias = hryvnias;
        const resultParts = [];
        let chunkIndex = 0;
        while (tempHryvnias > 0) {
            const chunk = tempHryvnias % 1000;
            if (chunk > 0) {
                const nounForms = largeNumberNouns[chunkIndex];
                const gender = (chunkIndex === 1) ? 'female' : 'male';
                const chunkAsWords = convertThreeDigitChunkToString(chunk, gender);
                const pluralNoun = getNounPluralForm(chunk, nounForms);
                resultParts.push(`${chunkAsWords} ${pluralNoun}`);
            }
            tempHryvnias = Math.floor(tempHryvnias / 1000);
            chunkIndex++;
        }
        hryvniasAsWords = resultParts.reverse().join(' ').trim();
    }
    
    // Правильно відмінюємо слово "гривня"
    const hryvniaNoun = getNounPluralForm(hryvnias, currencyNouns.hryvnia);

    // --- Обробка копійок ---
    // Форматуємо копійки, щоб завжди було 2 цифри (напр. 5 -> "05")
    const kopiykyAsString = String(kopiyky).padStart(2, '0');
    // Правильно відмінюємо слово "копійка"
    const kopiykaNoun = getNounPluralForm(kopiyky, currencyNouns.kopiyka);
    
    // Збираємо фінальний результат
    return `${hryvniasAsWords} ${hryvniaNoun} ${kopiykyAsString} ${kopiykaNoun}`;
}

// --- 5. Код, що зв'язує все з HTML ---
const numberInput = document.getElementById('numberInput');
const convertBtn = document.getElementById('convertBtn');
const resultText = document.getElementById('resultText');

convertBtn.addEventListener('click', () => {
    // Використовуємо parseFloat для читання дробових чисел
    const number = parseFloat(numberInput.value);
    
    // Викликаємо нашу нову головну функцію
    const textResult = numberToCurrency(number);
    resultText.textContent = textResult;
});
// --- 6. Логіка для кнопки копіювання ---

// Знаходимо нову кнопку
const copyBtn = document.getElementById('copyBtn');

copyBtn.addEventListener('click', () => {
    // Отримуємо текст з поля результату
    const textToCopy = resultText.textContent;

    // Якщо там є текст для копіювання
    if (textToCopy) {
        // Використовуємо Clipboard API для копіювання
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Успіх! Даємо користувачу зворотний зв'язок
                const originalIcon = copyBtn.textContent;
                copyBtn.textContent = '✅'; // Змінюємо іконку на галочку
                // Повертаємо стару іконку через 1.5 секунди
                setTimeout(() => {
                    copyBtn.textContent = originalIcon;
                }, 1500);
            })
            .catch(err => {
                // Обробка можливої помилки
                console.error('Не вдалося скопіювати текст: ', err);
            });
    }
});