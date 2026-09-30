module.exports = {
    transpileDependencies: ["@vueform"],
    configureWebpack: {
        devServer: {
            client: {
                overlay: {
                    warnings: false,
                    errors: true,
                },
            },
        },
    },
    chainWebpack: (config) => {
        // Rule "images" mặc định của Vue CLI test đuôi file phân biệt hoa/thường
        // (/\.(png|jpe?g|gif|webp|avif)$/), nên bỏ sót ảnh gốc từ máy ảnh/drone
        // có đuôi viết hoa (vd: DJI_..._D.JPG). Ghi đè lại với cờ "i".
        config.module
            .rule("images")
            .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i);
    },
}