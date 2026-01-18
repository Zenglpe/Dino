class Music {
    #_volume = 0.5;
    #_musicStorage = false;
    #_musicDownloadStorage = false;
    #_musicDownloadAllState = false;
    #_audios = []
    #_beatboxes = new Map([
        ['beatsArray1', [
            './Music/beats/beat_21.mp3',
            './Music/beats/beat_22.mp3',
            './Music/beats/beat_23.mp3',
            './Music/beats/beat_24.mp3',
        ]],
        ['beatsArray2', [
            './Music/beats/beat_31.mp3',
            './Music/beats/beat_32.mp3',
            './Music/beats/beat_33.mp3',
            './Music/beats/beat_34.mp3',
        ]],
        ['beatsArray3', [
            './Music/beats/beat_01.mp3',
            './Music/beats/beat_02.mp3',
            './Music/beats/beat_03.mp3',
            './Music/beats/beat_04.mp3',
        ]],
        ['beatsArray4', [
            './Music/beats/beat_41.mp3',
            './Music/beats/beat_42.mp3',
            './Music/beats/beat_43.mp3',
            './Music/beats/beat_44.mp3',
        ]],
        ['beatsArray5', [
            './Music/beats/beat_11.mp3',
            './Music/beats/beat_12.mp3',
            './Music/beats/beat_13.mp3',
            './Music/beats/beat_14.mp3',
        ]],
        ['beatsArray6', [
            './Music/beats/beat_01.mp3',
            './Music/beats/beat_02.mp3',
            './Music/beats/beat_03.mp3',
            './Music/beats/beat_04.mp3',
        ]],
    ])
    constructor() {
        const button_play = document.querySelector("#audio_button_play")
        button_play.addEventListener('pointerup', (() => {
            let isPlaying = false;
            return () => {
                if(!this.#_musicDownloadAllState && !this.#_musicDownloadStorage) {
                    this.#_musicDownloadStorage = true;
                    button_play.innerHTML = "&#10006;";
                    this.downloadMusic()
                    return;
                }
                if(!this.#_musicDownloadAllState && this.#_musicDownloadStorage) {
                    button_play.innerHTML = "&#x2B07;";
                    this.#_musicDownloadStorage = false;
                    this.offMusic()
                    return;
                }
                if(this.#_musicDownloadAllState) {
                    if(isPlaying) {
                        button_play.innerHTML = "&#9654";
                        this.offMusic()
                    } else {
                        button_play.innerHTML = "||";
                        this.onMusic()
                    }
                    isPlaying = !isPlaying;
                }
            }
        })())

        const button_delete = document.querySelector("#audio_button_delete")
        const form = document.querySelector('form#audio')
        button_delete.addEventListener('pointerup', event => {
            this.offMusic();
            button_play.innerHTML = "&#9654";
            form.style.display = 'none';
            this.#_volume = 0.5;
        })
        document.addEventListener('playaudio', () => {
            button_play.innerHTML = "&#9654";
        })

        const volumeRange = document.querySelector('#volume_audio')
        volumeRange.addEventListener('input', (event) => {
            this.#_volume = +(event.target.value)
        })
        volumeRange.addEventListener('change', (event) => {
            this.#_volume = +(event.target.value)
        })
    }
    *[Symbol.asyncIterator]() {
        for(let i = 1; i <= 6; i++) {
            for(let j = 0; j < 4; j++) {
                yield new Promise((resolve, reject) => {
                    let 
                        audioURLS = (this.#_beatboxes.get(`beatsArray${i}`)),
                        value = audioURLS[j],
                        audio,
                        button_play = document.querySelector('#audio_button_play')

                    if(value instanceof Audio) {
                        return resolve(value)
                    } else {
                        audio = new Audio(value)
                    }

                    audio.addEventListener('error', () => {
                        button_play.style.backgroundColor = 'red';
                        button_play.innerHTML = "&#9654";
                        reject('Не удалось загрузить аудио')
                    }, { once: true })

                    audio.addEventListener('loadstart', () => {
                        button_play.style.backgroundColor = 'yellow';
                    }, { once: true })

                    audio.addEventListener('loadedmetadata', async () => {
                        button_play.style.backgroundColor = 'orange';
                    }, { once: true })

                    audio.addEventListener('canplaythrough', async () => {
                        audioURLS[j] = audio;
                        button_play.style.backgroundColor = 'rgb(150 250 150)';
                        resolve(audio)
                    }, { once: true })

                    audio.addEventListener('ended', () => { 
                        audio.pause()
                        this.#_audios.shift()
                    }, { once: true })

                    audio.addEventListener('pause', () => {
                        button_play.style.backgroundColor = 'rgb(150 250 150)';
                        button_play.style.color = 'rgb(2, 45, 35)';
                        audio.pause()
                    }, { once: true })

                    audio.addEventListener('play', () => {
                        this.#_audios.push(audio)
                        audio.currentTime = 0;
                        button_play.style.backgroundColor = 'rgb(150 250 150)';
                        button_play.style.color = 'rgb(2, 45, 35)';
                    }, { once: true })
                })
            }
        }
    }
    async downloadMusic() {
        return new Promise(async resolve => {
            if(this.#_musicDownloadAllState) {
                resolve(true)
                return;
            }
            for await(let el of this) {
                if(!this.#_musicDownloadStorage) return;
                try {
                    await el;
                } catch {
                    this.#_musicDownloadStorage = false;
                    resolve(false)
                    return;
                }
            }
            const event = new Event('playaudio', {})
            document.dispatchEvent(event)
            this.#_musicDownloadStorage = false;
            this.#_musicDownloadAllState = true;
            resolve(true)
        })
    }
    async onMusic() {
        if(this.#_musicStorage || !this.#_musicDownloadAllState) return;
        this.#_musicStorage = true;
        playMusic.call(this)

        async function playMusic(index = 1) {
            if(!this.#_musicStorage) return;
            if(index > 6) (index = 1);

            const randomElement = () => {
                return this.#_beatboxes.get(`beatsArray${index}`)[Math.round(Math.random() * 3)]
            }
            const audio = randomElement();
            
            audio.addEventListener('timeupdate', (() => {
                let state = false;
                return async () => {
                    if(state) return;
                    audio.volume = this.#_volume;
                    if(audio.currentTime > audio.duration/2) {
                        state = true;
                        playMusic.call(this, index+1)
                    }
                }
                
            })())
            audio.play()
        }
    }
    offMusic() {
        if(!this.#_musicStorage) return;
        this.#_musicDownloadStorage = false;
        this.#_musicStorage = false;
        for(let el of this.#_audios) {
            el.pause()
            el.currentTime = 0;
        }
    }
}

export default Music