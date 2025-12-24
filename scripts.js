class Events {
    #_stateKeyPress = false;
    constructor() {
        document.addEventListener('visibilitychange', event => {
            this.home()
        })
        this.setMenuAnimations()
    }
    #_keyDown = (event) => {
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
                // case 'menu_settings':
                //     this.toggleWindow('settings')
                //     break;
                // case 'menu_shop':
                //     this.toggleWindow('shop')
                //     break;
                // case 'back':
                //     this.toggleWindow('home')
                //     break;
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
            [ 'one',  [/* cactuses */]],
            [ 'two',  [/* cactuses */]],
            ['three', [/* cactuses */]],
        ])],
    ])
    constructor() {
        super()
        for(let i = 1; i <= 21; i++) {
            let position = (i <= 8) ? 'one' : (i <= 17) ? 'two' : 'three';
            Game.urls.get('cactuses').get(position).push(`./Animations/Cactuses/cactus${i}.gif`)
        }
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
        if(!Game.localStorage || typeof n !== 'number' || n > 8) return this.#_wave;
        if(n < 1) {
            this.#_speed = 0.9;
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
    #_moneys = 0;
    #_timeScope = 0;
    #_timeElement = document.querySelector('#timeScope')
    #_countsText = document.querySelector('#counts')
    async #_timeStart() {
        if(!this.cloudStorage) {
            return this.#_clearTime();
        }
        this.#_timeElement.textContent = (this.#_timeScope++).toLocaleString();
        await this.wait(100);
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
        if(length <= 0) this.stop()
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
        this.#_timeStart()
        this.addHealth(3)
        super.start()
    }
    stop() {
        Details.balance += this.#_moneys;
        this.#_moneys = 0;
        this.delHealth(10)
        super.stop()
    }
}

class Evils extends Details {
    #_evils = [];
    evilsAll = [];
    cloudStorage = false;
    clouds = new Map([
        ['light', [/* clouds */]],
        ['dark',  [/* clouds */]],
        ['all', []]
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
        if(!this.cloudStorage) return;
        const random = Math.floor(Math.random() * 9)
        const cloud = this.clouds.get((this.theme === 'light') ? 'light' : 'dark')[random].cloneNode(true);
        
        this.clouds.get('all').push(cloud)
        
        document.body.append(cloud)
        this.playAnimation(cloud, 'step', super.speed*10, 'linear')
        
        await this.wait(super.speed * 5000)
        this.setCloud()
    }
    removeCloud() {
        for(let el of this.clouds.get('all')) el.remove()
    }
    setEvil = async () => {
        let
            speed = super.speed,
            random = Math.floor(Math.random() * this.#_evils.length),
            evil = this.#_evils[random].cloneNode(true),
            interval = (speed * 1000) + (Math.random() * (speed * 1000));
        if(evil.dataset.id === 'dragon') {
            const position = (evil.classList.contains('dragonBottom')) ? 'giftTop' : 'giftBottom';
            this.#_appendGift( this.#_bonuses.get(position).cloneNode() )
        }
        if(evil.dataset.id === 'money') {
            const r = Math.floor(Math.random() * super.wave)
            for(let i = 0; i < r; i++) {
                this.#_appendMoney(evil.cloneNode())
                await super.wait(super.speed*150)
            }
            await super.wait(super.speed*130)
            return;
        }
        this.evilsAll.push(evil)
        document.body.append(evil)
        this.playAnimation(evil, 'step', speed*3, 'linear')
        await super.wait(interval)
    }
    removeEvil() {
        for(let el of this.evilsAll) el.remove()
    }
    #_appendGift(bonus) {
        this.evilsAll.push(bonus)
        bonus.dataset.id = `gift`;
        document.body.append(bonus)
        this.playAnimation(bonus, 'step', super.speed*3, 'linear')
    }
    #_appendMoney(bonus) {
        this.evilsAll.push(bonus)
        bonus.dataset.id = `money`;
        document.body.append(bonus)
        this.playAnimation(bonus, 'step', super.speed*3, 'linear')
    }
    
    playAnimation(el, name, duration, animationTF) {
        const IDsBonus = ['money', 'gift']
        let getBonus = IDsBonus.some(ID => el.dataset.id === ID)
        let getCloud = el.dataset.id === 'cloud';
        
        el.style.animationDelay = '1s';
        el.style.animation = `${getBonus ? 'onbonuse' : getCloud ? 'oncloud' : name} ${duration}s ${animationTF}`;

        el.addEventListener('animationend', e => {
            el.style.animationName = null;
            if(el.dataset.id !== 'dino') {
                this.evilsAll.shift()
                el.remove();
            }
            if(getCloud) {
                this.clouds.get('all').shift()
            }
        })
    }    
    start() {
        this.cloudStorage = true;
        this.spawnEvils = true;
        this.setCloud()
        this.run()
        super.start()
    }
    stop() {
        this.cloudStorage = false;
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
    up() {
        Dino.dino.src = Game.urls.get('dinoUp')
        Dino.dino.classList.remove('dinoH')
        Dino.dino.classList.add('dinoV')
    }
    down() {
        Dino.dino.src = '';
        Dino.dino.classList.add('dinoH')
        Dino.dino.classList.remove('dinoV')
        Dino.dino.src = Game.urls.get('dinoDown')
    } 
    jump() {
        super.playAnimation(Dino.dino, 'jump', super.speed, 'ease-out')
    }
    async stop() {
        if(!Game.localStorage) return;
        this.toggleWindow('home')
        this.display(Dino.dino, 'none')
        super.stop()
    }
    async start() {
        if(Game.localStorage) return;
        this.toggleWindow('play')
        super.loading()
        await this.wait(5000)
        this.display(Dino.dino, 'block')
        this.up()
        super.start()
    };
}

const dino = new Dino()
dino.home()

setInterval((() => {
    let wave = 1;
    return () => {
        dino.toggleTheme()
        dino.addWave(wave++)
        dino.addMoney(500)
    }
})(), 25000)