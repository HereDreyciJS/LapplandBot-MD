const APIs = {
  xyro: { url: 'https://api.xyro.site', key: null },
  yupra: { url: 'https://api.yupra.my.id', key: null },
  vreden: { url: 'https://api.vreden.web.id', key: null },
  delirius: { url: 'https://api.delirius.store', key: null },
  zenzxz: { url: 'https://api.zenzxz.my.id', key: null },
  siputzx: { url: 'https://api.siputzx.my.id', key: null },
  adonix: { url: 'https://api-adonix.ultraplus.click', key: 'Yuki-WaBot' }
}

APIs.pinterest = {
  download: [
    `${APIs.vreden.url}/api/v1/download/pinterest?url=`,
    `${APIs.delirius.url}/download/pinterestdl?url=`,
    `${APIs.siputzx.url}/api/s/pinterestdl?url=`,
    `${APIs.yupra.url}/pinterest/dl?url=`,
    `${APIs.xyro.url}/dl/pinterest?url=`
  ],
  search: [
    `${APIs.vreden.url}/api/v1/search/pinterest?query=`,
    `${APIs.vreden.url}/api/v2/search/pinterest?query=`,
    `${APIs.delirius.url}/search/pinterest?text=`,
    `${APIs.delirius.url}/search/pinterestv2?text=`,
    `${APIs.siputzx.url}/api/s/pinterest?query=`,
    `${APIs.xyro.url}/search/pinterest?query=`,
    `${APIs.yupra.url}/pinterest/search?query=`
  ]
}

global.APIs = APIs

export default APIs
