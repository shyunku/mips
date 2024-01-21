import moment from "moment";
import "moment/locale/ko";

export const formatTime = (date) => {
  if (date == null) return null;
  date = moment(date);
  const now = moment();

  const diff = now.diff(date);

  if (diff < 1000 * 60) {
    return date.format("방금 전");
  } else if (date.isSame(now, "day")) {
    return date.format("오늘 a H시 mm분");
  } else if (date.isSame(now.subtract(1, "day"), "day")) {
    return date.format("어제 a H시 mm분");
  } else {
    return date.format("M월 D일 a H시");
  }
};

export const formatTimeShort = (date) => {
  if (date == null) return null;
  date = moment(date);
  const now = moment();

  const diff = now.diff(date);
  const diffFormatted = moment.utc(diff).format("HH:mm:ss");
  return diffFormatted;
};
