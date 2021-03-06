import * as React from "react";
import Chart from "chart.js";
import axios from "axios";

export default class ClassDoughnut extends React.Component {
  canvas = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      book: undefined,
    };
    this.updateChart = this.updateChart.bind(this);
  }

  async componentDidMount() {
    let data;

    try {
      data = await axios.get(
        process.env.NEXT_PUBLIC_BASE_URL + "/people/social_class.json"
      );
    } catch (err) {
      data = undefined;
    }
    if (data) {
      this.setState({ chartData: data.data }, () => {
        let ctx = null;
        if (this.canvas && this.canvas.current) {
          ctx = this.canvas.current;
        }
        if (this.state.chartData && ctx) {
          const chart = new Chart(ctx, {
            type: "doughnut",
            data: Object.assign({}, this.state.chartData),
            options: {
              legend: {
                onClick: (e) => e.stopPropagation(),
              },
            },
          });
          this.setState({ chart: chart });
        }
      });
    }
  }

  async updateChart() {
    let data;
    try {
      const query = this.state.book ? `?q=${this.state.book}` : "";
      data = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/people/social_class.json${query}`
      );
    } catch (err) {
      data = undefined;
    }
    if (data) {
      this.setState({ chartData: data.data }, () => {
        if (this.state.chart) {
          this.state.chart.data = this.state.chartData
            ? Object.assign({}, this.state.chartData)
            : {};
          this.state.chart.update();
        }
      });
    }
  }

  handleChange = (event) => {
    if (event.target.value === "all") {
      this.setState({ book: undefined }, () => {
        this.updateChart();
      });
    } else {
      this.setState({ book: parseInt(event.target.value, 10) }, () => {
        this.updateChart();
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div style={{ width: "50vw" }}>
          <label htmlFor="book-select">Choose a book: </label>
          <select id="book-select" onChange={this.handleChange}>
            <option value="all">All</option>
            {[...Array(9).keys()].map((x) => {
              return <option key={x}>{x + 1}</option>;
            })}
          </select>
          <canvas
            ref={this.canvas}
            id="social-chart"
            width={400}
            height={400}
            tabIndex={0}
            role="img"
            aria-label={
              this.state.data
                ? `Doughnut chart of letters per class
              ${
                this.state.book ? " for book " + this.state.book : ""
              } of Pliny's Letters.
               Senatorial: ${this.state.data.datasets[0].data[0]} Equestrian: ${
                    this.state.data.datasets[0].data[1]
                  }
                Citizen: ${this.state.data.datasets[0].data[2]}`
                : `Doughnut chart of Pliny's Letters`
            }
          ></canvas>
        </div>
      </React.Fragment>
    );
  }
}
