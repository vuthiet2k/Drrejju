# Viewer Audio Foundation

## Mục đích

`common/audio` là ranh giới Audio dùng chung của `vr360-viewer`. Module này
chuẩn bị API thống nhất cho Audio theo ba scope: tour, scene và POI.

Phase 2.1 tạo foundation; Phase 2.3 kết nối lifecycle và Phase 2.5 bổ sung
Smart Playback. `AudioManager` điều phối priority cố định POI → Scene → Tour,
resume đúng vị trí sau interruption và duck Background Music khi narration
đang phát. UI chỉ gọi API manager qua runtime hiện hữu.

## AudioManager

`AudioManager` là nơi duy nhất được phép sở hữu và thao tác trực tiếp với
`HTMLAudioElement` trong các phase sau. Component, layout và renderer chỉ được
gọi API của manager, không tự gọi `new Audio()` hoặc tạo thẻ audio.

API nền tảng:

- `play()`
- `pause()`
- `stop()`
- `resume()`
- `preload()`
- `dispose()`
- `setVolume()`
- `mute()`
- `unmute()`

`AudioManager` sở hữu các `HTMLAudioElement` theo scope và tự dọn dẹp chúng.
Runtime chỉ gọi API của manager; không component nào tạo audio element trực
tiếp. Event runtime tối thiểu gồm `audio:loaded`, `audio:play`, `audio:pause`,
`audio:stop`, `audio:ended` và `audio:error`.

Background Music giữ nguyên player và chỉ được duck xuống 25% volume cấu hình
khi Tour, Scene hoặc POI narration hoạt động; khi narration kết thúc hoặc lỗi,
volume được khôi phục. Scene/tour change dispose player không còn hợp lệ, nên
không resume audio thuộc scene hoặc tour cũ.

## Cấu trúc

```text
common/audio/
├── AudioManager.js
├── constants.js
├── utils.js
└── README.md
```

- `AudioManager.js`: boundary và API Audio duy nhất.
- `constants.js`: status, scope và mute state dùng chung.
- `utils.js`: helper thuần, không chứa business logic.

## Các phase tiếp theo

1. Bổ sung các chính sách âm thanh mở rộng nếu sản phẩm yêu cầu.
2. Kết nối UI/analytics mở rộng mà không thao tác audio element trực tiếp.
