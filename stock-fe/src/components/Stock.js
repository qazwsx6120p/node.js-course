import { Link } from 'react-router-dom';
import axios from 'axios';

import { useState, useEffect } from 'react';

const Stock = () => {
  //useState 會回傳一個包含兩個值的 array，第一個值是 state、
  //第二個值是用來更新 state 的函式
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    let getStocks = async () => {
      //取得 http://localhost:3001/stocks API
      let response = await axios.get('http://localhost:3001/stocks');
      //將response set到react的狀態裡面
      setStocks(response.data);
    };
    //呼叫函示
    getStocks();
  }, []); //<--如果為空陣列只會在第一次傳入時執行以上代碼

  return (
    <div>
      <h2 className="ml-7 mt-6 text-xl text-gray-600">股票代碼</h2>

      {stocks.map((stock) => {
        return (
          <div className="bg-white bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg m-6 cursor-pointer">
            <Link to={`/stock/${stock.id}`}>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {stock.id}
              </h2>
              <p className="text-gray-700">{stock.name}</p>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Stock;
