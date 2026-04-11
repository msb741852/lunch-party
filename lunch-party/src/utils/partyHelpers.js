const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  return new Date(value);
};

export const getPartyStatus = (party) => {
  if (!party) return "open";
  const meetingTime = toDate(party.meetingTime);
  const now = new Date();
  const currentCount = party.currentMembers?.length ?? 0;
  const max = party.maxMembers ?? 0;

  if (meetingTime && meetingTime.getTime() < now.getTime()) return "closed";
  if (currentCount >= max) return "full";
  return "open";
};

export const STATUS_LABEL = {
  open: "모집중",
  full: "마감",
  closed: "종료",
};

export const STATUS_STYLE = {
  open: "bg-green-100 text-green-700 border-green-200",
  full: "bg-red-100 text-red-700 border-red-200",
  closed: "bg-gray-200 text-gray-600 border-gray-300",
};

export const CATEGORY_OPTIONS = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "기타",
];

const pad = (n) => String(n).padStart(2, "0");

export const formatMeetingTime = (value) => {
  const date = toDate(value);
  if (!date) return "";
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? "오전" : "오후";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${display}:${pad(minutes)}`;
};

export const isToday = (value) => {
  const date = toDate(value);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const buildMeetingDateFromTimeString = (timeString) => {
  if (!timeString) return null;
  const [hourStr, minuteStr] = timeString.split(":");
  const date = new Date();
  date.setHours(Number(hourStr), Number(minuteStr), 0, 0);
  return date;
};

export const isMember = (party, uid) => {
  if (!party?.currentMembers || !uid) return false;
  return party.currentMembers.some((m) => m.uid === uid);
};
