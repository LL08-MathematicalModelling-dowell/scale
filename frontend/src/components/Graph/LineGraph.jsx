import {Line} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from "chart.js";
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineGraph = ({options, data}) => {

  return (
    <>
      <Line options={options} data={data} width={120} height={70}/>
    </>
  );
};

LineGraph.propTypes = {
  options: PropTypes.object,
  data: PropTypes.object,
};



export default LineGraph;
