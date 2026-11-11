setInterval(()=>{ const m = process.memoryUsage().rss/1024/1024; if(m>900) console.log(`[HEALTH] High RAM ${m.toFixed(0)}MB - restart soon`); }, 60000);
export default {};
