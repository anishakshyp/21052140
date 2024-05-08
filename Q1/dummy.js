import React, { useState, useEffect } from 'react';

const AverageCalculator = () => {
  const [numbers, setNumbers] = useState([]);
  const [average, setAverage] = useState(null);

  const fetchNumbers = async () => {
    try {
      const response = await fetch('http://localhost:9876/numbers/e');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching numbers:', error);
      return [];
    }
  };

  const calculateAverage = () => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  };
  
  const handleApiCall = async () => {
    const newNumbers = await fetchNumbers();
    const uniqueNumbers = Array.from(new Set([...numbers, ...newNumbers]));
    const windowSize = 10;

    if (uniqueNumbers.length > windowSize) {
      const trimmedNumbers = uniqueNumbers.slice(-windowSize);
      setNumbers(trimmedNumbers);
    } else {
      setNumbers(uniqueNumbers);
    }

    setAverage(calculateAverage());
  };

  useEffect(() => {
    const timer = setTimeout(handleApiCall, 500); // Limit response time to 500 ms
    return () => clearTimeout(timer);
  }, [numbers]);

  return (
    <div>
      <h1>Average Calculator Microservice</h1>
      <p>Stored numbers: {numbers.join(', ')}</p>
      <p>Average (window size {numbers.length}): {average}</p>
    </div>
  );
};

export default dummy;
