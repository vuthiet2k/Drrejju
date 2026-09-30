<script setup>
const setItem = (name, img) => {
    return {
        name: name,
        img: img
    }
}

const arrImg = [
    setItem('Cá Vực Sơn La', require("@/assets/images/products/ca-vuoc-son-la.jpg"),),
    setItem('Thanh Long Bình Thuận', require("@/assets/images/products/thanh-long-binh-thuan.jpg"),),
    setItem('Lúa gạo Hải Dương', require("@/assets/images/products/lua-gao-hai-duong.png"),),
    setItem('Sầu riêng Dak Lak', require("@/assets/images/products/sau-rieng-dak-lak.png"),),
    setItem('Khoai lang Quảng Bình', require("@/assets/images/products/khoai-lang-quang-binh.jpg"),),
    setItem('Gạo Điện Biên', require("@/assets/images/products/gao-dien-bien.jpg"),),
    setItem('Gà Hoà Bình', require("@/assets/images/products/ga-hoa-binh.jpg"),),
    setItem('Cam Cao Phong', require("@/assets/images/products/cam-cao-phong.jpg"),),
]
</script>

<template>
    <div class="p-5">
      <div class="text-center pb-3">
        <h1 class="ff-secondary fw-semibold lh-base text-uppercase mt-5">TỔNG HỢP SẢN PHẨM CHỦ LỰC</h1>
      </div>
        <div class="text-center">
            <ul class="list-inline categories-filter animation-nav" id="filter">
                <li class="list-inline-item"><a class="categories active" data-filter="*">Tất
                        cả</a>
                </li>
                <li class="list-inline-item"><a class="categories" data-filter=".lv_nongnghiep">Cây trồng</a>
                </li>
                <li class="list-inline-item"><a class="categories" data-filter=".lv_anqua">Nông sản</a>
                </li>
                <li class="list-inline-item"><a class="categories" data-filter=".lv_traigiong">Chăn nuôi</a>
                </li>
            </ul>
        </div>
        <div class="row">
            <div v-for="item, index in arrImg" :key="index" class="element-item col-xxl-3 col-xl-4 col-sm-6 tt_cho_chu"
                data-category="tt_cho_chu">
                <div class="card explore-box card-animate rounded">
                    <div class="bookmark-icon position-absolute top-0 end-0 p-2">
                        <button type="button" class="btn btn-icon active" data-bs-toggle="button" aria-pressed="true"><i
                                class="mdi mdi-cards-heart fs-16"></i></button>
                    </div>
                    <div class="explore-place-bid-img">
                        <img :src="item.img" alt="" class="img-fluid card-img-top explore-img" />
                        <!-- <div class="bg-overlay"></div>
                        <div class="place-bid-btn">
                            <a href="/dia-diem" class="btn btn-success">
                                <i class="ri-external-link-line align-bottom me-1"></i>
                                Xem chi tiết
                            </a>
                        </div> -->
                    </div>
                    <div class="card-body border-top">
                        <h6 class="my-2 text-center fw-semibold">{{ item.name }}</h6>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>