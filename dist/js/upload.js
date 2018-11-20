;(function (win, doc, undefined) {
    win.UploadImg = function(options){
        this.defaults = {
            /**
             * dom: 目标元素 {String}
             *      默认：必选项
             * maxNum:设置最大图片上传数 {Number}
             *        默认：1
             * area: 设置图片的宽高 {Arrary}
             *       默认：["80px","80px"]
             * 
             * fileSize：设置上传图片的最大值 单位K. {Number}
             *          默认：None
             * addImg: 添加图片标识图片 {String}。
             *          默认：必填项
             */
            maxNum:1,
            area:["80px","80px"],
            addImg:"",
            quality:1
            
        }
        this.init(options)
    }
    UploadImg.prototype = {
        //构造器指向构造函数,防止构造器指向Object的情况.
        constructor:UploadImg,
        init:function(options){
            let _self = this;
            //参数合并
            for (var name in options) {
                _self.defaults[name] = options[name];
            }
            if(!_self.defaults.addImg){
                alert("初始化添加图片，为必选项！")
                return false
            }

            let html_str = `
                <section class="up-file">
                    <img src="${_self.defaults.addImg}" class="add-img">
                    <input type="file" name="file" class="zui-file" value="" accept="image/jpg,image/jpeg,image/png,image/bmp" multiple="">
                </section>`
            if(!_self.defaults.dom){
                alert("请指定目标元素！")
                return false
            }
            _self.target = document.documentElement.querySelector(_self.defaults.dom);
            //初始化dom
            _self.target.innerHTML = html_str;
            _self.up_file = _self.target.querySelector(".up-file")
            _self.file = _self.target.querySelector(".zui-file")

            if(_self.defaults.area){
                //不为数组则返回
                if(typeof(_self.defaults.area) == 'object'){
                    _self.up_file.setAttribute('style', `width:${_self.defaults.area[0]};height:${_self.defaults.area[1]};`)
                }

            }

            //设置动作
            
            _self.file.onchange = function(){
                let files = this.files;
                if(files.length == 0){
                    return
                }
                let base64List = [];
                //先判断第一个文件大小是否符合
                if(_self.defaults.fileSize){
                    let file_size = files[0].size
                    if(Math.floor(file_size/1024) > _self.defaults.fileSize){
                        _self.sizeError(files[0].name, _self.defaults.fileSize)
                        alert(`您这个 [${files[0].name}] 文件大小超过 [${_self.defaults.fileSize}] K`)
                        return false
                    }
                }
                //获取section.up-preview
                _self.up_preview = _self.target.querySelector(".up-preview")
                //不存在则新建
                if(!_self.target.querySelector(".up-preview")){
                    let up_preview_dom = document.createElement("section")
                    up_preview_dom.setAttribute("class","up-preview")
                    _self.up_preview = up_preview_dom
                }
                
                //判断选定图片是否超出设定值
                let length = _self.up_preview.querySelectorAll('.preview-img-box').length
                if(length + files.length > _self.defaults.maxNum){
                    _self.maxNumError(_self.defaults.maxNum)
                    alert(`上传图片数目不可以超过 [${_self.defaults.maxNum}] 个，请重新选择`)
                    return false
                }
                //当添加图片数量 == 最大值，添加图片按钮隐藏
                if(length + files.length == _self.defaults.maxNum){
                    _self.up_file.setAttribute("style", 'display:none')
                }

                _self.target.insertBefore(_self.up_preview,  _self.up_file)

                

                //根据图片数量，添加显示
                for(let i =0;i<files.length;i++){
                    //判断文件大小是否符合
                    if(_self.defaults.fileSize){
                        let file_size = files[i].size
                        if(Math.floor(file_size/1024) > _self.defaults.fileSize){
                            _self.sizeError(files[i].name, _self.defaults.fileSize)
                            alert(`您这个 [${files[i].name}] 文件大小超过 [${_self.defaults.fileSize}] K`)
                            return false
                        }
                    }
                    
                    //图片地址
                    let img_url = window.URL.createObjectURL(files[i])
                    //创建包裹div dom
                    let preview_img_box = document.createElement("div")
                    preview_img_box.setAttribute("class","preview-img-box")
                    if(_self.defaults.area){
                        //不为数组则返回
                        if(typeof(_self.defaults.area) == 'object'){
                            preview_img_box.setAttribute('style', `width:${_self.defaults.area[0]};height:${_self.defaults.area[1]};`)
                        }
        
                    }
                    //创建图片dom
                    let img_prev = document.createElement("img")
                    img_prev.setAttribute('src',img_url)
                    //创建删除dom
                    let del_img = document.createElement('div')
                    del_img.setAttribute('class','del-img')
                    del_img.innerHTML = '×'
                    //添加到包裹div中
                    preview_img_box.appendChild(img_prev)
                    preview_img_box.appendChild(del_img)
                    //注册删除时间
                    del_img.onclick = function(e){
                        e.preventDefault()
                        e.stopPropagation()

                        _self.up_preview.removeChild(this.parentNode)
                        //当没有选取图片时，up_preview删除
                        let length = _self.up_preview.querySelectorAll('.preview-img-box').length
                        if(length == 0){
                            _self.up_preview.parentNode.removeChild(_self.up_preview)
                        }
                        //当数量小于最大值，添加图片显示
                        if(length < _self.defaults.maxNum){
                            _self.up_file.setAttribute("style", `display:block;width:${_self.defaults.area[0]};height:${_self.defaults.area[1]};`)
                        }
                        
                    }
                    _self.up_preview.appendChild(preview_img_box)
                    
                    //base64转化
                    let reader = new FileReader();
                    reader.readAsDataURL(files[i]);
                    reader.onload = function (e) { 
                       _self.toBase64(this.result, files[i].type)
                    }
                }

            }
        },
        toBase64:function(base64,type){

        },
        sizeError:function(name, size){

        },
        maxNumError:function(maxNum){

        }
    }
    
}(window, document))