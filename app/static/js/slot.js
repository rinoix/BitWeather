import { store } from './store.js';

const { createApp, ref, onMounted, onBeforeUnmount, getCurrentInstance, nextTick } = Vue;

const app = createApp({
  setup() {
    const SYMBOL_HEIGHT = 80;
    const SYMBOLS_PER_REEL = 21;
    const REEL_COUNT = 3;
    const SPEED_PX_PER_FRAME = 35;
    const PAYLINE_OFFSET = -40;

    const showSlot = ref(false);
    const IconUrl = {
      bell: "static/images/icons/bell_gold.png",
      seven: "static/images/icons/7_white.png",
      clover: "static/images/icons/clover_four.png",
      grape: "static/images/icons/budo_black.png",
      bar: "static/images/icons/shihei_10000yen.png",
      cherry: "static/images/icons/sakuranbo_red.png",
      angel: "static/images/icons/character_daitenshi_01_01_brown.png"
    };

    const reelSymbols = [
      ["bell","seven","clover","grape","clover","grape","bar","cherry","grape","clover","grape","seven","angel","grape","clover","grape","cherry","bar","grape","clover","grape"],
      ["clover","seven","grape","cherry","clover","bell","grape","cherry","clover","bar","grape","cherry","clover","bell","grape","cherry","clover","bar","grape","cherry","angel"],
      ["grape","seven","bar","bell","clover","grape","angel","bell","clover","grape","angel","bell","clover","grape","angel","bell","clover","grape","angel","bell","clover"]
    ];

    const reels = ref([]);
    const stopIconUrl = "static/images/icons/button_above_01.png";
    const closeIconUrl = "static/images/icons/yajirushi_left.png";
    const coins = ref(15);
    const spinning = ref(false);
    const result = ref('-');
    const cherryLeftMiddleCount = ref(0);
    const lastTime = ref(null);
    const gogoAllowed = ref(false);
    const lastStoppedIndex = ref(null);
    const coinBonusInterval = ref(null);

    const instance = getCurrentInstance();

    const openSlot = async () => {
      showSlot.value = true;
      await nextTick();
      initSlot();
    };

    const initSlot = () => {
      reels.value = [];

      for (let i = 0; i < REEL_COUNT; i++) {
        let inner = instance.refs['reel' + i];
        if (Array.isArray(inner)) inner = inner[0];
        if (!inner) {
          console.warn('reel ref missing:', 'reel' + i);
          continue;
        }
        inner.style.transform = 'translateY(0px)';
        reels.value.push({
          elem: inner,
          symbols: reelSymbols[i],
          offsetY: 0,
          spinning: false,
          stopRequested: false,
          landedIndex: null
        });
      }

      reels.value.forEach(r => renderReel(r));

      lastTime.value = null;
      requestAnimationFrame(animate);
    };

    const renderReel = (r) => {
      const total = SYMBOLS_PER_REEL * SYMBOL_HEIGHT;
      r.offsetY = (r.offsetY % total + total) % total;
      r.elem.style.transform = `translateY(${-r.offsetY}px)`;
    };

    const animate = (now) => {
      if (!showSlot.value) return;
      if (!lastTime.value) lastTime.value = now;
      const delta = now - lastTime.value;

      for (const r of reels.value) {
        if (r.spinning) {
          const speed = SPEED_PX_PER_FRAME * (delta / 16.6667);
          r.offsetY -= speed;
          renderReel(r);

          if (r.stopRequested) {
            const total = SYMBOLS_PER_REEL * SYMBOL_HEIGHT;
            const current = ((r.offsetY % total) + total) % total;
            const centerPos = current + SYMBOL_HEIGHT * 1.5 + PAYLINE_OFFSET;
            let idx = Math.round(centerPos / SYMBOL_HEIGHT) % SYMBOLS_PER_REEL;
            if (idx < 0) idx += SYMBOLS_PER_REEL;
            r.offsetY = (idx - 1.5) * SYMBOL_HEIGHT - PAYLINE_OFFSET;
            renderReel(r);
            r.spinning = false;
            r.stopRequested = false;
            r.landedIndex = idx;
          }
        }
      }

      if (spinning.value && !reels.value.some(r => r.spinning)) {
        spinning.value = false;
        handleBigAvoidance();
        evaluateResult();
      }

      lastTime.value = now;
      requestAnimationFrame(animate);
    };

    const startSpin = () => {
      if (spinning.value || coins.value < 3) return;
      coins.value -= 3;
      spinning.value = true;
      result.value = '回転中...';
      lastStoppedIndex.value = null;

      gogoAllowed.value = Math.random() < (1 / 127.5);

      for (const r of reels.value) {
        r.spinning = true;
        r.stopRequested = false;
        r.landedIndex = null;
      }
    };

    const stopReel = (i) => {
      const r = reels.value[i];
      if (r && r.spinning && !r.stopRequested) {
        r.stopRequested = true;
        lastStoppedIndex.value = i;
      }
    };

    const handleBigAvoidance = () => {
      if (gogoAllowed.value) return;
      const BIG_SYMBOLS = ['seven', 'bar'];

      const grid = reels.value.map(r => {
        const idx = r.landedIndex % SYMBOLS_PER_REEL;
        const s = r.symbols;
        return [
          s[(idx + SYMBOLS_PER_REEL - 1) % SYMBOLS_PER_REEL],
          s[idx],
          s[(idx + 1) % SYMBOLS_PER_REEL]
        ];
      });

      const lines = [
        [[0,1],[1,1],[2,1]],
        [[0,0],[1,0],[2,0]],
        [[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]],
        [[0,2],[1,1],[2,0]]
      ];

      for (const line of lines) {
        const syms = line.map(([x,y]) => grid[x][y]);
        const bigType = BIG_SYMBOLS.find(b => syms.every(s => s === b));
        const nearBig = BIG_SYMBOLS.find(b => syms.filter(s => s === b).length === 2);
        if (bigType || nearBig) {
          for (const [x,y] of line) {
            if (x === lastStoppedIndex.value) {
              const rr = reels.value[x];
              const shift = Math.floor(Math.random() * 3 + 1) * (Math.random() < 0.5 ? -1 : 1);
              rr.landedIndex = (rr.landedIndex + shift + SYMBOLS_PER_REEL) % SYMBOLS_PER_REEL;
              rr.offsetY = (rr.landedIndex - 1.5) * SYMBOL_HEIGHT - PAYLINE_OFFSET;
              renderReel(rr);
            }
          }
        }
      }
    };

    const evaluateResult = () => {
      const grid = reels.value.map(r => {
        const idx = r.landedIndex % SYMBOLS_PER_REEL;
        const s = r.symbols;
        return [
          s[(idx + SYMBOLS_PER_REEL - 1) % SYMBOLS_PER_REEL],
          s[idx],
          s[(idx + 1) % SYMBOLS_PER_REEL]
        ];
      });

      let hits = [];
      let payout = 0;
      const lines = [
        [[0,0],[1,0],[2,0]],
        [[0,1],[1,1],[2,1]],
        [[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]],
        [[0,2],[1,1],[2,0]]
      ];

      for (const line of lines) {
        const syms = line.map(([x,y]) => grid[x][y]);
        const combo = syms.join('');
        if (combo === 'sevensevenseven') { hits.push('BIG BONUS'); payout += 100; }
        else if (combo === 'barbarbar') { hits.push('BIG BONUS'); payout += 100; }
        else if (combo === 'bellbellbell') { hits.push('ベル'); payout += 14; }
        else if (combo === 'angelangelangel') { hits.push('ピエロ'); payout += 10; }
        else if (combo === 'grapegrapegrape') { hits.push('ぶどう'); payout += 8; }
        else if (combo === 'clovercloverclover') { hits.push('リプレイ'); }
      }

      if (grid[0][1] === 'cherry') { hits.push('チェリー'); payout += 1; }

      if (hits.includes('リプレイ')) result.value = 'REPLAY！';
      else if (hits.length > 0) {
        coins.value += payout;
        result.value = `当たり！(${hits.join(',')}) — 払い出し ${payout}枚`;
      } else {
        result.value = 'ハズレ...';
      }

      if (hits.includes('BIG BONUS')) {
        gogoAllowed.value = true;
      } else if (!spinning.value) {
        gogoAllowed.value = false;
      }

      const leftMiddle = grid[0][1];
      if (leftMiddle === 'cherry') cherryLeftMiddleCount.value++;
      else cherryLeftMiddleCount.value = 0;

      if (cherryLeftMiddleCount.value === 3) {
        result.value += ' ！？';
      }
    };

    const startIdleBonus = () => {
      const FIVE_MIN = 5 * 60 * 1000;
      coinBonusInterval.value = setInterval(() => {
        if (document.visibilityState === 'visible') {
          coins.value++;
        }
      }, FIVE_MIN);
    };

    onMounted(() => {
      startIdleBonus();
    });

    onBeforeUnmount(() => {
      if (coinBonusInterval.value) clearInterval(coinBonusInterval.value);
    });

    return {
      store,
      showSlot,
      IconUrl,
      reelSymbols,
      reels,
      stopIconUrl,
      closeIconUrl,
      coins,
      spinning,
      result,
      cherryLeftMiddleCount,
      gogoAllowed,
      openSlot,
      initSlot,
      startSpin,
      stopReel
    };
  }
});

app.config.compilerOptions.delimiters = ['[[', ']]'];
app.mount('#slot');
