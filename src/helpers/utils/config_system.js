const PROTOCAL = process.env.VUE_APP_SERVER_URL
const IDORGANIZATIONENV0 = `${process.env.VUE_APP_ID_ORGANIZATION || ''}`
export const WS = process.env.VUE_APP_WS_URL || ''

// export const GEOSERVER_URL = PROTOCAL + 'map-vungnguyenlieu.inoste.vn/geoserver'
// export const WMS_URL = GEOSERVER_URL + '/wms/'


export const SERVER_URL = PROTOCAL

export const ID_ORGANIZATION = IDORGANIZATIONENV0