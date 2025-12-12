import { writable } from 'svelte/store'
import moment from "moment-timezone";

export let backApi = writable('');

export let toast = writable({ show: false, text: '토스트 메세지' });

export let bottomFixFormWhether = writable(false);

export let formObj = writable({});

export let getFormList = writable([]);

// 폼 관련 변수 모음 (page / layout 공유를 위해 store 처리)

export let customerName = writable("");
export let customerPhone = writable("");

export let phone1 = writable("010");
export let phone2 = writable("");
export let phone3 = writable("");

export let formDate = writable(moment().format("YYYY-MM-DD"));
export let formTime = writable("base");

export let formAgree = writable(false);

export let inviteChk = writable(false);

