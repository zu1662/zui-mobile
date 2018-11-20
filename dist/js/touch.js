/*
 * @Author: huazite 
 * @Date: 2018-10-17 14:47:24 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-10-26 11:10:49
 * @功能：移动端触摸滑动函数判断
 */
;(function(win, doc, undefined){ 
    "use strict";

    let Touch = function(){
        this.touch = {
            distance: 30,  //滑动距离，超过该距离触发swipe事件，单位像素。
            duration: 300 //滑动时长，超过该时间不触发swipe，单位毫秒。
        };
    }
    Touch.prototype = {
         //构造器指向构造函数,防止构造器指向Object的情况.
         constructor: Touch,
        /**
        * 绑定事件
        * @param  el        触发事件的元素
        * @param  swipe     事件名称，可选值为swipeLeft,swipeRight,swipeUp,swipeDown
        * @param  callback  事件回调函数:当为swipeMove事件时，startPoint（起始点）、endPoint（结束点）、flag（move：在touchmove状态；end: 在touchend状态）包含在event内。
        * @param  isStopPropagation   是否停止冒泡，true为停止冒泡
        * @param  isPreventDefault    是否阻止默认事件，true为阻止默认事件
        * @param  triggerOnMove       swipe事件有两种触发方式，一种是在touchmove过程中，只要满足滑动距离条件即触发。
        *                             一种是在touchend中，进入滑动距离判断，如果满足滑动距离触发。
        *                             默认是在touchend中触发。
        */
        bindSwipe:function(el, swipe, callback, triggerOnMove, isStopPropagation, isPreventDefault){
            var _self = this;
            var startPoint, endPoint, timer;
            
            if ((typeof el) === "string") {
                var targetDom = document.querySelector(el);
            } else {
                var targetDom = el;
            }

            /**
            * 计算滑动方向
            * 首先根据x方向和y方向滑动的长度决定触发x方向还是y方向的事件。
            * 然后再判断具体的滑动方向。
            * 如果滑动距离不够长，不判断方向。
            */
            function swipeDirection(x1, y1, x2, y2){
                var diffX = x1 - x2,
                    diffY = y1 - y2,
                    absX = Math.abs(diffX),
                    absY = Math.abs(diffY),
                    swipe;

                if(absX >= absY){
                    if(absX >= _self.touch.distance){
                        swipe = diffX > 0 ? 'swipeLeft' : 'swipeRight';
                    }
                }else{
                    if(absY >= _self.touch.distance){
                        swipe = diffY > 0 ? 'swipeUp' : 'swipeDown';
                    }
                }

                return swipe;
            }

            // 清除本次滑动数据
            function clearSwipe(){
                startPoint = undefined;
                endPoint = undefined;

                if(timer !== undefined){
                    clearTimeout(timer);
                    timer = undefined;
                }
            }

            /**
            * 判断是否符合条件，如果符合条件就执行swipe事件
            * @param  el     {HTMLElement}  元素
            * @param  event  {Event}        Touch原始事件
            * @param  return 如果执行了事件，就返回true。
            */
            function execSwipe(el, event){
                if(startPoint && endPoint && swipeDirection(startPoint.x, startPoint.y, endPoint.x, endPoint.y) === swipe){
                    callback.call(el, event);
                    return true;
                }
            }

            /**
            * 判断是否符合move条件，如果符合条件就执行swipe事件
            * @param  el     {HTMLElement}  元素
            * @param  event  {Event}        Touch原始事件
            * @param  return 如果执行了事件，就返回true。
            */
            function execMove(el, event, flag){
                if(startPoint && endPoint && swipe == "swipeMove"){
                    event.startPoint = startPoint;
                    event.endPoint = endPoint;
                    event.flag = flag;
                    callback.call(el, event);
                    return true;
                }
            }

            targetDom.addEventListener('touchstart', function(event){
                var self = this, touchPoint = event.touches[0];

                if(isStopPropagation){
                    event.stopPropagation();
                }

                if(isPreventDefault){
                    event.preventDefault();
                }

                startPoint = {
                    x: Math.floor(touchPoint.clientX),
                    y: Math.floor(touchPoint.clientY)
                };

                if(swipe != "swipeMove"){
                    timer = setTimeout(function(){
                        //如果超时，清空本次touch数据
                        clearSwipe();
                    }, _self.touch.duration);
                }
            });

            targetDom.addEventListener('touchmove', function(event){
                var self = this, touchPoint = event.touches[0];

                if(isStopPropagation){
                    event.stopPropagation();
                }

                if(isPreventDefault){
                    event.preventDefault();
                }

                if(startPoint){
                    endPoint = {
                        x: Math.floor(touchPoint.clientX),
                        y: Math.floor(touchPoint.clientY)
                    };
                    let flag = "move";
                    execMove(self, event,flag);
                    //执行swipe事件判断，是否符合触发事件
                    if(triggerOnMove){
                        if(execSwipe(self, event)){
                            clearSwipe();
                        }
                    }
                }
            });

            targetDom.addEventListener('touchend', function(event){
                if(isStopPropagation){
                    event.stopPropagation();
                }

                if(isPreventDefault){
                    event.preventDefault();
                }

                if(swipe != "swipeMove"){
                    execSwipe(self, event);
                   
                }else{
                    let flag = "end";
                    execMove(self, event,flag);
                }
                 //清除本次touch数据
                 clearSwipe();
            });
        },
        swipeMove:function(el, callback, triggerOnMove, isStopPropagation, isPreventDefault){
            this.bindSwipe(el, 'swipeMove', callback, triggerOnMove, isStopPropagation, isPreventDefault);
        },
        swipeLeft:function(el, callback, triggerOnMove, isStopPropagation, isPreventDefault){
            this.bindSwipe(el, 'swipeLeft', callback, triggerOnMove, isStopPropagation, isPreventDefault);
        },

        swipeRight : function(el, callback, triggerOnMove, isStopPropagation, isPreventDefault){
            this.bindSwipe(el, 'swipeRight', callback, triggerOnMove, isStopPropagation, isPreventDefault);
        },

        swipeUp : function(el, callback, triggerOnMove, isStopPropagation, isPreventDefault){
            this.bindSwipe(el, 'swipeUp', callback, triggerOnMove, isStopPropagation, isPreventDefault);
        },

        swipeDown : function(el, callback, triggerOnMove, isStopPropagation, isPreventDefault){
            this.bindSwipe(el, 'swipeDown', callback, triggerOnMove, isStopPropagation, isPreventDefault);
        }

    }

    //自动根据构造函数新增对象，如果存在则使用已存在的
    win.touch = win.touch || new Touch();
}(window, document))