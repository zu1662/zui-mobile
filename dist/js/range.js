/*
 * @Author: huazite 
 * @Date: 2018-09-28 15:03:53 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-10-12 11:39:53
 * @功能：实现移动端滑块选取功能
 */
;(function (win, doc, undefined) {
    "use strict";
    var Range = function(targetDom,options){
        // 判断是用函数创建的还是用new创建的。这样我们就可以通过MaskShare("dom") 或 new MaskShare("dom")来使用这个插件了        
        //if (!(this instanceof Range)) return new Range(targetDom, options);
        // 判断传进来的是DOM还是字符串        
        if ((typeof targetDom) === "string") {
            this.targetDom = document.querySelector(targetDom);
        } else {
            this.targetDom = targetDom;
        }
        this.defaults = {
            //各种参数、各种属性
            //type:"default",//滑块类型：default（水平）、vertical（垂直滑块）
            min:0,//最小值，整数：默认0
            max:100,//最大值，整数：默认100
            range:false,//是否开启范围滑块：设置为true，则出现两个拖拽块
            value:0,//滑块初始默认值：若滑块范围为开启状态，需要传入数组，表示开始和结尾：[30,60]
            step:1,//拖动步长
            scale:false,//是否显示刻度尺：默认为不显示

        }
        // 参数合并        
        for(var name in options){
            //排除例外条件
            switch(name){
                case "min":
                    options[name] = options[name]<0 ? 0 : options[name];
                    break;
                case "value":
                    options[name] = (options[name] - options["min"]) <0 ? options["min"] : options[name];
                    break;
                case "step":
                    options[name] = options[name] > 0 ? options[name] : 1;
                    break;
            }
            this.defaults[name] = options[name];
        }
        this.init();
    }
    Range.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor:Range,
        //根据参数初始化选择器
        init:function(){
            //保存this
            var _self = this;
            let initStr = `<div class="range-path-line">
                                <div class="range-path-range"></div>
                            </div>
                            <div class="zui-range-bar right-bar" style="z-index:1000";><span class="range-bar-tip range-bar-tip-style">0</span></div>
                            <input type="text" class="right-input" name="range" style="display:none;">`
            //是否开启范围选项
            if(_self.defaults.range){
                initStr += `<div class="zui-range-bar left-bar" style="z-index:999";><span class="range-bar-tip range-bar-tip-style">100</span></div><input type="text" class="left-input" name="leftRange" style="display:none;">`
            }
            //是否显示刻度
            if(_self.defaults.scale){
                //跨度
                var scaleLength = (_self.defaults.max - _self.defaults.min) / 4;
                initStr += `<div class="range-path-scale">
                                <div class="range-path-scale-number" style="left:-50px;"><i class="range-path-scale-number-dial"></i> ${_self.defaults.min}</div>
                                <div class="range-path-scale-number" style="left:calc(25% - 50px);"><i class="range-path-scale-number-dial"></i>${_self.defaults.min + scaleLength}</div>
                                <div class="range-path-scale-number" style="left:calc(50% - 50px);"><i class="range-path-scale-number-dial"></i>${_self.defaults.min + 2*scaleLength}</div>
                                <div class="range-path-scale-number" style="left:calc(75% - 50px);"><i class="range-path-scale-number-dial"></i>${_self.defaults.min + 3*scaleLength}</div>
                                <div class="range-path-scale-number" style="left:calc(100% - 50px);"><i class="range-path-scale-number-dial"></i>${_self.defaults.min + 4*scaleLength}</div>
                            </div>`
            }

            //把生成的DOM添加到目标元素中
            _self.targetDom.innerHTML = `<div class="zui-range-path">${initStr}</div>`;

            //初始化效果
            _self.bar = _self.targetDom.querySelector(".zui-range-bar.right-bar");
            _self.line = _self.targetDom.querySelector(".range-path-line");
            _self.tip = _self.targetDom.querySelector(".range-bar-tip");
            _self.range = _self.targetDom.querySelector(".range-path-range");
            _self.input = _self.targetDom.querySelector(".right-input");
            //拖动条总长
            var lineWidth = _self.line.clientWidth;
            
            //设置初始值(判断是否为范围选项)
            if(_self.defaults.range){//存在范围
                _self.leftBar = _self.targetDom.querySelector(".zui-range-bar.left-bar");
                _self.leftBarTip = _self.leftBar.querySelector(".range-bar-tip");
                _self.leftInput = _self.targetDom.querySelector(".left-input");
                
                var initMinVal = _self.defaults.value[0] < _self.defaults.min ? _self.defaults.min : _self.defaults.value[0];
                var initMaxVal = _self.defaults.value[1] > _self.defaults.max ? _self.defaults.max : _self.defaults.value[1];
                var initLeftX = (initMinVal - _self.defaults.min)*lineWidth/(_self.defaults.max - _self.defaults.min)-10;
                var initRightX = (initMaxVal - _self.defaults.min)*lineWidth/(_self.defaults.max - _self.defaults.min)-10;
                _self.leftBar.setAttribute("style",`left:${initLeftX}px;`);
                _self.bar.setAttribute("style",`left:${initRightX}px;`);
                _self.leftBarTip.innerText = initMinVal;
                _self.tip.innerText = initMaxVal;
                var initLeftPercent =  parseInt((initLeftX + 10) / lineWidth * 100);
                var initrightPercent =  parseInt((initRightX + 10) / lineWidth * 100);
                _self.range.setAttribute("style",`width:${initrightPercent-initLeftPercent}% !important;left:${initLeftX}px`);
                _self.leftInput.setAttribute("value",initMinVal);
                _self.input.setAttribute("value",initMaxVal);
            }else{//无范围，单滑块
                var initMaxVal = _self.defaults.value < _self.defaults.min ? _self.defaults.min : _self.defaults.value;
                var initLeftX = -10;
                var initRightX = (initMaxVal - _self.defaults.min)*lineWidth/(_self.defaults.max - _self.defaults.min)-10;
                _self.bar.setAttribute("style",`left:${initRightX}px;`);
                var initLeftPercent =  0;
                var initrightPercent =  parseInt((initRightX + 10) / lineWidth * 100);
                _self.tip.innerText = initMaxVal;
                _self.range.setAttribute("style",`width:${initrightPercent-initLeftPercent}% !important;left:0px`);
                _self.input.setAttribute("value",initMaxVal);
            }

            //设置点击跳转
            _self.line.addEventListener("click",function(e){
                var leftX = e.offsetX-10;
                let percent = parseInt((leftX + 10) / lineWidth * 100);
                if(_self.defaults.range){
                    if(leftX < initLeftX){//点击位置在范围左侧
                        _self.leftBar.setAttribute("style",`left:${leftX}px;transition: left 0.3s ease 0s;`);
                        initLeftX = leftX;
                        initLeftPercent = percent;
                        //设置tip内文本
                        initMinVal = parseInt((_self.defaults.max - _self.defaults.min)  * (leftX + 10) / lineWidth) + _self.defaults.min;
                        _self.leftBarTip.innerText =  initMinVal;
                        _self.leftInput.setAttribute("value",initMinVal);
                    }else if(leftX > initRightX){//点击位置在范围右侧
                        _self.bar.setAttribute("style",`left:${leftX}px;transition: left 0.3s ease 0s;`);
                        initRightX = leftX;
                        initrightPercent = percent;
                         //设置tip内文本
                         initMaxVal = parseInt((_self.defaults.max - _self.defaults.min)  * (leftX + 10) / lineWidth) + _self.defaults.min;
                        _self.tip.innerText = initMaxVal;
                        _self.input.setAttribute("value",initMaxVal);
                    }else{//点击位置在范围内
                        _self.leftBar.setAttribute("style",`left:${leftX}px;transition: left 0.3s ease 0s;`);
                        initLeftX = leftX;
                        initLeftPercent = percent;
                         //设置tip内文本
                         initMinVal = parseInt((_self.defaults.max - _self.defaults.min)  * (leftX + 10) / lineWidth) + _self.defaults.min;
                        _self.leftBarTip.innerText =  initMinVal;
                        _self.leftInput.setAttribute("value",initMinVal);
                    }
                    
                }else{
                    _self.bar.setAttribute("style",`left:${leftX}px;transition: left 0.3s ease 0s;`);
                    initrightPercent = percent;
                    initMaxVal =  parseInt((_self.defaults.max - _self.defaults.min)  * (leftX + 10) / lineWidth) + _self.defaults.min;
                    _self.tip.innerText = initMaxVal;
                    _self.input.setAttribute("value",initMaxVal);
                }

                //点击后位置百分比位置
                //根据百分比设置颜色范围宽度
                _self.range.setAttribute("style",`width:${initrightPercent - initLeftPercent}% !important;left:${initLeftX+10}px;transition: width 0.3s ease 0s;`);
            })
            //拖动滑块
            if(_self.defaults.range){
                //左侧范围滑块拖动
                _self.leftBar.addEventListener("touchstart",function(e){
                    let target = e.target;
                    //获取初始相对于屏幕的位置
                    let x = e.touches[0].clientX - target.offsetLeft;
                    let lastLeft = 0;
                    document.addEventListener("touchmove",function(e){
                        if(target){
                            //根据上述位置，获取现在应该在的位置
                            let left = e.touches[0].clientX - x;
                            if(Math.abs(left-lastLeft) >= _self.defaults.step){
                                lastLeft = left;
                            }
                            if(lastLeft < -10){  
                                lastLeft = -10;  
                            }else if(lastLeft> lineWidth -10){  
                                lastLeft= lineWidth-10;  
                            }
                            initLeftX = lastLeft;
                            if(initLeftX > initRightX){
                                lastLeft = initRightX;
                            }
                            _self.leftBar.setAttribute("style",`left:${lastLeft}px`);
                            //点击后位置百分比位置
                            let percent = parseInt((lastLeft + 10) / lineWidth * 100);
                            initLeftPercent = percent;
                            //设置tip内文本
                            initMinVal = parseInt((_self.defaults.max - _self.defaults.min)  * (lastLeft + 10) / lineWidth) + _self.defaults.min;
                            _self.leftBarTip.innerText =  initMinVal;
                            _self.leftInput.setAttribute("value",initMinVal);
                            //根据百分比设置颜色范围宽度
                            _self.range.setAttribute("style",`width:${initrightPercent - initLeftPercent}% !important;transition: none;left:${lastLeft+10}px;`);
                        }
                    })
                    document.addEventListener("touchend",function(e){
                        if(target){
                            target = null;
                        }
                    })
                })
            }
            //右侧范围滑块拖动
            _self.bar.addEventListener("touchstart",function(e){
                let target = e.target;
                //获取初始相对于屏幕的位置
                let x = e.touches[0].clientX - target.offsetLeft;
                let lastLeft = 0;
                document.addEventListener("touchmove",function(e){
                    if(target){
                        //根据上述位置，获取现在应该在的位置
                        let left = e.touches[0].clientX - x;
                        if(Math.abs(left-lastLeft) >= _self.defaults.step){
                            lastLeft = left;
                        }
                        if(lastLeft < -10){  
                            lastLeft = -10;  
                        }else if(lastLeft> lineWidth -10){  
                            lastLeft= lineWidth-10;  
                        }
                        initRightX = lastLeft;
                        if(initRightX < initLeftX){
                            lastLeft = initLeftX;
                        }
                        _self.bar.setAttribute("style",`left:${lastLeft}px`);
                        //点击后位置百分比位置
                        let percent = parseInt((lastLeft + 10) / lineWidth * 100);
                        initrightPercent = percent;
                        //设置tip内文本
                        initMaxVal = parseInt((_self.defaults.max - _self.defaults.min)  * (lastLeft + 10) / lineWidth) + _self.defaults.min;
                        _self.input.setAttribute("value",initMaxVal);
                        _self.tip.innerText =  initMaxVal;
                        //根据百分比设置颜色范围宽度
                        _self.range.setAttribute("style",`width:${initrightPercent - initLeftPercent}% !important;transition: none;left:${initLeftX+10}px;`);
                    }
                })
                document.addEventListener("touchend",function(e){
                    if(target){
                        target = null;
                    }
                })
            })
        }
    }
    win.Range = Range;
}(window, document))
