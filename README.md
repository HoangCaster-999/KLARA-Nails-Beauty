# Website KLARA Nails & Beauty

Website tĩnh (HTML/CSS/JS thuần, không cần build, không phụ thuộc thư viện ngoài).

## Chạy thử
- Cách nhanh nhất: mở `index.html` trực tiếp trong trình duyệt (khi mở kiểu file:// trình duyệt chặn font tự host → chữ hiển thị bằng font dự phòng; xem đúng giao diện bằng server bên dưới).
- Hoặc chạy server cục bộ trong thư mục `site/`: `python -m http.server 8000` → mở http://localhost:8000
- Đưa lên mạng: upload toàn bộ thư mục `site/` lên bất kỳ hosting tĩnh nào (Netlify, Vercel, IONOS, Strato…).

## Cấu trúc
```
site/
├── index.html            Trang chính (tiêu đề, đoạn văn cố định)
├── impressum.html        Impressum – PLACEHOLDER, bắt buộc phải điền trước khi public
├── datenschutz.html      Datenschutz – PLACEHOLDER, bắt buộc phải điền trước khi public
└── assets/
    ├── js/content.js     ★ NỘI DUNG: liên hệ, giờ mở cửa, dịch vụ, BẢNG GIÁ, gallery, ảnh hero
    ├── js/main.js        Logic (render nội dung, form đặt lịch, hiệu ứng) – thường không cần sửa
    ├── css/styles.css    Giao diện; bảng màu/font nằm ở đầu file (:root)
    ├── img/              klara-logo.png, klara-logo-light.png (bản màu sáng cho nền tối),
    │                     klara-preisliste.svg, favicon.svg
    │   └── galerie/      Ảnh móng thật dạng WebP, mỗi ảnh 2 cỡ: tên-720.webp và tên-1440.webp
    └── fonts/            Font tự host (Fraunces, Manrope) – không gọi Google Fonts (DSGVO)
```

## Thay nội dung (chỉ cần sửa `assets/js/content.js`)
| Muốn thay | Sửa ở đâu |
|---|---|
| Điện thoại, email, WhatsApp, Instagram, Facebook, link đặt lịch online | `contact` – thay giá trị `[...]`. Nút tương ứng tự hiện khi có dữ liệu thật |
| Giờ Chủ Nhật | `hours` → dòng `dow: 0`, điền `open`/`close` (hoặc để `null`) |
| Giá | `prices` – nhập số không kèm €; `showCurrency` bật/tắt ký hiệu € |
| Ảnh gallery | Chép ảnh WebP vào `assets/img/galerie/` (đặt tên `xxx-720.webp` + `xxx-1440.webp`), thêm dòng vào `gallery` với `src` (bản 1440), `w`, `h`, `label`, `alt`. `galleryInitial` = số ảnh hiện sẵn |
| Ảnh hero | Trực tiếp trong `index.html`, khối `hero__media` (ảnh lớn + ảnh nhỏ) |
| Tên miền (SEO) | `business.siteUrl`; đồng thời bỏ comment thẻ `canonical` trong `index.html` |
| Chế độ xem trước | `draft: true` hiện thanh vàng + đánh dấu mục chưa xác nhận. **Đặt `false` trước khi public** |

Tiêu đề/đoạn văn cố định (hero, giới thiệu) nằm trực tiếp trong `index.html`.

## Ghi chú kỹ thuật
- Form „Wunschtermin“ không lưu dữ liệu trên server: nó soạn sẵn tin nhắn và mở WhatsApp hoặc ứng dụng email của khách. Khi `draft: false` mà chưa có WhatsApp/email, form tự ẩn.
- Google Maps chỉ tải khi khách bấm (giải pháp 2-click theo DSGVO); nút „Route planen“ là link thường.
- Trạng thái „Jetzt geöffnet“ tính theo giờ Berlin; với ngày chưa có giờ (Chủ Nhật) trang không khẳng định mở hay đóng.
- Dữ liệu SEO địa phương (schema.org `NailSalon`) được tạo tự động từ `content.js`.
- Tôn trọng `prefers-reduced-motion`: tắt mọi chuyển động khi người dùng bật giảm chuyển động.
