import { tasks } from './jira.js';
import { invoice } from './invoice.js'
import { pdf } from './pdf.js'
import { mail } from './mail.js'
import { read, write } from './conf.js'
import "./date.js"

const gDebug = false;

read((c) => { 
	const now = new Date();
	const sdate = new Date(c.sdate);
	const edate = sdate.addDays(c.freq);
	const diff = edate.diff(now);

	console.log(c);
	console.log("now", now);
	console.log("sdate", sdate);
	console.log("edate", edate);
	console.log("Diff (edate - now)", 
		edate.diffDays(now) + "d", (diff / (60000 * 60)).toFixed(2) + "h");

	if (diff <= 0 || gDebug) {
		tasks().then(t => {
			pdf("invoice.pdf", invoice({
				title: "Invoice",
				date: sdate.str() + ' ~ ' + edate.str(),
                		hours: edate.range(sdate, [0, 5]).length * 8,
				rate: 42.50,
               			p1: '40%',
                		p2: '60%',
                		t1: t.sh,
                		t2: t.ch,
                		total: ""
        		}), () => {
                		mail(`Invoice - ${sdate.str()} ~ ${edate.str()}`, "Ready for review.<br><br>Best regards,<br>Dren", () => {
					c.sdate = edate.dformat();
					c.cinv++;
					write(c);
				}, (e) => { console.warn(">>> Fail: Send mail", e); });
			});
		}).catch(() => { console.warn(">>> Fail: Get tasks") })
	}
});

