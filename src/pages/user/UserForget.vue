<template>
  <div class="title">
    <h1 class="one">
      修改密码
    </h1>
  </div>
  <div class="content">

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
            v-model="userAccount"
            name="userAccount"
            label="账户"
            placeholder="请输入要修改的账户"
            :class="{'apply-shake':userAccountClass}"
        />
        <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="密码"
            :class="{'apply-shake':passwordClass}"
        />
        <van-field
            v-model="checkPassword"
            type="password"
            name="checkPassword"
            label="确认密码"
            placeholder="确认密码"
            :class="{'apply-shake':checkPasswordClass}"
        />
        <van-field
            v-model="email"
            name="email"
            label="邮箱"
            placeholder="输入账户绑定的邮箱"
            :class="{'apply-shake':emailClass}"
        />
        <van-field
            v-model="code"
            center
            clearable
            label="邮箱验证码"
            placeholder="请输入邮箱验证码"
            :class="{'apply-shake':codeClass}"
        >
          <template #button>
            <van-button size="small"  v-if="isTime===false" @click="sendEmail" :loading="subValue"  loading-text="发送中..." type="primary">发送验证码</van-button>
            <van-count-down v-if="isTime===true" :time="time" format="ss" @finish="isTime = false"/>
          </template>
        </van-field>

      </van-cell-group>
      <div  class="submit">
        <van-button round :loading="buttonLoading" :disabled="buttonLoading"  loading-text="修改中..." block type="primary" native-type="submit">
          修改
        </van-button>
      </div>
      <div class="submit">
        <van-button plain round block type="primary" @click="toLogin">
          登录
        </van-button>
      </div>

    </van-form>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import MyAxios from "../../plugins/myAxios";


const userAccountClass = ref(false);
const passwordClass = ref(false);
const checkPasswordClass = ref(false);
const emailClass = ref(false);
const codeClass = ref(false);
const buttonLoading = ref(false);
const subValue = ref(false);
// 倒计时
const time = ref( 60 * 1000);
const isTime = ref( false);


const router = useRouter();
const userAccount = ref('');
const code = ref('');
const password = ref('');
const email = ref('');
const checkPassword = ref('');
const onSubmit =async () => {

  tx();
  if (!email.value || email.value === '') {
    emailClass.value = true;
    setTimeout(()=>{
      emailClass.value = false;
    },820)
  }
  if (!code.value || code.value === '') {
    codeClass.value = true;
    setTimeout(()=>{
      codeClass.value = false;
    },820)
  }
  if (!userAccount.value || userAccount.value === ''||!password.value || password.value === ''||!checkPassword.value
      || checkPassword.value === ''
      ||!email.value || email.value === ''|| !code.value || code.value === ''){
    return;
  }
  buttonLoading.value = true;
  const res = await myAxios.post('/api/user/forget',{
    userAccount: userAccount.value,
    password: password.value,
    checkPassword: checkPassword.value,
    email: email.value,
    code: code.value
  });
  if (res.code === 200) {
    buttonLoading.value = false;
    Toast.success("修改成功");
    await router.push({path: '/'})
  }else {
    buttonLoading.value = false;
    if (res.description) {
      Toast.fail(res.description)
    }
  }
}
const tx = () => {
  if (!userAccount.value || userAccount.value === '') {
    userAccountClass.value = true;
    setTimeout(()=>{
      userAccountClass.value = false;
    },820)
  }
  if (!password.value || password.value === '') {
    passwordClass.value = true;
    setTimeout(()=>{
      passwordClass.value = false;
    },820)
  }
  if (!checkPassword.value || checkPassword.value === '') {
    checkPasswordClass.value = true;
    setTimeout(()=>{
      checkPasswordClass.value = false;
    },820)
  }


}
const sendEmail =async () => {

  tx();
  if (!email.value || email.value === '') {
    emailClass.value = true;
    setTimeout(()=>{
      emailClass.value = false;
    },820)
  }else {
    const pattern = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/, str = email.value;
    if (!pattern.test(str)) {
      Toast.fail("邮箱格式错误");
      return;
    }
  }
  if (!userAccount.value || userAccount.value === ''||!password.value || password.value === ''||!checkPassword.value
      || checkPassword.value === ''
      ||!email.value || email.value === ''){
    return;
  }
  subValue.value = true;
  const response = await myAxios.post('/oss/sendForget', {
    email: email.value,
    userAccount: userAccount.value
  });
  if (response.code === 200) {
    subValue.value = false;
    isTime.value = true;
    Toast.success("发送成功，请注意查收");
  }
  subValue.value = false;
}
const toLogin = () => {
  router.push({path:'/'})
}
</script>

<style scoped>
.content{
  margin-top: 10%;
}
.submit{
  margin: 16px;
}
.title{
  margin-top: 40%;
}
.one{
  letter-spacing: 5px;
  color: #496e7f;
}
/* Standard syntax */
@keyframes shake {
  10%, 90% {
    transform: translate3d(-3px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(4px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-6px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(6px, 0, 0);
  }
}

.apply-shake {
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
