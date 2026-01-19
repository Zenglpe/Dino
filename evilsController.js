import Details from "./detailsController.js";
import Game from "./gameController.js";

class Evils extends Details {
    evils = [];
    spawnEvils = false;
    clouds = new Map([
        ['light', [/* CLOUDS */]],
        ['dark',  [/* CLOUDS */]],
        ['all', [/* ELEMENTS */]],
    ])
    bonuses = new Map([
        ['giftTop', 'HTMLElement'],
        ['giftBottom', 'HTMLElement'],
        ['money', Game.urls.get('money')],
    ])
    constructor() {
        super();
        const createEvil = (src, id, cl) => {
            const evil = document.createElement('img')
            evil.src = src;
            evil.classList.add(...cl)
            evil.dataset.id = id;
            this.evils.push(evil)
            return evil;
        }

        const createCactus = (srcName, id) => {
            for(let urlEvil of Game.urls.get(`cactuses_${srcName}`)) {
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
            this.bonuses.set(position, evil)
            this.evils.pop()
        }

        moneys: for(let i = 0; i < 10; i++) {
            createEvil(this.bonuses.get('money'), 'money', ['evil', 'bonus'])
        }

        clouds: for(let l = 0, d = 0; l < 10; l++, d++) {
            const cloudDark = createEvil(Game.urls.get('clouds_cloudDark'), 'cloud', ['clouds'])
            const cloudLight = createEvil(Game.urls.get('clouds_cloudLight'), 'cloud', ['clouds'])
            
            const randomTop = (255 + Math.floor(Math.random() * 30)) + 'px';

            cloudDark.style.top = cloudLight.style.top = randomTop;

            this.clouds.get('light').push(cloudLight)
            this.clouds.get('dark').push(cloudDark)

            this.evils.pop()
            this.evils.pop()
        }
    }
    removeCloud() {
        const event = new Event('removecloud')
        document.dispatchEvent(event)
    }
    removeEvil() {
        const event = new Event('removeevil')
        document.dispatchEvent(event)
    }
    appendBonus(bonus, id) {
        const event = new CustomEvent('appendbonus', { detail:[ bonus, id ]})
        document.dispatchEvent(event)
    }
    toggleSnows() {
        const event = new Event('togglesnows')
        document.dispatchEvent(event)
    }
    playAnimation(el, name, duration, animationTF) {
        const event = new CustomEvent('playanimationevils', { detail: [ el, name, duration, animationTF ]})
        document.dispatchEvent(event)
    }    
    start() {
        const event = new Event('evilstart')
        document.dispatchEvent(event)
        super.start()
    }
    stop() {
        const event = new Event('evilstop')
        document.dispatchEvent(event)
        super.stop()
    }
    async setCloud() {
        const event = new Event('setcloud')
        document.dispatchEvent(event)
    }
    async run() {
        const event = new Event('evilrun')
        document.dispatchEvent(event)
    }
}

export default Evils;