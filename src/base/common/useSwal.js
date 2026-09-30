import Swal from 'sweetalert2';

/**
 * Composable cho SweetAlert2 với custom theme
 * Cung cấp các hàm hỏi xác nhận với giao diện tùy chỉnh
 */
export const useSwal = () => {

  // Cấu hình chung cho theme
  const getCustomTheme = (maxWidth = '500px') => ({
    width: maxWidth,
    customClass: {
      container: 'custom-swal-container',
      popup: 'custom-swal-popup modal-dialog-centered',
      header: 'custom-swal-header modal-header',
      title: 'custom-swal-title',
      closeButton: 'custom-swal-close btn-close',
      icon: 'custom-swal-icon',
      image: 'custom-swal-image',
      content: 'custom-swal-content modal-body',
      htmlContainer: 'custom-swal-html-container',
      input: 'custom-swal-input form-control',
      validationMessage: 'custom-swal-validation-message',
      actions: 'custom-swal-actions d-flex gap-3 justify-content-center',
      confirmButton: 'custom-swal-confirm btn',
      cancelButton: 'custom-swal-cancel btn',
      footer: 'custom-swal-footer'
    },
    buttonsStyling: false,
    reverseButtons: true
  });

  /**
   * Hỏi xác nhận xóa với custom theme
   */
  const confirmDelete = (
    title = 'Bạn có chắc chắn muốn xóa?',
    text = 'Bạn sẽ không thể khôi phục lại dữ liệu này!',
    confirmButtonText = 'Xóa'
  ) => {
    return Swal.fire({
      ...getCustomTheme(),
      html: `
        <div class="mt-0 text-center">
          <div class="fs-13 mx-4 mx-sm-5">
            <h4>${title}</h4>
            <p class="text-muted mx-4 mb-0">${text}</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Hủy',
      customClass: {
        ...getCustomTheme().customClass,
        confirmButton: 'btn w-sm btn-danger',
        cancelButton: 'btn w-sm btn-light'
      }
    });
  };

  /**
   * Hỏi xác nhận hành động chung với custom theme
   */
  const confirmAction = (
    title = 'Bạn có chắc chắn?',
    text = null,
    iconType = 'question',
    confirmButtonText = 'Xác nhận',
  ) => {

    return Swal.fire({
      ...getCustomTheme(),
      title: false,
      html: `
        <div class="mt-2 text-center">
          <div class="mx-4 fs-13 mx-4 mx-sm-5">
            <h4>${title}</h4>
            ${text ? `<p class="text-muted mx-4 mb-0">${text}</p>` : ''}
          </div>
        </div>
      `,
      icon: iconType,
      showCancelButton: true,
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Hủy',
      customClass: {
        ...getCustomTheme().customClass,
        confirmButton: `btn w-sm btn-primary`,
        cancelButton: 'btn w-sm btn-light'
      }
    });
  };

  /**
   * Hỏi xác nhận với tùy chọn hoàn toàn tùy chỉnh
   */
  const confirmCustom = (options = {}) => {
    const defaultOptions = {
      ...getCustomTheme(),
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      customClass: {
        ...getCustomTheme().customClass,
      }
    };

    return Swal.fire({
      ...defaultOptions,
      ...options,
      html: `
        <div class="mt-0 text-center">
          <div class="fs-13 mx-4 mx-sm-5">
            <h4>${options.title}</h4>
            <p class="text-muted mx-4 mb-0">${options.text}</p>
          </div>
        </div>
      `,
      title: false,
    });
  };

  /**
   * Hiển thị thông báo thành công
   */
  const showSuccess = (title = 'Thành công!', text = '', timer = 3000) => {
    return Swal.fire({
      ...getCustomTheme(),
      html: `
        <div class="mt-0 text-center">
          <div class="fs-13 mx-4 mx-sm-5">
            <h4>${title}</h4>
          ${text ? `<div class="mt-3 pt-2 fs-15"><p class="text-muted mb-0">${text}</p></div>` : ''}
          </div>
        </div>
      `,
      icon: 'success',
      timer: timer,
      showConfirmButton: false,
      timerProgressBar: true,
      customClass: {
        ...getCustomTheme().customClass,
        popup: 'custom-swal-popup modal-dialog-centered success-swal'
      }
    });
  };

  /**
   * Hiển thị thông báo lỗi
   */
  const showError = (title = 'Lỗi!', text = 'Đã có lỗi xảy ra') => {
    return Swal.fire({
      ...getCustomTheme(),
      title: false,
      html: `
        <div class="mt-0 text-center">
          <div class="fs-13 mx-4 mx-sm-5">
            <h4>${title}</h4>
          ${text ? `<div class="mt-3 pt-2 fs-15"><p class="text-muted mb-0">${text}</p></div>` : ''}
          </div>
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        ...getCustomTheme().customClass,
        confirmButton: 'btn w-sm btn-danger',
        popup: 'custom-swal-popup modal-dialog-centered error-swal'
      }
    });
  };

  /**
   * Hiển thị thông báo cảnh báo
   */
  const showWarning = (title = 'Cảnh báo!', text = '') => {
    return Swal.fire({
      ...getCustomTheme(),
      title: false,
      html: `
        <div class="mt-0 text-center">
          <div class="fs-13 mx-4 mx-sm-5">
            <h4>${title}</h4>
          ${text ? `<div class="mt-3 pt-2 fs-15"><p class="text-muted mb-0">${text}</p></div>` : ''}
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'OK',
      customClass: {
        ...getCustomTheme().customClass,
        confirmButton: 'btn w-sm btn-warning',
        popup: 'custom-swal-popup modal-dialog-centered warning-swal'
      }
    });
  };

  /**
   * Hiển thị thông báo thông tin
   */
  const showInfo = (title = 'Thông tin', text = '') => {
    return Swal.fire({
      ...getCustomTheme(),
      title: false,
      html: `
        <div class="mt-0 text-center">
          <div class="fs-13 mx-4 mx-sm-5">
            <h4>${title}</h4>
          ${text ? `<div class="mt-3 pt-2 fs-15"><p class="text-muted mb-0">${text}</p></div>` : ''}
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'OK',
      customClass: {
        ...getCustomTheme().customClass,
        confirmButton: 'btn w-sm btn-info',
        popup: 'custom-swal-popup modal-dialog-centered info-swal'
      }
    });
  };

  return {
    // Hàm xác nhận
    confirmDelete,
    confirmAction,
    confirmCustom,

    // Hàm thông báo
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Instance gốc nếu cần tùy chỉnh nâng cao
    Swal
  };
};

// Export mặc định
export default useSwal;