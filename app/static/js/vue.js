import { store } from './store.js';

const { createApp, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const backgrounds = [
      { time: 0, fullhd: 'static/images/1920x1080/11-Mid-Night-Fhd.png', _4k: 'static/images/3840x2160/11-Mid-Night-4k.png' },
      { time: 2, fullhd: 'static/images/1920x1080/12-Late-Night-Fhd.png', _4k: 'static/images/3840x2160/12-Late-Night-4k.png' },
      { time: 4, fullhd: 'static/images/1920x1080/01-Early-Morning-Fhd.png', _4k: 'static/images/3840x2160/01-Early-Morning-4k.png' },
      { time: 6, fullhd: 'static/images/1920x1080/02-Mid-Morning-Fhd.png', _4k: 'static/images/3840x2160/02-Mid-Morning-4k.png' },
      { time: 8, fullhd: 'static/images/1920x1080/03-Late-Morning-Fhd.png', _4k: 'static/images/3840x2160/03-Late-Morning-4k.png' },
      { time: 10, fullhd: 'static/images/1920x1080/04-Early-Afternoon-Fhd.png', _4k: 'static/images/3840x2160/04-Early-Afternoon-4k.png' },
      { time: 12, fullhd: 'static/images/1920x1080/05-Mid-Afternoon-Fhd.png', _4k: 'static/images/3840x2160/05-Mid-Afternoon-4k.png' },
      { time: 14, fullhd: 'static/images/1920x1080/06-Late-Afternoon-Fhd.png', _4k: 'static/images/3840x2160/06-Late-Afternoon-4k.png' },
      { time: 16, fullhd: 'static/images/1920x1080/07-Early-Evening-Fhd.png', _4k: 'static/images/3840x2160/07-Early-Evening-4k.png' },
      { time: 18, fullhd: 'static/images/1920x1080/08-Mid-Evening-Fhd.png', _4k: 'static/images/3840x2160/08-Mid-Evening-4k.png' },
      { time: 20, fullhd: 'static/images/1920x1080/09-Late-Evening-Fhd.png', _4k: 'static/images/3840x2160/09-Late-Evening-4k.png' },
      { time: 22, fullhd: 'static/images/1920x1080/10-Early-Night-Fhd.png', _4k: 'static/images/3840x2160/10-Early-Night-4k.png' }
    ];

    const currentBackground = ref('');
    const currentSrcSet = ref({});
    const currentTime = ref(null);
    const usingServerTime = ref(false);
    const weather = ref('');
    const weatherCity = ref(null);
    const weatherDescription = ref(null);
    const temp = ref(0);
    const time = ref(null);

    const weatherIconUrl = {
      Thunderstorm: 'static/images/icons/weather_thunderstorm.png',
      Drizzle: 'static/images/icons/weather_rain_cloud_heavy.png',
      Rain: 'static/images/icons/weather_rain_umbrella_light.png',
      Snow: 'static/images/icons/weather_snow_light.png',
      Mist: 'static/images/icons/kasumi.png',
      Smoke: 'static/images/icons/kasumi.png',
      Haze: 'static/images/icons/kasumi.png',
      Dust: 'static/images/icons/kasumi.png',
      Fog: 'static/images/icons/kasumi.png',
      Sand: 'static/images/icons/kasumi.png',
      Ash: 'static/images/icons/kasumi.png',
      Squall: 'static/images/icons/kasumi.png',
      Tornado: 'static/images/icons/kasumi.png',
      Clear: 'static/images/icons/weather_sunny.png',
      Clouds: 'static/images/icons/weather_cloudy_white.png'
    };

    const getServerTime = async () => {
      try {
        const response = await axios.get('/api/time');
        const timeData = response.data;
        currentTime.value = new Date(timeData.datetime);
        usingServerTime.value = true;
        updateTime(currentTime.value);
        return currentTime.value;
      } catch (error) {
        console.error('サーバーからの時間取得に失敗しました。ローカル時間を使用します。', error);
        currentTime.value = new Date();
        updateTime(currentTime.value);
        return currentTime.value;
      }
    };

    const nextUpdateInterval = async (updateIntervalHours) => {
      const timeData = currentTime.value || await getServerTime();
      const nextHour = (Math.ceil(timeData.getHours() / updateIntervalHours) * updateIntervalHours) % 24;
      const nextUpdate = new Date(timeData);
      nextUpdate.setHours(nextHour, 0, 0, 0);
      if (nextUpdate <= timeData) {
        nextUpdate.setHours(nextHour + updateIntervalHours, 0, 0, 0);
      }
      const interval = nextUpdate - timeData;
      return interval;
    };

    const nextBackgroundUpdateInterval = async () => {
      return await nextUpdateInterval(2);
    };

    const changeBackground = async () => {
      const ct = await getServerTime();
      const hour = ct.getHours();
      let background = backgrounds.find(bg => bg.time === hour);
      if (!background) {
        for (let i = hour; i >= 0; i--) {
          background = backgrounds.find(bg => bg.time === i);
          if (background) break;
        }
      }
      if (!background) {
        console.warn('指定された時間に一致する背景が見つかりませんでした。デフォルト背景を使用します。');
        background = backgrounds[0];
      }
      return background;
    };

    const updateBackground = async () => {
      const bg = await changeBackground();
      currentBackground.value = bg.fullhd;
      currentSrcSet.value = { '4k': bg._4k };
    };

    const updateBackgroundDisplay = async () => {
      const interval = await nextBackgroundUpdateInterval();
      setTimeout(async () => {
        await updateBackground();
        updateBackgroundDisplay();
      }, interval);
    };

    const getWeather = async () => {
      try {
        const response = await axios.get('/api/weather');
        weather.value = response.data.weather;
        weatherCity.value = response.data.weatherCity;
        weatherDescription.value = response.data.weatherDescription;
        temp.value = response.data.temp;
      } catch (error) {
        console.error('天気情報取得に失敗しました。', error);
        weather.value = '天変地異';
        temp.value = '観測不能';
      }
    };

    const updateTime = (ct) => {
      const hours = ct.getHours().toString().padStart(2, '0');
      const minutes = ct.getMinutes().toString().padStart(2, '0');
      time.value = `${hours}:${minutes}`;
    };

    const startLocalTimeUpdate = () => {
      setInterval(() => {
        if (currentTime.value) {
          currentTime.value.setSeconds(currentTime.value.getSeconds() + 1);
          updateTime(currentTime.value);
        }
      }, 1000);
    };

    const syncTime = () => {
      const sync = async () => {
        await getServerTime();
        setTimeout(sync, 1800000);
      };
    };

    const syncWeather = async () => {
      const sync = async () => {
        const interval = await nextUpdateInterval(3);
        setTimeout(async () => {
          const fiveMinutes = 5 * 60 * 1000;
          setTimeout(async () => {
            await getWeather();
          }, fiveMinutes);
          setTimeout(async () => {
            sync();
          }, interval);
        }, interval);
      };
    };

    const changeIconUrl = (w) => {
      return weatherIconUrl[w] || 'static/images/icons/mark_question.png';
    };

    onMounted(async () => {
      await getServerTime();
      await nextUpdateInterval(1);
      await nextBackgroundUpdateInterval();
      await changeBackground();
      await updateBackground();
      await updateBackgroundDisplay();
      await getWeather();
      if (currentTime.value) updateTime(currentTime.value);
      startLocalTimeUpdate();
      syncTime();
      syncWeather();
    });

    return {
      store,
      currentBackground,
      currentSrcSet,
      weather,
      weatherCity,
      weatherDescription,
      temp,
      time,
      changeIconUrl
    };
  }
});

app.config.compilerOptions.delimiters = ['[[', ']]'];
app.mount('#mainApp');
