/*
 * @Author: huazite 
 * @Date: 2018-10-16 14:11:42 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-11-12 16:18:52
 * @功能：日期选择器
 */

;(function (win, doc, undefined) {
    "use strict";
    let DatePicker = function (targetDom, options) {
        if ((typeof targetDom) === "string") {
            this.targetDom = document.querySelector(targetDom);
        } else {
            this.targetDom = targetDom;
        }
        this.defaults = {
            /**
             * 默认：0（年）； 1（年月），2（年月日），
             * 3（时），4（时分），5（时分秒）
             * 6（年月日时），7（年月日时分），8（年月日时分秒），
             * 9 时段（年月日，时段：上午中午下午）
             */
            type:0,
            /**
             * 范围：默认不设置。设置在数组中，默认从年左到右依次设置
             */
        }
        // 参数合并        
        for (var name in options) {
            this.defaults[name] = options[name];
        }
        this.init();
    }
    DatePicker.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor: DatePicker,
        //根据参数初始化选择器
        init: function(){
            let _self = this; 
            
            //生成的字符串，填充到目标元素中,生成DOM
            _self.targetDom.innerHTML = initStr(_self.defaults.type);
            
            //获取相关元素DOM
            let items = _self.itemList = _self.targetDom.querySelectorAll(".picker-list");//数组列表
            
            //设置初始时间值
            let liHeight;
            let year,month,day,hour,minute,second;
            let date = new Date();
            year = date.getFullYear();
            month = date.getMonth();
            day = date.getDate();
            hour = date.getHours();
            minute = date.getMinutes();
            second = date.getSeconds();
            //设置内部li
            for(let i = 0; i< items.length;i++){
                let type = items[i].getAttribute("data-type");
                
                switch(type){
                    case "year":
                        for(let j = (parseInt(year) - 5); j <= (parseInt(year) + 5);j++){
                            let DOM_LI = document.createElement("li");
                            DOM_LI.setAttribute("data-value",j);
                            DOM_LI.innerHTML = j;
                            items[i].appendChild(DOM_LI)
                        }
                        liHeight = items[i].querySelector("li").offsetHeight;
                        items[i].setAttribute("style",`transform: translateY(${(2-5) * liHeight}px);`);
                        _self["year"] = items[i].index = 5;
                        _self["yearVal"] = parseInt(year) - 5;
                        items[i].length = 11;
                        break;
                    case "month": 
                        for(let j = 1; j <= 12;j++){
                            if(j < 10){
                                j = "0" + j;
                            }
                            let DOM_LI = document.createElement("li");
                            DOM_LI.setAttribute("data-value",j);
                            DOM_LI.innerHTML = j;
                            items[i].appendChild(DOM_LI)
                        }
                        liHeight = items[i].querySelector("li").offsetHeight;
                        items[i].setAttribute("style",`transform: translateY(${(2-parseInt(month) + 1) * liHeight}px);`);
                        _self["month"] = items[i].index = parseInt(month) + 1;
                        items[i].length = 12;
                        break;
                    case "day":
                        let allDay = parseInt(new Date(year, month, 0).getDate());
                        for(let j = 1; j <= allDay;j++){
                            if(j < 10){
                                j = "0" + j;
                            }
                            let DOM_LI = document.createElement("li");
                            DOM_LI.setAttribute("data-value",j);
                            DOM_LI.innerHTML = j;
                            items[i].appendChild(DOM_LI)
                        }
                        liHeight = items[i].querySelector("li").offsetHeight;
                        items[i].setAttribute("style",`transform: translateY(${(2-parseInt(day)) * liHeight}px);`);
                        _self["day"] = items[i].index = parseInt(day);
                        items[i].length = allDay;
                        break;
                    case "hour":
                        for(let j = 0; j < 24;j++){
                            if(j < 10){
                                j = "0" + j;
                            }
                            let DOM_LI = document.createElement("li");
                            DOM_LI.setAttribute("data-value",j);
                            DOM_LI.innerHTML = j;
                            items[i].appendChild(DOM_LI)
                        }
                        liHeight = items[i].querySelector("li").offsetHeight;
                        items[i].setAttribute("style",`transform: translateY(${(2-parseInt(hour)) * liHeight}px);`);
                        _self["hour"] = items[i].index = parseInt(hour);
                        items[i].length = 60;
                        break;
                    default:
                        for(let j = 0; j <= 59;j++){
                            if(j < 10){
                                j = "0" + j;
                            }
                            let DOM_LI = document.createElement("li");
                            DOM_LI.setAttribute("data-value",j);
                            DOM_LI.innerHTML = j;
                            items[i].appendChild(DOM_LI)
                        }
                        liHeight = items[i].querySelector("li").offsetHeight;
                        items[i].length = 60;
                        if(type == "minute"){
                            items[i].setAttribute("style",`transform: translateY(${(2-parseInt(minute)) * liHeight}px);`);
                            _self["minute"] = items[i].index = parseInt(minute);
                        }else{
                            items[i].setAttribute("style",`transform: translateY(${(2-parseInt(second)) * liHeight}px);`);
                            _self["second"] = items[i].index = parseInt(second)
                        }
                        break;
                }
            }
            
            /**
            * picker内item进行滑动移动函数
            * @param  targetDom  {HTMLElement}  元素
            * @param  event  {Event} Touch原始事件
            * @param  callback {Function} 回调函数
            */
            function itemMove(targetDom,event,callback){
                //开始点、结束点、距离
                let startPoint = event.startPoint;
                let endPoint = event.endPoint;
                let distance = endPoint.y - startPoint.y;
                let nowDistance = distance + (2 - targetDom.index)*liHeight;
                //到达阙值不可移动
                if(nowDistance > 2*liHeight){
                    nowDistance = 2*liHeight;
                }else if(nowDistance < (3 - targetDom.length)*liHeight ){
                    nowDistance = (3 - targetDom.length)*liHeight;
                }
                //如果在移动中，按照移动设置
                if(event.flag == "move"){
                    targetDom.setAttribute("style",`transform: translateY(${nowDistance}px);transition:none;`)

                //移动结束时，设置合适的值，使文字在线条正中间
                }else{
                    if(Math.abs(nowDistance)%liHeight > liHeight/3){
                        if(distance < 0){
                            nowDistance = Math.floor(nowDistance/liHeight)*liHeight
                        }else{
                            nowDistance =  Math.ceil(nowDistance/liHeight)*liHeight
                        }
                    }else{
                        if(distance < 0){
                            nowDistance = Math.ceil(nowDistance/liHeight)*liHeight
                        }else{
                            nowDistance =  Math.floor(nowDistance/liHeight)*liHeight
                        }
                    }
                    // 设置属性，并把目前的索引值传给目标元素列表
                    targetDom.setAttribute("style",`transform: translateY(${nowDistance}px);transition: transform .1s ease-in;`);
                    let type = targetDom.getAttribute("data-type");
                    _self[type] = targetDom.index = 2 - nowDistance/liHeight;

                    //如果改变月份，根据月份设置本月日期
                    if(type == "month" || type == "year"){
                        setDay(_self);
                    }
                    //如果存在回调函数，调取回调函数
                    if(callback){
                        callback(targetDom.index, _self, type);
                    }
                }
            }
            //设置极联dom变化事件：此处使用touch.js，需在页面内引入
           
            for(let i = 0;i<items.length;i++){
                touch.swipeMove(items[i],function(e){
                    itemMove(items[i], e, _self.itemChange);
                },false,true,true)
            } 

        },
        //获取对应列表目前值
        getItems:function(callback){
            let _self = this;
            let items =  this.itemList;
            let year,month,day,hour,minute,second;
            for(let i = 0;i<items.length;i++){
                let type = items[i].getAttribute("data-type");
                switch(type){
                    case "year":
                        year = _self.yearVal + _self.year;
                        break;
                    case "month":
                        month = _self.month + 1;
                        if(month < 10){
                            month = "0" + month;
                        }
                        break;
                    case "day":
                        day = _self.day + 1;
                        if(day < 10){
                            day = "0" + day;
                        }
                        break;
                    case "hour":
                        hour = _self.hour;
                        if(hour < 10){
                            hour = "0" + hour;
                        }
                        break;
                    case "minute":
                        minute = _self.minute;
                        if(minute < 10){
                            minute = "0" + minute;
                        }
                        break;
                    case "second":
                        second = _self.second;
                        if(second < 10){
                            second = "0" + second;
                        }
                        break;
                }
            }
            switch(_self.defaults.type){
                case 0:
                    return year;
                case 1:
                    return `${year}-${month}`;
                case 2:
                    return `${year}-${month}-${day}`;
                case 3:
                    return `${hour}`;
                case 4:
                    return `${hour}:${minute}`;
                case 5:
                    return `${hour}:${minute}:${second}`;
                case 6:
                    return `${year}-${month}-${day} ${hour}`;
                case 7:
                    return `${year}-${month}-${day} ${hour}:${minute}`;
                case 8:
                    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

            }
            if(callback){
                callback(year,month,day,hour,minute,second)
            }
        },
        itemChange:function(index, _self, type){
            console.log(_self.yearVal + _self.year,_self.month,_self.day,_self.hour,_self.minute,_self.second, type)
        },
       
    }
    //根据年月设置日期
    function setDay(_self){
        let allDay = parseInt(new Date(_self.yearVal + _self.year, _self.month + 1, 0).getDate());
        let liHeight =_self.targetDom.querySelector("li").offsetHeight;
        let dom_day = _self.targetDom.querySelector("[data-type='day']");
        dom_day.innerHTML = "";
        for(let j = 1; j <= allDay;j++){
            if(j < 10){
                j = "0" + j;
            }
            let DOM_LI = document.createElement("li");
            DOM_LI.setAttribute("data-value",j);
            DOM_LI.innerHTML = j;
            dom_day.appendChild(DOM_LI)
        }
        if(_self.day >= allDay){
            _self.day = allDay - 1;
        }
        dom_day.setAttribute("style",`transform: translateY(${(2-parseInt(_self.day)) * liHeight}px);`);
        _self["day"] = dom_day.index = parseInt(_self.day);
        dom_day.length = allDay;
    }

    function initStr(type){
         //根据type设置内容格式
         switch(type){
            case 0:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 1:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">月</div>
                        <ul class="picker-list" data-type="month">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 2:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">月</div>
                        <ul class="picker-list" data-type="month">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">日</div>
                        <ul class="picker-list" data-type="day">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 3:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">时</div>
                        <ul class="picker-list" data-type="hour">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 4:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">时</div>
                        <ul class="picker-list" data-type="hour">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">分</div>
                        <ul class="picker-list" data-type="minute">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 5:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">时</div>
                        <ul class="picker-list" data-type="hour">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">分</div>
                        <ul class="picker-list" data-type="minute">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">秒</div>
                        <ul class="picker-list" data-type="second">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 6:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">月</div>
                        <ul class="picker-list" data-type="month">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">日</div>
                        <ul class="picker-list" data-type="day">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">时</div>
                        <ul class="picker-list" data-type="hour">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 7:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">月</div>
                        <ul class="picker-list" data-type="month">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">日</div>
                        <ul class="picker-list" data-type="day">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">时</div>
                        <ul class="picker-list" data-type="hour">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">分</div>
                        <ul class="picker-list" data-type="minute">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 8:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">月</div>
                        <ul class="picker-list" data-type="month">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">日</div>
                        <ul class="picker-list" data-type="day">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">时</div>
                        <ul class="picker-list" data-type="hour">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">分</div>
                        <ul class="picker-list" data-type="minute">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">秒</div>
                        <ul class="picker-list" data-type="second">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
            case 9:
                var initStr = `<div class="picker-body">
                    <div class="picker-item">
                        <div class="list-title">年</div>
                        <ul class="picker-list" data-type="year">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">月</div>
                        <ul class="picker-list" data-type="month">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">日</div>
                        <ul class="picker-list" data-type="day">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                    <div class="picker-item">
                        <div class="list-title">时段</div>
                        <ul class="picker-list" data-type="time">
                            
                        </ul>
                        <div class="pciker-rule"></div>
                    </div>
                </div>`
                break;
        }
        return initStr
    }
    
    win.DatePicker = DatePicker;
}(window, document))