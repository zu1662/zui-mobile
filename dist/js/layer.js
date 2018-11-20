/*
 * @Author: huazite 
 * @Date: 2018-10-26 14:23:14 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-11-13 14:09:27
 * @功能：弹出框功能
 */

;(function (win, doc, undefined) {
    "use strict";
    let index = 0;
    let ready = {
        timer:{},
        end:{},
        dom:{}
    }
    let Layer = function(options){
        this.defaults = {
            /**
             * type:设置弹窗的类型 {Number}
             *      默认：0 （0表示信息框，1表示页面层，2表示加载层）
             * 
             * offsetType: 设置侧滑导航展示位置。{Number}
             *      默认：0 （0代表left，1代表right）
             * 
             * 
             * skin：弹框样式。{String}
             *      由于存在一些按钮样式，特设置skin属性。
             *      默认：正常样式（按钮在内容下方，为按钮分布在两侧）
             *      "footer":底部对话框样式
             *      "topbtn":头部按钮样式，适用于picker选取时样式。
             *      "msg":设置提示消息样式
             *      "offset"：设置后，展示为侧滑导航样式，只有为此参数时，[anim]参数才可设置侧滑动画
             * 
             * content:设置弹窗的内容 {String}
             *         默认：必填项
             * 
             * title: 设置弹窗的标题 {String}
             *         默认：'标题'
             * 
             * time: 控制自动关闭弹窗的时间（单位ms）。{Number}
             *      默认：不开启自动关闭
             * 
             * className：设置此弹窗的class名称。 这样，就可以通过css控制弹窗样式。 {String}
             *            默认：'zui-layer'
             * 
             * btn:设置所需按钮 {String/Array} 
             *     不设置则不显示按钮。一个按钮btn:"按钮"。两个按钮btn:["按钮一","按钮二"]，其中第一个为取消，第二个为确认。
             *     默认：不设置。
             * 
             * anim：动画类型 {String/Boolean}
             *      可支持动画类型：scale-in（由小到大） scale-out（由大到小） up(从下向上弹出)。
             *      当skin为：offset时，可设置侧滑导航动画为：offset-slip（侧滑导航滑出） offset-link（侧滑导航跟主界面联动滑动）
             *      默认：scale-in
             * 
             * mask:遮罩层是否显示 {String/Boolean}
             *       默认：true。
             * 
             * maskCLose: 是否点击遮罩时关闭弹窗 {BooLean}
             *              默认：true
             * 
             * maskType:遮罩的类别 {Number}
             *          默认：0（0表示遮罩全覆盖，1表示遮罩除了头部导航以外内容，3表示遮罩除了头部导航、底部导航以外内容） 
             * 
             * area:设置内容的宽高  {Array}
             *      默认情况下是自动适应，可以通过area:["500px","300px"]设置固定宽高
             * 
             *          
             * success：弹窗成功弹出时回调 {Function}
             *          返回当前弹窗对象
             *           success:function(elem){
             *              console.log(elem);
             *           }
             * 
             * yes:点击确认按钮 {Function}
             *     返回当前层索引值
             *      yes:function(index){
             *         console.log(index);
             *      }
             * 
             * no:点击取消按钮 {Function}
             *     返回当前层索引值
             *      no:function(index){
             *         console.log(index);
             *      }
             * 
             * 
             * end:弹出层销毁时回调 {Function}
             *     返回当前层索引值
             *      end:function(index){
             *         console.log(index);
             *      }
             *
             * 
             * 
             */
            type:0, 
            anim:"scale-in",
            mask:true,
            maskClose:true,
            maskType:0,
        }
        this.setDom(options);
    }
    Layer.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor:Layer,
        //设置DOM结构函数
        setDom:function(options){
            let _self = this;
            // 参数合并        
            for (var name in options) {
                _self.defaults[name] = options[name];
            }
            //初始化layerDOM结构
            //设置content DOM结构
            let contentStr = "";
            let offsetClass = "";
            switch(_self.defaults.type){
                case 0:
                    contentStr = `<div class="layer-body-content">${_self.defaults.content}</div>`
                    break;
            }   
            
            //设置title DOM
            let titleStr = "";
            if(typeof(_self.defaults.title) == "string"){
                titleStr = `<div class="layer-title">${_self.defaults.title}</div>`
            }

            //设置botton DOM
            let btnStr = "";
            if(typeof(_self.defaults.btn) == "string"){//字符串，一个按钮
                btnStr = `<div class="layer-footer">
                            <div class="layer-btn-ok">${_self.defaults.btn}</div>
                        </div>`

            }else if(typeof(_self.defaults.btn) == "object"){//object：数组类型，两个按钮
                btnStr = `<div class="layer-footer">
                            <div class="layer-btn-no">${_self.defaults.btn[0]}</div>
                            <div class="layer-btn-ok">${_self.defaults.btn[1]}</div>
                        </div>`
            }
            //设置mask DOM
            let maskStr = ""
            
            if(_self.defaults.mask){
                switch(_self.defaults.maskType){
                    case 1://头部以外区域
                        maskStr = `<div class="layer-mask layer-mask-headout"></div>`
                        break;
                    case 2://头部、脚部意外区域
                        maskStr = `<div class="layer-mask layer-mask-main"></div>`
                        break;
                    default://全遮罩
                        maskStr = `<div class="layer-mask"></div>`
                }
               
            }

            //把生成的DOM添加到body内部
            let layerDOM = document.createElement("div");
            switch(_self.defaults.skin){
                case "msg":
                    layerDOM.setAttribute("class",`zui-layer zui-layer-msg ${_self.defaults.className && _self.defaults.className}`);
                    break;
                case "footer":
                    layerDOM.setAttribute("class",`zui-layer zui-layer-footer ${_self.defaults.className && _self.defaults.className}`);
                    break;
                case "topbtn":
                    layerDOM.setAttribute("class",`zui-layer zui-layer-topbtn ${_self.defaults.className && _self.defaults.className}`);
                    break;
                case "offset":
                    layerDOM.setAttribute("class",`zui-layer zui-layer-offset ${_self.defaults.className && _self.defaults.className}`);
                    //添加youce样式class
                    if(_self.defaults.offsetType == 1){
                        layerDOM.classList.add("layer-offset-right");
                    }
                    break;
                default:
                    layerDOM.setAttribute("class",`zui-layer ${_self.defaults.className && _self.defaults.className}`);
            }
            //设置动画效果,如果为侧滑导航，则使用侧滑样式
            let animClass = "";
            if(_self.defaults.anim){
                let mainDom = document.documentElement.querySelector(".zui-main");
                switch(_self.defaults.anim){
                    case "up":
                        animClass = "layer-anim-up";
                        break;
                    case "scale-in":
                        animClass = "layer-anim-scale-in";
                        break;
                    case "scale-out":
                        animClass = "layer-anim-scale-out";
                        break;
                    case "offset-slip":
                        if(_self.defaults.offsetType == 1){
                            animClass = "layer-offset-anim-right";
                        }else{
                            animClass = "layer-offset-anim-left";
                        }

                        break;
                    case "offset-link":
                        if(_self.defaults.offsetType == 1){
                            animClass = "layer-offset-anim-right";
                            mainDom.classList.add("zui-main-right-for-offset");
                        }else{
                            animClass = "layer-offset-anim-left";
                            mainDom.classList.add("zui-main-left-for-offset");
                        }
                        
                        break;
                }
            }
            //设置弹窗大小数据
            let areaArr = [],area;
            if(_self.defaults.area){
                area = _self.defaults.area;
                if(typeof(area) == "string"){
                    areaArr.push(area)
                }else if(typeof(area) == "object"){
                    for(let i = 0; i<area.length;i++){
                        areaArr.push(area[i]);
                    }
                }
            }else{
                areaArr = ["",""]
            }
            //如果skin为topbtn，则按钮在body上部
            if(_self.defaults.skin == "topbtn"){
                layerDOM.innerHTML = `
                        ${maskStr}
                        <div class="layer-main">
                            <div class="layer-real ${animClass}" style="width:${areaArr[0]}; height:${areaArr[1] && areaArr[1]}" >
                                ${btnStr}
                                ${titleStr}
                                <div class="layer-body">
                                    ${contentStr}
                                </div>
                                    
                            </div>
                        </div>`
            }else{
                layerDOM.innerHTML = `
                        ${maskStr}
                        <div class="layer-main">
                            <div class="layer-real ${animClass}" style="width:${areaArr[0]}; height:${areaArr[1] && areaArr[1]}" >
                                ${titleStr}
                                <div class="layer-body">
                                    ${contentStr}
                                </div>
                                ${btnStr}
                            </div>
                        </div>`
            }
            if(_self.defaults.type == 1){
                if(typeof(_self.defaults.content) == "object"){
                    _self.defaults.content.classList.add("active");
                    layerDOM.querySelector(".layer-body").appendChild(_self.defaults.content)
                }else{
                    layerDOM.querySelector(".layer-body").innerHTML = _self.defaults.content;
                }
            }
            //存在按钮，则把className添加到按钮类名中
            if(_self.defaults.className){
                let btnData = _self.defaults.btn;
                if(btnData){
                    if(typeof(btnData) == "string"){
                        layerDOM.querySelector(".layer-btn-no").classList.add(`${_self.defaults.className}-no`)
                    }else if(typeof(btnData) == "object"){
                        layerDOM.querySelector(".layer-btn-no").classList.add(`${_self.defaults.className}-no`)
                        layerDOM.querySelector(".layer-btn-ok").classList.add(`${_self.defaults.className}-ok`)
                    }
                }
            }
            //把此时弹窗index设置到属性和id内
            _self.index = index ++;
            layerDOM.setAttribute("id",`zui-layer${_self.index}`);
            layerDOM.setAttribute("index",`${_self.index}`);
            //添加DOM到body内
            let layerEle = document.body.appendChild(layerDOM);
            _self.defaults.success && (_self.defaults.success(layerDOM))
            //设置DOM结构成功后，设置内部动作函数
            if(typeof(layerEle) == "object"){
               _self.setAction(layerDOM);
            }
        },
        //DOM创建完成后，设置事件动作函数
        setAction:function(elem){
            let _self = this;
            //自动关闭
            if(_self.defaults.time){
                ready.timer[_self.index] = setTimeout(function(){
                    layer.close(_self.index)
                },_self.defaults.time)
            }

            //确认和取消
            if(_self.defaults.btn){
                let btnNo = elem.querySelector(".layer-btn-no");
                let btnOk = elem.querySelector(".layer-btn-ok");
                btnNo && btnNo.addEventListener("click",function(e){
                    _self.defaults.no && _self.defaults.no(_self.index)
                    layer.close(_self.index)
                })
                btnOk && btnOk.addEventListener("click",function(e){
                    _self.defaults.yes && _self.defaults.yes(_self.index)
                    layer.close(_self.index)
                })
            }

            //mask点击关闭
            if(_self.defaults.mask){
                let maskDom = elem.querySelector(".layer-mask");
                _self.defaults.maskClose && maskDom.addEventListener("click",function(e){
                                       
                    layer.close(_self.index)
                })
            }
            ready.dom[_self.index] = {offsetType : _self.defaults.offsetType,anim:_self.defaults.anim};
            _self.defaults.end && (ready.end[_self.index] = _self.defaults.end);
        }
    }
    win.layer = {
        //初始化带有[zui-layer]属性的元素，点击弹出弹窗
        init:function(){
            let triggerDoms = document.documentElement.querySelectorAll("[zui-layer]");
            for(let i = 0; i<triggerDoms.length;i++){
                let optionStr = triggerDoms[i].getAttribute("zui-layer").replace(/\'/g, '\"');
                let layerOptions = JSON.parse(optionStr);
                let targetDom = document.documentElement.querySelector(layerOptions.target);

                layerOptions.content = targetDom;
                layerOptions.type = 1;

                triggerDoms[i].addEventListener("click",function(e){
                    this.layerIndex = layer.open(layerOptions);
                })
            }
        },
        //开启新的弹窗
        open:function(options){
            let layerObj = new Layer(options);
            return layerObj.index;
        },
        //关闭弹窗
        close:function(index){
            let layDom = document.documentElement.querySelector(`#zui-layer${index}`);
            if(!layDom) return;
            //如果是侧滑弹窗的联动动画，则需要删除主内容上添加的class
            if(ready.dom[index].anim == "offset-link"){
                        
                let mainDom = document.documentElement.querySelector(".zui-main");
                let realDom = layDom.querySelector(".layer-real");

                if(ready.dom[index].offsetType == 1){
                    mainDom.classList.remove("zui-main-right-for-offset");
                    realDom.classList.add("layer-offset-remove-link-right");
                }else{
                    mainDom.classList.remove("zui-main-left-for-offset");
                    realDom.classList.add("layer-offset-remove-link");
                }
                setTimeout(function(){
                    layDom.innerHTML = "";
                    document.body.removeChild(layDom);
                    //清楚计时器
                    clearTimeout(ready.timer[index]);
                    delete ready.timer[index];
                    delete ready.dom[index];
                    //调用结束函数,并删除
                    typeof ready.end[index] === 'function' && ready.end[index]();
                    delete ready.end[index];
                },300)
                return;
            }

            layDom.innerHTML = "";
            document.body.removeChild(layDom);
            //清楚计时器
            clearTimeout(ready.timer[index]);
            delete ready.timer[index];
            delete ready.dom[index];
            //调用结束函数,并删除
            typeof ready.end[index] === 'function' && ready.end[index]();
            delete ready.end[index];
        },
        //关闭所有弹窗
        closeAll:function(){
            let layerList = document.documentElement.querySelectorAll(".zui-layer");
            for(let i = 0;i<layerList.length;i++){
                layer.close(layerList[i].getAttribute("index")||0);
                ready.timer = {};
                ready.end = {};
            }
        }
    }
    window.onload = function(){
                
        layer.init();
    }
}(window, document))
