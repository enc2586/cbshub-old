const dateTimeConverter = (datetime) => {
  let sec = datetime.getSeconds();

  let min = datetime.getMinutes();

  let hour = datetime.getHours();

  let day = datetime.getDate();

  let mnth = datetime.getMonth();

  let year = datetime.getFullYear();

  return (
    year +
    "년 " +
    mnth +
    "월 " +
    day +
    "일 " +
    hour +
    "시 " +
    min +
    "분 " +
    sec +
    "초"
  );
};

export { dateTimeConverter };
