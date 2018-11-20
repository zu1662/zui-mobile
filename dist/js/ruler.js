/*
 * @Author: huazite 
 * @Date: 2018-10-11 14:19:10 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-10-12 15:22:09
 * @功能：实现移动端刻度尺选择器功能
 */
;(function (win, doc, undefined) {
    "use strict";
    let Ruler = function(targetDom,options){
        if ((typeof targetDom) === "string") {
            this.targetDom = document.querySelector(targetDom);
        } else {
            this.targetDom = targetDom;
        }
        this.defaults = {
            //各种参数、各种属性
            start:0,//起始值，整数：默认0
            end:100,//结束值，整数：默认100
            vaule:0,//初始值
            unit:1,//滑尺最小单元[单位]
            span:5,//滑尺跨度
            title:["title1","title2"],//滑尺title信息。传入数组列表，第一个为大标题，第二个为小标题。不传则不显示
        }
        // 参数合并        
        for(var name in options){
            this.defaults[name] = options[name];
        }
        this.init();
    }
    Ruler.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor:Ruler,
        //根据参数初始化选择器
        init:function(){
            //保存this
            var _self = this;
            let initStr = `   <div class="ruler-title1" style="${_self.defaults.title[0] == "title1" ? "display:none":""}">${_self.defaults.title[0]}</div>
                                <div class="ruler-title2" style="${_self.defaults.title[1] == "title2" ? "display:none":""}">${_self.defaults.title[1]}</div>
                                <div class="ruler-value-box">
                                    <div class="ruler-value">${_self.defaults.vaule}</div>
                                    <input type="text" value="${_self.defaults.vaule}" name="ruler" style="display:none;">
                                </div>
                                <div class="ruler">
                                    <canvas></canvas>
                                    <div class="ruler-pointer"></div>
                                </div>`
            //把生成的DOM添加到目标元素中
            _self.targetDom.innerHTML = initStr;

            //初始化相关参数
            _self.ruler = _self.targetDom.querySelector(".ruler")
            _self.canvas = _self.targetDom.querySelector("canvas");
            _self.rulerValue = _self.targetDom.querySelector(".ruler-value");
            _self.input = _self.targetDom.querySelector("input");
            let rulerWidth = _self.ruler.clientWidth;

            let spanWidth = 60;
            let unit = _self.defaults.unit;//单位、单元
            let span = _self.defaults.span;//跨度
            let start = _self.defaults.start;//起始数值
            let end = _self.defaults.end;//结束数值
            let canvasWidth = spanWidth * (end-start)/span + rulerWidth;
            let canvasHeight = 30;
            _self.canvas.width = canvasWidth;
            _self.canvas.height = canvasHeight;
            
            //获取上下文
            let ctx = _self.canvas.getContext('2d');

             //绘制底部线条
            ctx.beginPath();
            ctx.moveTo(0,canvasHeight);
            ctx.lineTo(canvasWidth,canvasHeight);
            ctx.strokeStyle = "#ccc";
            ctx.stroke();

            //绘制刻度
            let nowX = rulerWidth/2;
            let unitWidth = spanWidth/(span/unit);

            for(let i = 0;i<=(end-start)/span;i++){//span刻度
                ctx.moveTo(nowX,canvasHeight);
                ctx.lineTo(nowX,canvasHeight-10);
                ctx.strokeStyle = "#ccc";
                ctx.stroke();
                ctx.font = "12px";
                ctx.fillStyle = "#ccc";

                //测量写入的字体宽度，进行设置居中
                let text = ctx.measureText(start+span*i); 
                let textWidth = text.width;
                //填充字体
                ctx.fillText(start+span*i,nowX-textWidth/2,canvasHeight-20);

                if(i != (end-start)/span){
                    for(let j = 0;j<span/unit;j++){//span刻度
                        nowX += unitWidth;
                        ctx.moveTo(nowX,canvasHeight);
                        ctx.lineTo(nowX,canvasHeight-5);
                        ctx.strokeStyle = "#ccc";
                        ctx.stroke();
                    }
                }
            } 
            
            //初始化默认数值
            _self.canvas.setAttribute("style",`left:${-(_self.defaults.vaule -start)/unit*unitWidth}px;`);
            
            //滑动标尺
            _self.canvas.addEventListener("touchstart",function(e){
                let target = e.target;
                //获取初始相对于屏幕的位置
                let x = e.touches[0].clientX - target.offsetLeft;
                document.addEventListener("touchmove",function(e){
                    if(target){
                        //根据上述位置，获取现在应该在的位置
                        let left = e.touches[0].clientX - x;

                        if(left > 0){
                            left = 0;
                        }else if(left < rulerWidth-canvasWidth){
                            left = rulerWidth-canvasWidth;
                        }
                        _self.nowValue = start + Math.abs(left)/unitWidth * unit;
                        
                        //当值为正数时，进行赋值
                        if(_self.nowValue % unit == 0){
                            _self.rulerValue.innerHTML = Math.round(_self.nowValue);
                            _self.input.setAttribute("value",Math.round(_self.nowValue))
                            
                            _self.canvas.setAttribute("style",`left:${left}px;`);
                        }
                    }
                })

                document.addEventListener("touchend",function(e){
                    if(target){
                        target = null;
                        //当值在范围内时，进行自动贴近赋值
                        let flag =  Math.round(_self.nowValue%unit/unit);//四舍五入为整数
                        if(flag){//靠近大 的一侧
                            var nowValue = _self.nowValue - _self.nowValue%unit + unit;
                        }else{//靠近小的一侧
                            var nowValue = _self.nowValue - _self.nowValue%unit;
                        }
                        _self.rulerValue.innerHTML =  nowValue;
                        _self.canvas.setAttribute("style",`left:${-(nowValue-start)/unit*unitWidth}px;`);
                        _self.input.setAttribute("value",nowValue)
                    }
                })
            })
        },
    }
    win.Ruler = Ruler;
}(window, document))
