import { toZonedTime } from "date-fns-tz";

export function returnFromTest(testId: string, hasResult: boolean, router: any) {
  const currentPath = window.location.pathname;
  const basePath = currentPath.split(`/${testId}`)[0];

  if (hasResult) {
    router.replace(`${basePath}/result/${testId}`);
  } else {
    router.replace(`${basePath}`); // This will refresh the current route
  }
}

export async function getServerTime(): Promise<Date> {
  const res = await fetch('/api/server-time');
  // Server time is in milliseconds
  const { serverTime } = await res.json() as { serverTime: Date };

  // Convert serverTime to UTC+6
  const timeZone = "Asia/Dhaka";
  const utc6Date = toZonedTime(serverTime, timeZone);
  return utc6Date;
}
