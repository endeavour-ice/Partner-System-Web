<template>
  <van-card v-for="team in props.teamList"
            :desc="team.description"
            :title="team.name"
            thumb="https://pic1.zhimg.com/80/v2-88c46f9f5b2aa6d6e04469fb989b7b54_720w.jpg"
  >
    <template #tags>
      <van-tag plain style="margin-right: 8px; margin-top: 8px;color: #42b983" type="danger">
        {{ teamStateEnum[team.status] }}
      </van-tag>
    </template>
    <template #bottom>
      <div>
        {{ '当前人数: ' + team.userVo.length }}
      </div>
      <div>
        {{ '过期时间: ' + team.expireTime }}
      </div>
    </template>
    <template #footer>
      <van-button plain size="mini" type="primary"  @click="addTeam(team.id,team.status)">加入队伍</van-button>
      <van-button size="mini" plain type="primary" @click="isShow(team.id,team.status)">查看详情</van-button>
    </template>

  </van-card>
  <van-action-sheet
      v-model:show="show"
      round
      position="bottom"
  >
    <van-divider>{{ '队伍最大人数: ' + max }}</van-divider>
    <van-divider>队员</van-divider>
    <user-card-list :userList="userListVo"/>
  </van-action-sheet>


  <van-popup v-model:show="addPasswordTeam" :style="{width: '100%'}">
    <van-form @submit="JoinTeam">
      <van-cell-group inset>
        <van-field
            v-model="teamPassword"
            name="password"
            label="队伍密码"
            placeholder="队伍密码"
            :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          加入队伍
        </van-button>
      </div>
    </van-form>
  </van-popup>

</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {teamStateEnum} from "../states/team";
import {onMounted, ref, watchEffect} from "vue";
import UserCardList from "./UserCardList.vue";
import myAxios from "../plugins/myAxios";
import {Dialog, Toast} from "vant";


const show = ref(false)
const addPasswordTeam = ref(false)
const max = ref(0)
const userListVo = ref([])
const teamID = ref("")
const teamStatus = ref(0);
const teamPassword = ref('');
interface TeamCardListType {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListType>(), {
  // @ts-ignore
  teamList: [] as TeamType[],
})

const JoinTeam =async () => {
  if (teamPassword.value === '' || !teamPassword.value || teamID.value==='') {
    return;
  }
  const res: any = await myAxios.post("/partner/team/join", {
    teamId: teamID.value,
    password: teamPassword.value,
  });
  if (res?.code == 200) {
    Toast.success("加入成功");
  } else {
    Toast.fail(res.description);
  }
  teamID.value = '';
  teamPassword.value = '';
}

/**
 * 加入队伍
 */
const addTeam = async (id: string, status: number) => {
  if (status === 2) {
    teamPassword.value = '';
    addPasswordTeam.value = true;
    teamID.value = id
  }else {
    const res: any = await myAxios.post("/partner/team/join", {
      teamId: id,
    });
    if (res?.code == 200) {
      Toast.success("加入成功");
    } else {
      Toast.fail(res.description);
    }
  }

}

const isShow = (id: string, status: number) => {

  teamStatus.value = status;
  show.value = true;
  for (let i = 0; i < props.teamList.length; i++) {
    const team = props.teamList[i];
    if (team.id == id) {

      userListVo.value = [];
      max.value = team.maxNum;
      // @ts-ignore
      userListVo.value = team.userVo
    }
  }
}
</script>

<style scoped>
.van-popup--center {
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate3d(-50%, -50%, 0);
}
</style>
