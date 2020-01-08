class Field {
    constructor(width, height, ctx, isWrap = false) {
        this.isWrap = isWrap;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.items = [];
        for (let x = 0; x < this.width; x++) {
            this.items[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.items[x][y] = null;
            }
        }
        this.generate();
        this.shuffle();
        this.updateConnected();
    }
    generate() {
        const sx = Math.floor(this.width / 2);
        const sy = Math.floor(this.height / 2);
        this.server = this.addItem(new Item(sx, sy, 0, 's'));

        const connect = (item, dir) => {
            const shape = dir.odir;
            const itemShape = item.shape | dir.dir;
            if (itemShape < 0b1111) {
                const newItem = this.addItem(new Item(dir.x, dir.y, shape));
                item.shape |= dir.dir;
                return newItem;
            } else {
                return null;
            }
        };

        const tovisit = [this.server];
        while (tovisit.length) {
            const rIndex = Math.floor(Math.random() * tovisit.length);
            const item = tovisit[rIndex];
            const avDirs = this.getAvDirs(item);
            if (avDirs.length) {
                const rDir = avDirs[Math.floor(Math.random() * avDirs.length)];
                const newItem = connect(item, rDir);
                if (!newItem) {
                    continue;
                }
                if (this.getAvDirs(newItem).length) {
                    tovisit.push(newItem);
                } else {
                    newItem.type = 'c';
                    newItem.shape = rDir.odir;
                }
            } else {
                tovisit.splice(rIndex, 1);
            }
        }     
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const item = this.getItem(x, y);
                if (item && item.type  !== 's') {
                    if (item.shape === 0b0001 || item.shape === 0b0010 || item.shape === 0b0100 || item.shape === 0b1000) {
                        item.type = 'c';
                    }
                }
            }
        }
    }
    shuffle() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const item = this.getItem(x, y);
                const rotateCount = Math.floor(Math.random() * 3);
                for (let i = 0; i < rotateCount; i++) {
                    item.rotate();
                }
            }
        }
    }
    isComplete() {
        let complete = true;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const item = this.getItem(x, y);
                if (item && item.type === 'c') {
                    if (!item.isConnected) {
                        complete = false;
                    }
                }
            }
        }
        return complete;
    }
    addItem(item) {
        this.items[item.x][item.y] = item;
        return item;
    }
    getAvDirs(item) {
        return this.getNO(item).filter(o => !this.getItem(o.x, o.y));
    }
    getNO(item) {
        const pipka = [
            { x: item.x - 0, y: item.y - 1, dir: 8, odir: 2 }, // top  
            { x: item.x + 1, y: item.y - 0, dir: 4, odir: 1 }, // right 
            { x: item.x - 0, y: item.y + 1, dir: 2, odir: 8 }, // bottom 
            { x: item.x - 1, y: item.y - 0, dir: 1, odir: 4 }, // left 
        ];
        if (!this.isWrap) {
            return pipka.filter(o => {
                return o.x >= 0 && o.x < this.width && o.y >= 0 && o.y < this.height;
            });
        } else {
            return pipka.map(o => {
                const pupka = Object.assign({}, o);
                if (o.x < 0) {
                    pupka.x = this.width - 1;
                }
                if (o.y < 0) {
                    pupka.y = this.height - 1;
                }
                if (o.x >= this.width) {
                    pupka.x = 0;
                }
                if (o.y >= this.height) {
                    pupka.y = 0;
                }
                return pupka;
            });
        }
    }
    getN(item) {
        return this.getNO(item)
            .map(o => this.getItem(o.row, o.col))
            .filter(item => !!item);
    }
    render(ctx) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const item = this.items[x][y];
                if (item) {
                    item.render(ctx);
                }
            }
        }
    }
    getItem(x, y) {
        return this.items[x] && this.items[x][y];
    }
    updateConnected(item) {
        if (!item) {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    if (this.items[x] && this.items[x][y]) {
                        this.items[x][y].isConnected = false;
                    }
                }
            }
            this.server.isConnected = true;
        }
        item = item || this.server;
        const no = this.getNO(item);
        const isLeft = item.shape & 0b0001;
        const isTop = item.shape & 0b0010;
        const isRight = item.shape & 0b0100;
        const isBottom = item.shape & 0b1000;
        no.forEach((no => {
            const n = this.getItem(no.x, no.y);
            if (n && !n.isConnected) {
                const isLeftN = n.shape & 0b0001;
                const isTopN = n.shape & 0b0010;
                const isRightN = n.shape & 0b0100;
                const isBottomN = n.shape & 0b1000;
                switch (no.dir) {
                    case 1: // left
                        if (isLeft && isRightN) {
                            n.isConnected = true;
                            this.updateConnected(n);
                        } 
                        break; 
                    case 2: // top
                        if (isTop && isBottomN) {
                            n.isConnected = true;
                            this.updateConnected(n);
                        }
                        break;
                    case 4: // right
                        if (isRight && isLeftN) {
                            n.isConnected = true;
                            this.updateConnected(n);
                        }
                        break;
                    case 8: // bottom
                        if (isBottom && isTopN) {
                            n.isConnected = true;
                            this.updateConnected(n);
                        }
                        break;
                }
            }
        }));
    }
}