<template>
  <div class="tab-pane fade" id="activity" role="tabpanel">
    <b-card no-body>
      <b-card-body>
        <h5 class="card-title mb-3">Activities</h5>
        <div class="acitivity-timeline">
          <div class="acitivity-item d-flex">
            <div class="flex-shrink-0">
              <Image
                fallback="user"
                src="@/assets/images/users/user-dummy-img.jpg"
                alt=""
                class="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">
                Oliver Phillips
                <b-badge
                  variant="soft-primary"
                  class="text-primary align-middle"
                  >New</b-badge
                >
              </h6>
              <p class="text-muted mb-2">
                We talked about a project on linkedin.
              </p>
              <small class="mb-0 text-muted">Today</small>
            </div>
          </div>
          <div class="acitivity-item py-3 d-flex">
            <div class="flex-shrink-0 avatar-xs acitivity-avatar">
              <div
                class="avatar-title bg-soft-success text-success rounded-circle"
              >
                N
              </div>
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">
                Nancy Martino
                <b-badge
                  variant="soft-secondary"
                  class="text-secondary align-middle"
                  >In Progress</b-badge
                >
              </h6>
              <p class="text-muted mb-2">
                <i class="ri-file-text-line align-middle ms-2"></i>
                Create new project Buildng product
              </p>
              <div class="avatar-group mb-2">
                <b-link
                  href="javascript: void(0);"
                  class="avatar-group-item"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title=""
                  data-bs-original-title="Christi"
                >
                  <img
                    src="@/assets/images/users/user-dummy-img.jpg"
                    alt=""
                    class="rounded-circle avatar-xs"
                  />
                </b-link>
                <b-link
                  href="javascript: void(0);"
                  class="avatar-group-item"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title=""
                  data-bs-original-title="Frank Hook"
                >
                  <img
                    src="@/assets/images/users/user-dummy-img.jpg"
                    alt=""
                    class="rounded-circle avatar-xs"
                  />
                </b-link>
                <b-link
                  href="javascript: void(0);"
                  class="avatar-group-item"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title=""
                  data-bs-original-title=" Ruby"
                >
                  <div class="avatar-xs">
                    <div
                      class="avatar-title rounded-circle bg-light text-primary"
                    >
                      R
                    </div>
                  </div>
                </b-link>
                <b-link
                  href="javascript: void(0);"
                  class="avatar-group-item"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title=""
                  data-bs-original-title="more"
                >
                  <div class="avatar-xs">
                    <div class="avatar-title rounded-circle">2+</div>
                  </div>
                </b-link>
              </div>
              <small class="mb-0 text-muted">Yesterday</small>
            </div>
          </div>
          <div class="acitivity-item py-3 d-flex">
            <div class="flex-shrink-0">
              <Image
                fallback="user"
                src="@/assets/images/users/user-dummy-img.jpg"
                alt=""
                class="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">
                Natasha Carey
                <b-badge
                  variant="soft-success"
                  class="text-success align-middle"
                  >Completed</b-badge
                >
              </h6>
              <p class="text-muted mb-2">Adding a new event with attachments</p>
              <b-row>
                <b-col xxl="4">
                  <b-row class="border border-dashed gx-2 p-2 mb-2">
                    <b-col cols="4">
                      <img
                        src="@/assets/images/small/img-2.jpg"
                        alt=""
                        class="img-fluid rounded"
                      />
                    </b-col>
                    <b-col cols="4">
                      <img
                        src="@/assets/images/small/img-3.jpg"
                        alt=""
                        class="img-fluid rounded"
                      />
                    </b-col>
                    <b-col cols="4">
                      <img
                        src="@/assets/images/small/img-4.jpg"
                        alt=""
                        class="img-fluid rounded"
                      />
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
              <small class="mb-0 text-muted">25 Nov</small>
            </div>
          </div>
          <div class="acitivity-item py-3 d-flex">
            <div class="flex-shrink-0">
              <Image
                fallback="user"
                src="@/assets/images/users/user-dummy-img.jpg"
                alt=""
                class="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">Bethany Johnson</h6>
              <p class="text-muted mb-2">
                added a new member to velzon dashboard
              </p>
              <small class="mb-0 text-muted">19 Nov</small>
            </div>
          </div>
          <div class="acitivity-item py-3 d-flex">
            <div class="flex-shrink-0">
              <div class="avatar-xs acitivity-avatar">
                <div
                  class="avatar-title rounded-circle bg-soft-danger text-danger"
                >
                  <i class="ri-shopping-bag-line"></i>
                </div>
              </div>
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">
                Your order is placed
                <b-badge
                  variant="soft-danger"
                  class="text-danger align-middle ms-1"
                  >Out of Delivery
                </b-badge>
              </h6>
              <p class="text-muted mb-2">
                These customers can rest assured their order has been placed.
              </p>
              <small class="mb-0 text-muted">16 Nov</small>
            </div>
          </div>
          <div class="acitivity-item py-3 d-flex">
            <div class="flex-shrink-0">
              <Image
                fallback="user"
                src="@/assets/images/users/user-dummy-img.jpg"
                alt=""
                class="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">Lewis Pratt</h6>
              <p class="text-muted mb-2">
                They all have something to say beyond the words on the page.
                They can come across as casual or neutral, exotic or graphic.
              </p>
              <small class="mb-0 text-muted">22 Oct</small>
            </div>
          </div>
          <div class="acitivity-item py-3 d-flex">
            <div class="flex-shrink-0">
              <div class="avatar-xs acitivity-avatar">
                <div class="avatar-title rounded-circle bg-soft-info text-info">
                  <i class="ri-line-chart-line"></i>
                </div>
              </div>
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">Monthly sales report</h6>
              <p class="text-muted mb-2">
                <span class="text-danger">2 days left</span>
                notification to submit the monthly sales report.
                <b-link
                  href="javascript:void(0);"
                  class="link-warning text-decoration-underline"
                  >Reports Builder
                </b-link>
              </p>
              <small class="mb-0 text-muted">15 Oct</small>
            </div>
          </div>
          <div class="acitivity-item d-flex">
            <div class="flex-shrink-0">
              <Image
                fallback="user"
                src="@/assets/images/users/user-dummy-img.jpg"
                alt=""
                class="avatar-xs rounded-circle acitivity-avatar"
              />
            </div>
            <div class="flex-grow-1 ms-3">
              <h6 class="mb-1">
                New ticket received
                <b-badge
                  variant="soft-success"
                  class="text-success align-middle"
                  >Completed</b-badge
                >
              </h6>
              <p class="text-muted mb-2">
                User
                <span class="text-secondary">Erica245</span>
                submitted a ticket.
              </p>
              <small class="mb-0 text-muted">26 Aug</small>
            </div>
          </div>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import Image from "@/base/components/image/Image.vue";
export default {
  name: "ActivityTab",
  components: {
    Image,
  },
};
</script>