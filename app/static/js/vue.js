const { createApp } = Vue

createApp({
    delimiters: ['[[', ']]'],
    data() {
        return {
            backgrounds: [
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
            ],
            currentBackground: '',
            currentSrcSet: {},
            currentTime: null,
            usingServerTime: false,
            weather: '',
            weatherDescription: '',
            temp: 0,
            time: null,
            weatherIconUrl: {
                Thunderstorm: 'static/images/icons/weather_thunderstorm.svg',
                Drizzle: 'static/images/icons/weather_rain_cloud_heavy.svg',
                Rain: 'static/images/icons/weather_rain_umbrella_light.svg',
                Snow: 'static/images/icons/weather_snow_light.svg',
                Mist: 'static/images/icons/kasumi.svg',
                Smoke: 'static/images/icons/kasumi.svg',
                Haze: 'static/images/icons/kasumi.svg',
                Dust: 'static/images/icons/kasumi.svg',
                Fog: 'static/images/icons/kasumi.svg',
                Sand: 'static/images/icons/kasumi.svg',
                Ash: 'static/images/icons/kasumi.svg',
                Squall: 'static/images/icons/kasumi.svg',
                Tornado: 'static/images/icons/kasumi.svg',
                Clear: 'static/images/icons/weather_sunny.svg',
                Clouds: 'static/images/icons/weather_cloudy_white.svg'
            }
        }
    },
    async mounted() {
        await this.getServerTime()
        await this.nextUpdateInterval()
        await this.nextBackgroundUpdateInterval()
        await this.changeBackground()
        await this.updateBackground()
        await this.updateBackgroundDisplay()
        await this.getWeather()
        this.updateTime(this.currentTime)
        this.startLocalTimeUpdate()
        this.syncTime()
        await this.syncWeather()
    },
    methods: {
        async getServerTime() {
            try {
                const response = await axios.get('/api/time')
                const timeData = response.data
                this.currentTime = new Date(timeData.datetime)
                this.usingServerTime = true
                this.updateTime(this.currentTime)
                return this.currentTime
            } catch (error) {
                console.error('サーバーからの時間取得に失敗しました。ローカル時間を使用します。', error)
                this.currentTime = new Date()
                this.updateTime(this.currentTime)
                return this.currentTime
            }
        },
        async nextUpdateInterval(updateIntervalHours) {
            const timeData = this.currentTime || await this.getServerTime()
            const nextHour = (Math.ceil(timeData.getHours() / updateIntervalHours) * updateIntervalHours) % 24
            const nextUpdate = new Date(timeData)
            nextUpdate.setHours(nextHour, 0, 0, 0)

            if (nextUpdate <= timeData) {
                nextUpdate.setHours(nextHour + updateIntervalHours, 0, 0, 0)
            }

            const interval = nextUpdate - timeData
            return interval
        },
        async nextBackgroundUpdateInterval() {
            return await this.nextUpdateInterval(2)
        },
        async changeBackground() {
            const currentTime = await this.getServerTime()
            const hour = currentTime.getHours()
            let background = this.backgrounds.find(bg => bg.time === hour)

            if (!background) {
                for (let i = hour; i >= 0; i--) {
                    background = this.backgrounds.find(bg => bg.time === i)
                    if (background) break
                }
            }
            if (!background) {
                console.warn('指定された時間に一致する背景が見つかりませんでした。デフォルト背景を使用します。')
                background = this.backgrounds[0]
            }

            return background
        },
        async updateBackground() {
            const background = await this.changeBackground()
            this.currentBackground = background.fullhd
            this.currentSrcSet = {
                '4k': background._4k
            }
        },
        async updateBackgroundDisplay() {
            const interval = await this.nextBackgroundUpdateInterval()
            setTimeout(async () => {
                await this.updateBackground()
                this.updateBackgroundDisplay()
            }, interval);
        },
        async getWeather() {
            try {
                const response = await axios.get('/api/weather')
                this.weather = response.data.weather
                this.weatherDescription = response.data.weatherDescription
                this.temp = response.data.temp
            } catch (error) {
                console.error('天気情報取得に失敗しました。', error)
                this.weather = '天変地異'
                this.temp = '観測不能'
            }
        },
        updateTime(currentTime) {
            const hours = currentTime.getHours().toString().padStart(2, '0')
            const minutes = currentTime.getMinutes().toString().padStart(2, '0')
            this.time = `${hours}:${minutes}`
        },
        startLocalTimeUpdate() {
            setInterval(() => {
                if (this.currentTime) {
                    this.currentTime.setSeconds(this.currentTime.getSeconds() + 1)
                    this.updateTime(this.currentTime)
                }
            }, 1000)
        },
        syncTime() {
            const sync = async () => {
                await this.getServerTime()
                setTimeout(sync, 1800000)
            }
        },
        async syncWeather() {
            const sync = async () => {
                const interval = await this.nextUpdateInterval(3)
                setTimeout(async () => {
                    const fiveMinutes = 5 * 60 * 1000
                    setTimeout(async () => {
                        await this.getWeather()
                        this.changeIconUrl()
                    }, fiveMinutes)

                    setTimeout(async () => {
                        sync()
                    }, interval)
                }, interval)
            }
        },
        changeIconUrl(weather) {
            return this.weatherIconUrl[weather] || 'static/images/icons/mark_question.svg'
        }
    }
}).mount('#mainApp')