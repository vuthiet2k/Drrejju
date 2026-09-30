<script>
import {topBarNotification} from "@/app_portal/helpers/data/@data.js";
import simplebar from 'simplebar-vue';
import {onMounted, ref} from "vue";

export default {
  name: "Notification",
  components: {
    simplebar
  },
  computed: {
    isSmallScreen() {
      return window.screen.width < 600;
    }
  },
  setup() {
    const listNotis = ref([]);
    const notisDetail = ref({});
    const modalDetailNotis = ref(false);
    const modalListNotis = ref(false);
    const handleChangeNotisList = (ind) => {
      if (ind !== 0 && ind !== 1) {
        listNotis.value = topBarNotification;
        return;
      }
      listNotis.value = [];
      topBarNotification.forEach(item => {
        if (item.type === ind) listNotis.value.push(item);
      });
    }
    const handleGetDetail = (id) => {
      topBarNotification.forEach(item => {
        if (item.id === id) notisDetail.value = item;
      });
      modalDetailNotis.value = !modalDetailNotis.value;
    }
    const handleShowAllNotis = () => {
      handleChangeNotisList(2);
      modalListNotis.value = !modalListNotis.value;
    }
    onMounted(() => {
      handleChangeNotisList(2);
    })
    return {
      listNotis,
      modalDetailNotis,
      modalListNotis,
      notisDetail,
      handleChangeNotisList,
      handleGetDetail,
      handleShowAllNotis,
    }
  }
}
</script>

<style>
.fs-9 {
  font-size: 9px !important;
}

#notificationItemsTab > .nav-item > .nav-link {
  color: white;
}

#notificationItemsTab > .nav-item > .nav-link.active {
  color: #405189;
}

.avatar-xs > .avatar-title {
  width: 2rem;
  height: 2rem;
}
</style>
<template>
  <div class="dropdown topbar-head-dropdown header-item p-1">
    <button type="button" class="btn btn-icon btn-topbar btn-ghost-info rounded-circle"
            id="page-header-notifications-dropdown" data-bs-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
      <i class="bx bx-bell fs-20"></i>
      <span class="position-absolute topbar-badge fs-9 translate-middle badge rounded-pill bg-danger">3</span>
    </button>
    <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0" :class="{'dropdown__notis--small' : isSmallScreen}"
         aria-labelledby="page-header-notifications-dropdown">
      <div class="dropdown-head bg-primary bg-pattern rounded-top">
        <div class="p-3">
          <h6 class="m-0 fs-16 fw-semibold text-white">
            Thông báo
          </h6>
        </div>
        <div class="px-2 pt-2">
          <ul class="nav nav-tabs dropdown-tabs nav-tabs-custom" data-dropdown-tabs="true"
              id="notificationItemsTab" role="tablist">
            <li class="nav-item">
              <b-link class="nav-link active" data-bs-toggle="tab" href="#noti-tab" role="tab" aria-selected="false"
                      @click.capture.stop="handleChangeNotisList(2)">
                Tất cả
              </b-link>
            </li>
            <li class="nav-item">
              <b-link class="nav-link" data-bs-toggle="tab" href="#noti-tab" role="tab" aria-selected="true"
                      @click.capture.stop="handleChangeNotisList(1)">
                Hệ thống
              </b-link>
            </li>
            <li class="nav-item">
              <b-link class="nav-link" data-bs-toggle="tab" href="#noti-tab" role="tab" aria-selected="false"
                      @click.capture.stop="handleChangeNotisList(0)">
                Người dùng
              </b-link>
            </li>
          </ul>
        </div>
      </div>

      <div class="tab-content" id="notificationItemsTabContent">
        <div class="tab-pane fade py-2 ps-2 show active" id="noti-tab" role="tabpanel">
          <div v-if="listNotis.length">
            <simplebar :style="!isSmallScreen ? {'max-height': '300px'} : {'max-height': '200px'}"
                       class="pe-2">
              <div class="list-group list-group-flush">
                <div class="list-group-item list-group-item-action cursor-pointer" v-for="item in listNotis"
                     :key="item.id" @click="handleGetDetail(item.id)">
                  <div class="d-flex mb-2 justify-content-between">
                    <div class="d-flex">
                      <div class="avatar-xs me-3" v-if="item.type === 0">
                          <span class="avatar-title bg-soft-info text-info rounded-circle fs-16">
                            <i class="ri-user-line"></i></span>
                      </div>
                      <div class="avatar-xs me-3" v-else>
                          <span class="avatar-title bg-soft-danger text-danger rounded-circle fs-16">
                            <i class="bx bx-badge-check"></i></span>
                      </div>
                      <div>
                        <h6 class="list-title mb-1" :class="{'fw-semibold': !item.is_read}">
                          {{ item.title }}</h6>
                        <small class="list-text text-muted mb-0" :class="{'fw-semibold text-dark': !item.is_read}">
                          {{ item.content.slice(0, 85) }}
                          {{ item.content.length > 85 ? '...' : '' }}</small>
                      </div>
                    </div>
                    <i v-if="!item.is_read" class="mdi mdi-checkbox-blank-circle fs-10 text-danger"></i>
                  </div>
                </div>
              </div>
            </simplebar>
            <div class="my-3 w-100 text-center">
              <b-link class="link-success text-decoration-underline" @click="handleShowAllNotis">
                Xem tất cả thông báo <i class="ri-arrow-right-line align-middle"></i>
              </b-link>
            </div>
          </div>
          <div v-else>
            <div class="w-25 w-sm-50 pt-3 mx-auto">
              <img src="@/app_portal/assets/images/bell.svg" class="img-fluid" alt="user-pic"/>
            </div>
            <div class="text-center pb-5 mt-2">
              <h6 class="fs-18 fw-semibold lh-base">
                Chưa có thông báo
              </h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <b-modal v-model="modalDetailNotis" hide-footer body-class="p-0" header-class="p-3" modal-class="zoomIn"
           class="v-modal-custom" content-class="overflow-hidden" centered title="Thông tin thông báo">
    <div class="modal-body">
      <div class="mb-3">
        <label for="basiInput" class="form-label">Tiêu đề</label>
        <input type="text" class="form-control bg-light" id="basiInput" name="title" readonly
               v-model="notisDetail.title">
      </div>
      <div class="mb-3">
        <label for="exampleFormControlTextarea5" class="form-label">Nội dung</label>
        <textarea class="form-control bg-light" name="content" id="exampleFormControlTextarea5" rows="7" readonly
                  v-model="notisDetail.content"></textarea>
      </div>
    </div>
  </b-modal>
  <b-modal v-model="modalListNotis" hide-footer body-class="p-0" header-class="p-3" modal-class="zoomIn" size="lg"
           class="v-modal-custom" content-class="overflow-hidden" centered title="Dánh sách thông báo">
    <div class="modal-body">
      <div class="row g-4">
        <div class="col-sm-auto"></div>
        <div class="col-sm-4"></div>
        <div class="col-sm">
          <div class="d-flex justify-content-end">
            <div class="search-box">
              <input type="text" class="form-control" placeholder="Tìm kiếm...">
              <i class="ri-search-line search-icon"></i></div>
          </div>
        </div>
      </div>
      <simplebar style="height: 375px" class="mt-3">
        <div class="table-responsive h-100">
          <table class="table align-middle table-striped table-bordered table-hover">
            <thead class="table-light text-dark text-center text-uppercase">
            <tr>
              <th width="35%">Tiêu đề</th>
              <th>Nội dung</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in listNotis" :key="index" @click="getDetail(item.id)" class="cursor-pointer">
              <td>{{ item.title }}</td>
              <td>{{ item.content }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </simplebar>
    </div>
  </b-modal>
</template>