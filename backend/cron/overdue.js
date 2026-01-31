import cron from "node-cron";
import { prisma } from "../prisma/client.js";

// cron job for every 12 am and 12 pm
cron.schedule("0 */12 * * *", async () => {
    try{
        let fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

        const overdueTickets = await prisma.ticket.updateMany({
            where: {
                status: {
                    in: ["PENDING", "IN_PROGRESS"]
                },
                createdAt: { lt: fourDaysAgo }
            },
            data: {
                status: "OVERDUE"
            }
        })

        console.log(`Marked ${overdueTickets.count} tickets as OVERDUE`);
    }
    catch(e){
        console.log("Error in overdue tickets cron job:", e);
    }
});