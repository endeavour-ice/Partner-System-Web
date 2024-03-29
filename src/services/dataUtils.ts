import {UnwrapRef} from "vue";

export function formatDate(time: Date, type = 'YYYY-MM-DD') { //
    const y = formatNumber(time.getFullYear())
    const m = formatNumber(time.getMonth() + 1)
    const d = formatNumber(time.getDate())
    const h = formatNumber(time.getHours())
    const mm = formatNumber(time.getMinutes())
    const s = formatNumber(time.getSeconds())
    if (type === 'YYYY-MM-DD HH-MM-SS') {
        return `${y}-${m}-${d} ${h}:${mm}:${s}`
    } else if (type === 'YYYY-MM-DD') {
        return `${y}-${m}-${d}`
    } else if (type==='YYYY,MM,DD'){
        const arr = [];
        arr.push(y);
        arr.push(m);
        arr.push(d);
        return arr;
    }else if (type === 'YYYY-MM') {
        return `${y}-${m}`
    } else if (type === 'HH-MM-SS') {
        return `${h}:${mm}:${s}`
    } else if (type === 'HH') {
        return `${h}`
    }
}
function isType (type:any) {
    return (arg:any) => {
        return Object.prototype.toString.call(arg) === `[object ${type}]`
    }
}

/**
 * 格式化数字 1 => 01
 * @param {Number} num
 */
function formatNumber (num:number) {
    let isNumber = isType('Number')
    if (!isNumber(num)) return
    return num >= 10 ? String(num) : '0' + String(num)
}
