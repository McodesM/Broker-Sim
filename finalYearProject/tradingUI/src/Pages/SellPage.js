import { useState, useContext, useEffect } from "react";
import {AppContext} from '../Context'
import './styles/SellPageCSS.css';
import useSellController from "./Controllers/SellController";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
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
function Sell(){
    const [stockPriceData, setPriceData] = useState([])
    const [numberOfStocks, setNumStocks] = useState(0)
    const [currentPrice, setCurrentPrice] = useState(0.0)
    const { getStockData, sendSellOrder } = useSellController()
    const myContext = useContext(AppContext);
    const navigate = useNavigate();
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
          {
            label: 'Your Data',
            data: [],
            fill: false,
            borderColor: 'black',
            pointBorderColor: 'aqua'
          },
        ],
    });
    const retrieveStockData = async(period) => {
        try{
            const jsonResponseData = await getStockData(period, myContext);
            const formattedData = {
                labels: jsonResponseData.map((entry) => entry[0]),
                datasets: [
                  {
                    label: 'Stock Price',
                    data: jsonResponseData.map((entry) => entry[1]),
                    fill: false,
                    borderColor: 'rgba(75,192,192,1)',
                  },
                ],
            };
            setChartData(formattedData);
            console.log('Data:', jsonResponseData);
            setPriceData(jsonResponseData);
            if(period == "D"){
                setCurrentPrice(jsonResponseData[jsonResponseData.length-1][1])
            }
        }
        catch(error){
            console.error("Error:", error.message);
            alert("Error:", error.message);
        }
    }
    function handleInputChange(e){
        const { name, value } = e.target;
        setNumStocks(value)
    }
    function handleSubmit(e){
        e.preventDefault();
        sendSellOrder(currentPrice, myContext, numberOfStocks, navigate);
    }

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
        retrieveStockData("D");
    }, []);
    return(
        <Container>
            <Row className="justify-content-center">
                <Col md={9}>
                    <div className="chart_box">
                        <div className='time_buttons_container'>
                            <button className='time_button' onClick={() => retrieveStockData("D")}>Day</button> 
                            <button className='time_button' onClick={() => retrieveStockData("W")}>Week</button> 
                            <button className='time_button' onClick={() => retrieveStockData("M")}>Month</button> 
                            <button className='time_button' onClick={() => retrieveStockData("Y")}>Year</button>
                        </div>
                        <div className="charter">
                            <Line data={chartData} options={options} />
                        </div>    
                    </div>
                </Col>
                <Col md={3}>
                    <div className="price-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Current Sell Price</h5>
                                <p className="card-text">{currentPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="sell-form">
                        <h3>Sell {myContext.sellStock.stock_name}</h3>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicUsername">
                            <Form.Control
                                type="number"
                                name="numberStock"
                                value={numberOfStocks}
                                onChange={handleInputChange}
                                max={myContext.sellStock.number}
                            />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={!stockPriceData}>
                                Sell Shares
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default Sell