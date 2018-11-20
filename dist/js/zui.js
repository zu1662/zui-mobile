/*
 * @Author: huazite 
 * @Date: 2018-10-12 16:40:43 
 * @Last Modified by: huazite
 * @Last Modified time: 2018-10-26 11:42:41
 * @功能：zui简单模块通用js
 */
;(function (win, doc, undefined) {
    //导航栏返回按钮
    let zui_header_back = document.documentElement.querySelector(".zui-header-back");
    if(zui_header_back){
        zui_header_back.onclick=function(){
            history.back(-1);
        }
    }

    //




}(window, document))