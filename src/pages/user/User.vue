<template>
  <template v-if="user">
      <van-cell :title="userName.avatarUrl">
        <van-uploader :after-read="afterRead">
        <van-image
            round
            width="1.8rem"
            height="1.8rem"
            :src="avatar"
        />
        </van-uploader>
      </van-cell>

    <van-cell :title="userName.username" is-link :value="user?.username"
              @click="toEdit('username',userName.username,user?.username)"/>
    <van-cell :title="userName.userAccount" :value="user?.userAccount"/>
    <van-cell :title="userName.gender" is-link :value="user?.gender"
              @click="toEdit('gender',userName.gender,user?.gender)"/>
    <van-cell title="标签" @click="show = true">
      <template #right-icon>
            <van-tag plain  v-for="tag in user?.tags" type="primary"   size="large" >{{tag}}</van-tag>
      </template>
    </van-cell>
    <van-cell :title="userName.tel" is-link :value="user?.tel" @click="toEdit('tel',userName.tel,user?.tel)"/>
    <van-cell :title="userName.email" is-link :value="user?.email" @click="toEdit('email',userName.email,user?.email)"/>
    <van-cell :title="userName.description" is-link :value="user?.profile"
              @click="toEdit('profile',userName.description,user?.profile)"/>
    <van-cell :title="userName.planetCode" :value="user?.planetCode"/>
    <van-cell :title="userName.createTime" :value="user?.createTime"/>
    <van-button type="primary" round @click="edit" :loading="editState" loading-text="注销中..." size="large">退出登录</van-button>
  </template>
  <van-popup
      v-model:show="show"
      round
      position="bottom"
      :style="{ height: '60%' }"
  >
    <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">已选标签</van-divider>
    <van-row gutter="5" justify="center" v-if="tagList.length>0">
      <van-col span="6" v-for="tag in tagList">
        <van-tag plain :show="tagShow" closeable  type="primary"  @close="close(tag)"  size="medium" >{{tag}}</van-tag>
      </van-col>
    </van-row>
    <div v-if="tagList.length ===0 " style="color: #42b983; text-align: center">请选择标签</div>
    <van-divider :style="{ color: '#1989fa', borderColor: '#fa0723', padding: '0 16px' }">选择标签</van-divider>
    <van-row gutter="4" justify="center" v-if="SelectTagList.length>0">
      <van-col span="5" v-for="tag in SelectTagList">
        <van-tag plain    type="danger" @click="addTag(tag)"  size="medium" >{{tag}}</van-tag>
      </van-col>
    </van-row>
    <van-button round block type="primary" @click="toTag" native-type="submit" style="margin-top: 50px">提交</van-button>
  </van-popup>
<!--  <van-overlay :show="show" @click="show = false" >-->
<!--    <div class="wrapper">-->
<!--      <div class="block" >-->
<!--        -->
<!--      </div>-->
<!--    </div>-->
<!--  </van-overlay>-->

</template>

<script setup >

import {inject, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {getCurrentUser} from "../../services/users";
import myAxios from "../../plugins/myAxios";
import {removeChatUser} from "../../states/user";
import {Dialog, Toast} from "vant";
const reload = inject('reload')

const editState = ref(false);
const show = ref(false);
const tagShow = ref(true);
const tagList = ref([])
// '王者荣耀','吃鸡','火影','英雄联盟','大一','大二'
const SelectTagList = ref([])
const avatar = ref("");
const shows = ref(true);
const router = useRouter()
const userName = {
  username: '昵称',
  userAccount: '账号',
  avatarUrl: '头像',
  gender: '性别',
  tel: '电话号码',
  email: '邮箱',
  description: '描述',
  planetCode: '编号',
  createTime: '创建时间'
}

const user = ref()
onMounted(async () => {
  const response = await myAxios.get("/api/userLabel/getLabel");
  if (response.code === 200) {
    SelectTagList.value = response.data;
  }

  const res = await myAxios.get("/api/user/current");
  // @ts-ignore
  if (res.code === 200) {
    const users =res.data
    if (users.tags) {
      users.tags = JSON.parse(users.tags)
      tagList.value = users.tags
    }
    if (users.createTime) {
      users.createTime = users.createTime.split('T')[0]
    }
    user.value = users;
    avatar.value = user.value.avatarUrl

  }

})
// 注销
const edit = async () => {
  editState.value = true;
  const res = await myAxios.post("/api/user/Logout");
  // @ts-ignore
  if (res.code === 200) {
    editState.value = false;
    removeChatUser();
    await router.push({path: '/'})
  }
}
const toEdit = (editKey, editName, currentValue) => {
  router.push({
    path: '/user/edit',
    query: {
      editKey,
      currentValue,
      editName,
    }
  })
}
const toTag = () => {
  if (tagList.value.length > 0) {
    Dialog.confirm({
      title: '确认提交吗?',
      message:
          '每天只能提交五次',
    }).then(async () => {
      const tag =JSON.stringify(tagList.value)
      const user =await getCurrentUser();
      if (user == null) {
        Toast.fail("未登录");
        return;
      }
      const res = await myAxios.post("/api/user/update", {
        "id": user.id,
        "tags": tag,
      });
      if (res.code === 200) {
        await router.push({
          path: '/user'
        })
        Toast.success("修改成功");
        reload();
      }else {
        Toast.fail(res.description);
      }
    }).catch(() => {
          // on cancel
    });
  }
}
const close = (tag) => {
  if (tagList.value && tagList.value.length > 0) {
    tagList.value = tagList.value.filter(item=>{
      return tag !== item;
    })
  }

}
const addTag = (tag) => {
  for (let i = 0; i < tagList.value.length; i++) {
    if (tagList.value[i] === tag) {
      return;
    }
  }
  tagList.value.push(tag)
}
const afterRead = (file) => {
  Dialog.confirm({
    title: '每天只能修改一次',
    message: '是否上传?',
  }).then(async () => {
    const File = file.file
    let param =new FormData();
    param.append("file",File)
    const res = await myAxios.post("/oss/file/upload",param);
    if (res.code === 200) {
      avatar.value = res.data;
      reload()
      Toast.success('修改成功...');
    }else {
      Toast.fail(res.description);
    }
  }).catch(() => {

  });
}


</script>

<style>
#contents {
  text-align: left;
}

</style>
