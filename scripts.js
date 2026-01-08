/**
 * @author Evgeniy
 * @description 2D Game(DINO)
 * @version 1.1.0 
 */

class Events {
    #_stateKeyPress = false;
    constructor() {
        document.addEventListener('visibilitychange', event => {
            if(document.visibilityState === 'visible') {
                this.onSnows()
            } else {
                this.home()
                this.offSnows()
            }
        })
        this.setMenuAnimations()
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
        if(event.code === 'ArrowDown' || event.code === 'ArrowRight') {
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
        if(event.code === 'ArrowDown' || event.code === 'ArrowRight') {
            this.up()
        }
    }
    start() {
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
    stop() {
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
                    this.start()
                    break;
                case 'new_game':
                    this.start()
                    break;
                case 'home_game':
                    this.home()
                    break;
            }
        })
    }
}

class Game extends Events {
    #_game = document.querySelector('#game')
    #_moneys = document.querySelector('#moneys')
    #_wave = 1;
    #_speed = 1;
    #_lightTheme = false;
    #_snowStorage = false;
    static timeIntervalHB = 250;
    static localStorage = false;
    static urls = new Map([
        ['offWindow', './Animations/Window/homeWindow.gif'],
        ['onWindow', './Animations/Window/playWindow.gif'],
        ['dinoUp', './Animations/Dino/Dino.gif'],
        ['dinoDown', './Animations/Dino/DinoSit.gif'],
        ['dragon', './Animations/Dragon/Dragon.gif'],
        ['health', './Animations/Health/health.gif'],
        ['money', './Animations/Bonuses/money.gif'],
        ['gift', './Animations/Bonuses/gift.gif'],
        ['clouds', new Map([
            ['emoticonDark', './Animations/Clouds/Emoticons/emoticonDark.gif'],
            ['emoticonLight', './Animations/Clouds/Emoticons/emoticonLight.gif'],
            ['cloudDark', './Animations/Clouds/Cloud/cloudDark.gif'],
            ['cloudLight', './Animations/Clouds/Cloud/cloudLight.gif'],
        ])],
        ['cactuses', new Map([
            [ 'one',  [ /* CACTUSES */ ]],
            [ 'two',  [ /* CACTUSES */ ]],
            ['three', [ /* CACTUSES */ ]],
        ])],
        ['snow_green', './Animations/Menu/snow_green.png'],
        ['snow_red', './Animations/Menu/snow_red.png'],
    ])
    constructor() {
        super()
        for(let i = 1; i <= 21; i++) {
            let position = (i <= 8) ? 'one' : (i <= 17) ? 'two' : 'three';
            Game.urls.get('cactuses').get(position).push(`./Animations/Cactuses/cactus${i}.gif`)
        }
        this.onSnows()
    }
    toggleTheme() {
        const gameTheme = this.#_lightTheme ? 'black' : 'white';
        document.body.style.backgroundColor = gameTheme;
        this.#_lightTheme = !this.#_lightTheme;
        for(let el of this.clouds.get('all')) {
            const cloudTheme = (this.theme == 'light') ? 'cloudLight' : 'cloudDark';
            el.src = Game.urls.get('clouds').get(cloudTheme)
        }
    }
    toggleWindow(window) {
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

        this.#_game.src = Game.urls.get((window === 'play') ? 'onWindow' : 'offWindow')
    }
     async wait(duration) {
        return new Promise(resolve => setTimeout(resolve, duration))
    }
    async addWave(n) {
        if(!Game.localStorage || typeof n !== 'number' || n > 8) return;

        Game.timeIntervalHB = (250 - (27 * n))

        if(n < 1) {
            Game.timeIntervalHB = 250;
            this.#_speed = 1;
            this.#_wave = 1;
            return this.#_wave;
        }

        this.spawnEvils = false;
        await this.wait(5000)
        this.removeEvil()
        this.spawnEvils = true;

        if(Game.localStorage) {
            this.#_speed = (+`0.${10-n}`);
            this.#_wave = n;
            this.run()
        }
    }
    display(el, property) {
        el.style.display = (property === 'block') ? 'block' : 'none';
    }
    onSnows = (() => {          
        return function f() {
            if(this.#_snowStorage) return;
            this.#_snowStorage = true;
            let countSnows = Math.floor(window.innerWidth / 60);
            for(let i = 0; i <= countSnows+10; i++) {
                this.setSnow(i)
            }
        }
    })()
    async setSnow(i) {
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
        snow.style.animationDuration = `${2 + (Math.random() * 5)}s`;
        snow.style.animationTimingFunction = 'linear';
        snow.style.animationDelay = `${Math.random()}s`;
        snow.addEventListener('animationend', snow.remove)
        snows.append(snow)
        await this.wait(2000)
        if(!this.#_snowStorage) return;
        this.setSnow(i)
    }
    async offSnows() {
        this.#_snowStorage = false;
        while(true) {
            if(snows.childNodes.length === 0) return;
            for(let el of snows.childNodes) el.remove()
        }
    }
    start() {
        Game.localStorage = true;
        this.display(this.#_moneys, 'block')
        super.start()
    }
    stop() {
        this.addWave(0)
        Game.localStorage = false;
        this.display(this.#_moneys, 'none')
        super.stop()
    }
    clear() {
        throw Error('Метод является абстрактным!')
    }

    get speed() { return this.#_speed }
    get wave() { return this.#_wave }
    get theme() { return (this.#_lightTheme ? 'light' : 'dark') }
}

class Details extends Game {
    static balance = 0;
    static time = document.querySelector('#time');
    #_moneys = 0;
    #_timeScope = 0;
    #_timeStorage = false;
    #_timeElement = document.querySelector('#timeScope')
    #_countsText = document.querySelector('#counts')
    async #_timeStart() {
        if(!Game.localStorage) {
            return this.#_clearTime();
        }
        this.#_timeElement.textContent = (this.#_timeScope++).toLocaleString();
        await this.wait(100)
        this.#_timeStart()
    }
    #_clearTime() {
        const time = this.#_timeScope;
        this.#_timeElement.textContent = '0';
        this.#_timeScope = 0;
        return time;
    }
    async addHealth(count) {
        if(count < 0) return;
        const hp = document.querySelector('#health');
        for(let i = 0; i < count; i++) {
            if(hp.childElementCount >= 10) return;
            const health = `<img class="hp" src="${Game.urls.get('health')}">`;
            hp.insertAdjacentHTML('beforeend', health)
            this.reloadHealth()
        }
    }
    async delHealth(v = 1) {
        if(!Game.localStorage || v < 0) return;
        const hp = document.querySelector('#health');
        for(let i = 0; i < v; i++) {
            const length = hp.childElementCount;
            if(length <= 0) return;
            const health = hp.children[length-1];
            health.remove()
            this.reloadHealth()
        }
    }
    reloadHealth() {
        const hp = document.querySelector('#health');
        const length = hp.childElementCount;
        if(length <= 0) this.pause()
    }
    async addMoney(n) {
        if(n < 0 || n > 1_000) return; 
        const counter = document.querySelector('#counts');
        for(let i = 0; i < n; i++) {
            if(this.#_moneys > 1_000_000) return;
            counter.textContent = ++this.#_moneys;
            if(n <= 500) await this.wait(0.1)
        }
    }
    async delMoney(n) {
        if(n < 0) return;
        const counter = document.querySelector('#counts');
        for(let i = 0; i < n; i++) {
            if(this.#_moneys <= 0) return;
            counter.textContent = --this.#_moneys;
            if(n <= 500) await this.wait(0.1)
        }
    }
    async loading() {
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
    }
    shop() {
        this.stop()
        this.toggleWindow('shop')
    }
    settings() {
        this.stop()
        this.toggleWindow('settings')
    }
    home() {
        this.stop()
        this.toggleWindow('home')
    }
    start() {
        this.#_countsText.textContent = '0';
        this.addHealth(3)
        super.start()
        this.#_timeStart()
    }
    stop() {
        Details.balance += this.#_moneys;
        this.#_moneys = 0;
        this.delHealth(10)
        super.stop()
        this.toggleWindow('home')
    }
    pause() {
        this.toggleSnows()
        this.stop()
        this.toggleWindow('pause')
    }
}

class Evils extends Details {
    #_evils = [];
    clouds = new Map([
        ['light', [/* CLOUDS */]],
        ['dark',  [/* CLOUDS */]],
        ['all', [/* ELEMENTS */]],
    ])
    #_bonuses = new Map([
        ['giftTop', 'HTMLElement'],
        ['giftBottom', 'HTMLElement'],
        ['money', Game.urls.get('money')],
    ])
    spawnEvils = false;
    constructor() {
        super();
        const createEvil = (src, id, cl) => {
            const evil = document.createElement('img')
            evil.src = src;
            evil.classList.add(...cl)
            evil.dataset.id = id;
            this.#_evils.push(evil)
            return evil;
        }

        const createCactus = (srcName, id) => {
            for(let urlEvil of Game.urls.get('cactuses').get(srcName)) {
                const cactus = createEvil(urlEvil, id, ['evil'])
                cactus.classList.add(id)
            }
        }
       cactuses_1: createCactus('one', 'cactus_1')
       cactuses_2: createCactus('two', 'cactus_2')
       cactuses_3: createCactus('three', 'cactus_3')

        const dragonPositions = ['dragonTop', 'dragonCenter', 'dragonBottom'];
        dragons: for (let position of dragonPositions) {
            createEvil(Game.urls.get('dragon'), 'dragon', ['evil', position])
        }

        const giftPosition = ['giftTop', 'giftBottom']
        gifts: for (let position of giftPosition) {
            const evil = createEvil(Game.urls.get('gift'), 'gift', ['evil', 'bonus', position])
            this.#_bonuses.set(position, evil)
            this.#_evils.pop()
        }

        moneys: for(let i = 0; i < 10; i++) {
            createEvil(this.#_bonuses.get('money'), 'money', ['evil', 'bonus'])
        }

        clouds: for(let l = 0, d = 0; l < 10; l++, d++) {
            const cloudDark = createEvil(Game.urls.get('clouds').get('cloudDark'), 'cloud', ['clouds'])
            const cloudLight = createEvil(Game.urls.get('clouds').get('cloudLight'), 'cloud', ['clouds'])
            
            const randomTop = (255 + Math.floor(Math.random() * 30)) + 'px';

            cloudDark.style.top = cloudLight.style.top = randomTop;

            this.clouds.get('light').push(cloudLight)
            this.clouds.get('dark').push(cloudDark)

            this.#_evils.pop()
            this.#_evils.pop()
        }
    }
    async setCloud() {
        if(Game.localStorage) return;
        const parentElement = document.querySelector('#clouds')
        const random = Math.floor(Math.random() * 9)
        const cloud = this.clouds.get((this.theme === 'light') ? 'light' : 'dark')[random].cloneNode(true);
        
        
        parentElement.append(cloud)
        this.playAnimation(cloud, 'step', super.speed*10, 'linear')
        
        this.clouds.get('all').push(cloud)
        cloud.addEventListener('animationend', e => {
            this.clouds.get('all').shift()
            cloud.remove()
        })

        await this.wait(super.speed * 5000)
        this.setCloud()
    }
    removeCloud() {
        for(let el of this.clouds.get('all')) el.remove()
    }
    setEvil = async () => {
        const parentElement = document.querySelector('#evils')
        let
            speed = super.speed,
            random = Math.floor(Math.random() * this.#_evils.length),
            evil = this.#_evils[random].cloneNode(true),
            interval = (speed * 1000) + (Math.random() * (speed * 1000));
        if(evil.dataset.id === 'dragon') {
            const position = (evil.classList.contains('dragonBottom')) ? 'giftTop' : 'giftBottom';
            this.#_appendBonus(this.#_bonuses.get(position).cloneNode(), 'gift')
        }
        if(evil.dataset.id === 'money') {   
            const r = Math.floor(Math.random() * super.wave)
            for(let i = 0; i < r; i++) {
                this.#_appendBonus(evil.cloneNode(), 'money')
                await super.wait(super.speed*150)
            }
            await super.wait(super.speed*130)
            return;
        }
        parentElement.append(evil)
        this.playAnimation(this.addHitBox(evil), 'step', speed*3, 'linear')
        this.playAnimation(evil, 'step', speed*3, 'linear')
        evil.addEventListener('animationend', e => {
            evil.remove();
        })
        
        await super.wait(interval)
    }
    removeEvil() {
        const children = document.querySelector('#evils').childNodes;
        for(let el of children) {
            el.offTrackHitBox();
            el.remove()
        }
    }
    #_appendBonus(bonus, id) {
        const parentElement = document.querySelector('#evils')
        const time = super.speed*3;
        bonus.dataset.id = id;
        this.playAnimation(bonus, 'step', time, 'linear')
        this.playAnimation(this.addHitBox(bonus), 'step', time, 'linear')
        parentElement.append(bonus)
        bonus.addEventListener('animationend', e => {
            bonus.remove();
        })
        
    }
    addHitBox(evil) {
        const parentElement = document.querySelector('#boxes')
        let boxElement = evil;
        const time = super.speed *3;
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
    toggleSnows() {
        const snows = document.querySelector('#snows');
        for(const el of snows.children) {
            el.src = Game.urls.get('snow_red')
        }
    }
    playAnimation(el, name, duration, animationTF) {
        const IDsBonus = ['box_money', 'box_gift']
        let getBonus = IDsBonus.some(ID => el?.dataset?.id === ID)
        let getCloud = el?.dataset?.id === 'cloud';
        
        // el.style.animationDelay = '1s';
        el.style.animation = `${getBonus ? 'onbonuse' : getCloud ? 'oncloud' : name} ${duration}s ${animationTF}`;
        el.addEventListener('animationend', e => {
            el.style.animationName = '';
        })
    }    
    start() {
        this.spawnEvils = true;
        this.setCloud()
        this.run()
        super.start()
    }
    stop() {
        this.spawnEvils = false;
        this.removeCloud()
        this.removeEvil()
        super.stop()
    }
    async run() {
        if(!this.spawnEvils) return;
        await this.setEvil()
        this.run()
    }
}

class Dino extends Evils {
    static dino = document.querySelector('#dino');
    static box_dino = document.querySelector('#box_dino');
    up() {
        Dino.box_dino.classList.remove('box_dino_h')
        Dino.dino.src = Game.urls.get('dinoUp')
        Dino.dino.classList.remove('dinoH')
        Dino.dino.classList.add('dinoV')
    }
    down() {
        Dino.box_dino.classList.add('box_dino_h')
        Dino.dino.src = '';
        Dino.dino.classList.add('dinoH')
        Dino.dino.classList.remove('dinoV')
        Dino.dino.src = Game.urls.get('dinoDown')
    } 
    jump() {
        super.playAnimation(Dino.box_dino , 'jump', super.speed, 'ease-out')
        super.playAnimation(Dino.dino, 'jump', super.speed, 'ease-out')
    }
    async stop() {
        if(!Game.localStorage) return;
        this.toggleWindow('home')
        this.display(Dino.dino, 'none')
        super.stop()
    }
    async start() {
        const time = document.querySelector('#time');
        if(Game.localStorage) return;
        this.toggleWindow('play')
        this.display(time, 'none')
        super.loading()
        await this.wait(5000)
        this.display(Dino.dino, 'block')
        this.display(time, 'block')
        this.up()
        super.start()
    };
}

const dino = new Dino()
dino.home()

Object.defineProperties(HTMLElement.prototype, {
    hitBoxStorage: { value: false, writable: true },
    onTrackHitBox: { value: function() {
        if(this.hitBoxStorage) return;
        if(this.dataset.id.includes('box')) {
            this.isRectangle = function(positionDino, positionEvil) {
                return (((positionDino.left > positionEvil.left  && positionDino.left < positionEvil.right) || 
                        (positionDino.right > positionEvil.left  && positionDino.right < positionEvil.right)))
            };
            
            this.hitBoxStorage = true;
            this.startTrackHitBoxEvil()
        }
    } },
    offTrackHitBox: { value: function() {
        this.hitBoxStorage = false;
    } },
    startTrackHitBoxEvil: { value: async function() {
        if(!this.hitBoxStorage || !Game.localStorage) return;
        const positionEvil = this.getBoundingClientRect()
        const positionDino = Dino.box_dino.getBoundingClientRect()
        const rectangle = !(this.isRectangle(this.getBoundingClientRect(), Dino.box_dino.getBoundingClientRect()))

        if (rectangle) {
           await this.wait(Game.timeIntervalHB)
           return this.startTrackHitBoxEvil()
        }

        switch(this.dataset.id) {
            case 'box_cactus_1':
            case 'box_cactus_2':
            case 'box_cactus_3':
                if(positionDino.bottom > positionEvil.top) {
                    dino.delHealth(1)
                    dino.toggleSnows()
                };
                break;
            case 'box_dragon':
                const dragonPosition = this.className.match(/dragon[^\s]+(?=\s)/i).toString()
                switch(dragonPosition) {
                    case 'dragonTop':
                    case 'dragonCenter':
                        if (positionDino.top < positionEvil.bottom) {
                            dino.delHealth(1);
                            dino.toggleSnows()
                        };
                        break;
                    case 'dragonBottom':
                        if (positionDino.bottom > positionEvil.top) {
                            dino.delHealth(1);
                            dino.toggleSnows()
                        }
                        break;
                }
                break;
            case 'box_money':
                this.offTrackHitBox()
                this.remove()
                const addMoney = (dino.wave * 10) + Math.floor(Math.random() * 100)
                dino.addMoney(addMoney)
                break;
            case 'box_gift':
                this.offTrackHitBox()
                this.remove()
                dino.addHealth(1)
                break;
            }
        this.offTrackHitBox()
        this.startTrackHitBoxEvil()
    } },
    wait: { value: async function (duration) {
        return new Promise(resolve => setTimeout(resolve, duration))
    } },
})

let wave = 1;
setInterval(() => {
    dino.addWave(wave++)
    dino.toggleTheme()
    if(wave > 8) wave = 0;
}, 25000)