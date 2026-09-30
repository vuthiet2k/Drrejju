<script>
import { useManageAppStore } from "../../../../store.js";
import Search from "@/base/components/search/Search.vue";
import notMatchSearch from "@/base/components/search/notMatchSearch.vue";
import { stringToSlug } from "@/helpers/utils/stringHandle.js";
import { getImagePath } from "@/helpers/utils/images.js";
import { SimpleBar } from "simplebar-vue3";
import { AllBadges } from "@/helpers/utils/badges.js";
import { uuidv4 } from "@/helpers/utils/uuid/uuid.js";

export default {
  props: {
    roles: {
      type: Object,
    },
    appId: {
      type: String,
    },
  },
  computed: {
    visualRoles() {
      return this.roles.map((role) => {
        role.labelId = uuidv4();
        return role;
      });
    },
  },
  data() {
    const store = useManageAppStore();
    const selectedRoles = [];
    const users = [];
    const usersVisualList = [];
    const listUserPerms = [];
    const searchText = "";
    return {
      AllBadges,
      store,
      selectedRoles,
      users,
      usersVisualList,
      listUserPerms,
      searchText,
      isGettingUser: false,
    };
  },
  components: {
    Search,
    notMatchSearch,
    SimpleBar,
  },
  mounted() {},
  methods: {
    onChangeSearchTextUser(searchText) {
      this.searchUserVisual(searchText);
      this.searchText = searchText;
    },
    searchUserVisual(searchText) {
      this.usersVisualList = this.users.filter((user) => {
        const username = stringToSlug(user.username.toLowerCase());
        const fullName = stringToSlug(
          `${user.first_name} ${user.last_name}`.toLocaleLowerCase()
        );
        searchText = stringToSlug(searchText);
        if (username.includes(searchText) || fullName.includes(searchText)) {
          return user;
        }
      });
    },
    getImagePath(imagePath) {
      return getImagePath(imagePath);
    },
    getUserPerms(selectedRoles) {
      const userToAdd = [];
      const rolesToUpdate = [];
      // Cái này để lấy về tổng số user
      for (const item of selectedRoles) {
        // eslint-disable-next-line
        const [_, userId] = item.split("_");
        const user = userToAdd.find((user) => userId == user);
        if (!user) {
          userToAdd.push(userId);
        }
      }
      //
      for (const item of selectedRoles) {
        const [roleId, userId] = item.split("_");
        let currentRole = rolesToUpdate.find((role) => role.roleId == roleId);
        if (currentRole) {
          currentRole.users.push(userId);
        } else {
          let currentRole = {
            roleId: roleId,
            users: [userId],
          };
          rolesToUpdate.push(currentRole);
        }
      }
      return { totalUser: userToAdd.length, roles: rolesToUpdate };
    },
    reloadList() {
      this.selectedRoles = [];
      this.isGettingUser = true;
      this.store.getUsersCanAddToApp(this.appId).then((data) => {
        this.isGettingUser = false;
        this.users = data["results"];
        this.usersVisualList = this.users;
      });
    },
  },
  watch: {
    appId() {
      if (!this.appId) return;
      if (this.appId == "all") return;
      try {
        this.isGettingUser = true;
        this.store.getUsersCanAddToApp(this.appId).then((data) => {
          this.isGettingUser = false;
          this.users = data["results"];
          this.usersVisualList = this.users;
        });
      } catch {
        // eslint-disable-next-line
      }
    },
    selectedRoles() {
      const results = this.getUserPerms(this.selectedRoles);
      this.$emit("change-user-app-role", results);
    },
  },
};
</script>

<template>
  <b-row class="mb-3">
    <b-col class="mt-3" lg="12">
      <Search @search-text="onChangeSearchTextUser"></Search>
    </b-col>
    <SimpleBar style="max-height: 60vh">
      <b-col class="mt-3" lg="12">
        <div class="accordion custom-accordionwithicon" id="accordionWithicon">
          <template v-if="usersVisualList?.length">
            <div
              class="accordion-item"
              v-for="(user, index) in usersVisualList"
              :key="user.id"
            >
              <h2
                class="accordion-header"
                :id="`accordionwithiconUser_${index}`"
              >
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#accor_iconExamplecollapseUser_${index}`"
                  aria-expanded="false"
                  :aria-controls="`accor_iconExamplecollapseUser_${index}`"
                >
                  <div class="avatar-md" style="width: 4.5rem; height: 0px">
                    <div class="avatar-title bg-white rounded-circle">
                      <img
                        :src="getImagePath(user.photo)"
                        alt=""
                        class="img-fluid rounded-circle"
                        style="width: 45%; height: auto"
                      />
                    </div>
                  </div>
                  {{ user.username }} ({{ user.first_name }}
                  {{ user.last_name }})
                </button>
              </h2>
              <div
                :id="`accor_iconExamplecollapseUser_${index}`"
                class="accordion-collapse collapse"
                :aria-labelledby="`accordionwithiconUser_${index}`"
                data-bs-parent="#accordionWithicon"
              >
                <div class="accordion-body">
                  <div
                    class="form-check mb-2"
                    v-for="role in visualRoles"
                    :key="role.id"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-if="role?.permissions?.length"
                      :id="`formCheckRole${role.labelId}_${user.username}`"
                      v-model="selectedRoles"
                      :value="`${role.id}_${user.id}`"
                    />
                    <label
                      class="form-check-label"
                      :for="`formCheckRole${role.labelId}_${user.username}`"
                    >
                      <div>
                        <h5>{{ role.name }}</h5>
                        <ul v-if="role?.permissions?.length">
                          <li
                            v-for="(per, roleIndex) in role.permissions"
                            :key="per.id"
                          >
                            <span :class="AllBadges[roleIndex]">
                              {{ per.name }}
                            </span>
                          </li>
                        </ul>
                        <ul v-else>
                          <li>
                            Ứng dụng không có vai trò nào, vui lòng tạo vai trò!
                          </li>
                        </ul>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="isGettingUser"> Đang tải người dùng! </template>
          <notMatchSearch v-else :searchText="searchText"></notMatchSearch>
        </div>
      </b-col>
    </SimpleBar>
  </b-row>
</template>

<style>
.bg-head-title {
  background-color: #dbe4ff;
}
</style>
