const IMOVEIS = {
  "studio joão": "DS03J", "studio do joão": "DS03J", "ds03j": "DS03J",
  "flat da mari": "DS04J", "flat mari": "DS04J", "ds04j": "DS04J",
  "apartamento emanoel": "DS05J", "apto emanoel": "DS05J", "ds05j": "DS05J", "apartamento do emanoel": "DS05J",
  "apto do reinaldo mi": "FL10J", "apto reinaldo": "FL10J", "fl10j": "FL10J", "apartamento do reinaldo": "FL10J",
  "apartamento do reinaldo ji": "GC01J", "gc01j": "GC01J", "apartamento do zé coroa": "GC01J", "apto zé coroa": "GC01J",
  "flat da joyce": "HA03J", "flat joyce": "HA03J", "ha03j": "HA03J",
  "casa do tremura": "GF02J", "casa tremura": "GF02J", "gf02j": "GF02J",
  "casa laureana": "GF04J", "gf04j": "GF04J", "casa da laureana": "GF04J",
  "casa da moana": "GF06J", "casa moana": "GF06J", "gf06j": "GF06J",
  "casa do euller": "GG06J", "casa euller": "GG06J", "gg06j": "GG06J",
  "casa do john": "GG08J", "casa john": "GG08J", "gg08j": "GG08J",
  "vp-01": "JR01J", "jr01j": "JR01J", "studio varandas 01": "JR01J",
  "vp-03": "JR03J", "jr03j": "JR03J", "studio varandas 03": "JR03J",
  "vp-04": "JR04J", "jr04j": "JR04J", "studio varandas 04": "JR04J",
  "vp-05": "JR05J", "jr05j": "JR05J", "apto varandas 01": "JR05J",
  "vp-07": "JR07J", "jr07j": "JR07J", "apto varandas 03": "JR07J",
  "jr08j": "JR08J", "apto varandas 04": "JR08J",
  "jr09j": "JR09J", "apto duplex varandas 01": "JR09J",
  "condomínio do max": "VM10A", "cond do max": "VM10A", "vm10a": "VM10A",
};

const MIDIA = {
  "DS03J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782131150/DS03J.mp4_yjhh1w.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131146/DS03J-1_l4lqgm.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131146/DS03J-2_oqflm9.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131146/DS03J-3_nfbm1r.jpg",
      "",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131146/DS03J-5_ggzidx.jpg",
    ]
  },
  "DS04J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782131320/DS04J_nymqap.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131311/DS04J-1_aiq8xc.jpg",
      "",
      "",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131312/DS04J-4_err7qc.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131312/DS04J-5_hosnyt.jpg",
    ]
  },
  "DS05J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782131463/DS05J.mp4_he2dn9.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131459/DS05J-1_vwqsuo.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131459/DS05J-2_f5r4qe.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131458/DS05J-3_gdultw.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131459/DS05J-4_phpwkp.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131460/DS05J-5_xkm6uy.png",
    ]
  },
  "FL10J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782131613/FL10J.mp4_qkygw7.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131610/FL10J-1_hjgtqj.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131611/FL10J-2_wreisf.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131611/FL10J-3_qlg2et.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131612/FL10J-4_wzahfd.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131612/FL10J-5_xqrmzt.jpg",
    ]
  },
  "GC01J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131543/GC01J-1_ke3tlr.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131543/GC01J-2_p0u0u7.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131544/GC01J-3_ezlrvf.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131544/GC01J-4_apx6pk.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131545/GC01J-5_xrsmn8.jpg",
    ]
  },
  "GF02J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782132258/GF02J_-_Casa_do_Tremura_yakxbl.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132238/GF02J-1_v0p3zz.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132239/GF02J-2_h7xebp.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132240/GF02J-3_rvxlnb.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132241/GF02J-4_lolv4n.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132242/GF02J-5_xniqhe.jpg",
    ]
  },
  "GF04J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782132109/GF04J.mp4_pifndc.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132067/GF04J-1_ftforl.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132026/GF04J-2_exbcug.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132041/GF04J-3_kgz0vm.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132025/GF04J-4_rao29a.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132100/GF04J-5_oijbod.jpg",
    ]
  },
  "GF06J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782132137/GF06J.mp4_sasotv.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132126/GF06J-1_tm5si6.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132127/GF06J-2_lh46qo.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132128/GF06J-3_svgbcp.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132129/GF06J-4_bqnceo.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132130/GF06J-5_klyay7.jpg",
    ]
  },
  "GG06J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782132178/GG06J.mp4_bjxyri.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132160/GG06J-1_b8vk7g.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132161/GG06J-2_urfqor.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132158/GG06J-3_bdjbdl.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132162/GG06J-4_kciy0q.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132163/GG06J-5_c9blii.jpg",
    ]
  },
  "GG08J": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782132227/GG08J_-_Casa_do_John_jtppev.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132211/GG08J-1_jklkr5.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132213/GG08J-2_ivpqvw.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132195/GG08J-3_mvzfog.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132190/GG08J-4_wovtjj.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132214/GG08J-5_lykdhj.jpg",
    ]
  },
  "HA03J": {
    video: "",
    fotos: ["", "", "", "", ""]
  },
  "JR01J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131721/JR01J-1_aweeyh.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131718/JR01J-2_p9dklk.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131720/JR01J-3_nm2aqx.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131717/JR01J-4_zdmemk.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131720/JR01J-5_llohk4.png",
    ]
  },
  "JR03J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131759/JR03J-1_lb36ds.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131758/JR03J-2_tlk7uk.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131759/JR03J-3_ketrcd.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131760/JR03J-4_lm2rre.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131760/JR03J-5_ejtrxp.png",
    ]
  },
  "JR04J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131829/JR04J-1_tjyycr.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131829/JR04J-2_p8gsxr.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131830/JR04J-3_si8wv7.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131832/JR04J-4_bgmpcd.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131831/JR04J-5_yu79gq.png",
    ]
  },
  "JR05J": {
    video: "",
    fotos: ["", "", "", "", ""]
  },
  "JR07J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131923/JR07J-1_gqvaht.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131923/JR07J-2_jtkets.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131924/JR07J-3_abyrvz.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131925/JR07J-4_v5hdb7.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131925/JR07J-5_mwxrdh.png",
    ]
  },
  "JR08J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131998/JR08J-1_p8clvg.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132007/JR08J-2_ddxzlr.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132003/JR08J-3_qybtxg.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132001/JR08J-4_vnvfek.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782132005/JR08J-5_pqtp7l.png",
    ]
  },
  "JR09J": {
    video: "",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131982/JR09J-1_iqn0w0.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131984/JR09J-2_zvvaqf.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131983/JR09J-3_vlyptx.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131983/JR09J-4_bqlqme.png",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131985/JR09J-5_smsinm.png",
    ]
  },
  "VM10A": {
    video: "https://res.cloudinary.com/dwtylly4h/video/upload/v1782131516/VM10A.mp4_vt3cra.mp4",
    fotos: [
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131507/VM10A-1_i0zryi.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131508/VM10A-2_jac783.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131508/VM10A-3_bwmiwb.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131508/VM10A-4_u2bii2.jpg",
      "https://res.cloudinary.com/dwtylly4h/image/upload/v1782131509/VM10A-5_qwrbfn.jpg",
    ]
  },
};

function resolveId(nome) {
  return IMOVEIS[(nome || "").toLowerCase().trim()] || nome;
}

const mcp = session.datasources["Api-request-1"];
const imovelRaw = mcp?.imovel || "";
const imovelId = resolveId(imovelRaw);
const midia = MIDIA[imovelId];

if (!midia) {
  await session.setAdditionalValue("video_link", "");
  await session.setAdditionalValue("foto_1", "");
  await session.setAdditionalValue("foto_2", "");
  await session.setAdditionalValue("foto_3", "");
  await session.setAdditionalValue("foto_4", "");
  await session.setAdditionalValue("foto_5", "");
  await session.setAdditionalValue("midia_status", `Imóvel não encontrado: ${imovelRaw}`);
  return;
}

await session.setAdditionalValue("video_link", midia.video || "");
await session.setAdditionalValue("foto_1", midia.fotos[0] || "");
await session.setAdditionalValue("foto_2", midia.fotos[1] || "");
await session.setAdditionalValue("foto_3", midia.fotos[2] || "");
await session.setAdditionalValue("foto_4", midia.fotos[3] || "");
await session.setAdditionalValue("foto_5", midia.fotos[4] || "");
await session.setAdditionalValue("midia_status", "ok");
