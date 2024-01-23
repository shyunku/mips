import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const RateDoughnut = ({ current = 0.3, max = 1, enableTransition }) => {
  const validCurrent = useMemo(() => Math.min(current, max), [current, max]);
  const data = useMemo(
    () => ({
      labels: ["value", "empty"],
      datasets: [
        {
          data: [validCurrent, max - validCurrent],
          backgroundColor: ["rgb(201, 147, 255)", "#FFFFFF20"],
        },
      ],
    }),
    [validCurrent, max]
  );

  const options = useMemo(
    () => ({
      plugins: {
        legend: {
          display: false,
        },
      },
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
      cutout: "90%",
      animation: {
        duration: enableTransition ? 1000 : 0,
      },
    }),
    [enableTransition]
  );

  return <Doughnut data={data} options={options} />;
};

export default RateDoughnut;
