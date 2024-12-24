import { defineStore } from 'pinia';
import { sysConfig } from '../config/sysConfig';

export const useSysStore = defineStore('sys', {
    state: () => ({
        data: {
            ...sysConfig
        }
    }),

    getters: {

    },
    actions: {
        updateAllData(newData) {
            this.data = newData;
        }
    }
})