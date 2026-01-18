/**
 * @author Evgeniy
 * @description 2D Game(DINO)
 * @version 1.1.5
*/
import Evils from './evilsController.js';

class Dino extends Evils {
    static dino = document.querySelector('#dino');
    static box_dino = document.querySelector('#box_dino');
    up() {
        const event = new Event('dinoup')
        Dino.dino.dispatchEvent(event)
    }
    down() {
       const event = new Event('dinodown')
        Dino.dino.dispatchEvent(event)
    } 
    jump() {
        const event = new Event('dinojump')
        Dino.dino.dispatchEvent(event)
    }
    stop() {
        const event = new Event('dinostop')
        Dino.dino.dispatchEvent(event)
    }
    start() {
        const event = new Event('dinostart')
        Dino.dino.dispatchEvent(event)
    };
}

const dino = new Dino()

dino.home()
let wave = 1;
setInterval(() => {
    dino.addWave(wave++)
    dino.toggleTheme()
    if(wave > 8) wave = 0;
}, 25000)

export { dino }
export default Dino;