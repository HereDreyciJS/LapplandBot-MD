const APIs = {
  xyro: {
    url: 'https://api.xyro.site',
    key: null
  },
  yupra: {
    url: 'https://api.yupra.my.id',
    key: null
  },
  vreden: {
    url: 'https://api.vreden.web.id',
    key: null
  },
  delirius: {
    url: 'https://api.delirius.store',
    key: null
  },
  zenzxz: {
    url: 'https://api.zenzxz.my.id',
    key: null
  },
  siputzx: {
    url: 'https://api.siputzx.my.id',
    key: null
  },
  adonix: {
    url: 'https://api-adonix.ultraplus.click',
    key: 'Yuki-WaBot' // si lo usas
  },
  // Pinterest
  pinterest: {
    download: [
      `${global.APIs.vreden.url}/api/v1/download/pinterest?url=`, 
      `${global.APIs.delirius.url}/download/pinterestdl?url=`,
      `${global.APIs.siputzx.url}/api/s/pinterestdl?url=`,
      `${global.APIs.yupra.url}/pinterest/dl?url=`,
      `${global.APIs.xyro.url}/dl/pinterest?url=`
    ],
    search: [
      `${global.APIs.vreden.url}/api/v1/search/pinterest?query=`,
      `${global.APIs.vreden.url}/api/v2/search/pinterest?query=`,
      `${global.APIs.delirius.url}/search/pinterest?text=`,
      `${global.APIs.delirius.url}/search/pinterestv2?text=`,
      `${global.APIs.siputzx.url}/api/s/pinterest?query=`,
      `${global.APIs.xyro.url}/search/pinterest?query=`,
      `${global.APIs.yupra.url}/pinterest/search?query=`
    ]
  }
}

export default APIs
