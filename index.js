class App {
    constructor(fieldWidth, fieldHeight, isWrap) {
        const canvas = document.createElement('canvas');
        canvas.width = fieldWidth * ITEM_SIZE;
        canvas.height = fieldHeight * ITEM_SIZE;
        document.body.appendChild(canvas);
        canvas.addEventListener('click', this.onmouseclick.bind(this), false);
        canvas.addEventListener('mouseup', this.onmouseup.bind(this), false);
        canvas.addEventListener('contextmenu', e => { e.preventDefault(); return false; }, false);
        this.ctx = canvas.getContext('2d');
        this.load().then(() => {
            this.field = new Field(fieldWidth, fieldHeight, this.ctx, isWrap);
            this.field.render(this.ctx);
        });
    }
    load() {
        return Promise.all(Object.keys(srcs).map(key => {
            return new Promise(resolve => {
                const img = document.createElement('img');
                img.src = 'img/' + srcs[key];
                img.style.display = 'none';
                img.onload = () => resolve();
                imgs[key] = img;
                document.body.appendChild(img);
            })
        }));
    }
    click(x, y, isCw) {
        const row = Math.floor(x / ITEM_SIZE);
        const col = Math.floor(y / ITEM_SIZE);
        const item = this.field.getItem(row, col);
        if (item) {
            if (isCw) {
                item.rotateCW();
            } else {
                item.rotate();
            }
            this.field.updateConnected();
            this.field.render(this.ctx);
            if (this.field.isComplete()) {
                setTimeout(() => alert('You win!'), 0);                
            }

        }
    }
    onmouseclick(e) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.click(x, y, false);
    }
    onmouseup(e) {
        if (e.button === 2) {
            const x = e.offsetX;
            const y = e.offsetY;
            this.click(x, y, true);
        }
    }
}
// @todo: subscribe to document.ready event
const rect = document.body.getBoundingClientRect();
const w = Math.floor(rect.width / ITEM_SIZE);
const h = Math.floor(rect.height / ITEM_SIZE);
const app = new App(w, h, true);