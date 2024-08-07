// 定义全值数组 存放对象所有元素
let AC_GAME_OBJECT = [];

// 定义辅助对象
class AcGameObject {
    constructor() {
        // 指向实例将实例添加到数组中
        AC_GAME_OBJECT.push(this);

        // 存放距离上一帧的时间间隔
        this.timedelta = 0;

        // 表示这个对象是否执行过start
        this.has_call_start = false;
    }

    start () { //初始的时候执行一次，一般用来初始化

    }

    update() { //每帧执行一次，除了第一帧以外

    }

    destroy() { //删除当前对象
        for (let i in AC_GAME_OBJECT) {
            if (AC_GAME_OBJECT[i] === this) {
                // 删除一个元素
                AC_GAME_OBJECT.splice(i, 1);
                break;
            }
        }
    }
}

// 记录上一帧
let last_timestamp;

// timestamp表示执行的时刻
let AC_GAME_OBJECT_FRAME = (timestamp) => {
    for (let obj of AC_GAME_OBJECT) {
        // 判断是否执行过start函数 如果没有则执行
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            // 首先跟新timedelta函数 用当前时刻时间减上一帧时间来记录距离上一帧时间间隔 
            obj.timedelta = timestamp - last_timestamp;

            // 如果执行了则执行update函数
            obj.update();
        }
    }

    // 更新最后一帧时刻(last_timestamp)
    last_timestamp = timestamp;

    // requestAnimationFrame 这个函数是利用递归方式
    requestAnimationFrame(AC_GAME_OBJECT_FRAME);
}

// 这样就做到了每一帧可以执行函数
requestAnimationFrame(AC_GAME_OBJECT_FRAME);

// 暴露出来
export {
    AcGameObject
}