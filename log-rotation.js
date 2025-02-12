var CronJob = require('cron').CronJob;
var fs = require('fs');

const returnAWeekAgo = (date) => {
    return date.setDate(date.getDate()-5);
}
const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

var job = new CronJob({
  cronTime: '00 30 3 * * *',
  // cronTime: '* * * * * *',
  onTick: function() {
    /*
     * Runs everyday at 3:30:00 AM.
     */
    var aWeekAgo = returnAWeekAgo(new Date());
    var fileToDelete = './log/' + formatDate(aWeekAgo) + '.logs';
    if (fs.existsSync(fileToDelete)) {
        console.log(true);
        console.log(fileToDelete);
        fs.unlink(fileToDelete, (err) => {
            if (err) throw err;
            console.log('successfully deleted ' + fileToDelete);
        });
    } else {
        console.log(fileToDelete)
    }
  },
  start: true
});

job.start();

