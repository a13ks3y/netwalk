class App {
    constructor(fieldWidth = 13, fieldHeight = 11, isWrap = false) {
        const canvas = document.createElement('canvas');
        canvas.width = fieldWidth * Item.SIZE;
        canvas.height = fieldHeight * Item.SIZE;
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
        return Promise.all(Object.keys(Item.srcs).map(key => {
            return new Promise(resolve => {
                const img = document.createElement('img');
                img.src = 'img/' + Item.srcs[key];
                img.style.display = 'none';
                img.onload = resolve;
                Item.imgs[key] = img;
                document.body.appendChild(img);
            })
        }));
    }
    click(x, y, isCw) {
        const row = Math.floor(x / Item.SIZE);
        const col = Math.floor(y / Item.SIZE);
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
const rect = document.body.getBoundingClientRect();
const w = ~~(rect.width / Item.SIZE);
const h = ~~(rect.height / Item.SIZE);
const app = new App(w, h, true);