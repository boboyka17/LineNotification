
var CronJob = require('cron').CronJob;
var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({
    'message': 'สวัสดีปะรเทศไทย' 
  });
  var config = {
    method: 'post',
    url: 'https://notify-api.line.me/api/notify',
    headers: { 
      'Authorization': 'Bearer szUgUZwLpkO35OkztS5QFMYwtuusGEA7rjARKTB9Cms', 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };

var job = new CronJob(
	'1 * * * * *',
	function() {
		axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});    
	},
	null,
	true,
	'Asia/Bangkok'
);
// Use this if the 4th param is default value(false)
job.start()