
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
require('dotenv').config()
const CronJob = require('cron').CronJob;
const axios = require('axios');
const qs = require('qs');
const FormData = require('form-data');

app.use(express.json());
app.use(cors())

// สร้างตัวแปรเพื่อเก็บ Object ของ job Cron ที่ผ่านการ config เรียบร้อยแล้ว
const jobs = [];
const date = new Date();
// ดึงเวลาเป็น timestamp เพื่อเอาไปเช็คกับ วันที่หมดอายุของการเรียกใช้ post
const today = date.getTime();


function initialJob(json) {
  json.forEach(obj => {
    const job = new CronJob(
      obj.cron,
      function () {
        // console.log(date);
        // if (!(obj.exp >= today)) {
        console.log(obj.unique + " : is Fire");
        // }
        handleNotification(obj.message, obj.token)
        // console.log("work");

      },
      null,
      true,
      'Asia/Bangkok',
      {
        id: obj.unique,
      }

    );
    jobs.push(job)
    // job.start();
  });
}



async function initialFunction() {
  const config = {
    method: "get",
    url: process.env.API_HOST,
    headers: {
      'authorization': `${process.env.SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
  }
  try {
    const res = await axios(config)
    const json = res.data

    initialJob(json)

  } catch (error) {
    console.log(error);
  }
}

initialFunction()

// Trigger ให้ lineNotification แจ้งเตือน โดยการส่ง ข้อความ กับ token ผ่าน parameter 
async function handleNotification(message, token) {
  // กำหนดข้อความ
  const data = qs.stringify({
    'message': message
  });
  // config ส่วนที่จำเป็นในการ ยิง post api ผ่าน line Notification 
  const config = {
    method: 'post',
    url: process.env.API_LINE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };

  try {
    // ทำการยิง post
    const res = await axios(config);
    return JSON.stringify(res.data);
  } catch (error) {
    // catch error ออกมา
    console.log(error);
  }
}
async function triggleType(id) {
  // กำหนดข้อความ
  // config ส่วนที่จำเป็นในการ ยิง post api ผ่าน line Notification 
  const formdata = new FormData();
  formdata.append("id", id);

  const config = {
    method: 'post',
    url: process.env.API_TYPE,
    data: formdata
  };

  try {
    // ทำการยิง post
    const res = await axios(config);
    return JSON.stringify(res.data);
  } catch (error) {
    // catch error ออกมา
    console.log(error);
  }
}

app.post('/', (req, res) => {
  const d_exp = new Date(req.body.exp)
  const exp = d_exp.getTime();
  const cron_config = req.body.cron.join(" ")
  const job = new CronJob(
    cron_config,
    async function () {
      // console.log(date);
      if ((exp >= today)) {
        console.log(req.body.unique + " : is Fire");
        if (req.body.type == 'onec') {
          triggleType(req.body.unique)
          job.stop();
        }
        handleNotification(req.body.message, req.body.token)
      }

      // console.log("work");

    },
    null,
    true,
    'Asia/Bangkok',
    {
      id: req.body.unique,
    }

  );
  job.start();
  jobs.push(job)
  res.json({ status: "ok" })
})


// สำหรับ หยุด service การแจ้งเตือน
app.get('/stop_job/:id', (req, res) => {
  // ไอดีที่ไม่ซื้อ สำหรับค้นหา job ที่ต้องการจะปิด
  const uid = req.params["id"];
  // ดึง object จาก id ที่ไม่ซ้ำจาก object ใน array
  if (uid != "") {
    const result = jobs.find(({ context: { id } }) => id === uid);
    result.stop();
  }
  // res.json({ status: "stop job id : " + req.params["id"] });
  res.send("result");
})

app.get('/get_job', (req, res) => {
  const json = jobs.map(({ context }) => context)
  res.json(json)
})

// json.forEach(object => {
//   const job = new CronJob(
//     `${object.time} * * * * *`,
//     function () {
//       console.log(object.message);
//       console.log("----------------------------------- ");
//     },
//     null,
//     true,
//     'America/Los_Angeles'
//   );
//   // Use this if the 4th param is default value(false)
//   job.start()
//   // console.log(job);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})