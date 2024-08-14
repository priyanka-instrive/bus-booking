const isArray = (a) => !!a && a.constructor === Array;

const isEmptyArray = (a) => a.length === 0;

const generateSeatPattern = (totalSeats) => {
  const seatPattern = [];
  const seatsPerRow = 3;
  const totalRows = totalSeats / seatsPerRow / 2;

  for (let i = 1; i <= totalRows; i++) {
    // Lower Berth
    seatPattern.push(`L${i}L`);
    seatPattern.push(`L${i}R1`);
    seatPattern.push(`L${i}R2`);

    // Upper Berth
    seatPattern.push(`U${i}L`);
    seatPattern.push(`U${i}R1`);
    seatPattern.push(`U${i}R2`);
  }

  return seatPattern;
};

module.exports = {
  isArray,
  isEmptyArray,
  generateSeatPattern,
};
