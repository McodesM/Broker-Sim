import { useState, useContext,useEffect } from "react";
import { json } from "react-router-dom";
import {AppContext} from '../Context'
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Line } from 'react-chartjs-2';
import './styles/PortfolioCSS.css';
import zoomPlugin from 'chartjs-plugin-zoom';
import usePortfolioController from "./Controllers/PortfolioController";
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

function Portfolio(){
    const [PastTrades, setPastTrades] = useState([])
    const [OpenTrades, setOpenTrades] = useState([])
    const [userDetails, setUserDetails] = useState({})
    const { get_user_details, retrieveTrades } = usePortfolioController()
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
                min: PastTrades.length-31, 
                max: PastTrades.length-1,
                grid: {
                    color: "#404040"
                },
                ticks: {
                    color: "#FFFFFF"
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Profit Growth £',
                    color: "#FFFFFF"
                },
                grid: {
                    color: "#404040"
                },
                ticks: {
                    color: "#FFFFFF"
                }
            },
        },
      };
    const myContext = useContext(AppContext);
    const navigate = useNavigate();
    const sellTrade = (trade) => {
        console.log(trade)
        myContext.setStock_toSell(trade)
        navigate('/sell')
    };

    useEffect(() => {
        const fetchTrades = async () => {  
            try{
              const {open_trades, past_trades} = await retrieveTrades();
              const formattedData = {
                labels: past_trades.map((entry) => entry.datetime),
                datasets: [
                  {
                    label: "Profit Growth",
                    data: past_trades.map((entry) => entry.user_total_profit),
                    fill: false,
                    borderColor: 'rgba(75,192,192,1)',
                  },
                ],
            };
            setChartData(formattedData);
            setOpenTrades(open_trades)
            setPastTrades(past_trades)
            console.log(open_trades)
            console.log(past_trades)
            }catch(error){
              alert("Failed to retrieve user trade history")
            }
        };
        fetchTrades();
        const fetchData = async () => {  
            try{
              const userData = await get_user_details();
              setUserDetails(userData)
            }catch(error){
              alert("Failed to retrieve user details")
            }
        };
        fetchData();

    }, []);
    return(
        <div className="container-fluid bg-dark text-light p-5">
            <div className='balance-card-container'>
                <div className="balance-card">
                    <div className="card-body">
                    <div className="balance-field">
                        <h5 className="balance-title">Balance</h5>
                        <b className="card-text" style={{color: 'white', fontSize:17}}>£{userDetails.balance}</b>
                    </div>
                    </div>
                </div>
                <div className="balance-card">
                    <div className="card-body">
                        <div className="balance-field">
                            <h5 className="balance-title">Community points</h5>
                            <b className="card-text" style={{color: 'white', fontSize:17}}>{userDetails.points}</b>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="chart_container">
                <div id="chart">
                  <Line data={chartData} options={options} />
                </div>
            </div>

            <h3>Open Trades</h3>
            <Table responsive striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Date Time</th>
                        <th>Buy Price</th>
                        <th>Stock Name</th>
                        <th>Number</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {OpenTrades.map((trade) => (
                        <tr key={trade.id}>
                            <td>{trade.datetime}</td>
                            <td>{trade.buy_price}</td>
                            <td>{trade.stock_name}</td>
                            <td>{trade.number}</td>
                            <td><Button variant="primary" onClick={() => sellTrade(trade)}>Sell</Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h3>Past Trades</h3>
            <Table responsive striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Date Time</th>
                        <th>Buy Price</th>
                        <th>Sell Price</th>
                        <th>Stock Name</th>
                        <th>Number</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {PastTrades.map((trade) => (
                        <tr key={trade.id}>
                            <td>{trade.datetime}</td>
                            <td>{trade.buy_price}</td>
                            <td>{trade.sell_price}</td>
                            <td>{trade.stock_name}</td>
                            <td>{trade.number}</td>
                            <td>{trade.profit}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}

export default Portfolio 