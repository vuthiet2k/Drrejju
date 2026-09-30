<template>
  <footer class="dh-footer">
    <div class="dh-footer-container">
      <div class="dh-footer-top">
        <div class="dh-footer-brand">
          <div class="dh-footer-logo-row">
            <span class="dh-footer-logo-title">ĐỊNH HOÁ</span>
            <span class="dh-footer-tag">ATK THÁI NGUYÊN</span>
          </div>
          <p class="dh-footer-slogan">
            Cổng thông tin & Nền tảng số hóa không gian Di tích Lịch sử Quốc gia Đặc biệt — Hành trình số gắn kết bản sắc.
          </p>
        </div>

        <div class="dh-footer-links">
          <h4 class="dh-footer-heading">TRUY CẬP NHANH</h4>
          <ul class="dh-footer-nav">
            <li><a href="#hero">Trang chủ</a></li>
            <li><a href="#tong-quan">Thủ đô Kháng chiến ATK</a></li>
            <li><a href="#nien-bieu">Niên biểu lịch sử</a></li>
            <li><a href="#sa-ban-3d">Sa bàn kiến trúc 3D</a></li>
            <li><a href="#vr360">VR360 Virtual Tour</a></li>
            <li><a href="#dia-diem">Địa điểm di tích</a></li>
          </ul>
        </div>

        <div class="dh-footer-contact">
          <h4 class="dh-footer-heading">CƠ QUAN CHỦ QUẢN</h4>
          <p class="dh-contact-item"><strong>Cơ quan:</strong> UBND Huyện Định Hóa & UBND Xã Định Hóa</p>
          <p class="dh-contact-item"><strong>Địa chỉ:</strong> Trụ sở UBND Xã Định Hóa, Huyện Định Hóa, Tỉnh Thái Nguyên</p>
          <p class="dh-contact-item"><strong>Phát triển công nghệ:</strong> Hệ thống số hóa thực hiện bởi METATWIN</p>
        </div>
      </div>

      <div class="dh-footer-bottom">
        <p class="dh-copyright">
          © 2026 BẢN QUYỀN THUỘC VỀ UBND XÃ ĐỊNH HOÁ, TỈNH THÁI NGUYÊN. BẢO LƯU MỌI QUYỀN.
        </p>
        <p class="dh-tech-credit">
          PHIÊN BẢN SỐ HÓA HOME PORTAL V2 — ZERO HARD-CODING PIPELINE
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.dh-footer {
  background-color: #120c0a;
  background-image: linear-gradient(180deg, #18100c 0%, #0d0806 100%);
  color: #d1bea8;
  border-top: 1px solid rgba(212, 175, 55, 0.25);
  padding: 56px 20px 28px;
  font-family: 'Asap', sans-serif;
  position: relative;
  overflow: hidden;
}

.dh-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
}

.dh-footer-container {
  max-width: 1320px;
  margin: 0 auto;
}

.dh-footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dh-footer-logo-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
}

.dh-footer-logo-title {
  font-family: 'Saira Extra Condensed', 'Asap Condensed', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFFFFF;
}

.dh-footer-tag {
  font-size: 11px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 1px;
  padding: 2px 8px;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 4px;
}

.dh-footer-slogan {
  font-size: 14px;
  line-height: 1.65;
  color: #a89886;
  max-width: 480px;
}

.dh-footer-heading {
  font-family: 'Asap Condensed', sans-serif;
  font-size: 14px;
  letter-spacing: 1.5px;
  color: #D4AF37;
  margin-bottom: 18px;
  font-weight: 700;
}

.dh-footer-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dh-footer-nav a {
  color: #d1bea8;
  text-decoration: none;
  font-size: 13.5px;
  transition: color 0.2s ease;
}

.dh-footer-nav a:hover {
  color: #E1AF3B;
  padding-left: 4px;
}

.dh-contact-item {
  font-size: 13.5px;
  line-height: 1.6;
  margin-bottom: 8px;
  color: #d1bea8;
}

.dh-contact-item strong {
  color: #fbf4e6;
}

.dh-footer-bottom {
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #7a6e60;
}

.dh-copyright {
  margin: 0;
}

.dh-tech-credit {
  margin: 0;
  letter-spacing: 0.8px;
  color: #bfa882;
}

@media (max-width: 900px) {
  .dh-footer-top {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .dh-footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
