class Problem {
    //实例化类自动调用
    constructor() {
        //获取保存按钮节点，绑定点击事件
        this.$(".save-data").addEventListener("click", this.saveData)
        //给tbody绑定点击事件，利用事件委托，将所有的子元素点击事件，都委托给它
        //节点事件的回调方法的this指向 当前节点对象
        //bind() 返回一个新的函数引用，改变其内部this指向
        this.$(".table tbody").addEventListener("click", this.distribute.bind(this))
        this.$()
        this.getData();
        //给删除模态框中的删除按钮绑定点击事件
        this.$(".confirm-del").addEventListener("click", this.confirmDel.bind(this))
        //给修改模态框中的保存按钮绑定点击事件
        this.$(".modify-data").addEventListener("click",this.saveModify.bind(this))
    }
    /*****tbody点击的回调函数*****/
    distribute(eve) {
        //获取事件源
        let tar = eve.target;
        //判断按钮上是否有指定的类，确定当前点击的是什么按钮
        //删除的button上 绑定的 btn-del
        //修改的button上 绑定的 btn-modify

        //判断点击的是否为删除按钮，是则调用删除的方法
        if (tar.classList.contains("btn-del")) {
            this.delData(tar);
        }
        //判断点击的是否为修改按钮,是则调用修改的方法
        if (tar.classList.contains("btn-modify")) {
            this.modifyData(tar);
        }
    }
    /*
    修改的方法
      1：弹出修改模态框
      2：将原有的数据，展现模态框中
      3：将修改数据的id，隐藏到修改模态框中
      4：获取表单中的数据，不为空则发送给后台
      5：刷新页面
    */
    modifyData(target) {
        $('#modifyModal').modal('show')
        //判断点击的是span还是button按钮
        let trobj="";
        if (target.nodeName == "SPAN") {
            trobj =target.parentNode.parentNode.parentNode;
        }
        if (target.nodeName == "BUTTON") {
            trobj =target.parentNode.parentNode;
        }
        //获取所有的子节点，分别取出id idea title pos
        let chil=trobj.children;
        let id=chil[0].innerHTML;
        let title=chil[1].innerHTML;
        let pos=chil[2].innerHTML;
        let idea=chil[3].innerHTML;
        //将获取到的内容放到修改表单中
        let form=this.$("#modifyModal form").elements;
        form.title.value=title;
        form.pos.value=pos;
        form.idea.value=idea;
        //将id设置为属性
        this.modifyId=id;
    }
    saveModify(){
        //收集表单中的数据
        // let form=this.$("#modifyModal form").elements;
        // let title=form.title.value.trim();
        // let idea=form.idea.value.trim();
        // let pos=form.pos.value.trim();

        //解构赋值
        let {title,pos,idea}=this.$("#modifyModal form").elements;
        let titleVal=title.value.trim();
        let ideaVal=idea.value.trim();
        let posVal=pos.value.trim();
        //进行非空验证
        // if(!titleVal||!ideaVal||!posVal){
        //     throw new Error("字段不能为空")
        // }
        //结束代码运行
        if(!titleVal||!ideaVal||!posVal) return;
        //给后台发送数据，进行修改
        axios.put("http://localhost:3000/problem/"+this.modifyId,{
            title:titleVal,
            pos:posVal,
            idea:ideaVal
        }).then(res=>{
            //请求成功则刷新页面
            if(res.status==200){
                location.reload();
            }
        })
    }
    /****删除的方法****/
    delData(target) {
        //弹出确认删除的模态框，通过js控制
        //$()是jquery的方法，不是我们封装的获取节点的方法
        $('#delModal').modal('show')
        //将当前准备删除的节点保存到属性上
        this.target = target;
    }
    /*****确认删除的方法*******/
    confirmDel() {
        let id = 0;
        //确定点击的是span还是button
        if (this.target.nodeName == "SPAN") {
            let trobj = this.target.parentNode.parentNode.parentNode;
            id = trobj.firstElementChild.innerHTML;
        }
        if (this.target.nodeName == "BUTTON") {
            let trobj = this.target.parentNode.parentNode;
            id = trobj.firstElementChild.innerHTML;
        }
        //将id发送给json-sever服务器，删除对应的数据，刷新页面
        axios.delete("http://localhost:3000/problem/" + id).then(res => {
            if (res.status == 200) {
                location.reload();
            }
        })
    }
    /*****保存数据的方法******/
    saveData() {
        //获取表单中的内容
        let form = document.forms[0].elements;
        let title = form.title.value.trim();
        let pos = form.pos.value.trim();
        let idea = form.idea.value.trim();
        //判断表单中每一项是否有值，如果为空，则提示
        if (!title || !pos || !idea) {
            throw new Error("表单不能为空");
        }
        //把表单中获取的数据添加给后台服务器
        axios.post('http://localhost:3000/problem', {
            title,
            pos,
            idea
        }).then(res => {
            if (res.status == 201) {
                location.reload();
            }
        })
    }
    /****获取数据的方法****/
    getData() {
        //发送ajax请求。获取数据
        axios.get("http://localhost:3000/problem").then(res => {
            //将获取到的数据解构赋值
            let { data, status } = res;
            //当状态为200时，表示请求成功
            if (status == 200) {
                //将获取到的数据追加到页面中
                let html = "";
                data.forEach(ele => {
                    html += `<tr>
                    <th>${ele.id}</th>
                    <td>${ele.title}</td>
                    <td>${ele.pos}</td>
                    <td>${ele.idea}</td>
                    <td><button type="button" class="btn btn-danger btn-xs btn-del">
                    <span class="glyphicon glyphicon-trash btn-del" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="btn btn-warning btn-xs btn-modify">
                    <span class="glyphicon glyphicon-refresh btn-modify" aria-hidden="true"></span>
                    </button>
                    </td>
                  </tr>`
                });
                this.$(".table tbody").innerHTML = html;
            }
        })

    }

    /****获取节点的方法*****/
    $(ele) {
        let res = document.querySelectorAll(ele);
        //判断当前页面只有一个符合条件的，就返回单个节点对象，否则返回节点集合
        return res.length == 1 ? res[0] : res;
    }
}
new Problem;