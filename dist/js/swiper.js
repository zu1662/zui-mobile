/*
 * @Author: huazite 
 * @Date: 2018-10-16 14:11:42 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-10-24 16:54:09
 * @功能：轮播图
 */

;(function (win, doc, undefined) {
    "use strict";
    let Swiper = function (targetDom, options) {
        if ((typeof targetDom) === "string") {
            this.targetDom = document.querySelector(targetDom);
        } else {
            this.targetDom = targetDom;
        }
        this.defaults = {
            //各种参数、各种属性
            navBar: false, //是否显示导航按钮,默认不显示
            navBarLocation: "bottom", //导航按钮位置：bottom,left,top,right.默认bottom
            navTip: false, //是否显示导航提示信息，例如：1/4。默认不显示
            navTipLocation: "right", //导航提示信息位置，目前只设置左侧：left，右侧：right。默认right
            loopSwiper: false, //是否循环滚动
            nowPage: 1, //初始页面值
            animateType: "ease-in", //滚动动画方式
            autoSwiper: false, //是否设置自动轮播播放
            interval: 2000, //自动轮播变换间隔时间。当autoSwiper为false时，可不设置.单位为：毫秒
            beforeMove:null,//开始运动之前回调
            afterMove:null,//完成滑动之后回调
        }
        // 参数合并        
        for (var name in options) {
            this.defaults[name] = options[name];
        }
        this.init();
    }
    Swiper.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor: Swiper,
        //根据参数初始化选择器
        init: function () {
            let _self = this;
            _self.swiper =  _self.targetDom;
            _self.swiperWarp = _self.swiper.querySelector(".swiper-warp");
            _self.itemList = _self.swiperWarp.querySelectorAll(".swiper-item");
            _self.swiperWidth = _self.swiper.clientWidth;
            
            //排除错误条件
            _self.defaults.nowPage = _self.defaults.nowPage < 1 ? 1 : _self.defaults.nowPage;
            _self.defaults.nowPage = _self.defaults.nowPage > _self.itemList.length ? 1 : _self.defaults.nowPage;

            //初始化导航按钮navbar
            if (_self.defaults.navBar) {
                let spanStr = "";
                for (let i = 0; i < _self.itemList.length; i++) {
                    if (_self.defaults.nowPage - 1 == i) {
                        spanStr += `<span class="active"></span>`;
                    } else {
                        spanStr += "<span></span>";
                    }

                }
                let navbarDom = document.createElement("div");
                switch (_self.defaults.navBarLocation) {
                    case "left":
                        navbarDom.setAttribute("class", "swiper-navbar nav-bar-left");
                        break;
                    case "top":
                        navbarDom.setAttribute("class", "swiper-navbar nav-bar-top");
                        break;
                    case "right":
                        navbarDom.setAttribute("class", "swiper-navbar nav-bar-right");
                        break;
                    default:
                        navbarDom.setAttribute("class", "swiper-navbar");
                }
                navbarDom.innerHTML = spanStr;
                //把生成的dom加入页面中
                _self.swiper.appendChild(navbarDom);
                _self.navBarItem = navbarDom.querySelectorAll("span");
            }

            //初始化导航提示信息
            if (_self.defaults.navTip) {
                let tipStr = `<span class="swiper-nowpage">${_self.defaults.nowPage}</span>/<span class="swiper-allpage">${_self.itemList.length}</span>`;
                let navtipDom = document.createElement("div");
                switch (_self.defaults.navTipLocation) {
                    case "left":
                        navtipDom.setAttribute("class", "swiper-navtip navtip-left-bottom");
                        break;
                    default:
                        navtipDom.setAttribute("class", "swiper-navtip");
                }
                navtipDom.innerHTML = tipStr;
                //把生成的dom加入页面中
                _self.swiper.appendChild(navtipDom);
                _self.navTipItem = navtipDom.querySelector(".swiper-nowpage");
            }

            //初始化页面值
            _self.nowLeft = -(_self.defaults.nowPage - 1) * _self.swiperWidth;
            _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft}px)`);

            //手指点击并且移动时的情况
            _self.swiperWarp.addEventListener("touchstart", function (e) {
                //手指触屏屏幕，停止轮播
                if(_self.defaults.autoSwiper){
                    clearInterval(_self.intel);
                }

                _self.target = e.target;
                //获取初始相对于屏幕的位置
                let x = e.touches[0].clientX - _self.swiperWarp.offsetLeft;
                //手指触摸滑动
                _self.swiperWarp.addEventListener("touchmove", function (e) {
                    if (_self.target) {
                        //根据上述位置，获取现在应该在的位置
                        _self.moveLeft = e.touches[0].clientX - x;

                        //当滑动值>0或者<右侧最大值时，增加滑动阻尼
                        if (!_self.defaults.loopSwiper && _self.nowLeft >= 0) {
                            if (_self.moveLeft > 0) {
                                _self.moveLeft = damping(_self.moveLeft);
                            }

                        } else if (!_self.defaults.loopSwiper && _self.nowLeft <= -_self.swiperWidth * (_self.itemList.length - 1)) {
                            if (_self.moveLeft < 0) {
                                _self.moveLeft = -damping(Math.abs(_self.moveLeft));
                            }
                        }
                        _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft + _self.moveLeft}px)`);

                    }
                })
            })
            //手指结束触摸
            _self.swiperWarp.addEventListener("touchend", function (e) {
                if (_self.target) {
                    _self.target == null;

                    if (_self.moveLeft > _self.swiperWidth / 2) { //右滑超过一半
                        _self.animateToPrev(_self.defaults.beforeMove,_self.defaults.afterMove);
                    } else if (_self.moveLeft < -_self.swiperWidth / 2) { //左滑超过一半
                        _self.animateToNext(_self.defaults.beforeMove,_self.defaults.afterMove);
                    } else {
                        _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft}px);transition:transform .3s ${_self.defaults.animateType};`);
                    }

                    //手指结束触摸，重新设置自动轮播
                    if(_self.defaults.autoSwiper){
                        _self.intel =  setInterval(function(){
                            _self.animateToNext(_self.defaults.beforeMove,_self.defaults.afterMove);
                        },_self.defaults.interval);
                    }
                }
            })

            //手指左滑动时情况
            touch.swipeLeft(_self.swiperWarp, function () {
                _self.animateToNext(_self.defaults.beforeMove,_self.defaults.afterMove);
            })
            //手指右滑动时情况
            touch.swipeRight(_self.swiperWarp, function () { 
                _self.animateToPrev(_self.defaults.beforeMove,_self.defaults.afterMove);
            })

            //设置自动轮播
            if(_self.defaults.autoSwiper){
                _self.intel =  setInterval(function(){
                    _self.animateToNext(_self.defaults.beforeMove,_self.defaults.afterMove);
                },_self.defaults.interval);
            }

        },
        //跳转到下一页面
        animateToNext: function (beforeMove,afterMove) {
            let _self = this;
            //回调
            if(beforeMove){
                beforeMove();
            }
            //判断当最左侧时 nowleft为最右侧时 情况
            if (_self.nowLeft == -_self.swiperWidth * (_self.itemList.length - 1)) {
                //如果是到达末尾循环，则赋值开始值，否则值不变
                if (_self.defaults.loopSwiper) {
                    _self.swiperWarp.setAttribute("style", `transform:translateX(${0}px);transition:transform .3s ${_self.defaults.animateType};`);
                    _self.nowLeft = 0;
                    _self.defaults.nowPage = 1;
                } else {
                    _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft}px);transition:transform .3s ${_self.defaults.animateType};`);
                }
                //如果目前偏移值在范围内，则正常偏移
            } else {
                _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft - _self.swiperWidth}px);transition:transform .3s ${_self.defaults.animateType};`);
                _self.nowLeft -= _self.swiperWidth;
                _self.defaults.nowPage += 1;
            }

           if(_self.defaults.navBar){
                //设置导航按钮目前值
                for(let i = 0;i<_self.navBarItem.length;i++){
                    if(_self.defaults.nowPage-1 == i){
                        _self.navBarItem[i].setAttribute("class","active")
                    }else{
                        _self.navBarItem[i].setAttribute("class","")
                    }
                }
           }
           if(_self.defaults.navTip){
                //设置导航提示信息目前值
                _self.navTipItem.innerHTML = _self.defaults.nowPage;
           }

            //回调
            if(afterMove){
                //js判断动画完成
                var transitionEvent = whichTransitionEvent();
                transitionEvent && _self.swiperWarp.addEventListener(transitionEvent, _self.fuc = function() {
                    afterMove();
                    this.removeEventListener(transitionEvent,_self.fuc,false);//销毁事件                            
                });
               
            }
        },
        // 跳转到上一页面
        animateToPrev: function (beforeMove,afterMove) {
            let _self = this;
            //回调
            if(beforeMove){
                beforeMove();
            }
            //判断当最左侧时 nowleft== 0 情况
            if (_self.nowLeft == 0) {
                //如果是到达末尾循环，则赋值开始值，否则值不变
                if (_self.defaults.loopSwiper) {
                    _self.swiperWarp.setAttribute("style", `transform:translateX(${-_self.swiperWidth * (_self.itemList.length-1)}px);transition:transform .3s ${_self.defaults.animateType};`);
                    _self.nowLeft = -_self.swiperWidth * (_self.itemList.length - 1);
                    _self.defaults.nowPage = _self.itemList.length;
                } else {
                    _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft}px);transition:transform .3s ${_self.defaults.animateType};`);
                }
                //如果目前偏移值在范围内，则正常偏移
            } else {
                _self.swiperWarp.setAttribute("style", `transform:translateX(${_self.nowLeft + _self.swiperWidth}px);transition:transform .3s ${_self.defaults.animateType};`);
                _self.nowLeft += _self.swiperWidth;
                _self.defaults.nowPage -=1;
            }

            if(_self.defaults.navBar){
                //设置导航按钮目前值
                for(let i = 0;i<_self.navBarItem.length;i++){
                    if(_self.defaults.nowPage-1 == i){
                        _self.navBarItem[i].setAttribute("class","active")
                    }else{
                        _self.navBarItem[i].setAttribute("class","")
                    }
                }
            }
            if(_self.defaults.navTip){
                //设置导航提示信息目前值
                _self.navTipItem.innerHTML = _self.defaults.nowPage;
            }

            //回调
            if(afterMove){
                //js判断动画完成
                var transitionEvent = whichTransitionEvent();
                transitionEvent && _self.swiperWarp.addEventListener(transitionEvent,_self.fuc= function() {
                    afterMove();
                    this.removeEventListener(transitionEvent,_self.fuc,false);//销毁事件                            
                });
            }
        }
    }
    //判断动画完成函数
    function whichTransitionEvent() {
        var t,
            el = document.createElement('surface'),
            transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
    //添加阻尼效果函数
    function damping(value) {
        var step = [20, 40, 60, 80, 100];
        var rate = [0.5, 0.4, 0.3, 0.2, 0.1];

        var scaleedValue = value;
        var valueStepIndex = step.length;

        while (valueStepIndex--) {
            if (value > step[valueStepIndex]) {
                scaleedValue = (value - step[valueStepIndex]) * rate[valueStepIndex];
                for (var i = valueStepIndex; i > 0; i--) {
                    scaleedValue += (step[i] - step[i - 1]) * rate[i - 1];
                }
                scaleedValue += step[0] * 1;
                break;
            }
        }
        return scaleedValue;
    }
    win.Swiper = Swiper;
}(window, document))