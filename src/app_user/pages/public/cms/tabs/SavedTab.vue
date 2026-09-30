<template>
  <BTab title="Đánh dấu">
    <TabPanel value="saved">
      <div class="row g-3">
        <!-- Sidebar Search -->
        <div class="col-xl-3 d-none d-xl-block">
          <AccordionInfor title="Tìm kiếm đánh dấu">
            <div class="mb-3">
              <b-form-input
                v-model="searchValue"
                placeholder="Nhập tên bài viết hoặc thư mục"
              ></b-form-input>
            </div>
          </AccordionInfor>
        </div>

        <!-- Main Content -->
        <div class="col-xl-9">
          <AccordionInfor title="Danh sách đánh dấu">
            <template #icon>
              <!-- Navigation và Action Buttons -->
              <div class="mb-0" @click.stop>
                <div class="d-flex gap-3 align-items-center">
                  <ButtonIcon
                    v-if="selectedCollectionId"
                    type="secondary text-nowrap"
                    @click="handleSelectCollection('back')"
                    classIcon="ri-arrow-left-s-line"
                    name="Trở lại"
                  >
                  </ButtonIcon>
                  <div
                    class="ms-auto"
                    v-if="
                      !isLimitedCollection(filteredCollections) &&
                      filteredCollections?.id != 'DEFAULT'
                    "
                  >
                    <ButtonIcon
                      type="primary"
                      @click="showAddCollectionModal = true"
                      classIcon="ri-add-line"
                      name="Thêm"
                    >
                    </ButtonIcon>
                  </div>
                </div>
              </div>
            </template>

            <!-- Hiển thị dạng bảng -->
            <div
              v-if="
                filteredCollections?.children?.length > 0 ||
                filteredCollections?.posts?.length > 0
              "
            >
              <div class="card-body">
                <div class="live-preview">
                  <div class="table-responsive">
                    <table
                      class="table table-striped table-nowrap align-middle mb-0"
                    >
                      <thead class="table-light">
                        <tr>
                          <th
                            v-if="activeSelectSaved"
                            class="text-center"
                            style="width: 50px"
                          >
                            <Checkbox
                              v-model="selectAllSaved"
                              @change="toggleSelectAll('saved')"
                              binary
                            />
                          </th>
                          <th>Loại</th>
                          <th>Tên</th>
                          <th>Thông tin</th>
                          <th class="text-end">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Hiển thị thư mục -->
                        <tr
                          v-for="collection in filteredCollections?.children"
                          :key="collection.id"
                        >
                          <td v-if="activeSelectSaved" class="text-center">
                            <Checkbox
                              v-model="selectedSaved"
                              :value="`collection_${collection.id}`"
                            />
                          </td>
                          <td>
                            <i class="ri-folder-5-fill text-warning fs-5"></i>
                          </td>
                          <td>
                            <div
                              class="cursor-pointer"
                              @click="handleSelectCollection(collection.id)"
                            >
                              <span
                                v-if="!isOnEdit(collection.id)"
                                class="fw-semibold"
                              >
                                {{ collection.name }}
                              </span>
                              <input
                                v-else
                                type="text"
                                class="form-control form-control-sm"
                                v-model="collection.name"
                                @keyup.enter="
                                  handleEditCollection(
                                    collection.id,
                                    collection.name
                                  )
                                "
                                @blur="
                                  handleEditCollection(
                                    collection.id,
                                    collection.name
                                  )
                                "
                              />
                            </div>
                          </td>
                          <td>
                            <small class="text-muted">Thư mục</small>
                          </td>
                          <td class="text-end">
                            <div class="btn-group">
                              <button
                                v-if="
                                  !activeSelectSaved &&
                                  collection?.id != 'DEFAULT'
                                "
                                class="btn btn-sm btn-light"
                                @click="
                                  togglePopover(
                                    $event,
                                    collection.id,
                                    'collection'
                                  )
                                "
                              >
                                <i class="ri-more-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>

                        <!-- Hiển thị bài viết -->
                        <tr
                          v-for="post in filteredCollections?.posts"
                          :key="post.id"
                        >
                          <td v-if="activeSelectSaved" class="text-center">
                            <Checkbox
                              v-model="selectedSaved"
                              :value="`post_${post.id}`"
                            />
                          </td>
                          <td>
                            <i class="ri-file-text-line text-primary fs-5"></i>
                          </td>
                          <td>
                            <router-link
                              :to="{
                                name: 'HomePortalTinaDetail',
                                params: { slug: post?.slug },
                              }"
                              class="text-decoration-none"
                            >
                              <div class="d-none">
                                <Image
                                  :src="post?.thumbnail"
                                  class="rounded"
                                  width="70"
                                  height="70"
                                />
                              </div>
                              <div class="">
                                <span> {{ truncateText(post.title, 35) }}</span>
                              </div>
                            </router-link>
                          </td>
                          <td>
                            <small class="text-muted">Bài viết</small>
                          </td>
                          <td class="text-end">
                            <div class="btn-group">
                              <button
                                v-if="!activeSelectSaved"
                                class="btn btn-sm btn-light"
                                @click="togglePopover($event, post.id, 'post')"
                              >
                                <i class="ri-more-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-4">
              <i class="ri-inbox-line fs-1 text-muted"></i>
              <p class="text-muted mt-2">Không có bài viết hoặc thư mục nào!</p>
            </div>
          </AccordionInfor>
        </div>
      </div>

      <Popover ref="op">
        <div class="d-flex flex-column gap-2">
          <button
            type="button"
            class="list-group-item list-group-item-action mb-2 text-primary"
            aria-current="true"
            v-if="selectedItem.type == 'collection'"
            @click="popoverEditItem"
          >
            <i class="ri-edit-2-line align-middle me-2"></i>Đổi tên
          </button>
          <button
            type="button"
            class="list-group-item list-group-item-action text-danger"
            @click="confirmDelete($event)"
          >
            <i class="ri-delete-bin-5-line align-middle me-2"></i>Xóa
          </button>
        </div>
      </Popover>
      <ConfirmPopup />
    </TabPanel>
  </BTab>

  <!-- Modal và Popover (giữ nguyên) -->
  <Modal
    id="modal-add-collection"
    title="Thêm thư mục"
    v-model="showAddCollectionModal"
    size="md"
    hideFooter
  >
    <div class="mb-3">
      <label class="form-label">Đường dẫn</label>
      <input
        type="text"
        class="form-control"
        placeholder="Nhập đường dẫn"
        :value="getPath(form.path)"
        disabled
      />
    </div>
    <div class="mb-3">
      <label class="form-label">Tên thư mục</label>
      <input
        type="text"
        class="form-control"
        placeholder="Nhập tên thư mục"
        v-model="form.name"
      />
    </div>
    <div class="mb-3 d-flex justify-content-end gap-2">
      <button class="btn btn-secondary" @click="showAddCollectionModal = false">
        Đóng
      </button>
      <button class="btn btn-primary" @click="handleAddCollection">Thêm</button>
    </div>
  </Modal>
</template>

<script>
import { useFetch } from "@/helpers/api/api.js";
import { usePost } from "@/helpers/api/api.js";
import { usePatch } from "@/helpers/api/api.js";
import { useDelete } from "@/helpers/api/api.js";
import ConfirmPopup from "primevue/confirmpopup";
import { BASE_URL } from "@/helpers/api/axiosHttp.js";
import ButtonIcon from "@/base/components/baseUI/ButtonIcon.vue";
import Image from "@/base/components/image/Image.vue";
import { errorToast } from "@/helpers/api/toastStyle";
import Modal from "@/base/components/dtwinUI/Modal.vue";
import Popover from "primevue/popover";
import { cloneDeep } from "lodash";
import { removeVietnamese } from "@/helpers/utils/stringHandle.js";
import AccordionInfor from "@/base/components/dtwinUI/AccordionInfor.vue";

const PROXY = BASE_URL.endsWith("/")
  ? BASE_URL + "api"
  : BASE_URL + "/" + "api";

export default {
  name: "SavedTab",

  data() {
    return {
      collections: [],
      selectedCollectionId: null,
      activeSelectCollection: false,
      showAddCollectionModal: false,
      searchValue: "",
      form: {
        name: "",
        path: "/root/",
        parent: null,
      },
      selectedItem: {
        id: null,
        type: null,
        name: null,
        onEdit: false,
      },
    };
  },
  components: {
    Image,
    Modal,
    Popover,
    ConfirmPopup,
    AccordionInfor,
    ButtonIcon,
  },
  computed: {
    filteredCollections() {
      let collection = {
        children: this.collections,
        posts: [],
        name: "Tất cả",
      };
      if (this.selectedCollectionId) {
        collection = this.getCollectionById(this.selectedCollectionId);
      }
      if (this.searchValue) {
        collection.posts = collection.posts.filter((post) =>
          removeVietnamese(post.title).includes(
            removeVietnamese(this.searchValue)
          )
        );
        collection.children = collection.children.filter((child) =>
          removeVietnamese(child.name).includes(
            removeVietnamese(this.searchValue)
          )
        );
      }
      return collection;
    },
  },
  mounted() {
    this.getCollections();
  },
  methods: {
    isOnEdit(id) {
      return this.selectedItem.id == id && this.selectedItem.onEdit;
    },
    isLimitedCollection(collection) {
      return collection?.parent != null;
    },
    async getCollections() {
      const response = await useFetch(`${PROXY}/collections/my`);
      if (response?.collections) {
        this.collections = response?.collections;
      } else {
        errorToast("Hiện tại, không thể lấy danh sách bookmark của bạn!");
      }
    },
    getCollectionById(id, collections = this.collections) {
      for (const collection of collections) {
        if (collection.id === id) {
          return cloneDeep(collection);
        }
        if (collection.children) {
          const found = this.getCollectionById(id, collection.children);
          if (found) {
            return cloneDeep(found);
          }
        }
      }
      return null; // không tìm thấy
    },
    getCurrentPath() {
      let path = "Bookmark > ";
      if (this.filteredCollections?.tree_path_str) {
        path = path + this.filteredCollections?.tree_path_str + " > ";
      }
      return path;
    },
    async handleAddCollection() {
      if (this.form.name == "") {
        errorToast("Vui lòng nhập tên thư mục!");
        return;
      }
      const formData = new FormData();
      formData.append("name", this.form.name);
      if (this.selectedCollectionId) {
        formData.append("parent", this.selectedCollectionId);
      }
      const data = await usePost(`/collections/`, formData);
      if (data?.ok) {
        this.showAddCollectionModal = false;
        this.getCollections();
      }
    },
    async handleEditCollection(id, name) {
      this.selectedItem.onEdit = false;
      const formData = new FormData();
      formData.append("name", name);
      const data = await usePatch(`/collections/${id}`, formData);
      if (data?.ok) {
        this.getCollections();
      }
    },
    async handleDeleteCollection(id) {
      const data = await useDelete(`/collections/${id}`);
      if (data?.ok) {
        this.getCollections();
      }
    },
    async handleUnsavePost(id) {
      const formData = new FormData();
      formData.append("post", id);
      const data = await useDelete(`/bookmarks/unsave/`, formData, true, true);
      if (data?.ok) {
        this.getCollections();
      }
    },
    getPath(path) {
      if (this.selectedCollectionId) {
        return path + this.filteredCollections?.name + "/";
      }
      return path;
    },
    handleSelectCollection(id) {
      if (this.selectedItem.onEdit) {
        return;
      }
      if (id == "back") {
        this.selectedCollectionId = this.filteredCollections?.parent;
      } else {
        this.selectedCollectionId = id;
      }
    },
    truncateText(text, length) {
      return text.length > length ? text.slice(0, length) + "..." : text;
    },
    togglePopover(event, id, type) {
      this.$nextTick(() => {
        this.$refs.op.show(event);
        this.selectedItem.id = id;
        this.selectedItem.type = type;
      });
    },
    popoverDeleteItem() {
      this.$refs.op.hide();
      if (this.selectedItem.type == "collection") {
        this.deleteCollection(this.selectedItem.id);
      } else {
        this.deletePost(this.selectedItem.id);
      }
    },
    popoverEditItem() {
      this.$refs.op.hide();
      if (this.selectedItem.type == "collection") {
        this.selectedItem.onEdit = true;
        // Focus vào input sau khi DOM được cập nhật
        this.$nextTick(() => {
          // Tìm input element trong DOM
          const input = this.$el.querySelector('input[type="text"]');
          if (input && input.focus) {
            input.focus();
            input.select(); // Select toàn bộ text để dễ dàng thay thế
          }
        });
      } else {
        this.selectedItem.onEdit = true;
      }
    },
    confirmDelete(event) {
      const objName =
        this.selectedItem.type === "collection" ? "thư mục" : "bài viết";
      this.$confirm.require({
        target: event.currentTarget,
        message: `Xác nhận xóa ${objName}?`,
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
          if (this.selectedItem.type === "collection") {
            this.handleDeleteCollection(this.selectedItem.id);
          } else if (this.selectedItem.type === "post") {
            this.handleUnsavePost(this.selectedItem.id);
          }
        },
        reject: () => false,
      });
    },
  },
};
</script>
