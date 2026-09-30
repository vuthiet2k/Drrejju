import { Offcanvas } from "bootstrap";

const getOffcanvas = (id_offcanvas) => {
  // Lấy đối tượng offcanvas bằng cách sử dụng id của nó
  const offcanvas = new Offcanvas(document.getElementById(id_offcanvas));
  return offcanvas;
};

export { getOffcanvas };
