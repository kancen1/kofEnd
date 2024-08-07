// 导入辅助类对象
import { AcGameObject } from '/static/js/ac_game_object/base.js';

export class Player extends AcGameObject {
    // 传入root以便于索引 info存入角色相关信息
    constructor(root, info) {
        // 初始化父类
        super();

        this.root = root;
        // 定义id 区别角色
        this.id = info.id
        // 定义坐标
        this.x = info.x;
        this.y = info.y
        // 宽高 颜色
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        // 定义方向 正为1（右）
        this.direction = 1;

        // 角色横纵速度
        this.vx = 0;
        this.vy = 0;

        // 水平竖直速度（初始） 最好变量
        this.speedx = 500;  // 水平速度 
        this.speedy = -1800; // 跳起初始速度

        // 定义重力
        this.gravity = 50;

        // 定义ctx
        this.ctx = this.root.game_map.ctx;

        // 拿取用户按键
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        // 定义状态
        this.status = 3; // 0: idle, 1: 向前, 2: 向后, 3: 跳跃, 4: 攻击, 5: 被攻击, 6: 死亡

        // 将状态动作存入
        this.animations = new Map();

        // 设置计数器 每过一帧记录
        this.frame_current_cnt = 0;

        // 定义血量
        this.hp = 100;

        // 查找出血条
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`)
        this.$hp_div = this.$hp.find('div')
    }

    // 对象的两函数
    start() {

    }

    // 定义操控
    update_control() {
        // 定义是否使用过上左右空格
        let w, a, d, space;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            // 定义另一个玩家控制
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        // 判断状态
        if (this.status === 0 || this.status === 1) {
            if (space) {
                // 设置攻击
                this.status = 4;
                this.vx = 0;
                // 初始化渲染
                this.frame_current_cnt = 0;
            } else if (w) {
                this.frame_current_cnt = 0;
                // 如果是向前跳跃
                if (d) {
                    // 将水平速度赋值
                    this.vx = this.speedx;
                } else if (a) {
                    // 向后跳跃
                    this.vx = -this.speedx;
                } else {
                    // 没有移动
                    this.vx = 0;
                }
                // 设定初始跳跃速度
                this.vy = this.speedy;
                this.status = 3;
            } else if (d) {
                // 向前移动的话
                this.vx = this.speedx;
                // 设定状态
                this.status = 1;
            } else if (a) {
                // 向后的话
                this.vx = -this.speedx;
                // 设定状态
                this.status = 1;
            } else {
                // 设定静止
                this.vx = 0;
                this.status = 0;
            }
        }
    }

    update_move() {
        // // 第一版 只给空中和击退加重力
        // // 竖直速度 如果在空中才有加速度
        // if (this.status === 3) {
        //     this.vy += this.gravity;
        // }
        
        // // 击退后增加向下速度
        // if (this.status === 5) {
        //     this.vy += this.gravity;
        // }

        // 第二版 给所有状态加重力
        this.vy += this.gravity;

        // 取消倒地的速度
        if (this.status === 6) {
            this.vy = 1000;
            this.vx = 0;
        }

        // 计算水平位移
        this.x += this.vx * this.timedelta / 1000;
        // 计算竖直位移
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > 450) {
            // 定义如果到达底部后位置固定且速度为0
            this.y = 450;
            this.vy = 0;
            // 如果在跳跃 设置为静止状态
            if (this.status === 3) {
                this.status = 0;
            }
        }

        // 防止移动出去
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    // 判断角色方向
    update_direction() {
        // 如果倒地不变化方向
        if (this.status === 6) return;

        // 取出玩家
        let players = this.root.players;

        // 如果两个都存在的话执行
        if (players[0] && players[1]) {
            // 判断自己和对方
            let me = this, you = players[1 - this.id];
            // 如果自己在左边则设置方向为1
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    // 被攻击到
    is_attack() {
        // 如果倒地则设置无法被攻击
        if (this.status === 6) {
            return;
        }

        this.status = 5;
        this.frame_current_cnt = 0;
        // 最多只能扣到0
        this.hp = Math.max(this.hp - 20, 0);

        // 渐变效果
        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp /100
        }, 300)

        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp /100
        }, 800)

        // 血条扣血 百分比
        this.$hp.width(this.$hp.parent().width() * this.hp /100);

        // 如果没血倒地
        if (this.hp <= 0) {
            this.status = 6;
            this.vx = 60;
            this.frame_current_cnt = 0;
        }

        // 设置击退效果
        if (this.direction > 0) {
            this.vx -= 300;
            this.vy = -1000;

        } else {
            this.vx += 300;
            this.vy -= 1000;
        }
    }

    // 判断是否攻击到（矩阵是否相交）
    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return true;
        // 刚刚好碰到算攻击到
        return true;
    }

    update_attack() {
        // 判断攻击 帧到35时候拳头到顶
        if (this.status === 4 && this.frame_current_cnt === 35) {
            // 取出角色
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                // 如果为正方向 调用第一个坐标
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };

            // 如果矩形有交集则被攻击到
            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {
        // 调用控制函数
        this.update_control();

        // 定义移动函数
        this.update_move();

        // 移动后渲染
        this.render();

        // 判断方向
        this.update_direction();

        // 判断攻击
        this.update_attack();
    }

    render() {
        // // 碰撞盒子
        // // 这里先给他渲染成矩形（角色）
        // this.ctx.fillStyle = this.color;
        // // 使用角色高宽 定义左上角为坐标
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // // 攻击的拳头先模拟出矩形 （拳头）
        // if (this.direction > 0) {
        //     this.ctx.fillStyle = 'pink';
        //     this.ctx.fillRect(this.x + 120, this.y + 40, 100, 20);
        // } else {
        //     this.ctx.fillStyle = 'pink';
        //     this.ctx.fillRect(this.x + this.width -120 -100, this.y + 40, 100, 20);
        // }

        // 渲染gtf 根据status
        let status = this.status;

        // 识别当前是在前进还是后退
        if (this.status === 1 && this.direction * this.vx < 0) {
            // 不同反向表示后退
            status = 2;
        }

        // 取出
        let obj = this.animations.get(status);
        // 如果已经渲染则执行
        if (obj && obj.loaded) {
            // 如果正方向
            if (this.direction > 0) {
                // 控制图片速度
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                // 因为图片的高度是不同的需要加上偏移量
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                // 反方向的话

                // 先保存配置  保存当前的绘图上下文状态（如颜色、透明度、变换矩阵等）
                this.ctx.save();
                // 水平反转图片
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);


                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                // 因为图片的高度是不同的需要加上偏移量  对调后还需要调整位置改变偏移量 this.root.game_map.$canvas.width() - this.x - this.width
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                // 回退到保存
                this.ctx.restore();
            }
        }

        //如果在攻击且播放完动画  ||  跳跃后停止  || 被攻击播放后停下 || 定义倒地后停下
        if (status === 4 || status === 3 || status === 5 || status === 6) {
            // 设置播放完最后一帧停下来
            if (this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)) {
                
                // 如果是被打倒让他不起
                if (status === 6) {
                    // 和++抵消一直在这一帧
                    this.frame_current_cnt--;
                } else {
                    // 没被打倒则静止
                    this.status = 0;
                }

            }
        }

        // 更新
        this.frame_current_cnt++;
    }
}