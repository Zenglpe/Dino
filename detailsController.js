import Dino, { dino } from "./dinoController.js";
import Game from "./gameController.js";

class Details extends Game {
    static balance = 0;
    static time = document.querySelector('#time');
    addHealth(count) {
        const event = new CustomEvent('addhealth', { detail: count })
        document.dispatchEvent(event)
    }
    delHealth(v = 1) {
        const event = new CustomEvent('delhealth', { detail: v })
        document.dispatchEvent(event)
    }
    reloadHealth() {
        const event = new Event('reloadhealth')
        document.dispatchEvent(event)
    }
    addMoney(n) {
        const event = new CustomEvent('addmoney', { detail: n })
        document.dispatchEvent(event)
    }
    delMoney(n) {
        const event = new CustomEvent('delmoney', { detail: n })
        document.dispatchEvent(event)
    }
    loading() {
        const event = new Event('loading')
        document.dispatchEvent(event)
    }
    shop() {
        const event = new Event('detailshop')
        document.dispatchEvent(event)
    }
    settings() {
        const event = new Event('detailsettings')
        document.dispatchEvent(event)
    }
    home() {
        const event = new Event('detailhome')
        document.dispatchEvent(event)
    }
    pause() {
        const event = new Event('detailpause')
        document.dispatchEvent(event)
    }
    start() {
        const event = new Event('detailstart')
        document.dispatchEvent(event)
        super.start()
    }
    stop() {
        const event = new Event('detailstop')
        document.dispatchEvent(event)
        super.stop()
    }
}

export default Details;

// Details...
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
                }
                break;
            case 'box_dragon':
                const dragonPosition = this.className.match(/dragon[^\s]+(?=\s)/i).toString()
                switch(dragonPosition) {
                    case 'dragonTop':
                    case 'dragonCenter':
                        if (positionDino.top < positionEvil.bottom) {
                            dino.delHealth(1);
                            dino.toggleSnows()
                        }
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
                const addMoney = (Game.wave * 10) + Math.floor(Math.random() * 100)
                dino.addMoney(addMoney)
                break;
            case 'box_gift':
                const giftPosition = this.className.match(/gift(?:Bottom|Top)/).toString(); 
                switch(giftPosition) {
                    case 'giftTop':
                        if (positionEvil.bottom > positionDino.top) {
                            dino.addHealth(1)
                        }
                        break;
                    case 'giftBottom':
                        if (positionDino.bottom > positionEvil.top) {
                            dino.addHealth(1)
                        }
                        break;
                }
                this.offTrackHitBox()
                this.remove()
                break;
            }
        this.offTrackHitBox()
        this.startTrackHitBoxEvil()
    } },
    wait: { value: async function (duration) {
        return new Promise(resolve => setTimeout(resolve, duration))
    } },
})