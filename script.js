window.addEventListener('load', function() {
    // Screens
    const inputScreen = document.getElementById('input-screen');
    const ggjLink = document.getElementById('ggj-link');
    const ggjImage = document.getElementById('ggj-image');
    const displayScreen = document.getElementById('display-screen');
    const settingsScreen = document.getElementById('settings-screen');
    const recordScreen = document.getElementById('record-screen');

    // Buttons
    const menuButton = document.getElementById('menu-button');
    let menuDropdown; // created dynamically
    const closeSettingsButton = document.getElementById('close-settings');
    const closeDisplayButton = document.getElementById('close-display-button');
    const keypad = document.getElementById('keypad');
    const recordButton = document.getElementById('record-button');
    const closeRecordButton = document.getElementById('close-record');
    const recordTableBody = document.querySelector('#record-table tbody');
    const copyTsvButton = document.getElementById('copy-tsv');
    const resetDefaultsButton = document.getElementById('reset-defaults');
    const enableShakeButton = document.getElementById('enable-shake');

    // Displays
    const inputDisplay = document.getElementById('input-display');
    const numberDisplay = document.getElementById('number-display');

    // Settings
    const fontSizeSlider = document.getElementById('font-size');
    const animationEmphasisSlider = document.getElementById('animation-emphasis');
    const shakeSensitivitySlider = document.getElementById('shake-sensitivity');
    const bgColorPicker = document.getElementById('bg-color');
    const fontColorPicker = document.getElementById('font-color');

    // Gesture Settings
    const enableSwipeRightToLeft = document.getElementById('enable-swipe-right-to-left');
    const resultSwipeRightToLeft = document.getElementById('result-swipe-right-to-left');
    const enableSwipeLeftToRight = document.getElementById('enable-swipe-left-to-right');
    const resultSwipeLeftToRight = document.getElementById('result-swipe-left-to-right');
    const enableSwipeTopToBottom = document.getElementById('enable-swipe-top-to-bottom');
    const resultSwipeTopToBottom = document.getElementById('result-swipe-top-to-bottom');
    const enableSwipeBottomToTop = document.getElementById('enable-swipe-bottom-to-top');
    const resultSwipeBottomToTop = document.getElementById('result-swipe-bottom-to-top');
    const enableTwoFingerTouch = document.getElementById('enable-two-finger-touch');
    const resultTwoFingerTouch = document.getElementById('result-two-finger-touch');
    const unitSwipeRightToLeft = document.getElementById('unit-swipe-right-to-left');
    const unitSwipeLeftToRight = document.getElementById('unit-swipe-left-to-right');
    const unitSwipeTopToBottom = document.getElementById('unit-swipe-top-to-bottom');
    const unitSwipeBottomToTop = document.getElementById('unit-swipe-bottom-to-top');
    const unitTwoFingerTouch = document.getElementById('unit-two-finger-touch');

    // Slider value displays
    const fontSizeValue = document.getElementById('font-size-value');
    const animationEmphasisValue = document.getElementById('animation-emphasis-value');
    const shakeSensitivityValue = document.getElementById('shake-sensitivity-value');

    // Preview numbers
    const previewNumber27 = document.getElementById('preview-number-27');

    // Rotation radio buttons
    const rotationRadios = document.querySelectorAll('input[name="rotation"]');

    // Log
    const logList = document.getElementById('log-list');

    const DEFAULT_SETTINGS = {
        animationEmphasis: 1.1,
        backgroundColor: '#002f41',
        fontColor: '#aaaaaa',
        shakeSensitivity: 20,
        fontSize: 70,
        rotation: 0,
        enableSwipeRightToLeft: false,
        resultSwipeRightToLeft: '',
        enableSwipeLeftToRight: false,
        resultSwipeLeftToRight: '',
        enableSwipeTopToBottom: false,
        resultSwipeTopToBottom: '',
        enableSwipeBottomToTop: false,
        resultSwipeBottomToTop: '',
        enableTwoFingerTouch: false,
        resultTwoFingerTouch: '',
        unitSwipeRightToLeft: '',
        unitSwipeLeftToRight: '',
        unitSwipeTopToBottom: '',
        unitSwipeBottomToTop: '',
        unitTwoFingerTouch: '',
    };

    let currentInput = "";
    let twoDigitMode = false;
    let emphasisInterval = null;
    let emphasisIntervalPreview = null;
    let lastShownNumber = "";
    let shakeCooldown = false;
    let settings = { ...DEFAULT_SETTINGS };
    let log = [];

    // Accept numeric input only when explicitly enabled
    let numericInputEnabled = true;
    let numericInputEnableTimer = null;

    // --- Initialization ---
    loadSettings();
    loadLog();
    applySettings();
    updateLogDisplay();
    if (recordTableBody) updateRecordTableV2();
    // Setup iOS motion permission UI
    setupShakePermissionButton();

    // Position background teita.png 20px under GGJ image
    function updateTeitaOffset() {
        if (!inputScreen || !ggjLink) return;
        try {
            const offset = (ggjLink.offsetTop || 0) + (ggjLink.offsetHeight || 0) + 20;
            inputScreen.style.setProperty('--teita-offset', offset + 'px');
        } catch (e) {
            // noop
        }
    }
    updateTeitaOffset();
    window.addEventListener('resize', updateTeitaOffset);
    if (ggjImage) {
        if (!ggjImage.complete) {
            ggjImage.addEventListener('load', updateTeitaOffset, { once: true });
        } else {
            updateTeitaOffset();
        }
    }

    // --- Event Listeners ---

    keypad.addEventListener('click', function(event) {
        // 数字入力画面がアクティブでない、または受付クールダウン中は処理しない
        if (!inputScreen.classList.contains('active')) return;
        if (!numericInputEnabled) return;
        if (!event.target.classList.contains('key')) return;

        const key = event.target.dataset.key;

        if (key === 'clear') {
            currentInput = "";
            twoDigitMode = false;
            inputScreen.classList.remove('two-digit-mode');
        } else if (key === '10') {
            // Start two-digit mode fresh
            twoDigitMode = true;
            currentInput = "";
            inputDisplay.textContent = "";
            inputScreen.classList.add('two-digit-mode');
        } else {
            if (twoDigitMode) {
                if (currentInput.length < 2) {
                    currentInput += key;
                }
                if (currentInput.length === 2) {
                    showNumber(currentInput);
                }
            } else {
                 if (currentInput.length < 1) {
                    currentInput += key;
                }
                if (currentInput.length === 1) {
                    showNumber(currentInput);
                }
            }
        }
        inputDisplay.textContent = (!twoDigitMode && currentInput === '0') ? '〇' : currentInput;
    });

    // Initialize dropdown menu under hamburger
    setupMenuDropdown();
    closeSettingsButton.addEventListener('click', showInputScreen);
    closeDisplayButton.addEventListener('click', () => showInputScreen('closeButton'));
    if (recordButton) recordButton.addEventListener('click', showRecordScreen);
    if (closeRecordButton) closeRecordButton.addEventListener('click', showInputScreen);
    if (copyTsvButton) copyTsvButton.addEventListener('click', copyLogAsTsv);
    if (resetDefaultsButton) resetDefaultsButton.addEventListener('click', resetSettingsToDefaults);
    if (enableShakeButton) enableShakeButton.addEventListener('click', requestMotionPermission);

    // Shake detection
    window.addEventListener('devicemotion', function(event) {
        // 数字表示画面がアクティブな場合のみシェイクを検出
        if (!displayScreen.classList.contains('active')) return;

        const acceleration = event.accelerationIncludingGravity;
        const sensitivity = settings.shakeSensitivity;
        if (shakeCooldown) return;
        if (
            Math.abs(acceleration.x) > sensitivity ||
            Math.abs(acceleration.y) > sensitivity ||
            Math.abs(acceleration.z) > sensitivity
        ) {
            // Return to input screen on shake
            shakeCooldown = true;
            showInputScreen('shake', '', ''); // シェイクによる遷移であることを示す引数を追加
            setTimeout(() => { shakeCooldown = false; }, 300);
        }
    });

    // Gesture detection variables
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let twoFingerTouchActive = false;
    const SWIPE_THRESHOLD = 50; // スワイプと判定する最小距離
    const TOUCH_TIME_THRESHOLD = 300; // タッチイベントの最大時間（ミリ秒）
    let gestureCooldown = false; // ジェスチャーのクールダウン

    displayScreen.addEventListener('touchstart', (e) => {
        if (!displayScreen.classList.contains('active')) return; // 数字表示画面がアクティブでない場合は処理しない

        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            twoFingerTouchActive = false;
        } else if (e.touches.length === 2) {
            twoFingerTouchActive = true;
            touchStartTime = Date.now(); // 2本指タッチの開始時間も記録
        }
    });

    displayScreen.addEventListener('touchmove', (e) => {
        if (!displayScreen.classList.contains('active')) return; // 数字表示画面がアクティブでない場合は処理しない
        if (e.touches.length === 1) {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }
    });

    displayScreen.addEventListener('touchend', (e) => {
        if (!displayScreen.classList.contains('active') || gestureCooldown) return; // 数字表示画面がアクティブでない、またはクールダウン中は処理しない

        const elapsedTime = Date.now() - touchStartTime;

        // 2本指タッチの検出
        if (twoFingerTouchActive && e.touches.length === 0 && elapsedTime < TOUCH_TIME_THRESHOLD) {
            if (settings.enableTwoFingerTouch) {
                gestureCooldown = true;
                showInputScreen('twoFingerTouch', settings.resultTwoFingerTouch, settings.unitTwoFingerTouch);
                setTimeout(() => { gestureCooldown = false; }, 500);
            }
            twoFingerTouchActive = false;
            return;
        }

        // スワイプの検出
        if (e.touches.length === 0 && elapsedTime < TOUCH_TIME_THRESHOLD) {
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) { // 横方向のスワイプ
                if (dx > SWIPE_THRESHOLD && settings.enableSwipeLeftToRight) {
                    gestureCooldown = true;
                    showInputScreen('swipeLeftToRight', settings.resultSwipeLeftToRight, settings.unitSwipeLeftToRight);
                    setTimeout(() => { gestureCooldown = false; }, 500);
                } else if (dx < -SWIPE_THRESHOLD && settings.enableSwipeRightToLeft) {
                    gestureCooldown = true;
                    showInputScreen('swipeRightToLeft', settings.resultSwipeRightToLeft, settings.unitSwipeRightToLeft);
                    setTimeout(() => { gestureCooldown = false; }, 500);
                }
            } else { // 縦方向のスワイプ
                if (dy > SWIPE_THRESHOLD && settings.enableSwipeTopToBottom) {
                    gestureCooldown = true;
                    showInputScreen('swipeTopToBottom', settings.resultSwipeTopToBottom, settings.unitSwipeTopToBottom);
                    setTimeout(() => { gestureCooldown = false; }, 500);
                } else if (dy < -SWIPE_THRESHOLD && settings.enableSwipeBottomToTop) {
                    gestureCooldown = true;
                    showInputScreen('swipeBottomToTop', settings.resultSwipeBottomToTop, settings.unitSwipeBottomToTop);
                    setTimeout(() => { gestureCooldown = false; }, 500);
                }
            }
        }
    });
    
    // Settings Listeners
    fontSizeSlider.addEventListener('input', (e) => {
        settings.fontSize = e.target.value;
        fontSizeValue.textContent = `数字の大きさ: ${settings.fontSize}`;
        previewNumber27.style.fontSize = settings.fontSize + 'vw';
        applySettings();
        saveSettings();
    });
    animationEmphasisSlider.addEventListener('input', (e) => {
        settings.animationEmphasis = 1 + (e.target.value / 10);
        animationEmphasisValue.textContent = `アピールの強さ: ${e.target.value}`;
        animationEmphasisValue.textContent = `アピールの強さ: ${e.target.value}`;
        saveSettings();
    });
    shakeSensitivitySlider.addEventListener('input', (e) => {
        settings.shakeSensitivity = e.target.value;
        shakeSensitivityValue.textContent = `振って数字を消す感度: ${settings.shakeSensitivity}`;
        saveSettings();
    });
    bgColorPicker.addEventListener('input', (e) => {
        settings.backgroundColor = e.target.value;
        applySettings();
        saveSettings();
    });
    fontColorPicker.addEventListener('input', (e) => {
        settings.fontColor = e.target.value;
        applySettings();
        saveSettings();
    });

    rotationRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            settings.rotation = parseInt(e.target.value);
            applySettings();
            saveSettings();
        });
    });

    // New Gesture Settings Listeners
    enableSwipeRightToLeft.addEventListener('change', (e) => {
        settings.enableSwipeRightToLeft = e.target.checked;
        saveSettings();
    });
    resultSwipeRightToLeft.addEventListener('change', (e) => {
        settings.resultSwipeRightToLeft = e.target.value;
        saveSettings();
    });
    enableSwipeLeftToRight.addEventListener('change', (e) => {
        settings.enableSwipeLeftToRight = e.target.checked;
        saveSettings();
    });
    resultSwipeLeftToRight.addEventListener('change', (e) => {
        settings.resultSwipeLeftToRight = e.target.value;
        saveSettings();
    });
    enableSwipeTopToBottom.addEventListener('change', (e) => {
        settings.enableSwipeTopToBottom = e.target.checked;
        saveSettings();
    });
    resultSwipeTopToBottom.addEventListener('change', (e) => {
        settings.resultSwipeTopToBottom = e.target.value;
        saveSettings();
    });
    enableSwipeBottomToTop.addEventListener('change', (e) => {
        settings.enableSwipeBottomToTop = e.target.checked;
        saveSettings();
    });
    resultSwipeBottomToTop.addEventListener('change', (e) => {
        settings.resultSwipeBottomToTop = e.target.value;
        saveSettings();
    });
    enableTwoFingerTouch.addEventListener('change', (e) => {
        settings.enableTwoFingerTouch = e.target.checked;
        saveSettings();
    });
    resultTwoFingerTouch.addEventListener('change', (e) => {
        settings.resultTwoFingerTouch = e.target.value;
        saveSettings();
    });
    unitSwipeRightToLeft.addEventListener('change', (e) => {
        settings.unitSwipeRightToLeft = e.target.value;
        saveSettings();
    });
    unitSwipeLeftToRight.addEventListener('change', (e) => {
        settings.unitSwipeLeftToRight = e.target.value;
        saveSettings();
    });
    unitSwipeTopToBottom.addEventListener('change', (e) => {
        settings.unitSwipeTopToBottom = e.target.value;
        saveSettings();
    });
    unitSwipeBottomToTop.addEventListener('change', (e) => {
        settings.unitSwipeBottomToTop = e.target.value;
        saveSettings();
    });
    unitTwoFingerTouch.addEventListener('change', (e) => {
        settings.unitTwoFingerTouch = e.target.value;
        saveSettings();
    });


    // --- Functions ---

    function setupShakePermissionButton() {
        if (!enableShakeButton) return;
        const needsPermission = (typeof DeviceMotionEvent !== 'undefined') &&
            (typeof DeviceMotionEvent.requestPermission === 'function');
        // Show only on iOS Safari-like environments
        enableShakeButton.style.display = needsPermission ? '' : 'none';
    }

    async function requestMotionPermission() {
        try {
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                const res = await DeviceMotionEvent.requestPermission();
                if (res === 'granted') {
                    alert('シェイクが有効になりました');
                    if (enableShakeButton) enableShakeButton.style.display = 'none';
                } else if (res === 'denied') {
                    alert('シェイクの利用が拒否されました。設定から許可してください。');
                } else {
                    alert('シェイクの権限状態: ' + res);
                }
            } else {
                alert('この端末ではシェイク許可は不要です');
                if (enableShakeButton) enableShakeButton.style.display = 'none';
            }
        } catch (e) {
            alert('シェイクの権限リクエストに失敗しました');
        }
    }

    function setupMenuDropdown() {
        if (!menuButton) return;

        // Create dropdown container
        menuDropdown = document.createElement('div');
        menuDropdown.id = 'menu-dropdown';
        menuDropdown.className = 'menu-dropdown hidden';

        // Items: 設定 / 使い方
        const btnSettings = document.createElement('button');
        btnSettings.id = 'menu-open-settings';
        btnSettings.className = 'menu-item';
        btnSettings.textContent = '設定';

        const linkHowto = document.createElement('a');
        linkHowto.id = 'menu-open-howto';
        linkHowto.className = 'menu-item';
        linkHowto.href = 'howto.html';
        linkHowto.textContent = '使い方';

        menuDropdown.append(btnSettings, linkHowto);
        document.body.appendChild(menuDropdown);

        function closeDropdown() {
            if (!menuDropdown.classList.contains('hidden')) {
                menuDropdown.classList.add('hidden');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        }

        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = menuButton.getBoundingClientRect();
            menuDropdown.style.position = 'fixed';
            menuDropdown.style.top = Math.round(rect.bottom + 8) + 'px';
            menuDropdown.style.left = Math.round(rect.left) + 'px';
            const wasHidden = menuDropdown.classList.contains('hidden');
            menuDropdown.classList.toggle('hidden');
            menuButton.setAttribute('aria-expanded', wasHidden ? 'true' : 'false');
        });

        btnSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDropdown();
            showSettingsScreen();
        });

        document.addEventListener('click', (e) => {
            if (!menuDropdown) return;
            if (menuDropdown.classList.contains('hidden')) return;
            if (e.target === menuButton) return;
            if (menuDropdown.contains(e.target)) return;
            closeDropdown();
        });

        // Settings header: add "使い方" link next to title
        if (settingsScreen) {
            const settingsHeader = settingsScreen.querySelector('.settings-header');
            if (settingsHeader) {
                const howtoLink = document.createElement('a');
                howtoLink.href = 'howto.html';
                howtoLink.textContent = '使い方';
                howtoLink.className = 'howto-link';
                const titleEl = settingsHeader.querySelector('h2');
                if (titleEl) {
                    titleEl.appendChild(howtoLink);
                } else if (closeSettingsButton) {
                    settingsHeader.insertBefore(howtoLink, closeSettingsButton);
                } else {
                    settingsHeader.appendChild(howtoLink);
                }
            }
        }
    }

    function showInputScreen(returnMethod = '') { // returnMethod引数を追加
        if (emphasisInterval) {
            clearInterval(emphasisInterval);
            emphasisInterval = null;
        }
        if (emphasisIntervalPreview) {
            clearInterval(emphasisIntervalPreview);
            emphasisIntervalPreview = null;
        }
        inputScreen.classList.add('active');
        displayScreen.classList.remove('active');
        settingsScreen.classList.remove('active');
        if (recordScreen) recordScreen.classList.remove('active');
        // 画面遷移直後の合成clickを無効化（ゴーストタップ対策）
        numericInputEnabled = false;
        if (numericInputEnableTimer) clearTimeout(numericInputEnableTimer);
        numericInputEnableTimer = setTimeout(() => { numericInputEnabled = true; }, 500);
        currentInput = "";
        inputDisplay.textContent = "";
        twoDigitMode = false;
        inputScreen.classList.remove('two-digit-mode');
        previewNumber27.style.display = 'none'; // プレビューを非表示

        // 数字表示画面から戻ってきた場合のみログに記録
        if (lastShownNumber !== "" && returnMethod !== '') {
            let resultToLog = '';
            let unitToLog = '';
            switch (returnMethod) {
                case 'shake':
                    resultToLog = ''; // シェイクには結果と単位の設定がないため空文字列
                    unitToLog = '';
                    break;
                case 'closeButton':
                    // ✕ボタンは設定で結果と単位を紐付けないので空文字列
                    resultToLog = '';
                    unitToLog = '';
                    break;
                case 'swipeRightToLeft':
                    resultToLog = settings.resultSwipeRightToLeft;
                    unitToLog = settings.unitSwipeRightToLeft;
                    break;
                case 'swipeLeftToRight':
                    resultToLog = settings.resultSwipeLeftToRight;
                    unitToLog = settings.unitSwipeLeftToRight;
                    break;
                case 'swipeTopToBottom':
                    resultToLog = settings.resultSwipeTopToBottom;
                    unitToLog = settings.unitSwipeTopToBottom;
                    break;
                case 'swipeBottomToTop':
                    resultToLog = settings.resultSwipeBottomToTop;
                    unitToLog = settings.unitSwipeBottomToTop;
                    break;
                case 'twoFingerTouch':
                    resultToLog = settings.resultTwoFingerTouch;
                    unitToLog = settings.unitTwoFingerTouch;
                    break;
                default:
                    resultToLog = '';
                    unitToLog = '';
            }
            logEntry(lastShownNumber, returnMethod, resultToLog, unitToLog); // resultとunit引数を追加
            lastShownNumber = ""; // 記録後、最後に表示された数字をリセット
        }
    }

    function showDisplayScreen() {
        inputScreen.classList.remove('active');
        displayScreen.classList.add('active');
        settingsScreen.classList.remove('active');
        if (recordScreen) recordScreen.classList.remove('active');
        if (emphasisIntervalPreview) {
            clearInterval(emphasisIntervalPreview);
            emphasisIntervalPreview = null;
        }
    }

    function showSettingsScreen() {
        inputScreen.classList.remove('active');
        displayScreen.classList.remove('active');
        settingsScreen.classList.add('active');
        if (recordScreen) recordScreen.classList.remove('active');
        previewNumber27.style.display = 'inline'; // プレビューを表示
        previewNumber27.textContent = '27'; // プレビューの数字を27に固定
        previewNumber27.style.fontSize = settings.fontSize + 'vw'; // 初期フォントサイズを設定
        applyRotationToElements(settings.rotation); // 初期回転を適用

        // Emphasis animation preview in settings
        if (emphasisIntervalPreview) {
            clearInterval(emphasisIntervalPreview);
        }
        let previewScaledUp = false;
        emphasisIntervalPreview = setInterval(() => {
            if (previewScaledUp) {
                previewNumber27.style.transform = `rotate(${settings.rotation}deg)`;
            } else {
                previewNumber27.style.transform = `scale(${settings.animationEmphasis}) rotate(${settings.rotation}deg)`;
            }
            previewScaledUp = !previewScaledUp;
        }, 1000);

        // Set rotation radio button
        document.getElementById(`rotate-${settings.rotation}`).checked = true;
    }

    function showNumber(number) {
        const displayStr = (String(number) === '0') ? '〇' : String(number);
        numberDisplay.textContent = displayStr;
        lastShownNumber = number; // ここでlastShownNumberをセット
        applySettings();
        showDisplayScreen();
        // ここではログを記録しない。数字入力画面に戻る際に記録する。

        if (emphasisInterval) {
            clearInterval(emphasisInterval);
        }

        let scaledUp = false;
        emphasisInterval = setInterval(() => {
            if (scaledUp) {
                numberDisplay.style.transform = `rotate(${settings.rotation}deg)`; // 回転を維持しつつスケールをリセット
            } else {
                numberDisplay.style.transform = `scale(${settings.animationEmphasis}) rotate(${settings.rotation}deg)`;
            }
            scaledUp = !scaledUp;
        }, 1000);
    }
    
    function logEntry(value, method = 'keypad', result = '', unit = '') {
        const entry = {
            timestamp: new Date().toISOString(),
            value: value,
            unit: unit, // unitを引数から設定
            result: result, // resultを引数から設定
            memo: '',
            method: method // 遷移方法を記録
        };
        log.unshift(entry);
        if (log.length > 20) { // Keep log size manageable
            log.pop();
        }
        saveLog();
        updateLogDisplay();
        if (recordTableBody) updateRecordTableV2();
    }

    function updateLogDisplay() {
        if (!logList) return;
        logList.innerHTML = "";
        for (const entry of log) {
            const li = document.createElement('li');
            li.textContent = `${new Date(entry.timestamp).toLocaleString()}: ${entry.value}`;
            logList.appendChild(li);
        }
    }

    function applySettings() {
        document.body.style.backgroundColor = settings.backgroundColor;
        document.body.style.color = settings.fontColor;
        numberDisplay.style.fontSize = settings.fontSize + 'vw';
        applyRotationToElements(settings.rotation);
    }

    function resetSettingsToDefaults() {
        settings = { ...DEFAULT_SETTINGS };
        const emph = Math.round((settings.animationEmphasis - 1) * 10);
        animationEmphasisSlider.value = emph;
        if (animationEmphasisValue) animationEmphasisValue.textContent = `アピールの強さ: ${emph}`;
        animationEmphasisValue.textContent = `アピールの強さ: ${emph}`;
        bgColorPicker.value = settings.backgroundColor;
        if (animationEmphasisValue) animationEmphasisValue.textContent = `アピールの強さ: ${emph}`;
        fontColorPicker.value = settings.fontColor;
        shakeSensitivitySlider.value = settings.shakeSensitivity;
        if (shakeSensitivityValue) shakeSensitivityValue.textContent = `振って数字を消す感度: ${settings.shakeSensitivity}`;
        fontSizeSlider.value = settings.fontSize;
        if (fontSizeValue) fontSizeValue.textContent = `数字の大きさ: ${settings.fontSize}`;
        if (previewNumber27) previewNumber27.style.fontSize = settings.fontSize + 'vw';
        const rotateRadio = document.getElementById(`rotate-${settings.rotation}`);
        if (rotateRadio) rotateRadio.checked = true;
        if (previewNumber27) previewNumber27.style.transform = `rotate(${settings.rotation}deg)`;

        // 新しいジェスチャー設定のUIをリセット
        enableSwipeRightToLeft.checked = settings.enableSwipeRightToLeft;
        resultSwipeRightToLeft.value = settings.resultSwipeRightToLeft;
        unitSwipeRightToLeft.value = settings.unitSwipeRightToLeft;
        enableSwipeLeftToRight.checked = settings.enableSwipeLeftToRight;
        resultSwipeLeftToRight.value = settings.resultSwipeLeftToRight;
        unitSwipeLeftToRight.value = settings.unitSwipeLeftToRight;
        enableSwipeTopToBottom.checked = settings.enableSwipeTopToBottom;
        resultSwipeTopToBottom.value = settings.resultSwipeTopToBottom;
        unitSwipeTopToBottom.value = settings.unitSwipeTopToBottom;
        enableSwipeBottomToTop.checked = settings.enableSwipeBottomToTop;
        resultSwipeBottomToTop.value = settings.resultSwipeBottomToTop;
        unitSwipeBottomToTop.value = settings.unitSwipeBottomToTop;
        enableTwoFingerTouch.checked = settings.enableTwoFingerTouch;
        resultTwoFingerTouch.value = settings.resultTwoFingerTouch;
        unitTwoFingerTouch.value = settings.unitTwoFingerTouch;

        applySettings();
        saveSettings();
    }

    function updateRecordTableV2() {
        if (!recordTableBody) return;
        recordTableBody.innerHTML = '';
        const unitOptions = [
            { value: '', label: '-' },
            { value: 'kg', label: 'Kg' },
            { value: 'case', label: 'ケース' },
            { value: 'hiki', label: '匹' },
            { value: 'hon', label: '本' },
            { value: 'ko', label: '個' },
            { value: 'katamari', label: '塊' },
            { value: 'other', label: 'その他' }
        ];
        const resultOptions = [
            { value: '', label: '-' },
            { value: '成', label: '成' },
            { value: '貸', label: '貸' },
            { value: '借', label: '借' },
            { value: '不', label: '不' }
        ];

        const unitCodes = unitOptions.map(o => o.value);
        const resultCodes = resultOptions.map(o => o.value);

        log.forEach((entry, index) => {
            if (entry.unit === undefined) entry.unit = '';
            if (entry.result === undefined) entry.result = '';
            if (entry.memo === undefined) entry.memo = '';

            const tr = document.createElement('tr');
            tr.dataset.index = index;

            const dt = new Date(entry.timestamp);
            const y = dt.getFullYear();
            const m = dt.getMonth() + 1;
            const d = dt.getDate();
            const youbi = ['日','月','火','水','木','金','土'][dt.getDay()];
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm = String(dt.getMinutes()).padStart(2, '0');
            const ss = String(dt.getSeconds()).padStart(2, '0');

            tr.innerHTML = `
                <td>${y}</td>
                <td>${m}/${d}</td>
                <td>${youbi}</td>
                <td>${hh}:${mm}:${ss}</td>
                <td>${entry.value}</td>
                <td>
                    <select class="unit-select">
                        ${unitOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
                    </select>
                    <input class="unit-input" type="text" placeholder="その他" style="display:none; width: 6em;" />
                </td>
                <td>
                    <select class="result-select">
                        ${resultOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <button class="memo-btn">メモ</button>
                    <span class="memo-text" style="margin-left:6px; opacity:0.8;"></span>
                </td>
                <td>${entry.method || '-'}</td>
            `;

            recordTableBody.appendChild(tr);

            const unitSelect = tr.querySelector('.unit-select');
            const unitInput = tr.querySelector('.unit-input');
            const resultSelect = tr.querySelector('.result-select');
            const memoText = tr.querySelector('.memo-text');

            // init selects
            if (unitCodes.includes(entry.unit)) {
                unitSelect.value = entry.unit;
                unitInput.style.display = (entry.unit === 'other') ? '' : 'none';
                if (entry.unit !== 'other') unitInput.value = '';
            } else if (entry.unit) {
                unitSelect.value = 'other';
                unitInput.style.display = '';
                unitInput.value = entry.unit;
            } else {
                unitSelect.value = '';
                unitInput.style.display = 'none';
                unitInput.value = '';
            }

            resultSelect.value = resultCodes.includes(entry.result) ? entry.result : '';
            memoText.textContent = entry.memo || '';
        });

        // Bind once
        if (!recordTableBody._v2bound) {
            recordTableBody.addEventListener('change', (e) => {
                const tr = e.target.closest('tr');
                if (!tr) return;
                const idx = parseInt(tr.dataset.index, 10);
                const entry = log[idx];
                if (!entry) return;

                if (e.target.classList.contains('unit-select')) {
                    const val = e.target.value;
                    const unitInput = tr.querySelector('.unit-input');
                    if (val === 'other') {
                        unitInput.style.display = '';
                        entry.unit = unitInput.value || '';
                    } else {
                        unitInput.style.display = 'none';
                        entry.unit = val;
                    }
                    saveLog();
                }

                if (e.target.classList.contains('result-select')) {
                    entry.result = e.target.value;
                    saveLog();
                }
            });

            recordTableBody.addEventListener('input', (e) => {
                if (!e.target.classList.contains('unit-input')) return;
                const tr = e.target.closest('tr');
                const idx = parseInt(tr.dataset.index, 10);
                const entry = log[idx];
                entry.unit = e.target.value;
                saveLog();
            });

            recordTableBody.addEventListener('click', (e) => {
                if (!e.target.classList.contains('memo-btn')) return;
                const tr = e.target.closest('tr');
                const idx = parseInt(tr.dataset.index, 10);
                const entry = log[idx];
                const current = entry.memo || '';
                const next = window.prompt('メモを入力', current);
                if (next !== null) {
                    entry.memo = next;
                    saveLog();
                    updateRecordTableV2();
                }
            });
            recordTableBody._v2bound = true;
        }
    }

    function unitCodeToLabel(codeOrText) {
        const map = { kg: 'Kg', case: 'ケース', hiki: '匹', hon: '本', ko: '個', katamari: '塊' };
        return map[codeOrText] || codeOrText || '';
    }

    function updateRecordTable() {
        recordTableBody.innerHTML = '';
        const unitOptions = [
            { value: '', label: '-' },
            { value: 'kg', label: 'Kg' },
            { value: 'case', label: 'ケース' },
            { value: 'hiki', label: '匹' },
            { value: 'hon', label: '本' },
            { value: 'ko', label: '個' },
            { value: 'katamari', label: '塊' },
            { value: 'other', label: 'その他' }
        ];
        const resultOptions = [
            { value: '', label: '-' },
            { value: '成', label: '成' },
            { value: '貸', label: '貸' },
            { value: '借', label: '借' },
            { value: '不', label: '不' }
        ];

        log.forEach((entry, index) => {
            if (entry.unit === undefined) entry.unit = '';
            if (entry.result === undefined) entry.result = '';
            if (entry.memo === undefined) entry.memo = '';

            const tr = document.createElement('tr');
            tr.dataset.index = index;

            const dt = new Date(entry.timestamp);
            const y = dt.getFullYear();
            const m = dt.getMonth() + 1;
            const d = dt.getDate();
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm = String(dt.getMinutes()).padStart(2, '0');
            const ss = String(dt.getSeconds()).padStart(2, '0');

            tr.innerHTML = `
                <td>${y}</td>
                <td>${m}/${d}</td>
                <td>${hh}:${mm}:${ss}</td>
                <td>${entry.value}</td>
                <td>
                    <select class="unit-select">
                        ${unitOptions.map(u => `<option value="${u}">${u || '-'}</option>`).join('')}
                    </select>
                    <input class="unit-input" type="text" placeholder="その他" style="display:none; width: 6em;" />
                </td>
                <td>
                    <select class="result-select">
                        ${resultOptions.map(r => `<option value="${r}">${r || '-'}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <button class="memo-btn">メモ</button>
                    <span class="memo-text" style="margin-left:6px; opacity:0.8;"></span>
                </td>
            `;

            recordTableBody.appendChild(tr);

            const unitSelect = tr.querySelector('.unit-select');
            const unitInput = tr.querySelector('.unit-input');
            const resultSelect = tr.querySelector('.result-select');
            const memoText = tr.querySelector('.memo-text');

            if (unitOptions.includes(entry.unit)) {
                unitSelect.value = entry.unit;
                unitInput.style.display = (entry.unit === 'その他') ? '' : 'none';
                if (entry.unit !== 'その他') unitInput.value = '';
            } else if (entry.unit) {
                unitSelect.value = 'その他';
                unitInput.style.display = '';
                unitInput.value = entry.unit;
            } else {
                unitSelect.value = '';
                unitInput.style.display = 'none';
                unitInput.value = '';
            }

            resultSelect.value = resultOptions.includes(entry.result) ? entry.result : '';
            memoText.textContent = entry.memo || '';
        });
    }

    if (recordTableBody) {
        recordTableBody.addEventListener('change', (e) => {
            const tr = e.target.closest('tr');
            if (!tr) return;
            const idx = parseInt(tr.dataset.index, 10);
            const entry = log[idx];
            if (!entry) return;

            if (e.target.classList.contains('unit-select')) {
                const val = e.target.value;
                const unitInput = tr.querySelector('.unit-input');
                if (val === 'その他') {
                    unitInput.style.display = '';
                    entry.unit = unitInput.value || '';
                } else {
                    unitInput.style.display = 'none';
                    entry.unit = val;
                }
                saveLog();
            }

            if (e.target.classList.contains('result-select')) {
                entry.result = e.target.value;
                saveLog();
            }
        });

        recordTableBody.addEventListener('input', (e) => {
            if (!e.target.classList.contains('unit-input')) return;
            const tr = e.target.closest('tr');
            const idx = parseInt(tr.dataset.index, 10);
            const entry = log[idx];
            entry.unit = e.target.value;
            saveLog();
        });

        recordTableBody.addEventListener('click', (e) => {
            if (!e.target.classList.contains('memo-btn')) return;
            const tr = e.target.closest('tr');
            const idx = parseInt(tr.dataset.index, 10);
            const entry = log[idx];
            const current = entry.memo || '';
            const next = window.prompt('メモを入力', current);
            if (next !== null) {
                entry.memo = next;
                saveLog();
                updateRecordTableV2();
            }
        });
    }

    function copyLogAsTsv() {
        const header = ['年','月日','曜日','時間','数字','単位','結果','メモ','遷移方法'];
        const lines = [header.join('\t')];
        log.forEach((entry) => {
            const dt = new Date(entry.timestamp);
            const y = dt.getFullYear();
            const m = dt.getMonth() + 1;
            const d = dt.getDate();
            const youbi = ['日','月','火','水','木','金','土'][dt.getDay()];
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm = String(dt.getMinutes()).padStart(2, '0');
            const ss = String(dt.getSeconds()).padStart(2, '0');
            const vals = [
                y,
                `${m}/${d}`,
                youbi,
                `${hh}:${mm}:${ss}`,
                entry.value ?? '',
                unitCodeToLabel(entry.unit ?? ''),
                entry.result ?? '',
                (entry.memo ?? '').replace(/\t/g, ' ').replace(/\n/g, ' '),
                entry.method ?? ''
            ];
            lines.push(vals.join('\t'));
        });
        const tsv = lines.join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(tsv).then(() => {
                alert('商談結果をコピーしました');
            }).catch(() => {
                fallbackCopy(tsv);
            });
        } else {
            fallbackCopy(tsv);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); alert('商談結果をコピーしました'); }
        catch (e) { alert('コピーに失敗しました'); }
        document.body.removeChild(ta);
    }

    function applyRotationToElements(rotation) {
        const transformValue = `rotate(${rotation}deg)`;
        numberDisplay.style.transform = transformValue;
        previewNumber27.style.transform = transformValue;

        // Reset top clearance
        numberDisplay.style.top = '';
        previewNumber27.style.top = '';

        if (rotation === 90 || rotation === 270) {
            numberDisplay.style.top = '0';
            previewNumber27.style.top = '0';
        }
    }

    function showRecordScreen() {
        inputScreen.classList.remove('active');
        displayScreen.classList.remove('active');
        settingsScreen.classList.remove('active');
        if (recordScreen) recordScreen.classList.add('active');
        if (emphasisIntervalPreview) {
            clearInterval(emphasisIntervalPreview);
            emphasisIntervalPreview = null;
        }
        if (recordTableBody) updateRecordTableV2();
    }

    // --- Local Storage ---

    function saveSettings() {
        localStorage.setItem('numberAppSettings', JSON.stringify(settings));
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('numberAppSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            settings.animationEmphasis = settings.animationEmphasis || 1.1;
            settings.backgroundColor = settings.backgroundColor || '#1e3333';
            settings.fontColor = settings.fontColor || '#aaaaaa';
            settings.shakeSensitivity = settings.shakeSensitivity || 15;
            settings.fontSize = settings.fontSize || 40;
            settings.rotation = settings.rotation || 0; // Default rotation
            settings.enableSwipeRightToLeft = settings.enableSwipeRightToLeft ?? false;
            settings.resultSwipeRightToLeft = settings.resultSwipeRightToLeft ?? '';
            settings.unitSwipeRightToLeft = settings.unitSwipeRightToLeft ?? '';
            settings.enableSwipeLeftToRight = settings.enableSwipeLeftToRight ?? false;
            settings.resultSwipeLeftToRight = settings.resultSwipeLeftToRight ?? '';
            settings.unitSwipeLeftToRight = settings.unitSwipeLeftToRight ?? '';
            settings.enableSwipeTopToBottom = settings.enableSwipeTopToBottom ?? false;
            settings.resultSwipeTopToBottom = settings.resultSwipeTopToBottom ?? '';
            settings.unitSwipeTopToBottom = settings.unitSwipeTopToBottom ?? '';
            settings.enableSwipeBottomToTop = settings.enableSwipeBottomToTop ?? false;
            settings.resultSwipeBottomToTop = settings.resultSwipeBottomToTop ?? '';
            settings.unitSwipeBottomToTop = settings.unitSwipeBottomToTop ?? '';
            settings.enableTwoFingerTouch = settings.enableTwoFingerTouch ?? false;
            settings.resultTwoFingerTouch = settings.resultTwoFingerTouch ?? '';
            settings.unitTwoFingerTouch = settings.unitTwoFingerTouch ?? '';

            animationEmphasisSlider.value = (settings.animationEmphasis - 1) * 10;
            bgColorPicker.value = settings.backgroundColor;
            fontColorPicker.value = settings.fontColor;
            shakeSensitivitySlider.value = settings.shakeSensitivity;
            fontSizeSlider.value = settings.fontSize;
            // Normalize emphasis to integer for UI display
            const emph = Math.round((settings.animationEmphasis - 1) * 10);
            animationEmphasisSlider.value = emph;
            animationEmphasisValue.textContent = `アピールの強さ: ${emph}`;

            // Update slider value displays
            fontSizeValue.textContent = `数字の大きさ: ${settings.fontSize}`;
            animationEmphasisValue.textContent = `アピールの強さ: ${(settings.animationEmphasis - 1) * 10}`;
            shakeSensitivityValue.textContent = `振って数字を消す感度: ${settings.shakeSensitivity}`;
            // override to avoid float artifacts like 3.0000000004
            animationEmphasisValue.textContent = `アピールの強さ: ${emph}`;

            // 新しいジェスチャー設定のUIを更新
            enableSwipeRightToLeft.checked = settings.enableSwipeRightToLeft;
            resultSwipeRightToLeft.value = settings.resultSwipeRightToLeft;
            unitSwipeRightToLeft.value = settings.unitSwipeRightToLeft;
            enableSwipeLeftToRight.checked = settings.enableSwipeLeftToRight;
            resultSwipeLeftToRight.value = settings.resultSwipeLeftToRight;
            unitSwipeLeftToRight.value = settings.unitSwipeLeftToRight;
            enableSwipeTopToBottom.checked = settings.enableSwipeTopToBottom;
            resultSwipeTopToBottom.value = settings.resultSwipeTopToBottom;
            unitSwipeTopToBottom.value = settings.unitSwipeTopToBottom;
            enableSwipeBottomToTop.checked = settings.enableSwipeBottomToTop;
            resultSwipeBottomToTop.value = settings.resultSwipeBottomToTop;
            unitSwipeBottomToTop.value = settings.unitSwipeBottomToTop;
            enableTwoFingerTouch.checked = settings.enableTwoFingerTouch;
            resultTwoFingerTouch.value = settings.resultTwoFingerTouch;
            unitTwoFingerTouch.value = settings.unitTwoFingerTouch;
        }
    }
    
    function saveLog() {
        localStorage.setItem('numberAppLog', JSON.stringify(log));
    }

    function loadLog() {
        const savedLog = localStorage.getItem('numberAppLog');
        if (savedLog) {
            log = JSON.parse(savedLog);
            // migrate to include extra fields
            log = log.map(e => ({
                timestamp: e.timestamp,
                value: e.value,
                unit: e.unit || '',
                result: e.result || '',
                memo: e.memo || '',
                method: e.method || '' // methodもマイグレーションに追加
            }));
        }
    }
});
