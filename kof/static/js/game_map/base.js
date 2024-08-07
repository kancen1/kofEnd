import { AcGameObject } from '/static/js/ac_game_object/base.js';
import { Controller } from '/static/js/controller/base.js';

// 定义函数继承AcGameObject 并暴露
export class GameMap extends AcGameObject {
    // 继承一定要写构造函数
    constructor(root) {

        // 调用父类构造函数
        super();

        // 将传入的参数赋值给 GameMap 类实例的一个属性 this.root
        this.root = root;

        // 定义canvas
        this.$canvas = $(`<canvas width="1280" height="720" tabindex=0></canvas>`);

        // 取出对象 在这canvas是数组
        this.ctx = this.$canvas[0].getContext('2d');

        // 加入到kof中 (base传入了root 对象)
        this.root.$kof.append(this.$canvas);

        // 聚焦为了获取输入
        this.$canvas.focus();

        this.controller = new Controller(this.$canvas);

        // 添加血条
        this.root.$kof.append($(`<div class="kof-head">
            <div class="kof-head-hp-0"><div><div></div></div></div>
            <div class="kof-head-timer">60</div>
            <div class="kof-head-hp-1"><div><div></div></div></div>
            </div>`
        ));
        
        // 当前剩余时间
        this.time_left = 60000;
        // 设定时间
        this.$timer = this.root.$kof.find('.kof-head-timer')
    }

    // 对象一般都需要定义start update 初始和每一帧的执行
    start() {

    }

    // 重写update
    update() {
        // 更新时间
        this.time_left -= this.timedelta;
        if (this.time_left < 0) {
            this.time_left = 0;

            // 时间到了平局
            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = 6, b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
            }
        }

        // 渲染进计时器
        this.$timer.text(parseInt(this.time_left / 1000));

        // update一般不写逻辑一般用函数调用
        this.render();
    }

    // 清空 不然移动会变成拖尾
    render() {
        // 清理矩阵 0 0到宽高 使用canvas.width方法获得宽度
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 调试是否输出成功
        // console.log(this.ctx.canvas.width);
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
}