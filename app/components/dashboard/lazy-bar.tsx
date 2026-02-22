import dynamic from "next/dynamic";

const LazyBar = dynamic(
  async () => {
    const [
      { Bar },
      { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend },
    ] = await Promise.all([import("react-chartjs-2"), import("chart.js")]);
    Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
    return { default: Bar };
  },
  { ssr: false },
);

export default LazyBar;
