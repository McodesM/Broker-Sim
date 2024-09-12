import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/HomePageCSS.css';
import {AppContext} from '../Context'
import useHomeController from './Controllers/HomeController';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Line } from 'react-chartjs-2';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);
function Home(){
  const [stockName, setFormData] = useState('');
  const [searchedstockName, setSearchedStockName] = useState('')
  const myContext = useContext(AppContext);
  const [currentPrice, setCurrentPrice] = useState(0.0)
  const [search, setSearch] = useState(false)
  const [stockPriceData, setPriceData] = useState([])
  const [numberOfStocks, setNumStocks] = useState(0)
  const { retrieveUserDetails, sendBuyOrder, retrieveStockData } = useHomeController()
  const suggestedStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'INTC'];
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Data',
        data: [],
        fill: false,
        borderColor: 'black',
        pointBorderColor: 'aqua'
      },
    ],
  });
  
  function handleInputChange(e){
      const { name, value } = e.target;
      setFormData(value);
  }
  const fetchDataPeriod = async (period) => {  
    try{
      const stockData = await retrieveStockData(period, stockName);
      const formattedData = {
          labels: stockData.map((entry) => entry[0]),
          datasets: [
            {
              label: stockName,
              data: stockData.map((entry) => entry[1]),
              fill: false,
              borderColor: 'rgba(75,192,192,1)',
            },
          ],
      };
      console.log('Data:', stockData);
      setChartData(formattedData);
      setPriceData(stockData);
      if(period === "D"){
        setCurrentPrice(stockData[stockData.length-1][1])
        setSearchedStockName(stockName)
      }
    }catch(error){
      alert("Failed to retrieve stock data")
    }
  };
  

  function handleSubmit(e){
      e.preventDefault();
      myContext.setSearchedStock(stockName)
      setSearch(true)
      fetchDataPeriod("D");
      setNumStocks(0);
  }

  function handleInputChangeStock(e){
    const { name, value } = e.target;
    setNumStocks(value)
  }

  function handleSubmitStockBuy(e){
    e.preventDefault();
    sendBuyOrder(currentPrice, stockPriceData, searchedstockName, numberOfStocks, myContext);
    setNumStocks(0);
  }

  const handleSelectSuggestion = (selectedStock) => {
    setFormData(selectedStock);
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: true,
        zoom: {
            zoom: {
                wheel: {
                    enabled: true,
                },
                mode: 'x',
            },
            pan: {
                enabled: true,
                mode: 'x',
            },
        },
    },
    scales: {
        x: {
            min: stockPriceData.length-31, 
            max: stockPriceData.length-1,
            grid: {
                color: "#404040"
            },
            ticks: {
                color: "#FFFFFF"
            } 
        },
        y: {
            grid: {
                color: "#404040"
            },
            ticks: {
                color: "#FFFFFF"
            }
        },
    },
  };
  useEffect(() => {
      retrieveUserDetails(myContext);
  }, []);
    return(
      <Container className="mt-5">
        <Row className="justify-content-center align-items-center">
          <div className='balance-card-container'>
            <div className="balance-card">
                <div className="card-body">
                  <div className="balance-field">
                    <h5 className="balance-title">Balance</h5>
                    <b className="card-text" style={{color: 'white', fontSize:17}}>£{myContext.userDetails.balance}</b>
                  </div>
                </div>
            </div>
          </div>
          <div className="search-bar">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter Ticker"
                    name="username"
                    value={stockName}
                    onChange={handleInputChange}
                    className="rounded-0"
                  />
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                      Suggested
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {suggestedStocks.map((stock, index) => (
                        <Dropdown.Item key={index} onClick={() => handleSelectSuggestion(stock)}>
                          {stock}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </InputGroup>
              </Form.Group>
              <Button variant="primary" type="submit" disabled={!stockName} className="btn btn-primary btn-lg btn-block">
                Search
              </Button>
            </Form>
          </div>
        </Row>

        {search && (
          <Row className="justify-content-center">
            <Col md={9}>
              <div className="chart_box">
                  <div className='time_buttons_container'>
                    <button className='time_button' onClick={() => fetchDataPeriod("D")}>Day</button> 
                    <button className='time_button' onClick={() => fetchDataPeriod("W")}>Week</button> 
                    <button className='time_button' onClick={() => fetchDataPeriod("M")}>Month</button> 
                    <button className='time_button' onClick={() => fetchDataPeriod("Y")}>Year</button>
                  </div>
                  <div className="charter">
                    <Line data={chartData} options={options} />
                  </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="carder">
                <div className="card-body">
                  <h5 className="card_title">Current Buy Price</h5>
                  <p className="card-text">£{currentPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="buy-form">
                <h3>Buy {myContext.searchedStock}</h3>
                <Form onSubmit={handleSubmitStockBuy}>
                  <Form.Group className="mb-3" controlId="formBasicNumber">
                    <Form.Control
                      type="number"
                      name="numberStock"
                      value={numberOfStocks}
                      onChange={handleInputChangeStock}
                      className="rounded-0"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={!stockPriceData || numberOfStocks<1 || numberOfStocks*currentPrice>myContext.userDetails.balance } className="btn btn-primary btn-lg btn-block">
                    Buy Shares
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        )}
      </Container>

    )
}

export default Home;