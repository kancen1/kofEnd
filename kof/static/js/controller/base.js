// 创建对象读取玩家操作
export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        // 存放是否按住了一个键 set可以判重
        this.pressed_keys = new Set();
        this.start();
    }

    start() {
        let outer = this;
        this.$canvas.keydown(function(e) {
            // 存放按键
            outer.pressed_keys.add(e.key)
        });

        this.$canvas.keyup(function(e) {
            outer.pressed_keys.delete(e.key);
        });
    }
}