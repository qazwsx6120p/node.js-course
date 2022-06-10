
let dt = new Date();
console.log(`起床了 at ${dt.toISOString()}`);

let doWork = function (job, timer) {
  return new Promise((resolve, reject) => {
    // 做非同步工作
    setTimeout(() => {
      let dt = new Date();
      let result = `完成工作: ${job} at ${dt.toISOString()}`;
      resolve(result);
      // reject('故意失敗');
    }, timer);
  });
};

async function main(){

  let resultBrush = await doWork('刷牙', 3000);
  console.log(resultBrush);

  let resultEat = await doWork('吃早餐', 5000);
  console.log(resultEat);

  let resultHw =  await doWork('寫功課', 3000);
  con.log(resultHw)

};

main()

// // 刷牙 (3000) -> 吃早餐 (5000) -> 寫功課 (3000)
// let doBrushPromise = doWork('刷牙', 3000);
// // console.log(doBrushPromise);  // => Promise { <pending> }
// // doBrushPromise.then(處理成功的函式, 處理失敗的函式)
// doBrushPromise
//   .then((result) => {
//     // 這邊就接到「刷牙」成功的結果
//     console.log(result);

//     let doEatPromise = doWork('吃早餐', 5000);
//     return doEatPromise;
//   })
//   .then((result) => {
//     // 這邊就接到「吃早餐」成功的結果
//     console.log(result);

//     let doHWPromise = doWork('寫功課', 3000);
//     return doHWPromise;
//   })
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     // 在此之前發生的錯誤，都可以在這裡被捕捉
//     console.error('發生錯誤，現在在 catch', error);
//   })
//   .finally(() => {
//     console.log('這裡是 finally');
//   });
// // Promise chain