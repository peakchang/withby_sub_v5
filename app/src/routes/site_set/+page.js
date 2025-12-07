import axios from "axios";
import { back_api } from "$lib/const";
// import Cookies from "js-cookie";
// import { user_info } from "$lib/store";

export const load = (async ({ url }) => {
    
    const getId = url.host.split('.')[0]

    let ld_json_header = {}
    let ld_json_main = []
    let ld_json_menus = {}
    let allData = {}

    try {
        const res = await axios.post(`${back_api}/load_site_set`, { getId })
        if (res.status == 200) {
            allData = res.data.siteSetData
            ld_json_header = JSON.parse(allData.ld_json_header)
            ld_json_main = JSON.parse(allData.ld_json_main)
            ld_json_menus = JSON.parse(allData.ld_json_menus)
        }
    } catch (error) {

    }
    return { getId, allData, ld_json_header, ld_json_main, ld_json_menus };
})