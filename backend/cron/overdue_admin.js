import cron from "node-cron";
import { prisma } from "../prisma/client.js";

// cron job for every 9 am
cron.schedule("0 9 * * *", async () => {
    try{
        let sixDaysAgo = new Date();
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

        const overdueCount = await prisma.ticket.count({
            where: {
                status: "OVERDUE",
                createdAt: { lt: sixDaysAgo }
            },
        })

        // send as notification to admin {
        console.log(`Found ${overdueCount} overdue ticket${overdueCount !== 1 ? "s" : ""} older than 6 days.`);
        // }
    }
    catch(e){
        console.log("Error in overdue tickets 4+2 cron job:", e);
    }
});