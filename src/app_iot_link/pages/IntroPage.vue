<script setup>
// Giới thiệu — faithful clone of https://thaihai.metatwin.vn/gioi-thieu
// (original: web_frontend/portal/gioi_thieu/gioi-thieu.html + portal_gioithieu.css).
// Spec: docs/research/thaihai.metatwin.vn/components/intro-page.spec.md
//
// Three sections: cover hero, white intro body with a photo carousel that fades
// on a 4s timer, then a click-driven carousel of horizontal feature cards.
// Bootstrap's carousel CSS ships with the theme but its JS does not, so the two
// carousels below drive Bootstrap's own class protocol (`.active`,
// `.carousel-item-next/-prev`, `.carousel-item-start/-end`) from Vue instead.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTenant } from '../common/tenant'
import { mediaUrl } from '../common/media'
import imgPattern from '@/assets/images/landing/bg-pattern.png'

const { intro: introData, site: SITE } = useTenant()
const intro = computed(() => introData)
const cover = computed(() => mediaUrl(intro.value?.cover) || SITE.cover)

// Bootstrap's $carousel-transition-duration.
const TRANSITION = 600
// The original markup's data-bs-interval on the photo carousel.
const SLIDE_INTERVAL = 4000

// A carousel's sliding state: `active` is on screen, `incoming` is the slide
// being brought in, `started` flips on one frame later to run the transition.
function useCarousel(count) {
  const active = ref(0)
  const incoming = ref(null)
  const dir = ref('next')
  const started = ref(false)

  async function go(step) {
    const n = count.value
    if (incoming.value !== null || n < 2) return
    dir.value = step > 0 ? 'next' : 'prev'
    incoming.value = (active.value + step + n) % n
    // The incoming slide goes from display:none to block here, so it has to be
    // painted at its off-screen/transparent start position before the
    // transition class lands — otherwise it snaps straight to its end state.
    await nextTick()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    started.value = true
    setTimeout(() => {
      active.value = incoming.value
      incoming.value = null
      started.value = false
    }, TRANSITION)
  }

  function classes(i) {
    const moving = i === incoming.value
    return {
      active: i === active.value,
      'carousel-item-next': moving && dir.value === 'next',
      'carousel-item-prev': moving && dir.value === 'prev',
      'carousel-item-start': started.value && dir.value === 'next' && (moving || i === active.value),
      'carousel-item-end': started.value && dir.value === 'prev' && (moving || i === active.value),
    }
  }

  return { go, classes }
}

// Tenants with only partial intro data (e.g. Dũng Tân's CMS has just a title)
// still need to render — hide the two body sections when their content is empty.
const hasBodySection = computed(() => {
  const i = intro.value
  return !!(i && (i.description || i.description_short2 || (i.images || []).length))
})
const hasCards = computed(() => cards.value.length > 0)

// --- Carousel A: photos, auto-fades every 4s, no controls ---
const slides = computed(() => (intro.value?.images || []).map((s) => mediaUrl(s)).filter(Boolean))
const slideCarousel = useCarousel(computed(() => slides.value.length))
let timer = null
onMounted(() => {
  if (slides.value.length > 1) timer = setInterval(() => slideCarousel.go(1), SLIDE_INTERVAL)
})
onBeforeUnmount(() => timer && clearInterval(timer))

// --- Carousel B: feature cards, prev/next clicks only (no autoplay, no swipe) ---
const cards = computed(() => {
  if (!intro.value) return []
  return [1, 2, 3]
    .map((i) => ({
      title: intro.value[`title${i}`],
      desc: intro.value[`description_${i}`],
      img: mediaUrl(intro.value[`description_img${i}`]),
    }))
    .filter((c) => c.title || c.desc || c.img)
})
const cardCarousel = useCarousel(computed(() => cards.value.length))
</script>

<template>
  <div v-if="intro" class="intro-page">
    <!-- Hero: cover photo, 25% black overlay, centred system name -->
    <section class="section header-background" :style="cover ? { backgroundImage: `url(${cover})` } : {}">
      <div class="bg-overlay" style="opacity: 0.25"></div>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-12 col-sm-10">
            <div class="text-center">
              <h1 class="display-6 fw-semibold text-uppercase mb-4 lh-base text-white-custom">{{ SITE.name }}</h1>
              <p class="lead text-white lh-base mb-4 pb-2">{{ intro.description_short1 }}</p>
            </div>
          </div>
          <!--end col-->
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </section>
    <!-- end section -->

    <section v-if="hasBodySection" class="section bg-white">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="text-center">
              <h2 class="mb-3 fw-bold text-uppercase lh-base">{{ intro.title }}</h2>
              <p class="text-muted">{{ intro.description_short2 }}</p>
            </div>
          </div>
          <!-- end col -->
        </div>
        <div class="row justify-content-center">
          <div v-if="slides.length" class="col-lg-8 col-sm-10 mb-5">
            <div class="demo-carousel">
              <div class="demo-img-patten-top d-none d-sm-block">
                <img :src="imgPattern" class="d-block img-fluid" alt="..." />
              </div>
              <div class="demo-img-patten-bottom d-none d-sm-block">
                <img :src="imgPattern" class="d-block img-fluid" alt="..." />
              </div>
              <div class="carousel slide carousel-fade">
                <div class="carousel-inner shadow-lg p-2 bg-white rounded">
                  <div v-for="(src, i) in slides" :key="i" class="carousel-item" :class="slideCarousel.classes(i)">
                    <img :src="src" class="d-block w-100" alt="..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- `col-ls-12` is a typo in the original markup (no such Bootstrap
               class), so this column is really col-sm-10 — wider than the
               carousel above it. Kept verbatim. -->
          <div v-if="intro.description" class="col-ls-12 col-sm-10 mt-2">
            <p class="lead lh-base fst-italic">{{ intro.description }}</p>
          </div>
        </div>
        <!-- end row -->
      </div>
    </section>
    <!-- end section -->

    <section v-if="hasCards" class="section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="text-center mb-5">
              <h2 class="mb-3 fw-bold text-uppercase lh-base">{{ intro.title }}</h2>
              <p class="text-muted">{{ intro.description_short3 }}</p>
            </div>
          </div>
          <!-- end col -->
        </div>
        <div class="row">
          <div class="col-lg-12">
            <!-- Disable Touch Swiping -->
            <div class="carousel slide">
              <div class="d-flex justify-content-end gap-2 mb-2">
                <div class="slider-button-prev" @click="cardCarousel.go(-1)">
                  <div class="avatar-title fs-18 rounded px-1">
                    <i class="ri-arrow-left-s-line"></i>
                  </div>
                </div>
                <div class="slider-button-next" @click="cardCarousel.go(1)">
                  <div class="avatar-title fs-18 rounded px-1">
                    <i class="ri-arrow-right-s-line"></i>
                  </div>
                </div>
              </div>
              <div class="carousel-inner">
                <div v-for="(c, i) in cards" :key="i" class="carousel-item" :class="cardCarousel.classes(i)">
                  <div class="card card-height-100">
                    <div class="row g-0">
                      <div v-if="c.img" class="col-md-4">
                        <img class="rounded-start img-fluid object-cover img-introduce" :src="c.img" alt="Card image" />
                      </div>
                      <div class="col-md-8">
                        <div class="card-header">
                          <h5 class="card-title mb-0">{{ c.title }}</h5>
                        </div>
                        <div class="card-body">
                          <p class="card-text mb-2">{{ c.desc }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end container -->
    </section>
    <!-- end section -->
  </div>
</template>

<style scoped>
/* Bridge three host-theme deviations from the Velzon defaults the original
   page was built against, so this page renders at the original's metrics:
   - `body { font-size: 1rem }` in config/default/custom.scss overrides
     Velzon's $font-size-base (0.8125rem = 13px), which everything on the
     original inherits (.text-muted, .card-text, …). rem-sized type
     (.lead, h2, .display-6, .card-title, .fs-18) is unaffected either way.
   - $primary is #550912 here, whereas the original renders $primary #405189 —
     .avatar-title bakes the colour in at compile time, so the app's
     --iot-primary token can't reach it.
   - $card-border-width is 1px here; the original's .card computes to 0. */
.intro-page {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  line-height: 1.5;
}

.intro-page .avatar-title {
  background-color: var(--iot-primary);
}

.intro-page .card {
  border-width: 0;
}

/* Ported verbatim from the original portal_gioithieu.css. Everything else on
   this page (.section, .demo-carousel, .demo-img-patten-*, .bg-overlay, the
   .carousel-* rules, .card, .card-header) already comes from the theme. */
.header-background {
  background-size: cover;
  background-position: bottom;
  padding: 222px 0 150px 0;
  image-rendering: pixelated;
}

.text-white-custom {
  color: #ffffff;
}

.img-introduce {
  width: 372px;
  height: 268px;
}

/* The original leaves these two unstyled divs without a cursor hint. */
.slider-button-prev,
.slider-button-next {
  cursor: pointer;
}
</style>
