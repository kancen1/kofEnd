import { Player } from "/static/js/player/base.js";
import { GIF } from "/static/js/utils/gif.js";
// 实现一个角色

export class Kyo extends Player{
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    // 初始化动画
    init_animations() {
        let outer = this;
        // 定义偏移量数组
        let offsets = [0, -22, -22, -140, 0, 0, 0];
        for (let i = 0; i < 7; i ++ ) {
            // 初始化gif
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            // i get可以凭借状态取得
            this.animations.set(i, {
                // 存放gif
                gif: gif,
                // 存放帧数
                frame_cnt: 0,  // 总帧数
                // 每秒刷新帧的速率
                frame_rate: 10,  // 每五帧过度一次
                // 竖直偏移量
                offset_y: offsets[i],
                // 判断是否加载
                loaded: false,
                // 设置缩放
                scale: 2, // 放大多少倍
            });

            // 需要定义outer
            // 更新图片
            gif.onload = function() {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                // 加载成功
                obj.loaded = true;

                if (i === 3) {
                    obj.frame_rate = 8;
                }
            } 
        }
    }
}