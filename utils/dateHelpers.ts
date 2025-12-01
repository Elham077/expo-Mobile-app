export const getLast7Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const day = date.toLocaleDateString("en-US", { weekday: "short" }); // مثل Sat, Sun
    const isoDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

    days.push({
      day,
      date: isoDate,
      income: 0,
      expense: 0,
    });
  }

  return days;
};
export const getLast12Months = () => {
  const months = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("default", { month: "short" }); // "Jan"
    const shortYear = date.getFullYear().toString().slice(-2); // "25"

    months.push({
      month: `${monthName} ${shortYear}`, // مثلا "Jun 25"
      income: 0,
      expense: 0,
    });
  }

  return months;
};
export const getYearsRange = (firstYear: number, currentYear: number) => {
  const years = [];

  for (let year = firstYear; year <= currentYear; year++) {
    years.push({
      year: year.toString(),
      income: 0,
      expense: 0,
    });
  }

  return years;
};
