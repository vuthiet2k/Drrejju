<template>
  <BTabs
    navClass="nav nav-pills animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
    contentClass="text-muted mt-3"
    pills
  >
    <!-- Tab Chuyên mục (giữ nguyên) -->
    <BTab class="nav-link fs-14" title="Chuyên mục" active>
      <TabPanel value="category">
        <div class="row g-3">
          <div class="col-xl-3 d-none d-xl-block">
            <AccordionInfor title="Tìm kiếm chuyên mục">
              <div class="mb-3">
                <b-form-input
                  v-model="serchCategory"
                  placeholder="Tìm kiếm chuyên mục"
                ></b-form-input>
              </div>
            </AccordionInfor>
          </div>
          <div class="col-xl-9">
            <AccordionInfor title="Danh sách chuyên mục đã theo dõi">
              <!-- Tab Chuyên mục -->
              <template #icon>
                <div
                  class="text-nowrap d-flex gap-2 align-items-center justify-content-start me-2"
                >
                  <button
                    v-if="!activeSelectCategory"
                    class="btn btn-sm d-flex align-items-center btn-outline-secondary"
                    @click.stop="activeSelectCategory = true"
                  >
                    <i class="ri-checkbox-multiple-line me-1"></i> Chọn
                  </button>
                  <button
                    v-else
                    class="btn btn-sm d-flex align-items-center btn-outline-danger"
                    @click.stop="
                      activeSelectCategory = false;
                      selectedCategory = [];
                    "
                  >
                    <i class="ri-close-line me-1"></i> Hủy
                  </button>
                </div>
              </template>
              <div class="" v-if="isLoading">
                <div class="d-flex justify-content-center">
                  <Searching></Searching>
                </div>
              </div>
              <!-- Tab Chuyên mục -->
              <template v-else-if="filteredCategoryList.length > 0">
                <div class="mb-3 d-flex">
                  <div class="ms-auto">
                    <Button
                      v-if="selectedCategory.length > 0 && activeSelectCategory"
                      icon="ri-delete-bin-2-line"
                      variant="text"
                      severity="secondary"
                      rounded
                      aria-label="Filter"
                      @click="
                        confirmUnfollow(
                          $event,
                          '',
                          '',
                          'category-selected',
                          'Xác nhận hủy theo dõi các chuyên mục đã chọn?'
                        )
                      "
                    />
                  </div>
                </div>
                <div class="card-body">
                  <div class="live-preview">
                    <div class="table-responsive">
                      <table
                        class="table table-striped table-nowrap align-middle mb-0"
                      >
                        <thead class="table-light">
                          <tr>
                            <th
                              v-if="activeSelectCategory"
                              class="text-center"
                              style="width: 50px"
                            >
                              <Checkbox
                                v-model="isSelectedAllCategory"
                                @change="toggleSelectAll('category')"
                                binary
                              />
                            </th>
                            <th v-if="false">Hình ảnh</th>
                            <th>Tên chuyên mục</th>
                            <th>Slug</th>
                            <th class="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="category in filteredCategoryList"
                            :key="category.id"
                          >
                            <td v-if="activeSelectCategory" class="text-center">
                              <Checkbox
                                v-model="selectedCategory"
                                :value="category.category.id"
                              />
                            </td>
                            <td v-if="false">
                              <img
                                :src="category?.category?.image || ImageDefault"
                                alt=""
                                class="rounded-circle"
                                width="50"
                                height="50"
                              />
                            </td>
                            <td>
                              <h6 class="mb-0">{{ category.category.name }}</h6>
                            </td>
                            <td>
                              <small class="text-muted">{{
                                category.category.slug
                              }}</small>
                            </td>
                            <td class="text-end">
                              <ConfirmPopup />
                              <Button
                                v-if="!activeSelectCategory"
                                icon="ri-delete-bin-2-line"
                                variant="text"
                                severity="secondary"
                                rounded
                                aria-label="Filter"
                                @click="
                                  confirmUnfollow(
                                    $event,
                                    category.category.id,
                                    category.category.name,
                                    'category'
                                  )
                                "
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </template>
              <div class="row" v-else-if="serchCategory">
                <notMatchSearch :search-text="serchCategory" />
              </div>
              <div class="row" v-else>
                Bạn đang chưa theo dõi chuyên mục nào!
              </div>
            </AccordionInfor>
          </div>
        </div>
      </TabPanel>
    </BTab>

    <!-- Tab Chủ đề -->
    <BTab title="Chủ đề">
      <TabPanel value="topic">
        <div class="row g-3">
          <div class="col-xl-3 d-none d-xl-block">
            <AccordionInfor title="Tìm kiếm chủ đề">
              <div class="mb-3">
                <b-form-input
                  v-model="serchTopic"
                  placeholder="Tìm kiếm chủ đề"
                ></b-form-input>
              </div>
            </AccordionInfor>
          </div>
          <div class="col-xl-9">
            <AccordionInfor title="Danh sách chủ đề đã theo dõi">
              <!-- Tab Chủ đề -->
              <template #icon>
                <div
                  class="text-nowrap d-flex gap-2 align-items-center justify-content-start me-2"
                >
                  <button
                    v-if="!activeSelectTopic"
                    class="btn btn-sm d-flex align-items-center btn-outline-secondary"
                    @click.stop="activeSelectTopic = true"
                  >
                    <i class="ri-checkbox-multiple-line me-1"></i> Chọn
                  </button>
                  <button
                    v-else
                    class="btn btn-sm d-flex align-items-center btn-outline-danger"
                    @click.stop="
                      activeSelectTopic = false;
                      selectedTopic = [];
                    "
                  >
                    <i class="ri-close-line me-1"></i> Hủy
                  </button>
                </div>
              </template>
              <div class="" v-if="isLoading">
                <div class="d-flex justify-content-center">
                  <Searching></Searching>
                </div>
              </div>
              <!-- Tab Chủ đề -->
              <template v-else-if="filteredTopicList.length > 0">
                <div class="mb-3 d-flex">
                  <div class="ms-auto">
                    <Button
                      v-if="selectedTopic.length > 0 && activeSelectTopic"
                      icon="ri-delete-bin-2-line"
                      variant="text"
                      severity="secondary"
                      rounded
                      aria-label="Filter"
                      @click="
                        confirmUnfollow(
                          $event,
                          '',
                          '',
                          'topic-selected',
                          'Xác nhận hủy theo dõi các chủ đề đã chọn?'
                        )
                      "
                    />
                  </div>
                </div>
                <div class="card-body">
                  <div class="live-preview">
                    <div class="table-responsive">
                      <table
                        class="table table-striped table-nowrap align-middle mb-0"
                      >
                        <thead class="table-light">
                          <tr>
                            <th
                              v-if="activeSelectTopic"
                              class="text-center"
                              style="width: 50px"
                            >
                              <Checkbox
                                v-model="isSelectedAllTopic"
                                @change="toggleSelectAll('topic')"
                                binary
                              />
                            </th>
                            <th v-if="false">Hình ảnh</th>
                            <th>Tên chủ đề</th>
                            <th>Slug</th>
                            <th class="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="topic in filteredTopicList"
                            :key="topic.id"
                          >
                            <td v-if="activeSelectTopic" class="text-center">
                              <Checkbox
                                v-model="selectedTopic"
                                :value="topic.topic.id"
                              />
                            </td>
                            <td v-if="false">
                              <Image
                                :src="topic?.topic?.image"
                                :fallback="ImageDefault"
                                alt=""
                                class="rounded-circle"
                                width="50"
                                height="50"
                              />
                            </td>
                            <td>
                              <h6 class="mb-0">{{ topic.topic.name }}</h6>
                            </td>
                            <td>
                              <small class="text-muted">{{
                                topic.topic.slug
                              }}</small>
                            </td>
                            <td class="text-end">
                              <ConfirmPopup />
                              <Button
                                v-if="!activeSelectTopic"
                                icon="ri-delete-bin-2-line"
                                variant="text"
                                severity="secondary"
                                rounded
                                aria-label="Filter"
                                @click="
                                  confirmUnfollow(
                                    $event,
                                    topic.topic.id,
                                    topic.topic.name,
                                    'topic'
                                  )
                                "
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </template>
              <div class="row" v-else-if="serchTopic">
                <notMatchSearch :search-text="serchTopic" />
              </div>
              <div class="px-1" v-else>Bạn đang chưa theo dõi chủ đề nào!</div>
            </AccordionInfor>
          </div>
        </div>
      </TabPanel>
    </BTab>

    <!-- Tab Bài viết -->
    <BTab title="Bài viết">
      <TabPanel value="post">
        <div class="row g-3">
          <div class="col-xl-3 d-none d-xl-block">
            <AccordionInfor title="Tìm kiếm bài viết">
              <div class="mb-3">
                <b-form-input
                  v-model="serchPost"
                  placeholder="Tìm kiếm bài viết"
                ></b-form-input>
              </div>
            </AccordionInfor>
          </div>
          <div class="col-xl-9">
            <AccordionInfor title="Danh sách bài viết đã theo dõi">
              <!-- Tab Bài viết -->
              <template #icon>
                <div
                  class="text-nowrap d-flex gap-2 align-items-center justify-content-start me-2"
                >
                  <button
                    v-if="!activeSelectPost"
                    class="btn btn-sm d-flex align-items-center btn-outline-secondary"
                    @click.stop="activeSelectPost = true"
                  >
                    <i class="ri-checkbox-multiple-line me-1"></i> Chọn
                  </button>
                  <button
                    v-else
                    class="btn btn-sm d-flex align-items-center btn-outline-danger"
                    @click.stop="
                      activeSelectPost = false;
                      selectedPost = [];
                    "
                  >
                    <i class="ri-close-line me-1"></i> Hủy
                  </button>
                </div>
              </template>
              <div class="" v-if="isLoading">
                <div class="d-flex justify-content-center">
                  <Searching></Searching>
                </div>
              </div>
              <!-- Tab Bài viết -->
              <template v-else-if="filteredPostList.length > 0">
                <div class="mb-3 d-flex">
                  <div class="ms-auto">
                    <Button
                      v-if="selectedPost.length > 0 && activeSelectPost"
                      icon="ri-delete-bin-2-line"
                      variant="text"
                      severity="secondary"
                      rounded
                      aria-label="Filter"
                      @click="
                        confirmUnfollow(
                          $event,
                          '',
                          '',
                          'post-selected',
                          'Xác nhận hủy theo dõi các bài viết đã chọn?'
                        )
                      "
                    />
                  </div>
                </div>
                <div class="card-body">
                  <div class="live-preview">
                    <div class="table-responsive">
                      <table
                        class="table table-striped table-nowrap align-middle mb-0"
                      >
                        <thead class="table-light">
                          <tr>
                            <th
                              v-if="activeSelectPost"
                              class="text-center"
                              style="width: 50px"
                            >
                              <Checkbox
                                v-model="isSelectedAllPost"
                                @change="toggleSelectAll('post')"
                                binary
                              />
                            </th>
                            <th>Hình ảnh</th>
                            <th>Tiêu đề bài viết</th>
                            <th>Slug</th>
                            <th class="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="post in filteredPostList" :key="post.id">
                            <td v-if="activeSelectPost" class="text-center">
                              <Checkbox
                                v-model="selectedPost"
                                :value="post.post.id"
                              />
                            </td>
                            <td>
                              <Image
                                :src="post?.post?.image"
                                fallback="logo"
                                alt=""
                                class="rounded-circle"
                                width="50"
                                height="50"
                              />
                            </td>
                            <td>
                              <h6 class="mb-0">
                                {{ truncateText(post.post.title, 60) }}
                              </h6>
                            </td>
                            <td>
                              <small class="text-muted">{{
                                post.post.slug
                              }}</small>
                            </td>
                            <td class="text-end">
                              <ConfirmPopup />
                              <Button
                                v-if="!activeSelectPost"
                                icon="ri-delete-bin-2-line"
                                variant="text"
                                severity="secondary"
                                rounded
                                aria-label="Filter"
                                @click="
                                  confirmUnfollow(
                                    $event,
                                    post.post.id,
                                    post.post.title,
                                    'post'
                                  )
                                "
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </template>
              <div class="row" v-else-if="serchPost">
                <notMatchSearch :search-text="serchPost" />
              </div>
              <div class="px-1" v-else>
                Bạn đang chưa theo dõi bài viết nào!
              </div>
            </AccordionInfor>
          </div>
        </div>
      </TabPanel>
    </BTab>
  </BTabs>
</template>

<script>
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import ConfirmPopup from "primevue/confirmpopup";
import { successToast, errorToast } from "@/helpers/api/toastStyle";
import { useFetch, usePost } from "@/helpers/api/api.js";
import { BASE_URL } from "@/helpers/api/axiosHttp";
import notMatchSearch from "@/base/components/search/notMatchSearch.vue";
import Searching from "@/base/components/search/searching.vue";
import ImageDefault from "@/assets/images/logo/img-default.jpg";
import Image from "@/base/components/image/Image.vue";
import AccordionInfor from "@/base/components/dtwinUI/AccordionInfor.vue";
const PROXY = BASE_URL + "/api";
export default {
  name: "FollowingTab",
  data() {
    return {
      activeTab: "category",
      categoryList: [],
      topicList: [],
      postList: [],
      serchCategory: "",
      serchTopic: "",
      serchPost: "",
      isLoading: false,
      ImageDefault,
      selectedTopic: [],
      selectedPost: [],
      selectedCategory: [],
      activeSelectPost: false,
      activeSelectTopic: false,
      activeSelectCategory: false,
      isSelectedAllCategory: false,
      isSelectedAllTopic: false,
      isSelectedAllPost: false,
    };
  },
  computed: {
    filteredCategoryList() {
      if (!this.serchCategory) return this.categoryList;
      return this.categoryList.filter((category) =>
        category.category.name
          .toLowerCase()
          .includes(this.serchCategory.toLowerCase())
      );
    },
    filteredTopicList() {
      if (!this.serchTopic) return this.topicList;
      return this.topicList.filter((topic) =>
        topic.topic.name.toLowerCase().includes(this.serchTopic.toLowerCase())
      );
    },
    filteredPostList() {
      if (!this.serchPost) return this.postList;
      return this.postList.filter((post) =>
        post.post.title.toLowerCase().includes(this.serchPost.toLowerCase())
      );
    },
  },
  components: {
    Button,
    ConfirmPopup,
    notMatchSearch,
    Searching,
    Checkbox,
    Image,
    AccordionInfor,
  },
  mounted() {
    this.getFollowingData();
  },
  methods: {
    async getFollowingData() {
      this.isLoading = true;
      await this.getCategoryList();
      await this.getTopicList();
      await this.getPostList();
      this.isLoading = false;
    },
    async getCategoryList() {
      const response = await useFetch(`${PROXY}/categories/category/followed`);
      this.categoryList = response;
    },
    async getTopicList() {
      const response = await useFetch(`${PROXY}/categories/topic/followed`);
      this.topicList = response;
    },
    async getPostList() {
      const response = await useFetch(`${PROXY}/posts/followed`);
      this.postList = response;
    },
    async unfollowCategory(categoryId) {
      const response = await usePost(
        `/categories/category/${categoryId}/unfollow`
      );
      if (response.ok) {
        this.categoryList = this.categoryList.filter(
          (category) => category.id !== categoryId
        );
        const index = this.categoryList.findIndex(
          (category) => category.id === categoryId
        );
        this.categoryList.splice(index, 1);
        successToast("Hủy theo dõi chuyên mục thành công");
      } else {
        errorToast("Hủy theo dõi chuyên mục thất bại");
      }
    },
    truncateText(text, length) {
      return text.length > length ? text.slice(0, length) + "..." : text;
    },
    async unfollowTopic(topicId) {
      const response = await usePost(`/categories/topic/${topicId}/unfollow`);
      if (response.ok) {
        const index = this.topicList.findIndex((topic) => topic.id === topicId);
        this.topicList.splice(index, 1);
        successToast("Hủy theo dõi chủ đề thành công");
      } else {
        errorToast("Hủy theo dõi chủ đề thất bại");
      }
    },
    async unfollowPost(postId) {
      const response = await usePost(`/posts/${postId}/unfollow`);
      if (response.ok) {
        const index = this.postList.findIndex((post) => post.id === postId);
        this.postList.splice(index, 1);
        successToast("Hủy theo dõi bài viết thành công");
      } else {
        errorToast("Hủy theo dõi bài viết thất bại");
      }
    },
    confirmUnfollow(event, objId, objName, type, message) {
      objName = objName.length > 20 ? objName.slice(0, 20) + "..." : objName;
      this.$confirm.require({
        target: event.currentTarget,
        message: message || `Xác nhận hủy theo dõi ${objName}?`,
        icon: " ri-alert-line",
        rejectProps: {
          label: "Hủy",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Xác nhận",
          severity: "danger",
        },
        accept: async () => {
          if (type === "category") {
            this.unfollowCategory(objId);
          } else if (type === "topic") {
            this.unfollowTopic(objId);
          } else if (type === "post") {
            this.unfollowPost(objId);
          }
          if (type === "topic-selected") {
            this.selectedTopic.forEach(async (id) => {
              await this.unfollowTopic(id);
              this.topicList = this.topicList.filter(
                (topic) => topic.id !== id
              );
            });
            this.selectedTopic = [];
            this.activeSelectTopic = false;
          }
          if (type === "post-selected") {
            this.selectedPost.forEach(async (id) => {
              await this.unfollowPost(id);
              this.postList = this.postList.filter((post) => post.id !== id);
            });
            this.selectedPost = [];
            this.activeSelectPost = false;
          }
          if (type === "category-selected") {
            this.selectedCategory.forEach(async (id) => {
              await this.unfollowCategory(id);
            });
            this.selectedCategory = [];
            this.activeSelectCategory = false;
          }
        },
        reject: () => false,
      });
    },
    toggleSelectAll(type) {
      console.log(type)
      if (type === "category") {
        if (!this.isSelectedAllCategory) {
          // Chưa chọn hết → chọn tất cả
          this.selectedCategory = this.filteredCategoryList.map(
            (obj) => obj.category.id
          );
          this.isSelectedAllCategory = true;
        } else {
          // Đã chọn hết → gỡ hết
          this.selectedCategory = [];
          this.isSelectedAllCategory = false;
        }
      } else if (type === "topic") {
        if (!this.isSelectedAllTopic) {
          this.selectedTopic = this.filteredTopicList.map(
            (obj) => obj.topic.id
          );
          this.isSelectedAllTopic = true;
        } else {
          this.selectedTopic = [];
          this.isSelectedAllTopic = false;
        }
      } else if (type === "post") {
        if (!this.isSelectedAllPost) {
          this.selectedPost = this.filteredPostList.map((obj) => obj.post.id);
          this.isSelectedAllPost = true;
        } else {
          this.selectedPost = [];
          this.isSelectedAllPost = false;
        }
      }
    },
  },
};
</script>
