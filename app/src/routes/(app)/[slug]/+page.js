import axios from "axios";
import { back_api } from "$lib/const";
import { error } from '@sveltejs/kit';
import moment from "moment-timezone";

export const load = async ({ fetch, url, params }) => {


    const subDomainName = url.hostname.split('.')[0]
    let menuList = []
    const nowPage = params.slug;
    console.log(nowPage);
    
    let index = -1;

    let subView = {}

    try {
        const res = await axios.post(`${back_api}/subview`, {
            subDomainName
        })
        if (!res.data.subView) {
            return error('404', 'asjfaisjfilasjdf')
        } else if (res.data.status && res.data.subView['ld_domain']) {
            subView = res.data.subView;
        }
    } catch (error) {
        console.error(error.message);
        return error('404', 'asjfaisjfilasjdf')
    }



    if (!subView.ld_view_type || subView.ld_view_type == 'old') {
        try {
            const res = await axios.post(`${back_api}/get_menu`, {
                subDomainName
            })

            if (!res.data.status) {
                return error('404', 'asjfaisjfilasjdf')
            }

            menuList = JSON.parse(res.data.menuList);

            console.log(menuList);
            for (let i = 0; i < menuList.length; i++) {
                if (menuList[i].pgLink === nowPage) {
                    index = i;
                    break;
                }
            }

        } catch (error) {
            console.error(error.message);
            return error('404', 'asjfaisjfilasjdf')
        }
    }
    return { index, nowPage }
}


