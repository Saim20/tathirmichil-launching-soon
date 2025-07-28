import { toZonedTime } from "date-fns-tz";

export function getTime() {
    // Get current UTC time
    const date = new Date();
    return date;
}

export function convertToUTCPlus6(date: Date) {
    const timeZone = "Asia/Dhaka";
    const utc6Date = toZonedTime(date, timeZone);
    return utc6Date;
}