export const generateNextWeekDates = (): {
    label: string;
    value: string;
    day: string;
  }[] => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.toLocaleDateString("en-US", {
        weekday: "short",
      });
      const value = date.toISOString().split("T")[0];
      const label = `${String(date.getDate()).padStart(2, "0")}.${String(
        date.getMonth() + 1
      ).padStart(2, "0")} (${day})`;
      return { label, value, day };
    });
  };
  
  export const isToday = (dateString: string): boolean => {
    const today = new Date().toISOString().split("T")[0];
    const selected = new Date(dateString).toISOString().split("T")[0];
    return today === selected;
  };
  
  export const formatSlotTime = (date: string, time: string): string => {
    return new Date(`${date}T${time}:00`).toISOString();
  };
  
  export const getValidSlots = (slots: string[], date: string): string[] => {
    const now = new Date();
    const isTodaySelected = isToday(date);
    return isTodaySelected
      ? slots.filter((time) => {
          const [start] = time.split("-");
          const slotDate = new Date(`${date}T${start}:00`);
          return slotDate > now;
        })
      : slots;
  };
  
  export const buildBookingDetails = (
    time: string,
    date: string,
    venueId: string
  ) => {
    const [start, end] = time.split("-");
    return {
      venueId,
      start: formatSlotTime(date, start),
      end: formatSlotTime(date, end),
      status: "pending",
    };
  };