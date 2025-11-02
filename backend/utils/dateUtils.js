exports.getStartOfDay = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Sets time to 00:00:00
  return now;
};