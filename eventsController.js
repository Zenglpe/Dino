import Game  from './gameController.js';
import Evils from './evilsController.js';
import Music from './musicController.js';
import Details from './detailsController.js';

class Events extends Music {
    #_stateKeyPress = false;
    #_snowStorage = false;
    #_moneys = document.querySelector('#moneys')
    constructor() {
        super()
        this.setMenuAnimations()
        this.#_windowEvents()
        this.#_documentEvents()
        this.#_gameEvents()
        this.#_detailsEvent()
        this.#_evilsEvents()
        this.#_dinoEvents()
    }
    #_detailsEvent() {
        let money = 0;
        let timeScope = 0;
        const form = document.querySelector('form#audio')
        const timeElement = document.querySelector('#timeScope')
        const counter = document.querySelector('#counts');

        document.addEventListener('detailstart', event => {
            const countsText = document.querySelector('#counts')
            countsText.textContent = '0';
            this.addHealth(3)
            timeStart(this)
            this.display(form, 'none')
        })
        document.addEventListener('detailstop', event => {
            Details.balance += money;
            money = 0;
            clearTime();
            this.delHealth(10)
            this.toggleWindow('home')
            this.display(form, 'block')
        })
        document.addEventListener('detailpause', event => {
            this.toggleSnows()
            this.stop()
            this.toggleWindow('pause')
        })
        document.addEventListener('detailhome', event => {
            this.stop()
            clearTime();
            this.toggleWindow('home')
            this.display(form, 'block')
        })
        document.addEventListener('detailsettings', event => {
            this.stop()
            this.toggleWindow('settings')
        })
        document.addEventListener('detailshop', event => {
            this.stop()
            this.toggleWindow('shop')
        })
        document.addEventListener('loading', async event => {
            const loading = document.querySelector('#loading')
            const load = document.querySelector('#load')
            loading.style.animation = 'loadingStart 7s';
            for(let i = 0; i < 3; i++) {
                load.textContent += '.';
                await this.wait(1500)
            }
            loading.addEventListener('animationend', () => {
                loading.style.animation = '';
                load.textContent = 'Loading';
            })
        })
        document.addEventListener('addmoney', async event => {
            const n = event.detail;
            if(n < 0 || n > 1_000) return; 
            for(let i = 0; i < n; i++) {
                if(this.#_moneys > 1_000_000) return;
                counter.textContent = ++money;
                if(n <= 500) await this.wait(0.1)
                }
        })
        document.addEventListener('delmoney', async event => {
            const n = event.detail;
            if(n < 0) return;
            for(let i = 0; i < n; i++) {
                if(this.#_moneys <= 0) return;
                counter.textContent = --money;
                if(n <= 500) await this.wait(0.1)
            }
        })
        document.addEventListener('addhealth', event => {
            const count = event.detail;
            if(count < 0) return;
            const hp = document.querySelector('#health');
            for(let i = 0; i < count; i++) {
                if(hp.childElementCount >= 10) return;
                const health = `<img class="hp" src="${Game.urls.get('health')}">`;
                hp.insertAdjacentHTML('beforeend', health)
                this.reloadHealth()
            }
        })
        document.addEventListener('delhealth', event => {
            const v = event.detail;
            if(!Game.localStorage || v < 0) return;
            const hp = document.querySelector('#health');
            for(let i = 0; i < v; i++) {
                const length = hp.childElementCount;
                if(length <= 0) return;
                const health = hp.children[length-1];
                health.remove()
                this.reloadHealth()
            }
        })
        document.addEventListener('reloadhealth', event => {
            const hp = document.querySelector('#health');
            const length = hp.childElementCount;
            if(length <= 0) this.pause()
        })
        const timeStart = async () => {
            timeElement.textContent = (timeScope++).toLocaleString();
            await this.wait(100)
            if(!Game.localStorage) return; 
            timeStart()
        }
        const clearTime = function() {
            const time = timeScope;
            timeElement.textContent = '0';
            timeScope = 0;
            return time;
        }
    }
    #_evilsEvents() {
        document.addEventListener('setcloud', async event => {
            const parentElement = document.querySelector('#clouds')
                const random = Math.floor(Math.random() * 9)
                const cloud = this.clouds.get((this.theme === 'light') ? 'light' : 'dark')[random].cloneNode(true);
                
                parentElement.append(cloud)
                this.playAnimation(cloud, 'step', Game.speed*10, 'linear')
                
                this.clouds.get('all').push(cloud)
                cloud.addEventListener('animationend', e => {
                    this.clouds.get('all').shift()
                    cloud.remove()
                })
        
                await this.wait(Game.speed * 5000)
                if(!Game.localStorage) return;
                this.setCloud()
        })
        document.addEventListener('removecloud', event => {
            for(let el of this.clouds.get('all')) el.remove()
        })
        document.addEventListener('togglesnows', event => {
            const snows = document.querySelector('#snows');
            for(const el of snows.children) {
                el.src = Game.urls.get('snow_red')
            }
        })
        document.addEventListener('playanimationevils', event => {
            const [ el, name, duration, animationTF ] = event.detail;
            const IDsBonus = ['box_money', 'box_gift']
            let getBonus = IDsBonus.some(ID => el?.dataset?.id === ID)
            let getCloud = el?.dataset?.id === 'cloud';
            
            el.style.animationDelay = '1s';
            el.style.animation = `${getBonus ? 'onbonuse' : getCloud ? 'oncloud' : name} ${duration}s ${animationTF}`;
            el.addEventListener('animationend', e => {
                el.style.animationName = '';
            })
        })
        document.addEventListener('evilstart', event => {
            this.spawnEvils = true;
            this.setCloud()
            this.run()
        })
        document.addEventListener('evilstop', event => {
            this.spawnEvils = false;
            this.removeCloud()
            this.removeEvil()
        })
        document.addEventListener('evilrun', async event => {
            if(!this.spawnEvils) return;
            await setEvil.call(this)
            this.run()

            async function setEvil() {
                if(!Game.localStorage) return; 
                const parentElement = document.querySelector('#evils')
                let
                    speed = Game.speed,
                    random = Math.floor(Math.random() * this.evils.length),
                    evil = this.evils[random].cloneNode(true),
                    interval = (speed * 1000) + (Math.random() * (speed * 1000));
                if(evil.dataset.id === 'dragon') {
                    const position = (evil.classList.contains('dragonBottom')) ? 'giftTop' : 'giftBottom';
                    this.appendBonus(this.bonuses.get(position).cloneNode(), 'gift')
                }
                if(evil.dataset.id === 'money') {   
                    const r = Math.floor(Math.random() * Game.wave)
                    for(let i = 0; i < r; i++) {
                        this.appendBonus(evil.cloneNode(), 'money')
                        await this.wait(Game.speed*150)
                    }
                    await this.wait(Game.speed*130)
                    return;
                }
                parentElement.append(evil)
                this.playAnimation(addHitBox(evil), 'step', speed*3, 'linear')
                this.playAnimation(evil, 'step', speed*3, 'linear')
                evil.addEventListener('animationend', e => {
                    evil.remove();
                })
                await this.wait(interval)
            }
        }) 
        document.addEventListener('removeevil', async event => {
            const children = document.querySelector('#evils').children;
            for(let el of [...children]) {
                el.offTrackHitBox();
                el.remove()
            }
        })
        document.addEventListener('appendbonus', async event => {
            const [ bonus, id ] = event.detail;
            const parentElement = document.querySelector('#evils')
            const time = Game.speed*3;
            bonus.dataset.id = id;
            this.playAnimation(bonus, 'step', time, 'linear')
            this.playAnimation(addHitBox(bonus), 'step', time, 'linear')
            parentElement.append(bonus)
            bonus.addEventListener('animationend', bonus.remove)
        })
        document.addEventListener('removeevil', async event => {
            
        })
        const addHitBox = function(evil) {
            const parentElement = document.querySelector('#boxes')
            let boxElement = evil;
            const time = Game.speed *3;
            switch(evil.dataset.id) {
                case 'cactus_1':
                case 'cactus_2':
                case 'cactus_3':
                    boxElement = document.createElement('div')
                    boxElement.className = `evil box_${evil.dataset.id}`;
                    parentElement.append(boxElement)
                    break;
                }
            boxElement.classList.add(`box_${evil.dataset.id}`)
            boxElement.dataset.id = (`box_${evil.dataset.id}`);
    
            const timeIntervalHitBix = (time * 1000)-((time * 1000)/3);
            boxElement.addEventListener('animationstart', e => {
                setTimeout(boxElement.onTrackHitBox.bind(boxElement), timeIntervalHitBix)
            })
            boxElement.addEventListener('animationend', e => {
                boxElement.offTrackHitBox();
                boxElement.remove();
            })
            return boxElement;
        }
    }
    #_gameEvents() {
        document.addEventListener('toggletheme', event => {
            document.body.style.backgroundColor = (event.detail) ? 'black' : 'white';
            this.theme = (event.detail) ? 'dark' : 'light';
            for(let el of this.clouds.get('all')) {
                const cloudTheme = (event.detail) ? 'cloudDark' : 'cloudLight';
                el.src = Game.urls.get('clouds').get(cloudTheme)
            }
        })
        document.addEventListener('gamestart', event => {
            Game.localStorage = true;
            this.display(this.#_moneys, 'block')
        })
        document.addEventListener('gamestop', event => {
            this.addWave(0)
            Game.localStorage = false;
            this.display(this.#_moneys, 'none')
        })
        document.addEventListener('addwave', async event => {
            const n = event.detail;
            if(!Game.localStorage || typeof n !== 'number' || n > 8) return;

            Game.timeIntervalHB = (250 - (25 * n))

            if(n < 1) {
                Game.timeIntervalHB = 250;
                Game.speed = 1;
                Game.wave = 1;
                return Game.wave;
            }

            this.spawnEvils = false;
            await this.wait(5000)
            this.removeEvil()
            this.spawnEvils = true;

            if(Game.localStorage) {
                Game.speed = (+`0.${10-n}`);
                Game.wave = n;
                this.run()
            }
        })
        document.addEventListener('togglewindow', event => {
            const window = event.detail;
            const game = document.querySelector('#game')
            const elements = new Map([
                ['home', document.querySelector('#screen_home')],
                ['shop', document.querySelector('#screen_shop')],
                ['settings', document.querySelector('#screen_settings')],
                ['play', document.querySelector('#screen_play')],
                ['pause', document.querySelector('#screen_pause')]
            ])
            const setDisplay = (el, state) => el.style.display = state;
            
            for(const [screen, element] of elements.entries()) {
                setDisplay(element, (window === screen) ? 'block' : 'none')
            }

            game.src = Game.urls.get((window === 'play') ? 'onWindow' : 'offWindow')
        })
        document.addEventListener('onshows', async event => {
            if(this.#_snowStorage) return;
            this.#_snowStorage = true;
            let countSnows = Math.floor(window.innerWidth / 60);
            
            for(let i = 0; i <= countSnows+10; i++) {
                setSnow.call(this, i)
            }

            async function setSnow(i) {
                if(!this.#_snowStorage) return;
                const snows = document.querySelector('#snows');
                const snow = document.createElement('img')
                const randomSize = `${10 + Math.random() * 60}px`;
                snow.classList.add('snow')
                snow.src = Game.urls.get('snow_green')
                snow.alt = 'snow';
                snow.style.left = `${i*50}px`;
                snow.style.width = randomSize;
                snow.style.height = randomSize;
                snow.style.animationName = 'snows';
                snow.style.animationDuration = `${2.5 + (Math.random() * 5)}s`;
                snow.style.animationTimingFunction = 'linear';
                snow.style.animationDelay = `${1 * Math.random()}s`;
                snow.addEventListener('animationend', snow.remove)
                snows.append(snow)
                await this.wait(2000)
                if(!this.#_snowStorage) return;
                setSnow.call(this, i)
            }
        })
        document.addEventListener('offshows', event => {
            this.#_snowStorage = false;
            while(true) {
                if(snows.childNodes.length === 0) return;
                for(let el of snows.childNodes) el.remove()
            }
        })
    }
    #_dinoEvents() {
        const dino = document.querySelector('#dino');
        const box_dino = document.querySelector('#box_dino');
        dino.addEventListener('dinoup', event => {
            box_dino.classList.remove('box_dino_h')
            dino.src = Game.urls.get('dinoUp')
            dino.classList.remove('dinoH')
            dino.classList.add('dinoV')
        })
        dino.addEventListener('dinodown', event => {
            box_dino.classList.add('box_dino_h')
            dino.src = '';
            dino.src = Game.urls.get('dinoDown')
            dino.classList.add('dinoH')
            dino.classList.remove('dinoV')
        })
        dino.addEventListener('dinojump', event => {
            this.playAnimation(box_dino , 'jump', Game.speed, 'ease-out')
            this.playAnimation(dino, 'jump', Game.speed, 'ease-out')
        })
        dino.addEventListener('dinostart', async event => {
            if(Game.localStorage) return;
            const time = document.querySelector('#time');
            this.#_start()
            this.toggleWindow('play')
            this.display(time, 'none')
            this.loading()
            await this.wait(5000)
            this.display(dino, 'block')
            this.display(time, 'block')
            this.up()
            Evils.prototype.start.call(this)
        })
        dino.addEventListener('dinostop', event => {
            if(!Game.localStorage) return;
            this.#_stop()
            this.toggleWindow('home')
            this.display(dino, 'none')
            Evils.prototype.stop.call(this)
        })
    }
    #_documentEvents() {
        document.addEventListener('visibilitychange', event => {
            if(document.visibilityState === 'visible') {
                this.onSnows()
            } else {
                this.home()
                this.offSnows()
            }
        })
    }
    #_windowEvents() {
        let heightWindow = window.innerHeight + 400;

        function newStyle(height) {
            return `
            <style id="snows_style">
                @keyframes snows {
                    40% {
                        opacity: 1;
                    }
                    
                    to { 
                        opacity: 0;
                        transform: translateY(${height}px) rotate(${Math.floor(Math.random() * 360)}deg);
                    }
                }
            </style>`;
        }

        window.addEventListener('resize', async () => {
            this.offSnows()
            heightWindow = window.innerHeight + 400;
            document.querySelector('#snows_style')?.remove()
            document.head.insertAdjacentHTML('beforeend', newStyle(heightWindow))
            await this.wait(2000)
            this.onSnows()
        })  
        document.head.insertAdjacentHTML('beforeend', newStyle(heightWindow))
    }
    #_keyDown = (event) => {
        document.querySelector('img#game').scrollIntoView(false)
        if(event.code === 'ArrowDown') {
            if(!this.#_stateKeyPress) {
                this.down()
                this.#_stateKeyPress = true;
            }
        } else {
            this.jump()
        }
    }
    #_keyUp = (event) => {
        document.querySelector('img#game').scrollIntoView(false)
        this.#_stateKeyPress = false;
        if(event.code === 'ArrowDown') {
            this.up()
        }
    }
    #_start() {
        document.addEventListener('keydown', this.#_keyDown)
        document.addEventListener('keyup', this.#_keyUp)

        document.addEventListener('pointerdown', (e) => {
            e.preventDefault()
            let position = parseInt(window.getComputedStyle(document.body).width)/2;
            if(e.x <= position) {
                this.down()
            } else {
                this.up()
                this.jump()
            }
        })
        document.addEventListener('pointerup', e => {
            e.preventDefault()
            this.up()
        })
    }
    #_stop() {
        document.removeEventListener('keydown', this.#_keyDown)
        document.removeEventListener('keyup', this.#_keyUp)
    }

    setMenuAnimations() {
        const menu = document.querySelector('#menu')
        const elements = menu.children;
        menu.addEventListener('pointermove', e => {
            for(let el of elements) {
                el.style.opacity = 0.4;
            }
            e.target.style.opacity = 1;
        })
        menu.addEventListener('pointerleave', e => {
            for(let el of elements) {
                el.style.opacity = 0.4;
            }
            elements['menu_start'].style.opacity = 1;
        })
        document.addEventListener('pointerup', e => {
            switch(e.target.id) {
                case 'menu_start':
                case 'new_game':
                    this.start()
                    break;
                case "back":
                case 'home_game':
                    this.home()
                    break;
                case "menu_settings":
                    this.settings()
                    break;
                case "menu_shop":
                    this.shop()
                    break;
            }
        })
    }
    get speed() { return Game.speed }
    get wave() { return Game.wave }
}

export default Events;