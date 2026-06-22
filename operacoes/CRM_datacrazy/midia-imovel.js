var IMOVEIS = {
  "studio joão":"DS03J","studio do joão":"DS03J","ds03j":"DS03J",
  "flat da mari":"DS04J","flat mari":"DS04J","ds04j":"DS04J",
  "apartamento emanoel":"DS05J","apto emanoel":"DS05J","ds05j":"DS05J","apartamento do emanoel":"DS05J",
  "apto do reinaldo mi":"FL10J","apto reinaldo":"FL10J","fl10j":"FL10J","apartamento do reinaldo":"FL10J",
  "apartamento do reinaldo ji":"GC01J","gc01j":"GC01J","apartamento do zé coroa":"GC01J","apto zé coroa":"GC01J",
  "flat da joyce":"HA03J","flat joyce":"HA03J","ha03j":"HA03J",
  "casa do tremura":"GF02J","casa tremura":"GF02J","gf02j":"GF02J",
  "casa laureana":"GF04J","gf04j":"GF04J","casa da laureana":"GF04J",
  "casa da moana":"GF06J","casa moana":"GF06J","gf06j":"GF06J",
  "casa do euller":"GG06J","casa euller":"GG06J","gg06j":"GG06J",
  "casa do john":"GG08J","casa john":"GG08J","gg08j":"GG08J",
  "vp-01":"JR01J","jr01j":"JR01J","studio varandas 01":"JR01J",
  "vp-03":"JR03J","jr03j":"JR03J","studio varandas 03":"JR03J",
  "vp-04":"JR04J","jr04j":"JR04J","studio varandas 04":"JR04J",
  "vp-05":"JR05J","jr05j":"JR05J","apto varandas 01":"JR05J",
  "vp-07":"JR07J","jr07j":"JR07J","apto varandas 03":"JR07J",
  "jr08j":"JR08J","apto varandas 04":"JR08J",
  "jr09j":"JR09J","apto duplex varandas 01":"JR09J",
  "condomínio do max":"VM10A","cond do max":"VM10A","vm10a":"VM10A",
};

var I = "https://res.cloudinary.com/dwtylly4h/image/upload/";
var V = "https://res.cloudinary.com/dwtylly4h/video/upload/";

var MIDIA = {
  "DS03J":{v:V+"DS03J.mp4_yjhh1w.mp4",f:[I+"DS03J-1_l4lqgm.jpg",I+"DS03J-2_oqflm9.jpg",I+"DS03J-3_nfbm1r.jpg",I+"DS03J_foto_cama3_tafx2z.jpg",I+"DS03J-5_ggzidx.jpg"]},
  "DS04J":{v:V+"DS04J_nymqap.mp4",f:[I+"DS04J-1_aiq8xc.jpg",I+"DSJ04-2_xfmhbu.jpg",I+"DSJ04J-3_gbpz4v.jpg",I+"DS04J-4_err7qc.jpg",I+"DS04J-5_hosnyt.jpg"]},
  "DS05J":{v:V+"DS05J.mp4_he2dn9.mp4",f:[I+"DS05J-1_vwqsuo.png",I+"DS05J-2_f5r4qe.png",I+"DS05J-3_gdultw.png",I+"DS05J-4_phpwkp.png",I+"DS05J-5_xkm6uy.png"]},
  "FL10J":{v:V+"FL10J.mp4_qkygw7.mp4",f:[I+"FL10J-1_hjgtqj.jpg",I+"FL10J-2_wreisf.jpg",I+"FL10J-3_qlg2et.jpg",I+"FL10J-4_wzahfd.jpg",I+"FL10J-5_xqrmzt.jpg"]},
  "GC01J":{v:"",f:[I+"GC01J-1_ke3tlr.jpg",I+"GC01J-2_p0u0u7.jpg",I+"GC01J-3_ezlrvf.jpg",I+"GC01J-4_apx6pk.jpg",I+"GC01J-5_xrsmn8.jpg"]},
  "GF02J":{v:V+"GF02J_-_Casa_do_Tremura_yakxbl.mp4",f:[I+"GF02J-1_v0p3zz.jpg",I+"GF02J-2_h7xebp.jpg",I+"GF02J-3_rvxlnb.jpg",I+"GF02J-4_lolv4n.jpg",I+"GF02J-5_xniqhe.jpg"]},
  "GF04J":{v:V+"GF04J.mp4_pifndc.mp4",f:[I+"GF04J-1_ftforl.jpg",I+"GF04J-2_exbcug.jpg",I+"GF04J-3_kgz0vm.jpg",I+"GF04J-4_rao29a.jpg",I+"GF04J-5_oijbod.jpg"]},
  "GF06J":{v:V+"GF06J.mp4_sasotv.mp4",f:[I+"GF06J-1_tm5si6.jpg",I+"GF06J-2_lh46qo.jpg",I+"GF06J-3_svgbcp.jpg",I+"GF06J-4_bqnceo.jpg",I+"GF06J-5_klyay7.jpg"]},
  "GG06J":{v:V+"GG06J.mp4_bjxyri.mp4",f:[I+"GG06J-1_b8vk7g.jpg",I+"GG06J-2_urfqor.jpg",I+"GG06J-3_bdjbdl.jpg",I+"GG06J-4_kciy0q.jpg",I+"GG06J-5_c9blii.jpg"]},
  "GG08J":{v:V+"GG08J_-_Casa_do_John_jtppev.mp4",f:[I+"GG08J-1_jklkr5.jpg",I+"GG08J-2_ivpqvw.jpg",I+"GG08J-3_mvzfog.jpg",I+"GG08J-4_wovtjj.jpg",I+"GG08J-5_lykdhj.jpg"]},
  "HA03J":{v:"",f:["","","","",""]},
  "JR01J":{v:V+"JR01.MP4_necaog.mp4",f:[I+"JR01J-1_aweeyh.png",I+"JR01J-2_p9dklk.png",I+"JR01J-3_nm2aqx.png",I+"JR01J-4_zdmemk.png",I+"JR01J-5_llohk4.png"]},
  "JR03J":{v:V+"JR03.MP4_r5dbxm.mp4",f:[I+"JR03J-1_lb36ds.png",I+"JR03J-2_tlk7uk.png",I+"JR03J-3_ketrcd.png",I+"JR03J-4_lm2rre.png",I+"JR03J-5_ejtrxp.png"]},
  "JR04J":{v:V+"JR04.MP4_hppquh.mp4",f:[I+"JR04J-1_tjyycr.png",I+"JR04J-2_p8gsxr.png",I+"JR04J-3_si8wv7.png",I+"JR04J-4_bgmpcd.png",I+"JR04J-5_yu79gq.png"]},
  "JR05J":{v:"",f:["","","","",""]},
  "JR07J":{v:V+"JR07.MP4_rtcrtr.mp4",f:[I+"JR07J-1_gqvaht.png",I+"JR07J-2_jtkets.png",I+"JR07J-3_abyrvz.png",I+"JR07J-4_v5hdb7.png",I+"JR07J-5_mwxrdh.png"]},
  "JR08J":{v:V+"JR08.MP4_i5wtp5.mp4",f:[I+"JR08J-1_p8clvg.png",I+"JR08J-2_ddxzlr.png",I+"JR08J-3_qybtxg.png",I+"JR08J-4_vnvfek.png",I+"JR08J-5_pqtp7l.png"]},
  "JR09J":{v:V+"JR09.MP4_vskovc.mp4",f:[I+"JR09J-1_iqn0w0.png",I+"JR09J-2_zvvaqf.png",I+"JR09J-3_vlyptx.png",I+"JR09J-4_bqlqme.png",I+"JR09J-5_smsinm.png"]},
  "VM10A":{v:V+"VM10A.mp4_vt3cra.mp4",f:[I+"VM10A-1_i0zryi.jpg",I+"VM10A-2_jac783.jpg",I+"VM10A-3_bwmiwb.jpg",I+"VM10A-4_u2bii2.jpg",I+"VM10A-5_qwrbfn.jpg"]},
};

function resolveId(nome) {
  return IMOVEIS[(nome||"").toLowerCase().trim()] || nome;
}

var mcp = session.datasources["Api-request-1"];
var imovelRaw = mcp ? mcp.imovel || "" : "";
var imovelId = resolveId(imovelRaw);
var midia = MIDIA[imovelId];

if (!midia) {
  await session.setAdditionalValue("video","");
  await session.setAdditionalValue("foto_1","");
  await session.setAdditionalValue("foto_2","");
  await session.setAdditionalValue("foto_3","");
  await session.setAdditionalValue("foto_4","");
  await session.setAdditionalValue("foto_5","");
  await session.setAdditionalValue("midia_status","Imóvel não encontrado: "+imovelRaw);
  return;
}

await session.setAdditionalValue("video", midia.v||"");
await session.setAdditionalValue("foto_1", midia.f[0]||"");
await session.setAdditionalValue("foto_2", midia.f[1]||"");
await session.setAdditionalValue("foto_3", midia.f[2]||"");
await session.setAdditionalValue("foto_4", midia.f[3]||"");
await session.setAdditionalValue("foto_5", midia.f[4]||"");
await session.setAdditionalValue("midia_status","ok");
