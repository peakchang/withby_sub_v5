import { writable } from 'svelte/store'

export let backApi = writable('');

export let toast = writable({ show: false, text: '토스트 메세지' });

export let bottomFixFormWhether = writable(false);