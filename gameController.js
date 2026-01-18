import Events from './eventsController.js';

class Game extends Events {
    #_lightTheme = false;
    static wave = 1;
    static speed = 1;
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
    toggleTheme = (() => {
        let isBlackTheme = true;
        return () => {
            const event = new CustomEvent('toggletheme', {
                detail: isBlackTheme = !isBlackTheme
            })
            document.dispatchEvent(event)
        }
    })()
    
    async wait(duration) {
        return new Promise(resolve => setTimeout(resolve, duration))
    }
    display(el, property) {
        el.style.display = (property === 'block') ? 'block' : 'none';
    }
    toggleWindow(window) {
        const event = new CustomEvent('togglewindow', { detail: window })
        document.dispatchEvent(event)
    }
    addWave(count) {
        const event = new CustomEvent('addwave', { detail: count })
        document.dispatchEvent(event)
    }
    onSnows() {
        const event = new Event('onshows')
        document.dispatchEvent(event)
    }
    offSnows() {
        const event = new Event('offshows')
        document.dispatchEvent(event)
    }
    start() {
        const event = new Event('gamestart')
        document.dispatchEvent(event)
    }
    stop() {
        const event = new Event('gamestop')
        document.dispatchEvent(event)
    }

    get theme() { return (this.#_lightTheme ? 'light' : 'dark') }
    set theme(v) { this.#_lightTheme = !!(v === 'light') }
}

export default Game;