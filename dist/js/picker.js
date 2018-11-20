/*
 * @Author: huazite 
 * @Date: 2018-10-16 14:11:42 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-10-30 11:19:44
 * @功能：选择器
 */

;(function (win, doc, undefined) {
    "use strict";
    let Picker = function (targetDom, options) {
        if ((typeof targetDom) === "string") {
            this.targetDom = document.querySelector(targetDom);
        } else {
            this.targetDom = targetDom;
        }
        this.defaults = {
            //各种参数、各种属性
            type:1,//选择器种类：一级：1；二级极联：2；三级极联：3
            data:[],/** 选择器数据：
                一级选择器：[{value:1,name:参数1},{value:1,name:参数2},....]
                二级极联选择器：[{
                    value:1,
                    name:参数1,
                    data:[{value:1,name:参数1},{value:1,name:参数2}]},....]
                三级极联选择器：
                [{
                    value:1,
                    name:参数1,
                    data:[{
                        value:1,
                        name:参数1,
                        data:[{
                            value:1,
                            name:参数1},....]},...]},....]
            */
            value:[0],//传入数据内的value值。则直接传入数组即可.如果为极联样式，如三级极联-->[2,1,2]
        }
        // 参数合并        
        for (var name in options) {
            this.defaults[name] = options[name];
        }
        //排除参数的错误值
        this.defaults["type"] = this.defaults["type"] > 3 ? 3 : this.defaults["type"];
        this.defaults["type"] = this.defaults["type"] < 0 ? 0 : this.defaults['type'];
        this.init();
    }
    Picker.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor: Picker,
        //根据参数初始化选择器
        init: function(){
            let _self = this;
            _self.picker = _self.targetDom;
            //选择器容器dom字符串
            let pickerItemStr = `<div class="picker-item">
                                    <ul class="picker-list" >
                                        
                                    </ul>
                                    <div class="pciker-rule"></div>
                                </div>`
            for(let i = 0;i< _self.defaults.type - 1; i++){
                pickerItemStr = pickerItemStr + `<div class="picker-item">
                                                    <ul class="picker-list" >
                                                        
                                                    </ul>
                                                    <div class="pciker-rule"></div>
                                                </div>`;
            }
            //初始化dom字符串
            let initStr = `<div class="picker-body">
                                ${pickerItemStr}
                            </div>`
            
            //生成的字符串，填充到目标元素中,生成DOM
            _self.targetDom.innerHTML = initStr;
            
            //获取相关元素DOM
            _self.itemList = _self.picker.querySelectorAll(".picker-list");//数组列表

            //设置数据data
            let item1Str = '';
            let item2Str = '';
            let item3Str = '';
            let data1 = _self.defaults.data;
            let data2 = null,data3 = null;
            if(data1){
                for(let i = 0;i< data1.length;i++){
                    if(_self.defaults.value[0] == data1[i].value){
                        item1Str += ` <li class="active" data-value="${data1[i].value}" >${data1[i].name}</li>`
                        _self.item1Index = i;
                    }else{
                        item1Str += ` <li data-value="${data1[i].value}" >${data1[i].name}</li>`
                        _self.item1Index = 0;
                    }
                }
            }

            if( data1 && data1[_self.item1Index].data){
                data2 = data1[_self.item1Index].data;
                for(let j = 0;j< data2.length;j++){
                    if(_self.defaults.value[1] == data2[j].value){
                        item2Str += ` <li class="active" data-value="${data2[j].value}" >${data2[j].name}</li>`
                        _self.item2Index = j;
                    }else{
                        item2Str += ` <li data-value="${data2[j].value}" >${data2[j].name}</li>`
                        _self.item2Index = 0;
                    }
                }
            }

            if(data2 && data2[_self.item2Index].data){
                data3 = data2[ _self.item2Index].data;
                for(let k = 0;k< data3.length;k++){
                    if(_self.defaults.value[2] == data3[k].value){
                        item3Str += ` <li class="active" data-value="${data3[k].value}" >${data3[k].name}</li>`
                        _self.item3Index = k;
                    }else{
                        item3Str += ` <li data-value="${data3[k].value}" >${data3[k].name}</li>`
                        _self.item3Index = 0;
                    }  
                }
            }
            //得到字符串数据填入dom中
            _self.itemList[0].innerHTML = item1Str;
            if(_self.itemList[1]){
                _self.itemList[1].innerHTML = item2Str;
            }
            if(_self.itemList[2]){
                _self.itemList[2].innerHTML = item3Str;
            }

            let liHeight = _self.itemList[0].querySelector("li").offsetHeight;//实际li高度
            
            //设置初始值时的偏移量
            _self.itemList[0].setAttribute("style",`transform: translateY(${(2 - _self.item1Index)*liHeight}px);`);
            _self.itemList[0].index = _self.item1Index;
            _self.itemList[0].data = data1;
            if(data2 && _self.defaults.type >= 2 ){
                _self.itemList[1].setAttribute("style",`transform: translateY(${(2 - _self.item2Index)*liHeight}px);`);
                _self.itemList[1].index = _self.item2Index;
                _self.itemList[1].data = data2;

            }
            if(data3 &&  _self.defaults.type == 3){
                _self.itemList[2].setAttribute("style",`transform: translateY(${(2 - _self.item3Index)*liHeight}px);`);
                _self.itemList[2].index = _self.item2Index;
                _self.itemList[2].data = data3;
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
                }else if(nowDistance < (3 - targetDom.data.length)*liHeight ){
                    nowDistance = (3 - targetDom.data.length)*liHeight;
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
                    targetDom.index = 2 - nowDistance/liHeight;
                    //如果存在回调函数，调取回调函数
                    if(callback){
                        callback(targetDom.index,targetDom.data,_self);
                    }
                }
            }
            //设置极联dom变化事件：此处使用touch.js，需在页面内引入
            touch.swipeMove(_self.itemList[0],function(e){
                itemMove(_self.itemList[0], e, _self.firstItemChange);
                
            },false,true,true)
            if(_self.itemList[1]){
                touch.swipeMove(_self.itemList[1],function(e){
                    itemMove(_self.itemList[1], e, _self.secondItemChange);
                },false,true,true)
            }
            if(_self.itemList[2]){
                touch.swipeMove(_self.itemList[2],function(e){
                    itemMove(_self.itemList[2], e, _self.thirdItemChange);
                },false,true,true)
            }        

        },
        //获取对应列表目前值
        getItems:function(callback){
            let _self = this;
            let data = [];
            if(_self.itemList[0]){
                data.push(_self.itemList[0].data[_self.itemList[0].index]);
            }
            if(_self.itemList[1]){
                data.push(_self.itemList[1].data[_self.itemList[1].index]);
            }
            if(_self.itemList[2]){
                data.push(_self.itemList[2].data[_self.itemList[2].index]);
            }
            
            //如果存在回调函数，把数据传入回调函数。否则直接返回数据值
            if(callback){
                callback(data)
            }
            return data
        },
        /**
         * itemChange:  {Function}
         *      对应列表进行选区动作后，触发函数。
         *      可重写，重写时，接受系统传入的index（此 列表选中的data数组的索引）、data（此列表此时数据data）、_self（此选择器Picker实例对象）三个参数。
         * set..ItemData:   {Function}
         *      设置对应列表的数据，默认设置索引为0.
         *      可重写，重写时，传入设置的data数据。多用于通过Ajax请求数据，然后设置数据值。
         *  
         * 
        */
        firstItemChange:function(index,data,_self){
            console.log(data[index])
            if(_self.defaults.type >= 2){
                _self.setSecondItemData(data[index].data);
            }
            
            if(data[index].data){
               if(data[index].data[0].data && _self.defaults.type == 3){
                    _self.setThirdItemData(data[index].data[0].data);
               }
            }
        },
        setFirstItemData:function(data){
            if(data){
                let itemStr = "";
                for(let i = 0;i< data.length;i++){
                    itemStr += ` <li data-value="${data[i].value}" >${data[i].name}</li>`
                }
                this.itemList[0].innerHTML = itemStr;
                this.itemList[0].data = data;
                this.itemList[0].index = 0;
                this.itemList[0].setAttribute("style",`transform: translateY(72px);`);
                
            }
        },
        secondItemChange:function(index,data,_self){
            console.log(data[index])
            if(_self.defaults.type == 3){
                _self.setThirdItemData(data[index].data);
            }
        },
        setSecondItemData:function(data){
            if(data && this.defaults.type >= 2){
                let itemStr = "";
                for(let i = 0;i< data.length;i++){
                    itemStr += ` <li data-value="${data[i].value}" >${data[i].name}</li>`
                }
                this.itemList[1].innerHTML = itemStr;
                this.itemList[1].data = data;
                this.itemList[1].index = 0;
                this.itemList[1].setAttribute("style",`transform: translateY(72px);`);
                
            }
        },
        thirdItemChange:function(index,data,_self){
            console.log(data[index])
        },
        setThirdItemData:function(data){
            if(data && this.defaults.type == 3){
                let itemStr = "";
                for(let i = 0;i< data.length;i++){
                    itemStr += ` <li data-value="${data[i].value}" >${data[i].name}</li>`
                }
                this.itemList[2].innerHTML = itemStr;
                this.itemList[2].data = data;
                this.itemList[2].index = 0;
                this.itemList[2].setAttribute("style",`transform: translateY(72px);`);
                
            }
        },
       
    }
    
    win.Picker = Picker;
}(window, document))