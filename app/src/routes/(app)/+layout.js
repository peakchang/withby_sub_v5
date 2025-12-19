
import axios from "axios";
import { back_api } from "$lib/const";
import { error } from '@sveltejs/kit';
import moment from "moment-timezone";
import Cookies from 'js-cookie';
import { setImg } from "$lib/lib";

export const load = async ({ fetch, url }) => {

    const subDomainName = url.hostname.split('.')[0]
    let subView = {}
    let seoValue = {
        title: "",
        description: '',
        url: url.href,
        image: "",
        date: '',
        published_time: '',
        icon: `${url.origin}/favicon.png`,
    }

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

    let addTitle = "";


    if (!subView.ld_view_type || subView.ld_view_type == 'old') {
        if (url.href.includes("premium")) {
            addTitle = " - 프리미엄"
        } else if (url.href.includes("overview")) {
            addTitle = " - 사업소개"
        } else if (url.href.includes("environ")) {
            addTitle = " - 입지환경"
        } else if (url.href.includes("product")) {
            addTitle = " - 상품안내"
        }
    }

    seoValue['title'] = subView.ld_name + addTitle
    seoValue['description'] = subView.ld_description
    seoValue['published_time'] = subView['ld_created_at']
    seoValue["date_str"] = moment(subView.ld_created_at).format('YYYY-MM-DD HH:mm');
    seoValue['date_str'] = subView["date_str"]

    if (subView.ld_view_type == 'new') {

        const mainJson = JSON.parse(subView.ld_json_main)
        const urlHost = url.host.split('.').slice(1).join('.');
        // const ogImage = subView.ld_card_image ? subView.ld_card_image : mainJson[0]['backgroundImg'].split(',')[0]
        // const ogImage = subView.ld_card_image ? subView.ld_card_image : ""
        let ogImage = ""
        let seoMainImg = ""
        if (subView.ld_card_image) {
            ogImage = subView.ld_card_image
            seoMainImg = subView.ld_card_image
        } else {
            ogImage =
                mainJson[0].contentList.find(item => item.imgList?.length)?.imgList[0].url;
            seoMainImg =
                mainJson[0].contentList.find(item => item.imgList?.length)?.imgList[0].url;
        }
        // const seoMainImg = mainJson ? mainJson[0]['backgroundImg'].split(',')[0] : subView.ld_card_image
        // const seoMainImg = subView.ld_card_image ? subView.ld_card_image : ""
        if (mainJson.length > 0) {
            seoValue["og_image"] = setImg(ogImage)
            seoValue["image"] = setImg(seoMainImg);
        }
    } else {
        seoValue["image"] = `${url.protocol}//${url.host.split('.')[1]}${subView['ld_main_img'] ? subView['ld_main_img'].split(',')[0] : ""}`;
    }


    return { subView, seoValue }
}


function truncateTextTo100Chars(text) {
    if (text.length <= 100) {
        return text;
    }

    // 100자 뒤의 가장 가까운 띄어쓰기를 찾음
    const truncatedText = text.substr(0, 200);
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');

    if (lastSpaceIndex === -1) {
        // 띄어쓰기를 찾지 못한 경우, 그냥 100자까지 자름
        return truncatedText;
    }

    // 가장 가까운 띄어쓰기까지 잘라서 반환
    return truncatedText.substr(0, lastSpaceIndex);
}